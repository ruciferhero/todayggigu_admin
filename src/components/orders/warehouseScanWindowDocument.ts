import type { OrderBoardOrder, OrderBoardProduct } from "./OrderBoard";
import { escapeHtml } from "./orderViewWindowDocument";

export interface WarehouseScanWindowLabels {
  pageTitle: string;
  takePhoto: string;
  upload: string;
  inboundComplete: string;
  workPending: string;
  issuePhoto: string;
  orderNumber: string;
  productNumber: string;
  productName: string;
  productImage: string;
  colorSize: string;
  quantity: string;
  barcode: string;
  barcodePhoto: string;
  imageUpload: string;
  productMemo: string;
  userMemo: string;
  caution: string;
  inspectionImages: string;
  sellerShippingCost: string;
  actualShippingCost: string;
  won: string;
  status: string;
  warehouseInComplete: string;
  warehouseInProgress: string;
  orderNoBracket: string;
  noMatches: string;
  close: string;
  trackingFilterCaption: string;
}

export type WarehouseScanMatch = { order: OrderBoardOrder; product: OrderBoardProduct };

/** `useLocale().t` 기준 입고 스캔 결과 HTML용 라벨 */
export function warehouseScanLabelsFromTranslate(t: (key: string) => string): WarehouseScanWindowLabels {
  return {
    pageTitle: t("orders.action.warehouseScan"),
    takePhoto: t("orders.inboundScan.takePhoto"),
    upload: t("orders.inboundScan.upload"),
    inboundComplete: t("orders.inboundScan.inboundComplete"),
    workPending: t("orders.inboundScan.workPending"),
    issuePhoto: t("orders.inboundScan.issuePhoto"),
    orderNumber: t("orders.common.orderNumber"),
    productNumber: t("orders.product.productNumber"),
    productName: t("orders.inboundScan.productName"),
    productImage: t("orders.inboundScan.productImage"),
    colorSize: t("orders.inboundScan.colorSize"),
    quantity: t("orders.common.quantity"),
    barcode: t("orders.inboundScan.barcode"),
    barcodePhoto: t("orders.inboundScan.barcodePhoto"),
    imageUpload: t("orders.inboundScan.imageUpload"),
    productMemo: t("orders.product.productMemo"),
    userMemo: t("orders.product.userMemo"),
    caution: t("orders.product.caution"),
    inspectionImages: t("orders.product.inspectionImages"),
    sellerShippingCost: t("orders.product.sellerShippingCost"),
    actualShippingCost: t("orders.product.actualShippingCost"),
    status: t("orders.common.status"),
    warehouseInComplete: t("orders.status.warehouseInComplete"),
    warehouseInProgress: t("orders.status.warehouseInProgress"),
    orderNoBracket: t("orders.inboundScan.orderNoBracket"),
    noMatches: t("orders.inboundScan.noMatchesHint"),
    close: t("orders.common.close"),
    trackingFilterCaption: t("orders.inboundScan.trackingFilterCaption"),
    won: t("orders.common.won"),
  };
}

function lineOrderNo(p: OrderBoardProduct, order: OrderBoardOrder): string {
  const pon = p.productOrderNumber?.trim();
  return pon && pon.length > 0 ? pon : order.orderNo;
}

