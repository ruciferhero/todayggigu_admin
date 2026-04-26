"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OrderBoardOrder, OrderBoardProduct } from "@/components/orders/OrderBoard";
import { ApiError } from "@/api/client";
import {
  fetchManualOrder,
  fetchManualOrdersSearch,
  patchManualOrderLineIssueImages,
  postAdminOrderUploadImages,
  resolveManualOrderPatchIdentifier,
} from "@/api/orders/manualSearch";
import { useLocale } from "@/contexts/LocaleContext";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { emitOrderBoardMutationSignal } from "@/lib/orderBoardMutationSignal";

/** 체크박스로 지정한 주문번호·상품 라인만 — 업로드 PATCH 대상. */
function resolveFocusedProductLine(
  orders: OrderBoardOrder[],
  focusedOrderNo: string,
  focusedProductId: string,
): { order: OrderBoardOrder; product: OrderBoardProduct } | null {
  const oNo = focusedOrderNo.trim();
  const pId = focusedProductId.trim();
  if (!oNo || !pId) return null;
  const o = orders.find((x) => x.orderNo === oNo);
  if (!o?.products?.length) return null;
  const p =
    o.products.find((x) => x.id === pId) ??
    o.products.find((x) => pId.length > 0 && x.productNo.trim() === pId);
  return p ? { order: o, product: p } : null;
}

