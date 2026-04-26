"use client";

import React, { useMemo } from "react";
import type { WarehouseScanMatchPair } from "@/api/orders/manualSearch";
import type { OrderBoardProduct } from "@/components/orders/OrderBoard";
import type { WarehouseScanWindowLabels } from "@/components/orders/warehouseScanWindowDocument";
import { warehouseScanDisplayOrderNo } from "@/components/orders/warehouseScanWindowDocument";

type Props = {
  matches: WarehouseScanMatchPair[];
  trackingFilter: string;
  labels: WarehouseScanWindowLabels;
  onResultsClick: React.MouseEventHandler<HTMLDivElement>;
  /** 선택된 상품 줄 키 `orderNo:productId` — 상단 작업대기 버튼과 동기 */
  focusedLineKey: string | null;
  onFocusedLineKeyChange: (key: string | null) => void;
  workPendingToolbarActive: boolean;
  onToolbarWorkPendingClick: () => void;
  onIssuePhotoClick: () => void;
};

function lineKey(orderNo: string, productId: string): string {
  return `${orderNo}:${productId}`;
}

function mergeUniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const s = u.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

/** API가 바코드 자산을 incomeimgurl에 넣는 경우 제외(readBarcodeImageUrls와 동일 경로 휴리스틱) */
function looksLikeBarcodeAssetUrl(url: string): boolean {
  return (
    /\/order\/barcode\//i.test(url) ||
    /\/barcode\/images\//i.test(url) ||
    /barcode/i.test(url) ||
    /realbarcode/i.test(url)
  );
}

function barcodeUrlSet(p: OrderBoardProduct): Set<string> {
  const s = new Set<string>();
  for (const u of p.barcodeImages ?? []) {
    const t = u.trim();
    if (t) s.add(t);
  }
  const rb = (p.inboundApiImages?.realbarcodeimgurl ?? "").trim();
  if (rb) s.add(rb);
  return s;
}

/** 입고사진 표시용 — 바코드 전용 URL은 제외 */
function incomeUrlsForDisplay(p: OrderBoardProduct): string[] {
  const raw = (p.inboundApiImages?.incomeimgurl ?? []).map((x) => x.url).filter(Boolean);
  const bc = barcodeUrlSet(p);
  return raw.filter((u) => {
    const t = u.trim();
    if (!t) return false;
    if (bc.has(t)) return false;
    if (looksLikeBarcodeAssetUrl(t)) return false;
    return true;
  });
}

function barcodeUrlsForDisplay(p: OrderBoardProduct): string[] {
  const rb = (p.inboundApiImages?.realbarcodeimgurl ?? "").trim();
  return mergeUniqueUrls([...(p.barcodeImages ?? []), ...(rb ? [rb] : [])]);
}