function productBlock(m: WarehouseScanMatch, L: WarehouseScanWindowLabels, barcodeValue: string): string {
  const { order, product: p } = m;
  const displayOrderNo = lineOrderNo(p, order);
  const orderNoBracket = L.orderNoBracket.replace("{{no}}", displayOrderNo);
  const memo = p.productMemo ?? order.productMemo ?? "";
  const userMemo = p.userMemo ?? order.userMemo ?? "";
  const caution = p.caution ?? order.caution ?? "";
  const defaultNote = `${p.productNo}-26包邮》等卖家改价 /`;
  const img =
    p.image != null && p.image !== ""
      ? `<img src="${escapeHtml(p.image)}" alt="" class="pimg" referrerpolicy="no-referrer" />`
      : `<span class="pimg-ph">IMG</span>`;
  const insp = (p.inspectionImages ?? [])
    .slice(0, 6)
    .map(
      (u) =>
        `<a class="insp-a" href="${escapeHtml(u)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(u)}" alt="" class="insp-thumb" referrerpolicy="no-referrer"/></a>`,
    )
    .join("");
  const inspRow =
    insp.length > 0
      ? `<tr><th>${escapeHtml(L.inspectionImages)}</th><td><div class="insp-row">${insp}</div></td></tr>`
      : "";
  const seller =
    typeof p.sellerShippingCost === "number" && Number.isFinite(p.sellerShippingCost)
      ? `${escapeHtml(L.won)}${p.sellerShippingCost.toLocaleString()}`
      : "—";
  const actual = `${escapeHtml(L.won)}${p.shippingCost.toLocaleString()}`;

  return `
<section class="card">
  <p class="orderno"><span class="muted">${escapeHtml(L.orderNumber)}</span> : <strong class="red">${escapeHtml(displayOrderNo)}</strong></p>
  <div class="tbl-wrap">
    <table class="tbl">
      <tbody>
        <tr><th>${escapeHtml(L.productNumber)}</th><td>${escapeHtml(p.productNo)}</td></tr>
        <tr><th>${escapeHtml(L.productName)}</th><td>${escapeHtml(p.name)}</td></tr>
        <tr><th>${escapeHtml(L.productImage)}</th><td><div class="thumb">${img}</div></td></tr>
        ${inspRow}
        <tr><th>${escapeHtml(L.colorSize)}</th><td>${escapeHtml(p.option)}</td></tr>
        <tr><th>${escapeHtml(L.quantity)}</th><td>${escapeHtml(String(p.quantity))}</td></tr>
        <tr><th>${escapeHtml(L.sellerShippingCost)}</th><td>${seller}</td></tr>
        <tr><th>${escapeHtml(L.actualShippingCost)}</th><td>${actual}</td></tr>
        <tr><th>${escapeHtml(L.caution)}</th><td><input type="text" class="inp" value="${escapeHtml(caution)}" placeholder="${escapeHtml(L.caution)}" /></td></tr>
        <tr><th>${escapeHtml(L.userMemo)}</th><td><input type="text" class="inp" value="${escapeHtml(userMemo)}" placeholder="${escapeHtml(L.userMemo)}" /></td></tr>
        <tr><th>${escapeHtml(L.barcode)}</th><td><input type="text" class="inp" value="${escapeHtml(barcodeValue)}" /></td></tr>
        <tr><th>${escapeHtml(L.barcodePhoto)}</th><td><div class="upload">${escapeHtml(L.imageUpload)}</div></td></tr>
        <tr><th>${escapeHtml(L.productMemo)}</th><td><input type="text" class="inp" value="${escapeHtml(memo)}" placeholder="${escapeHtml(L.productMemo)}" /></td></tr>
        <tr><th>${escapeHtml(L.status)}</th><td>
          <select class="sel">
            <option>${escapeHtml(L.warehouseInComplete)}</option>
            <option>${escapeHtml(L.warehouseInProgress)}</option>
          </select>
        </td></tr>
        <tr><th class="th-top">${escapeHtml(orderNoBracket)}</th><td><textarea class="ta" rows="3">${escapeHtml(defaultNote)}</textarea></td></tr>
      </tbody>
    </table>
  </div>
</section>`;
}

