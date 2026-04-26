"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import type { OrderBoardOrder } from "@/components/orders/OrderBoard";
import { ApiError } from "@/api/client";
import {
  enrichWarehouseScanMatchesFromApi,
  patchManualOrderInboundLineFromUpload,
  patchManualOrderLineWorkPending,
  postAdminOrderUploadImages,
  refreshMatchesInboundFromManualSearch,
  type OrderImageUploadCategory,
  type WarehouseScanMatchPair,
} from "@/api/orders/manualSearch";
import { collectWarehouseScanMatches } from "@/lib/collectWarehouseScanMatches";
import { warehouseScanLabelsFromTranslate } from "@/components/orders/warehouseScanWindowDocument";
import { WarehouseScanResults } from "@/components/orders/WarehouseScanResults";
import { useLocale } from "@/contexts/LocaleContext";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { emitOrderBoardMutationSignal } from "@/lib/orderBoardMutationSignal";
import { putIssuePhotoWindowPayload } from "@/lib/orderBoardWindowPayload";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function mergeUniqueStringUrls(existing: string[], added: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [...existing, ...added]) {
    const s = u.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export default function InboundScanToolWindow({
  orders,
  defaultWarehouse,
}: {
  orders: OrderBoardOrder[];
  defaultWarehouse: string;
}) {
  const uploadDebug = (...args: unknown[]) => {
    // DevTools에서 입고사진 업로드/패치 흐름 추적용 로그.
    if (typeof window !== "undefined") console.info("[InboundScanUpload]", ...args);
  };
  const { t } = useLocale();
  const [warehouse, setWarehouse] = useState(defaultWarehouse || "");
  const [tracking, setTracking] = useState("");
  const [matches, setMatches] = useState<WarehouseScanMatchPair[] | null>(null);
  /** `orderNo:productId` — 상단 작업대기 버튼이 이 줄의 태그와 동기 */
  const [focusedLineKey, setFocusedLineKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<{
    orderNo: string;
    productId: string;
  } | null>(null);
  /**
   * 파일 input은 `setState` 직후 동기로 `click()`되므로, `onChange` 시점에 `pendingTarget` state가
   * 아직 갱신되지 않은 채 `onUploadImages`가 실행될 수 있음 → ref로 동일 대상을 즉시 보관.
   */
  const pendingUploadTargetRef = useRef<{
    orderNo: string;
    productId: string;
  } | null>(null);
  /** 입고/바코드/이슈 중 어디에 붙일지 — mixed 응답이 한쪽으로 몰리는 문제 방지 */
  const pendingUploadCategoryRef = useRef<OrderImageUploadCategory | null>(null);
  const matchesRef = useRef<WarehouseScanMatchPair[] | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const scanLabels = useMemo(() => warehouseScanLabelsFromTranslate(t), [t]);

  const workPendingToolbarActive = useMemo(() => {
    if (!matches || !focusedLineKey) return false;
    const pair = matches.find((m) => `${m.order.orderNo}:${m.product.id}` === focusedLineKey);
    return pair?.product.manualStatusTags?.workPending ?? false;
  }, [matches, focusedLineKey]);

  matchesRef.current = matches;

  /** 체크박스로 줄 선택 시 `GET …/admin/orders/manual/search?orderNumber=…`로 income/issue/realbarcode 반영 */
  useEffect(() => {
    if (!focusedLineKey) return;
    const idx = focusedLineKey.indexOf(":");
    if (idx <= 0) return;
    const orderNo = focusedLineKey.slice(0, idx).trim();
    if (!orderNo) return;
    let cancelled = false;
    void (async () => {
      try {
        const prev = matchesRef.current;
        if (!prev?.length) return;
        const next = await refreshMatchesInboundFromManualSearch(prev, orderNo, t);
        if (!cancelled) setMatches(next);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Failed";
        if (!cancelled) showToast({ variant: "error", message: msg || "Failed" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [focusedLineKey, t]);

  useEffect(() => {
    if (!matches?.length || !focusedLineKey) return;
    const exists = matches.some((m) => `${m.order.orderNo}:${m.product.id}` === focusedLineKey);
    if (!exists) setFocusedLineKey(null);
  }, [matches, focusedLineKey]);

  const onToolbarWorkPendingClick = useCallback(() => {
    void (async () => {
      if (!matches) return;
      if (!focusedLineKey) {
        showToast({ variant: "info", message: t("orders.inboundScan.workPendingSelectLineFirst") });
        return;
      }
      const pair = matches.find((m) => `${m.order.orderNo}:${m.product.id}` === focusedLineKey);
      if (!pair) return;
      const current = pair.product.manualStatusTags?.workPending ?? false;
      const nextValue = !current;
      const optimistic = matches.map((m) =>
        m.order.orderNo === pair.order.orderNo && m.product.id === pair.product.id
          ? {
              ...m,
              product: {
                ...m.product,
                // `manualStatusTags`의 boolean 3종을 항상 유지해 타입/렌더 안정성 보장
                manualStatusTags: {
                  labelState: m.product.manualStatusTags?.labelState ?? false,
                  issueProduct: m.product.manualStatusTags?.issueProduct ?? false,
                  workPending: nextValue,
                },
              },
            }
          : m,
      );
      try {
        // 버튼 클릭 직후 상태가 즉시 보이도록 낙관적 반영
        setMatches(optimistic);
        await patchManualOrderLineWorkPending(pair.order, pair.product, nextValue);

        // PATCH 직후 백엔드 반영 지연을 고려해 짧은 재조회 재시도
        let reloaded = optimistic;
        for (let i = 0; i < 3; i += 1) {
          reloaded = await enrichWarehouseScanMatchesFromApi(reloaded, t);
          const refreshed = reloaded.find(
            (m) => m.order.orderNo === pair.order.orderNo && m.product.id === pair.product.id,
          );
          const reflected = (refreshed?.product.manualStatusTags?.workPending ?? false) === nextValue;
          if (reflected) break;
          await sleep(220);
        }
        setMatches(reloaded);
        emitOrderBoardMutationSignal({
          orderNo: pair.order.orderNo,
          at: Date.now(),
          source: "inbound-scan",
        });
        showToast({ variant: "success", message: t("orders.viewWindow.stubSaved") });
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Failed";
        showToast({ variant: "error", message: msg || "Failed" });
      }
    })();
  }, [matches, focusedLineKey, t]);

  const openIssuePhotoWindow = useCallback(() => {
    const key = focusedLineKey?.trim();
    if (!key) {
      showToast({ variant: "info", message: t("orders.inboundScan.issuePhotoSelectLineFirst") });
      return;
    }
    const idx = key.indexOf(":");
    if (idx <= 0) return;
    const focusedOrderNo = key.slice(0, idx).trim();
    const focusedProductId = key.slice(idx + 1).trim();
    if (!focusedOrderNo || !focusedProductId) return;
    /** 이슈 창은 초기 보드 스냅샷만 쓰면 수동조회로 채워진 이미지가 빠짐 → 현재 matches 줄로 덮어씀 */
    const matchPair = matches?.find((m) => `${m.order.orderNo}:${m.product.id}` === key) ?? null;
    const ordersForIssue = matchPair
      ? orders.map((o) => {
          if (o.orderNo !== matchPair.order.orderNo) return o;
          return {
            ...o,
            manualOrderPatchId: matchPair.order.manualOrderPatchId || o.manualOrderPatchId,
            products: o.products.map((p) => {
              const same =
                p.id === matchPair.product.id ||
                (!!matchPair.product.productNo?.trim() && p.productNo === matchPair.product.productNo);
              return same ? { ...p, ...matchPair.product } : p;
            }),
          };
        })
      : orders;
    const token = putIssuePhotoWindowPayload({
      orders: ordersForIssue,
      defaultWarehouse: (warehouse || defaultWarehouse || "").trim(),
      focusedOrderNo,
      focusedProductId,
    });
    if (!token) return;
    const path = `/admin/orders/business/issue-photo?k=${encodeURIComponent(token)}`;
    const url = `${window.location.origin}${path}`;
    const w = 920;
    const h = 720;
    const left = Math.max(0, Math.floor((window.screen.availWidth - w) / 2));
    const top = Math.max(0, Math.floor((window.screen.availHeight - h) / 2));
    const features = [
      `width=${w}`,
      `height=${h}`,
      `left=${left}`,
      `top=${top}`,
      "scrollbars=yes",
      "resizable=yes",
      "menubar=no",
      "toolbar=no",
    ].join(",");
    const popup = window.open(url, "_blank", features);
    if (!popup) {
      showToast({ message: t("orders.inboundScan.popupBlocked"), variant: "error" });
    }
  }, [orders, matches, defaultWarehouse, warehouse, focusedLineKey, t]);

  const onScan = () => {
    void (async () => {
      const raw = tracking.trim();
      if (!raw) {
        window.alert(t("orders.inboundScan.trackingRequired"));
        return;
      }
      setLoading(true);
      try {
        setFocusedLineKey(null);
        let nextMatches = collectWarehouseScanMatches(orders, warehouse, raw);
        nextMatches = await enrichWarehouseScanMatchesFromApi(nextMatches, t);
        setMatches(nextMatches);
      } finally {
        setLoading(false);
      }
    })();
  };

  const onUploadImages = async (files: FileList | null, _mode: "append" | "replace") => {
    const target = pendingUploadTargetRef.current ?? pendingTarget;
    pendingUploadTargetRef.current = null;
    const category = pendingUploadCategoryRef.current ?? "income";
    pendingUploadCategoryRef.current = null;
    if (!target || !matches) return;
    const matchList = matches;
    const m0 =
      matchList.find((x) => x.order.orderNo === target.orderNo && x.product.id === target.productId) ?? null;
    if (!m0) return;

    const line = m0;
    const picked = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (picked.length === 0) return;

    let urls: string[];
    try {
      urls = await postAdminOrderUploadImages(category, picked);
      uploadDebug("upload-images by category", { category, urls });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      window.alert(msg || "Image upload failed");
      return;
    }
    if (!urls.length) {
      showToast({ variant: "error", message: t("orders.inboundScan.uploadResponseMissingUrls") });
      return;
    }
    const uploadedSet = new Set(urls.map((u) => u.trim()).filter(Boolean));
    const optimistic = matchList.map((m) => {
      if (m.order.orderNo !== line.order.orderNo || m.product.id !== line.product.id) return m;
      const baseApi = {
        incomeimgurl: m.product.inboundApiImages?.incomeimgurl ?? [],
        issueimgurl: m.product.inboundApiImages?.issueimgurl ?? [],
        realbarcodeimgurl: m.product.inboundApiImages?.realbarcodeimgurl ?? "",
      };
      if (category === "barcode") {
        return {
          ...m,
          product: {
            ...m.product,
            barcodeImages: urls,
            inboundApiImages: {
              ...baseApi,
              realbarcodeimgurl: urls[0] ?? "",
            },
          },
        };
      }
      if (category === "income") {
        const prev = m.product.inboundApiImages?.incomeimgurl ?? [];
        const merged = mergeUniqueStringUrls(
          prev.map((x) => x.url),
          urls,
        ).map((url) => ({ url, isclick: true }));
        return {
          ...m,
          product: {
            ...m.product,
            inboundApiImages: {
              ...baseApi,
              incomeimgurl: merged,
            },
          },
        };
      }
      const prevIssueApi = m.product.inboundApiImages?.issueimgurl ?? [];
      const mergedIssueApi = mergeUniqueStringUrls(
        prevIssueApi.map((x) => x.url),
        urls,
      ).map((url) => ({ url, isclick: true }));
      return {
        ...m,
        product: {
          ...m.product,
          issueImages: mergeUniqueStringUrls(m.product.issueImages ?? [], urls),
          inboundApiImages: {
            ...baseApi,
            issueimgurl: mergedIssueApi,
          },
        },
      };
    });
    try {
      if (category === "barcode") {
        // 바코드는 inbound 계약 필드(realbarcodeimgurl)로 직접 교체 저장.
        await patchManualOrderInboundLineFromUpload(line.order, line.product, {
          income: [],
          issue: [],
          barcode: urls,
        });
      } else {
        const grouped =
          category === "income"
            ? { income: urls, issue: [] as string[], barcode: [] as string[] }
            : { income: [] as string[], issue: urls, barcode: [] as string[] };
        await patchManualOrderInboundLineFromUpload(line.order, line.product, grouped);
      }
      // 저장 성공 직후 즉시 반영(백엔드 반영 지연 시에도 화면이 바로 바뀌게 함)
      setMatches(optimistic);
      // 그 다음 서버값으로 동기화(지연 반영 대응 재시도)
      let next = optimistic;
      for (let i = 0; i < 4; i += 1) {
        next = await refreshMatchesInboundFromManualSearch(next, line.order.orderNo, t);
        const refreshed =
          next.find((x) => x.order.orderNo === line.order.orderNo && x.product.id === line.product.id) ?? null;
        if (refreshed) {
          if (category === "barcode") {
            const done = (refreshed.product.barcodeImages ?? []).some((u) => uploadedSet.has(u.trim()));
            if (done) break;
          } else if (category === "income") {
            const done = (refreshed.product.inboundApiImages?.incomeimgurl ?? []).some((x) =>
              uploadedSet.has(x.url.trim()),
            );
            if (done) break;
          } else {
            const done =
              (refreshed.product.issueImages ?? []).some((u) => uploadedSet.has(u.trim())) ||
              (refreshed.product.inboundApiImages?.issueimgurl ?? []).some((x) => uploadedSet.has(x.url.trim()));
            if (done) break;
          }
        }
        await sleep(220);
      }
      setMatches(next);
      emitOrderBoardMutationSignal({
        orderNo: line.order.orderNo,
        at: Date.now(),
        source: "inbound-scan",
      });
      showToast({ variant: "success", message: t("orders.viewWindow.stubSaved") });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      uploadDebug("inbound PATCH failed", { error: msg });
      window.alert(msg || "Failed to upload image");
    }
  };

  const resolveTargetFromCard = (cardEl: Element | null): { orderNo: string; productId: string } | null => {
    if (!(cardEl instanceof HTMLElement)) return null;
    const orderNo = cardEl.dataset.orderNo?.trim() ?? "";
    const productId = cardEl.dataset.productId?.trim() ?? "";
    if (!orderNo || !productId) return null;
    return { orderNo, productId };
  };

  /** 상단 입고(실사) 사진 — 체크박스로 선택한 줄과 동일 대상. */
  const resolveTargetFromFocusedLineKey = (): { orderNo: string; productId: string } | null => {
    const key = focusedLineKey?.trim();
    if (!key) return null;
    const idx = key.indexOf(":");
    if (idx <= 0) return null;
    const orderNo = key.slice(0, idx).trim();
    const productId = key.slice(idx + 1).trim();
    if (!orderNo || !productId) return null;
    return { orderNo, productId };
  };

  const onResultsClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const targetEl = e.target as HTMLElement | null;
    if (!targetEl) return;
    const takePhotoButton = targetEl.closest('[data-action="take-photo"]');
    if (takePhotoButton) {
      const resolved = resolveTargetFromFocusedLineKey();
      if (!resolved) {
        showToast({ variant: "info", message: t("orders.inboundScan.inspectionPhotoSelectLineFirst") });
        return;
      }
      const next = { ...resolved };
      pendingUploadTargetRef.current = next;
      pendingUploadCategoryRef.current = "income";
      setPendingTarget(next);
      cameraInputRef.current?.click();
      return;
    }
    const topUpload = targetEl.closest('[data-action="upload"]');
    if (topUpload) {
      const resolved = resolveTargetFromFocusedLineKey();
      if (!resolved) {
        showToast({ variant: "info", message: t("orders.inboundScan.inspectionPhotoSelectLineFirst") });
        return;
      }
      const next = { ...resolved };
      pendingUploadTargetRef.current = next;
      pendingUploadCategoryRef.current = "income";
      setPendingTarget(next);
      uploadInputRef.current?.click();
      return;
    }
    const lineUploadBarcode = targetEl.closest('[data-action="line-upload-barcode"]');
    if (lineUploadBarcode) {
      const card = targetEl.closest("[data-inbound-card]");
      const resolved = resolveTargetFromCard(card);
      if (!resolved) {
        showToast({ variant: "error", message: t("orders.inboundScan.barcodeUploadTargetMissing") });
        return;
      }
      const next = { ...resolved };
      pendingUploadTargetRef.current = next;
      pendingUploadCategoryRef.current = "barcode";
      setPendingTarget(next);
      uploadInputRef.current?.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mb-4">
          <label htmlFor="inbound-wh" className="mb-1.5 block text-xs font-medium text-gray-600">
            {t("orders.filter.center")}
          </label>
          <select
            id="inbound-wh"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="h-9 w-full max-w-xs rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            aria-label={t("orders.filter.center")}
          >
            <option value="">{t("orders.filter.centerAll")}</option>
            <option value="Weihai">{t("orders.filter.centerWeihai")}</option>
            <option value="Qingdao">{t("orders.filter.centerQingdao")}</option>
            <option value="Guangzhou">{t("orders.filter.centerGuangzhou")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="inbound-track" className="mb-2 block text-sm font-bold text-gray-900">
            {t("orders.inboundScan.trackingNumber")}
          </label>
          <div className="flex overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-sky-400/40">
            <input
              id="inbound-track"
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onScan();
                }
              }}
              placeholder={t("orders.inboundScan.trackingPlaceholder")}
              autoComplete="off"
              className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={onScan}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1.5 bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
            >
              <ScanLine className="h-4 w-4 shrink-0" aria-hidden />
              {t("orders.inboundScan.scanButton")}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-3 py-4">
        {loading ? (
          <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            {t("orders.inboundScan.scanLoading")}
          </p>
        ) : matches != null ? (
          <WarehouseScanResults
            matches={matches}
            trackingFilter={tracking}
            labels={scanLabels}
            onResultsClick={onResultsClick}
            focusedLineKey={focusedLineKey}
            onFocusedLineKeyChange={setFocusedLineKey}
            workPendingToolbarActive={workPendingToolbarActive}
            onToolbarWorkPendingClick={onToolbarWorkPendingClick}
            onIssuePhotoClick={openIssuePhotoWindow}
          />
        ) : (
          <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            {t("orders.inboundScan.initialHint")}
          </p>
        )}
      </div>
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void onUploadImages(e.currentTarget.files, "append");
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*;capture=camera"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void onUploadImages(e.currentTarget.files, "append");
          e.currentTarget.value = "";
        }}
      />

      <div className="fixed bottom-0 left-0 right-0 flex justify-end border-t border-gray-200 bg-gray-50 px-4 py-3">
        <button
          type="button"
          onClick={() => window.close()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          {t("orders.common.close")}
        </button>
      </div>
    </div>
  );
}

export function InboundScanMissingPayload({ backHref }: { backHref: string }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-md rounded border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
      <p className="mb-4">{t("orders.tool.missingPayload")}</p>
      <Link href={backHref} className="text-blue-600 underline hover:text-blue-800">
        {t("orders.tool.backToBoard")}
      </Link>
    </div>
  );
}