function thumbStrip(urls: string[], borderClass: string) {
  if (!urls.length) return ;
  return (
    <div className="flex flex-wrap gap-1.5">
      {urls.map((u) => (
        <a
          key={u}
          href={u}
          target="_blank"
          rel="noreferrer"
          className={`block h-14 w-14 shrink-0 overflow-hidden rounded-md border ${borderClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        </a>
      ))}
    </div>
  );
}

export function WarehouseScanResults({
  matches,
  trackingFilter,
  labels: L,
  onResultsClick,
  focusedLineKey,
  onFocusedLineKeyChange,
  workPendingToolbarActive,
  onToolbarWorkPendingClick,
  onIssuePhotoClick,
}: Props) {
  const trackingTrim = trackingFilter.trim();
  /** 상단(입고완료 위): 체크한 줄의 입고사진(income) — 이슈는 이슈사진 팝업 전용 */
  const topInboundApiPreview = useMemo(() => {
    if (focusedLineKey == null) {
      return { income: [] as string[], caption: "", hasLine: false };
    }
    const target = matches.find((x) => lineKey(x.order.orderNo, x.product.id) === focusedLineKey) ?? null;
    const income = target ? incomeUrlsForDisplay(target.product) : [];
    const caption = target ? `${target.order.orderNo} · ${target.product.productNo || target.product.id}` : "";
    return { income, caption, hasLine: target != null };
  }, [matches, focusedLineKey]);

  return (
    <div className="text-[13px] text-gray-900" onClick={onResultsClick}>
      <div className="mb-3.5 flex flex-col gap-2.5">
        <button
          type="button"
          className="w-full cursor-pointer rounded-[10px] border-0 bg-teal-500 px-3 py-3 text-sm font-semibold text-white hover:bg-teal-600"
          data-action="take-photo"
        >
          {L.takePhoto}
        </button>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-[10px] font-semibold text-gray-700">{L.inboundPhotoLabel}</span>
            {topInboundApiPreview.caption ? (
              <span className="text-[10px] font-medium text-gray-500">{topInboundApiPreview.caption}</span>
            ) : null}
          </div>
          <div className="flex min-h-[4.5rem] flex-wrap items-center gap-1.5 rounded-lg border-2  border-orange-300 bg-gray-50/60 p-1.5">
            {thumbStrip(topInboundApiPreview.income, "border-orange-200")}
            <div
              className="flex h-[4.5rem] w-[4.5rem] shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-orange-400 bg-orange-100/70 p-1 text-center text-[9px] font-semibold leading-tight text-orange-900 hover:bg-orange-100"
              data-action="upload"
              role="button"
              tabIndex={0}
            >
              <span className="text-lg font-bold leading-none text-red-600" aria-hidden>
                +
              </span>
              <span className="block max-w-full break-keep">{L.imageUpload}</span>
            </div>
          </div>
        </div>
        {/* {!topInboundApiPreview.hasLine ? (
          <p className="text-[11px] text-gray-400">{L.noInboundApiImagesSummary}</p>
        ) : null} */}
        <button type="button" className="w-full cursor-default rounded-[10px] border-0 bg-gray-200 px-3 py-3 text-sm font-semibold text-gray-800">
          {L.inboundComplete}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={workPendingToolbarActive}
            onClick={(e) => {
              e.stopPropagation();
              onToolbarWorkPendingClick();
            }}
            className={`rounded-[10px] border-0 px-2.5 py-2.5 text-[13px] font-semibold transition ${
              workPendingToolbarActive
                ? "cursor-pointer bg-gradient-to-br from-yellow-300 via-amber-300 to-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-500/80"
                : "cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {L.workPending}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIssuePhotoClick();
            }}
            className="cursor-pointer rounded-[10px] border-0 bg-gray-200 px-2.5 py-2.5 text-[13px] font-semibold text-gray-800 hover:bg-gray-300"
          >
            {L.issuePhoto}
          </button>
        </div>
      </div>

      {matches.length > 0 ? (
        <p className="mb-2.5 text-xs text-gray-600">
          {L.trackingFilterCaption}:{" "}
          <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">{trackingTrim}</code>
        </p>
      ) : null}

      {matches.length === 0 ? (
        <p className="rounded-[10px] border border-gray-200 bg-white px-4 py-7 text-center text-[13px] text-gray-500">
          {L.noMatches}
        </p>
      ) : (
        matches.map((m) => {
          const { order, product: p } = m;
          const displayOrderNo = warehouseScanDisplayOrderNo(p, order);
          const orderNoBracket = L.orderNoBracket.replace("{{no}}", displayOrderNo);
          const memo = p.productMemo ?? order.productMemo ?? "";
          const userMemo = p.userMemo ?? order.userMemo ?? "";
          const caution = p.caution ?? order.caution ?? "";
          const defaultNote = `${p.productNo}-26包邮》等卖家改价 /`;
          const seller =
            typeof p.sellerShippingCost === "number" && Number.isFinite(p.sellerShippingCost)
              ? `${L.won}${p.sellerShippingCost.toLocaleString()}`
              : "—";
          const actual = `${L.won}${p.shippingCost.toLocaleString()}`;
          const barcodeImgs = barcodeUrlsForDisplay(p).slice(0, 8);
          const lk = lineKey(order.orderNo, p.id);
          const tags = p.manualStatusTags;
          const isFocused = focusedLineKey === lk;

          return (
            <section
              key={`${order.orderNo}:${p.id}`}
              className="mb-3.5 rounded-[10px] border border-gray-200 bg-white p-2.5"
              data-inbound-card
              data-order-no={order.orderNo}
              data-product-id={p.id}
            >
              <p className="mb-2.5 text-center text-xs">
                <span className="text-gray-500">{L.orderNumber}</span> : <strong className="text-red-600">{displayOrderNo}</strong>
              </p>
              
              <div className="flex flex-row items-start gap-1.5">
                <label
                  className="flex w-[26px] shrink-0 cursor-pointer justify-center self-start pt-[11px]"
                  title={L.selectLine}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isFocused}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) onFocusedLineKeyChange(lk);
                      else onFocusedLineKeyChange(null);
                    }}
                    className={`h-[18px] w-[18px] shrink-0 cursor-pointer accent-teal-600 ${isFocused ? "ring-2 ring-teal-400 ring-offset-1 rounded" : ""}`}
                    aria-label={L.selectLine}
                  />
                </label>
                <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.productNumber}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">{p.productNo}</td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.productName}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">{p.name}</td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.productImage}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">
                          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[10px] text-gray-400">IMG</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.colorSize}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">{p.option}</td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.quantity}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">{String(p.quantity)}</td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.sellerShippingCost}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">{seller}</td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.actualShippingCost}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">{actual}</td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.caution}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">
                          <input
                            type="text"
                            className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                            defaultValue={caution}
                            placeholder={L.caution}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.userMemo}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">
                          <input
                            type="text"
                            className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                            defaultValue={userMemo}
                            placeholder={L.userMemo}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.barcode}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">
                          <input type="text" className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs" defaultValue={trackingTrim} />
                        </td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.barcodePhoto}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {barcodeImgs.map((u: string) => (
                              <a
                                key={u}
                                href={u}
                                target="_blank"
                                rel="noreferrer"
                                className="block h-14 w-14 shrink-0 overflow-hidden rounded-md border border-orange-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={u} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                              </a>
                            ))}
                            <button
                              type="button"
                              className="flex h-[4.5rem] w-[4.5rem] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50/60 p-1 text-center text-[9px] font-semibold leading-tight text-orange-800"
                              data-action="line-upload-barcode"
                            >
                              <span className="text-lg font-bold leading-none text-red-600" aria-hidden>
                                +
                              </span>
                              <span className="block max-w-full break-keep">{L.imageUpload}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.productMemo}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">
                          <input
                            type="text"
                            className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                            defaultValue={memo}
                            placeholder={L.productMemo}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-b border-r border-gray-200 bg-gray-100 px-2.5 py-2 text-left align-middle font-semibold text-gray-700">
                          {L.status}
                        </th>
                        <td className="border-b border-gray-200 bg-white px-2.5 py-2 align-middle">
                          <select className="h-8 w-full rounded-md border border-gray-300 bg-white px-2 text-xs">
                            <option>{L.warehouseInComplete}</option>
                            <option>{L.warehouseInProgress}</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <th className="w-[38%] border-r border-gray-200 bg-gray-100 px-2.5 pb-2 pt-2.5 text-left align-top text-xs font-semibold text-gray-700">
                          {orderNoBracket}
                        </th>
                        <td className="bg-white px-2.5 py-2 align-middle">
                          <textarea className="w-full resize-y rounded-md border border-gray-300 px-2 py-1.5 text-xs" rows={3} defaultValue={defaultNote} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