function mergeUniqueUrls(existing: string[], added: string[]): string[] {
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

function issueImageUrlsFromProduct(p: OrderBoardProduct): string[] {
  const fromApi = (p.inboundApiImages?.issueimgurl ?? []).map((row) => row.url).filter(Boolean);
  return mergeUniqueUrls(p.issueImages ?? [], fromApi);
}

export default function IssuePhotoToolWindow({
  orders: initialOrders,
  defaultWarehouse: _defaultWarehouse,
  focusedOrderNo = "",
  focusedProductId = "",
}: {
  orders: OrderBoardOrder[];
  defaultWarehouse: string;
  focusedOrderNo?: string;
  focusedProductId?: string;
}) {
  const { t } = useLocale();
  const [ordersState, setOrdersState] = useState<OrderBoardOrder[]>(initialOrders);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const gallery = useMemo(() => {
    const out: { url: string; caption: string }[] = [];
    const seen = new Set<string>();
    const push = (url: string, caption: string) => {
      const s = url.trim();
      if (!s || seen.has(s)) return;
      seen.add(s);
      out.push({ url: s, caption });
    };
    const focO = focusedOrderNo.trim();
    const focP = focusedProductId.trim();
    if (focO && focP) {
      const o = ordersState.find((x) => x.orderNo === focO);
      const p =
        o?.products.find((x) => x.id === focP) ??
        o?.products.find((x) => focP.length > 0 && x.productNo.trim() === focP);
      if (!p) return out;
      const date = o ? (o.updatedAt || o.shipDate || "").slice(0, 10) : "";
      const cap = date ? `${focO} · ${date}` : focO;
      for (const url of issueImageUrlsFromProduct(p)) push(url, cap);
      return out;
    }
    for (const o of ordersState) {
      const date = (o.updatedAt || o.shipDate || "").slice(0, 10);
      const cap = date ? `${o.orderNo} · ${date}` : o.orderNo;
      for (const p of o.products) {
        for (const url of issueImageUrlsFromProduct(p)) push(url, cap);
      }
    }
    return out;
  }, [ordersState, focusedOrderNo, focusedProductId]);

  const focusedLineSummary = useMemo(() => {
    const pair = resolveFocusedProductLine(ordersState, focusedOrderNo, focusedProductId);
    if (!pair) return "";
    return `${pair.order.orderNo} · ${pair.product.productNo || pair.product.id}`;
  }, [ordersState, focusedOrderNo, focusedProductId]);

  const canUploadToFocusedLine = useMemo(
    () => resolveFocusedProductLine(ordersState, focusedOrderNo, focusedProductId) != null,
    [ordersState, focusedOrderNo, focusedProductId],
  );

  const refreshOrderAfterIssuePatch = useCallback(
    async (order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">) => {
      let fresh: OrderBoardOrder | null = null;
      try {
        const id = resolveManualOrderPatchIdentifier(order);
        fresh = await fetchManualOrder(id, t);
      } catch (err) {
        // 일부 서버는 /orders/manual/:id 라우트를 제공하지 않아 orderNumber 검색으로 폴백.
        const isNotFound = err instanceof ApiError && err.status === 404;
        if (!isNotFound) throw err;
        const searched = await fetchManualOrdersSearch({ orderNumber: order.orderNo, page: 1, pageSize: 20 }, t);
        fresh = searched.orders.find((o) => o.orderNo === order.orderNo) ?? null;
      }
      if (!fresh) return;
      setOrdersState((prev) => prev.map((o) => (o.orderNo === fresh.orderNo ? fresh : o)));
    },
    [t],
  );

  /** 팝업 직후 GET으로 이슈·입고 API 필드 동기(입고 스캔과 동일 데이터) */
  useEffect(() => {
    const oNo = focusedOrderNo.trim();
    const pId = focusedProductId.trim();
    if (!oNo || !pId) return;
    const snap = initialOrders.find((x) => x.orderNo === oNo);
    if (!snap) return;
    let cancelled = false;
    void (async () => {
      try {
        let fresh: OrderBoardOrder | null = null;
        try {
          fresh = await fetchManualOrder(resolveManualOrderPatchIdentifier(snap), t);
        } catch (err) {
          const isNotFound = err instanceof ApiError && err.status === 404;
          if (!isNotFound) throw err;
          const searched = await fetchManualOrdersSearch({ orderNumber: snap.orderNo, page: 1, pageSize: 20 }, t);
          fresh = searched.orders.find((o) => o.orderNo === snap.orderNo) ?? null;
        }
        if (!fresh) return;
        if (!cancelled) {
          setOrdersState((prev) => prev.map((o) => (o.orderNo === fresh.orderNo ? fresh : o)));
        }
      } catch {
        /* 스냅샷만으로도 동작 가능 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [focusedOrderNo, focusedProductId, initialOrders, t]);

  const onUploadFiles = async (files: FileList | null) => {
    const pair = resolveFocusedProductLine(ordersState, focusedOrderNo, focusedProductId);
    if (!pair) {
      showToast({ variant: "error", message: t("orders.inboundScan.issuePhotoTargetMissing") });
      return;
    }
    const picked = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;
    let added: string[];
    try {
      added = await postAdminOrderUploadImages("issue", picked);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      window.alert(msg || "Upload failed");
      return;
    }
    if (!added.length) {
      showToast({ variant: "error", message: t("orders.inboundScan.uploadResponseMissingUrls") });
      return;
    }
    const current = issueImageUrlsFromProduct(pair.product);
    const next = mergeUniqueUrls(current, added);
    try {
      await patchManualOrderLineIssueImages(pair.order, pair.product, next);
      await refreshOrderAfterIssuePatch(pair.order);
      emitOrderBoardMutationSignal({ orderNo: pair.order.orderNo, at: Date.now(), source: "inbound-scan" });
      showToast({ variant: "success", message: t("orders.viewWindow.stubSaved") });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Failed";
      showToast({ variant: "error", message: msg || "Failed" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-3 pb-3 pt-3">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
          {/* 상단: 슬레이트 바 — 이슈사진 / 사진 촬영(탭 시 카메라) */}
          <button
            type="button"
            disabled={!canUploadToFocusedLine}
            onClick={() => cameraInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-1 border-0 bg-slate-700 px-4 py-4 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-lg font-bold leading-tight">{t("orders.inboundScan.issuePhoto")}</span>
            <span className="text-sm font-medium text-white/95">{t("orders.inboundScan.takePhoto")}</span>
          </button>
          {/* 메타: 왼쪽 라벨 · 오른쪽 주문·상품 키 */}
          <div className="flex items-center justify-between gap-2 border-x border-b border-gray-200 bg-white px-3 py-2.5">
            <span className="shrink-0 text-xs font-semibold text-gray-800">{t("orders.inboundScan.issuePhoto")}</span>
            {focusedLineSummary ? (
              <span className="min-w-0 truncate text-right text-[11px] font-medium text-gray-500" title={focusedLineSummary}>
                {focusedLineSummary}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">—</span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-3 pt-1">
        <div className="flex min-h-[4.5rem] flex-wrap items-center gap-1.5 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/60 p-2">
          {gallery.map((item) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              title={item.caption}
              className="block h-14 w-14 shrink-0 overflow-hidden rounded-md border border-rose-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </a>
          ))}
          <button
            type="button"
            disabled={!canUploadToFocusedLine}
            className="flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-rose-400 bg-white/90 p-1 text-center text-[9px] font-semibold leading-tight text-red-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => uploadInputRef.current?.click()}
          >
            <span className="text-lg font-bold leading-none" aria-hidden>
              +
            </span>
            <span className="block max-w-full break-keep">{t("orders.inboundScan.imageUpload")}</span>
          </button>
        </div>
        {!gallery.length ? (
          <p className="mt-2 text-center text-[11px] text-gray-400">{t("orders.inboundScan.issuePhotoEmpty")}</p>
        ) : null}
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void onUploadFiles(e.currentTarget.files);
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
          void onUploadFiles(e.currentTarget.files);
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

export function IssuePhotoMissingPayload({ backHref }: { backHref: string }) {
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