/** 스타일 블록 — 입고 스캔 결과 카드 + 상단 바 */
export function warehouseScanWindowCss(): string {
  return `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; font-size: 13px; color: #111827; background: #f3f4f6; }
  .head {
    text-align: center; font-weight: 700; font-size: 15px; padding: 14px 12px;
    background: #fff; border-bottom: 1px solid #e5e7eb;
  }
  .wrap { max-width: 520px; margin: 0 auto; padding: 12px 12px 80px; }
  .filter { font-size: 12px; color: #4b5563; margin: 0 0 10px; }
  .filter code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  .actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
  .btn-teal {
    width: 100%; border: 0; border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 600; color: #fff;
    background: #14b8a6; cursor: default;
  }
  .btn-upload {
    min-height: 5.5rem; width: 100%; border-radius: 10px; border: 2px dashed #d1d5db; background: #f9fafb;
    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #4b5563;
  }
  .btn-gray {
    border: 0; border-radius: 10px; padding: 10px; font-size: 13px; font-weight: 600; color: #1f2937;
    background: #e5e7eb; cursor: default;
  }
  .btn-gray.full { width: 100%; padding: 12px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .card {
    background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; margin-bottom: 14px;
  }
  .orderno { text-align: center; font-size: 12px; margin: 0 0 10px; }
  .muted { color: #6b7280; }
  .red { color: #dc2626; }
  .tbl-wrap { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  .tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
  .tbl th {
    width: 38%; text-align: left; padding: 8px 10px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb; font-weight: 600; color: #374151; vertical-align: middle;
  }
  .tbl th.th-top { vertical-align: top; padding-top: 10px; }
  .tbl td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; background: #fff; vertical-align: middle; }
  .tbl tr:last-child th, .tbl tr:last-child td { border-bottom: none; }
  .thumb { width: 80px; height: 80px; border-radius: 6px; border: 1px solid #e5e7eb; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
  .pimg { width: 100%; height: 100%; object-fit: cover; }
  .pimg-ph { font-size: 10px; color: #9ca3af; }
  .insp-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .insp-a { display: block; width: 56px; height: 56px; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb; }
  .insp-thumb { width: 100%; height: 100%; object-fit: cover; }
  .inp {
    width: 100%; height: 32px; border: 1px solid #d1d5db; border-radius: 6px; padding: 0 8px; font-size: 12px;
  }
  .sel { width: 100%; height: 32px; border: 1px solid #d1d5db; border-radius: 6px; padding: 0 8px; font-size: 12px; background: #fff; }
  .ta { width: 100%; resize: vertical; border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 8px; font-size: 12px; }
  .upload {
    min-height: 4rem; border: 2px dashed #fdba74; border-radius: 8px; background: rgba(255, 247, 237, 0.6);
    display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #c2410c;
  }
  .empty { text-align: center; padding: 28px 16px; color: #6b7280; font-size: 13px; background: #fff; border-radius: 10px; border: 1px solid #e5e7eb; }
  .foot {
    position: fixed; left: 0; right: 0; bottom: 0; padding: 12px; background: #f9fafb; border-top: 1px solid #e5e7eb;
    display: flex; justify-content: flex-end;
  }
  .btn-close {
    border: 1px solid #d1d5db; border-radius: 8px; background: #fff; padding: 8px 18px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer;
  }
  .btn-close:hover { background: #f3f4f6; }
`;
}

/** 입고 스캔 결과 본문(액션 + 필터 문구 + 카드들) */
export function buildWarehouseScanResultsInnerHtml(
  matches: WarehouseScanMatch[],
  trackingFilter: string,
  L: WarehouseScanWindowLabels,
): string {
  const trackingEsc = escapeHtml(trackingFilter.trim());
  const barcodeVal = trackingFilter.trim();
  const topActions = `
<div class="actions">
  <button type="button" class="btn-teal">${escapeHtml(L.takePhoto)}</button>
  <div class="btn-upload">${escapeHtml(L.upload)}</div>
  <button type="button" class="btn-gray full">${escapeHtml(L.inboundComplete)}</button>
  <div class="grid2">
    <button type="button" class="btn-gray">${escapeHtml(L.workPending)}</button>
    <button type="button" class="btn-gray">${escapeHtml(L.issuePhoto)}</button>
  </div>
</div>`;
  const filterLine =
    matches.length > 0
      ? `<p class="filter">${escapeHtml(L.trackingFilterCaption)}: <code>${trackingEsc}</code></p>`
      : "";
  const body =
    matches.length === 0
      ? `<p class="empty">${escapeHtml(L.noMatches)}</p>`
      : matches.map((m) => productBlock(m, L, barcodeVal)).join("");
  return `${topActions}${filterLine}${body}`;
}

export function buildWarehouseScanResultsWindowHtml(
  matches: WarehouseScanMatch[],
  trackingFilter: string,
  L: WarehouseScanWindowLabels,
): string {
  const docTitle = `${L.pageTitle} — ${trackingFilter}`;
  const inner = buildWarehouseScanResultsInnerHtml(matches, trackingFilter, L);
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(docTitle)}</title>
<style>${warehouseScanWindowCss()}</style>
</head>
<body>
  <div class="head">${escapeHtml(L.pageTitle)}</div>
  <div class="wrap">
    ${inner}
  </div>
  <div class="foot">
    <button type="button" class="btn-close" onclick="window.close()">${escapeHtml(L.close)}</button>
  </div>
</body>
</html>`;
}
