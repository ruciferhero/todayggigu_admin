import type { OrderBoardOrder, OrderBoardProduct } from "./OrderBoard";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** UI strings for the standalone order detail window (from i18n). */
export interface OrderViewWindowLabels {
  none: string;
  won: string;
  close: string;
  orderMemo: string;
  orderMemoPlaceholder: string;
  register: string;
  orderInquiry: string;
  shippingCenterSection: string;
  orderShipperMailbox: string;
  progressReceipt: string;
  applicationCenterRow: string;
  trackingRow: string;
  shippingMethod: string;
  customsClearance: string;
  depositAutoPay: string;
  productInfoTitle: string;
  selectAll: string;
  saveOrderMemo: string;
  additionalServices: string;
  registeredCoupon: string;
  changeAdditionalServices: string;
  recipientSection: string;
  nameOrCompany: string;
  addressContact: string;
  bizRegAddress: string;
  deliveryRequest: string;
  centerRequest: string;
  changeRecipientAddress: string;
  orderInquirySection: string;
  inquiryPlaceholder: string;
  stubSaved: string;
  stubComingSoon: string;
  edit: string;
  copy: string;
  add: string;
  delete: string;
  trackingSave: string;
  orderNoSave: string;
  productNumber: string;
  image: string;
  nameOptions: string;
  trackingNoColon: string;
  orderNoLink: string;
  unitQtyPriceLine1: string;
  unitQtyPriceLine2: string;
  shippingLine1: string;
  shippingLine2: string;
  rackHeaderLine1: string;
  rackHeaderLine2: string;
  productStatus: string;
  trackingInput: string;
  batchSave: string;
  addAdditionalService: string;
  productLog: string;
  packingSplit: string;
  labelPrint: string;
  actualPhoto: string;
  rackNoColon: string;
  rackNoPlaceholder: string;
  rackSave: string;
  prevRackColon: string;
  productMemo: string;
  caution: string;
  userMemo: string;
  statusInbound: string;
  statusInboundDone: string;
  statusShipWait: string;
  workPending: string;
  labelUnconfirmed: string;
  issueProduct: string;
  trackingFilterPlaceholder: string;
}

/** 상품표 주문번호 열: API `productordernumber` 우선, 없으면 주문 `orderNo`(예: P00000003). */
function productLineOrderNo(p: OrderBoardProduct): string {
  const pon = p.productOrderNumber?.trim();
  return pon && pon.length > 0 ? pon : p.orderNo;
}

function productRows(order: OrderBoardOrder, L: OrderViewWindowLabels): string {
  const won = L.won;
  return order.products
    .map((p: OrderBoardProduct, pIdx: number) => {
      const rowNo = String(pIdx + 1).padStart(4, "0");
      const lineOrderNo = productLineOrderNo(p);
      const lineProductMemo = p.productMemo ?? order.productMemo ?? "";
      const lineCaution = p.caution ?? order.caution ?? "";
      const lineUserMemo = p.userMemo ?? order.userMemo ?? "";
      const priceLine1 = `${won}${p.unitPrice.toLocaleString()} × ${p.quantity} = ${won}${p.totalPrice.toLocaleString()}`;
      const priceLine2 = `${won}${p.unitPrice.toLocaleString()} × ${p.quantity} = ${won}${p.totalPrice.toLocaleString()}`;
      const prevRack = p.prevRackNo?.trim() ? p.prevRackNo : "—";
      const imgBlock = p.image
        ? `<img src="${escapeHtml(p.image)}" alt="" class="pv-thumb-img" referrerpolicy="no-referrer" />`
        : `<span class="pv-thumb-ph">IMG</span>`;

      return `
<tr class="pv-row-main">
  <td class="pv-cell pv-c1">
    <div class="pv-c1-inner">
      <label class="pv-cb-wrap"><input type="checkbox" class="pv-cb" name="pid" value="${escapeHtml(p.id)}" /><span class="pv-rowno">${escapeHtml(rowNo)}</span></label>
      <div class="pv-pno">${escapeHtml(L.productNumber)}: ${escapeHtml(p.productNo)}</div>
      <button type="button" class="pv-linkbtn js-stub">${escapeHtml(L.productLog)}</button>
      <button type="button" class="pv-borderbtn js-stub">${escapeHtml(L.packingSplit)}</button>
    </div>
  </td>
  <td class="pv-cell pv-c2">
    <div class="pv-c2-inner">
      <div class="pv-thumb">${imgBlock}</div>
      <button type="button" class="pv-borderbtn js-stub">${escapeHtml(L.labelPrint)}</button>
    </div>
  </td>
  <td class="pv-cell pv-c3">
    <div class="pv-name">${escapeHtml(p.name)}</div>
    <div class="pv-opt">${escapeHtml(p.option)}</div>
  </td>
  <td class="pv-cell pv-c4">
    <div class="pv-tk">${escapeHtml(L.trackingNoColon)}:${escapeHtml(p.trackingNo || "-")}</div>
    <button type="button" class="pv-borderbtn js-stub">${escapeHtml(L.actualPhoto)}</button>
    <div class="pv-mt"><input type="text" class="pv-inp" value="${escapeHtml(p.trackingNo)}" aria-label="${escapeHtml(L.trackingNoColon)}" /><button type="button" class="pv-btn-teal js-save">${escapeHtml(L.trackingSave)}</button></div>
    <div class="pv-mt"><button type="button" class="pv-link js-stub">${escapeHtml(lineOrderNo)}</button></div>
    <div class="pv-mt"><input type="text" class="pv-inp" value="${escapeHtml(lineOrderNo)}" aria-label="${escapeHtml(L.orderNoLink)}" /><button type="button" class="pv-btn-teal js-save">${escapeHtml(L.orderNoSave)}</button></div>
  </td>
  <td class="pv-cell pv-c5">
    <div class="pv-price">${escapeHtml(priceLine1)}</div>
    <div class="pv-price2">${escapeHtml(priceLine2)}</div>
  </td>
  <td class="pv-cell pv-c6">
    <input type="text" class="pv-inp pv-inp-full" value="${escapeHtml(`${won} ${p.shippingCost.toLocaleString()}`)}" />
  </td>
  <td class="pv-cell pv-c7">
    <div>${escapeHtml(L.rackNoColon)}: ${escapeHtml(p.rackNo || "-")}</div>
    <div class="pv-mt"><input type="text" class="pv-inp" placeholder="${escapeHtml(L.rackNoPlaceholder)}" /><button type="button" class="pv-btn-teal js-save">${escapeHtml(L.rackSave)}</button></div>
    <div class="pv-prev">${escapeHtml(L.prevRackColon)} ${escapeHtml(prevRack)}</div>
  </td>
  <td class="pv-cell pv-c8">
    <select class="pv-sel" aria-label="${escapeHtml(L.productStatus)}">
      <option value="inbound">${escapeHtml(L.statusInbound)}</option>
      <option value="inbound_done">${escapeHtml(L.statusInboundDone)}</option>
      <option value="ship_wait">${escapeHtml(L.statusShipWait)}</option>
    </select>
    <div class="pv-badges">
      <span class="pv-badge">${escapeHtml(p.statusLabel || L.workPending)}</span>
      <span class="pv-badge">${escapeHtml(L.labelUnconfirmed)}</span>
      <span class="pv-badge">${escapeHtml(L.issueProduct)}</span>
    </div>
  </td>
</tr>
<tr class="pv-row-sub">
  <td class="pv-subcell" colspan="8">
    <div class="pv-memo-grid">
      <div class="pv-memo-row">
        <span class="pv-memo-lab">${escapeHtml(L.productMemo)}</span>
        <input type="text" class="pv-memo-inp" value="${escapeHtml(lineProductMemo)}" />
        <button type="button" class="pv-btn-blue js-save">${escapeHtml(L.register)}</button>
      </div>
      <div class="pv-memo-row">
        <span class="pv-memo-lab pv-memo-caution">${escapeHtml(L.caution)}</span>
        <input type="text" class="pv-memo-inp pv-memo-inp-warn" value="${escapeHtml(lineCaution)}" />
        <button type="button" class="pv-btn-blue js-save">${escapeHtml(L.register)}</button>
      </div>
      <div class="pv-memo-row">
        <span class="pv-memo-lab">${escapeHtml(L.userMemo)}</span>
        <input type="text" class="pv-memo-inp" value="${escapeHtml(lineUserMemo)}" />
        <button type="button" class="pv-btn-blue js-save">${escapeHtml(L.register)}</button>
      </div>
      <div class="pv-row-actions">
        <button type="button" class="pv-act pv-act-blue js-stub">${escapeHtml(L.edit)}</button>
        <button type="button" class="pv-act pv-act-green js-stub">${escapeHtml(L.copy)}</button>
        <button type="button" class="pv-act pv-act-green js-stub">${escapeHtml(L.add)}</button>
        <button type="button" class="pv-act pv-act-red js-stub">${escapeHtml(L.delete)}</button>
      </div>
    </div>
  </td>
</tr>`;
    })
    .join("");
}

export function buildOrderViewWindowHtml(order: OrderBoardOrder, L: OrderViewWindowLabels): string {
  const none = L.none;
  const docTitle = `${order.orderNo}`;

  const shipperLine = `${order.orderNo} / ${order.userName} / ${order.memberBadge}`;
  const progressLine = `${order.progressStatus} (${order.warehouseStatus})`;
  const appCenterLine = `${order.applicationType} / ${order.center}`;
  const trackingVal = order.krTrack?.trim() ? order.krTrack : none;

  const recipientName = order.receiver || order.userName || none;
  const addressContact = none;
  const bizAddr = none;
  const deliveryReq = order.userMemo?.trim() ? order.userMemo : none;
  const centerReq = order.adminMemo?.trim() ? order.adminMemo : none;

  const stubSavedJs = JSON.stringify(L.stubSaved);
  const stubSoonJs = JSON.stringify(L.stubComingSoon);

  const infoRow = (th: string, td: string) =>
    `<tr><th>${escapeHtml(th)}</th><td>${escapeHtml(td)}</td></tr>`;

  const shippingBody = [
    infoRow(L.orderShipperMailbox, shipperLine),
    infoRow(L.progressReceipt, progressLine),
    infoRow(L.applicationCenterRow, appCenterLine),
    infoRow(L.trackingRow, trackingVal),
    infoRow(L.shippingMethod, order.shippingMethod),
    infoRow(L.customsClearance, order.customsClearance),
  ].join("");

  const additionalBody = [
    infoRow(L.additionalServices, none),
    infoRow(L.registeredCoupon, none),
  ].join("");

  const recipientBody = [
    infoRow(L.nameOrCompany, recipientName),
    infoRow(L.addressContact, addressContact),
    infoRow(L.bizRegAddress, bizAddr),
    infoRow(L.deliveryRequest, deliveryReq),
    infoRow(L.centerRequest, centerReq),
  ].join("");

  const productsHtml = productRows(order, L);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(docTitle)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; font-size: 13px; color: #111827; background: #f3f4f6; }
  .top-header {
    display: flex; align-items: center; justify-content: center;
    position: relative; min-height: 52px; padding: 12px 48px;
    background: linear-gradient(90deg, #0d9488 0%, #6d28d9 100%);
    color: #fff; font-weight: 700; font-size: 18px; letter-spacing: -0.02em;
  }
  .top-header-icon { position: absolute; left: 16px; top: 50%; margin-top: -7px; width: 14px; height: 14px; background: #fff; }
  .top-header-title { text-align: center; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 16px 16px 100px; }
  .section { margin-bottom: 18px; border: 1px solid #9dcbae; background: #fff; }
  .section-head {
    padding: 10px 14px; font-weight: 700; font-size: 14px; color: #14532d;
    background: linear-gradient(to bottom, #d4f4e8, #b8e8d0);
    border-bottom: 1px solid #9dcbae;
  }
  .section-body { padding: 0; }
  .info-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .info-table th {
    width: 22%; text-align: left; padding: 9px 12px; background: #e5e7eb; border: 1px solid #c4c4c4;
    color: #374151; font-weight: 600;
  }
  .info-table td { padding: 9px 12px; border: 1px solid #c4c4c4; background: #fff; vertical-align: top; }
  .section-foot { text-align: center; padding: 12px; background: #ecfdf5; border-top: 1px solid #9dcbae; }
  .btn { display: inline-block; padding: 8px 20px; font-size: 13px; cursor: pointer; border-radius: 4px; border: 1px solid #6b7280; background: #f9fafb; color: #111; }
  .btn:hover { filter: brightness(0.97); }
  .btn-primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }
  .order-memo-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #e5e7eb; background: #fafafa; }
  .order-memo-bar label { font-weight: 700; font-size: 12px; min-width: 88px; }
  .order-memo-bar input { flex: 1; min-width: 200px; height: 32px; padding: 0 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; }
  .pv-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; }
  .pv-toolbar label { font-size: 12px; font-weight: 600; color: #6b7280; }
  .pv-toolbar input[type="text"] { height: 32px; width: 220px; padding: 0 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; }
  .pv-head-row { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; background: #f0fdf4; }
  .pv-selall { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; user-select: none; }
  .pv-table-wrap { overflow-x: auto; }
  .pv-table { width: 100%; border-collapse: collapse; table-layout: fixed; min-width: 880px; border: 1px solid #9ca3af; }
  .pv-table thead th { background: #6b7280; color: #fff; font-size: 11px; font-weight: 600; padding: 8px 4px; border: 1px solid #9ca3af; text-align: center; vertical-align: middle; }
  .pv-table thead th.pv-th-left { text-align: left; }
  .pv-cell { border: 1px solid #d1d5db; padding: 8px 6px; vertical-align: middle; background: #fff; font-size: 11px; }
  .pv-c1, .pv-c2, .pv-c4, .pv-c6, .pv-c8 { text-align: center; }
  .pv-c3 { text-align: left; }
  .pv-c5 { text-align: right; }
  .pv-c7 { text-align: left; }
  .pv-c1-inner, .pv-c2-inner { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .pv-cb-wrap { display: flex; align-items: center; gap: 6px; cursor: pointer; }
  .pv-rowno { font-weight: 700; font-size: 12px; }
  .pv-pno { font-size: 10px; color: #4b5563; }
  .pv-linkbtn { background: none; border: none; color: #dc2626; font-size: 11px; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0; }
  .pv-borderbtn { border: 1px solid #d1d5db; background: #fff; border-radius: 3px; padding: 3px 8px; font-size: 10px; cursor: pointer; }
  .pv-thumb { width: 48px; height: 48px; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
  .pv-thumb-img { width: 100%; height: 100%; object-fit: cover; }
  .pv-thumb-ph { font-size: 9px; font-weight: 600; color: #64748b; }
  .pv-name { font-weight: 700; font-size: 12px; line-height: 1.35; }
  .pv-opt { margin-top: 4px; font-size: 11px; color: #374151; white-space: pre-wrap; line-height: 1.35; }
  .pv-tk { font-size: 11px; }
  .pv-mt { margin-top: 6px; }
  .pv-link { background: none; border: none; color: #2563eb; font-size: 11px; font-weight: 600; text-decoration: underline; cursor: pointer; word-break: break-all; padding: 0; }
  .pv-price { font-weight: 600; color: #dc2626; font-size: 11px; line-height: 1.35; }
  .pv-price2 { margin-top: 4px; font-size: 10px; color: #4b5563; line-height: 1.35; }
  .pv-inp { width: 100%; max-width: 7rem; height: 26px; border: 1px solid #d1d5db; border-radius: 3px; text-align: center; font-size: 11px; padding: 0 4px; }
  .pv-inp-full { max-width: 100%; background: #f3f4f6; }
  .pv-btn-teal { margin-left: 4px; height: 26px; padding: 0 8px; font-size: 10px; font-weight: 600; border: none; border-radius: 3px; background: #0d9488; color: #fff; cursor: pointer; }
  .pv-prev { margin-top: 6px; font-size: 10px; color: #6b7280; }
  .pv-sel { width: 100%; max-width: 6.5rem; margin: 0 auto; display: block; height: 28px; font-size: 11px; border: 1px solid #d1d5db; border-radius: 3px; text-align: center; }
  .pv-badges { margin-top: 8px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .pv-badge { display: inline-block; min-width: 4.5rem; padding: 2px 6px; font-size: 10px; font-weight: 600; border: 1px solid #bbf7d0; background: #dcfce7; color: #14532d; border-radius: 2px; text-align: center; }
  .pv-row-sub .pv-subcell { border: 1px solid #d1d5db; padding: 10px 12px; background: #f8fafc; }
  .pv-memo-grid { display: flex; flex-direction: column; gap: 10px; }
  .pv-memo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .pv-memo-lab { font-size: 11px; font-weight: 600; color: #374151; min-width: 72px; }
  .pv-memo-caution { color: #c2410c; }
  .pv-memo-inp { flex: 1; min-width: 160px; height: 28px; border: 1px solid #d1d5db; border-radius: 3px; padding: 0 8px; font-size: 11px; }
  .pv-memo-inp-warn { border-color: #fdba74; }
  .pv-btn-blue { height: 28px; padding: 0 10px; font-size: 10px; border: none; border-radius: 3px; background: #2563eb; color: #fff; cursor: pointer; font-weight: 600; }
  .pv-row-actions { display: flex; justify-content: flex-end; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
  .pv-act { padding: 5px 12px; font-size: 11px; font-weight: 600; border-radius: 3px; border: none; cursor: pointer; color: #fff; }
  .pv-act-blue { background: #2563eb; }
  .pv-act-green { background: #16a34a; }
  .pv-act-red { background: #dc2626; }
  .inquiry-area { padding: 14px; }
  .inquiry-area textarea { width: 100%; min-height: 88px; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; resize: vertical; }
  .inquiry-actions { text-align: center; padding: 12px; border-top: 1px solid #e5e7eb; }
  .page-footer {
    position: fixed; left: 0; right: 0; bottom: 0; padding: 14px; text-align: center;
    background: #fff; border-top: 1px solid #e5e7eb; box-shadow: 0 -4px 12px rgba(0,0,0,0.06);
  }
  .page-footer .btn { min-width: 120px; }
</style>
</head>
<body>
  <header class="top-header">
    <span class="top-header-icon" aria-hidden="true"></span>
    <span class="top-header-title">${escapeHtml(order.orderNo)}</span>
  </header>

  <div class="wrap">
    <section class="section">
      <div class="section-head">${escapeHtml(L.shippingCenterSection)}</div>
      <div class="section-body">
        <table class="info-table">${shippingBody}</table>
      </div>
      <div class="section-foot">
        <button type="button" class="btn js-stub">${escapeHtml(L.depositAutoPay)}</button>
      </div>
    </section>

    <section class="section">
      <div class="section-head">${escapeHtml(L.productInfoTitle)}</div>
      <div class="section-body">
        <div class="order-memo-bar">
          <label>${escapeHtml(L.orderMemo)}</label>
          <input type="text" id="orderMemoInput" value="${escapeHtml(order.adminMemo ?? "")}" placeholder="${escapeHtml(L.orderMemoPlaceholder)}" />
          <button type="button" class="btn btn-primary js-save">${escapeHtml(L.saveOrderMemo)}</button>
        </div>
        <div class="pv-toolbar">
          <label>${escapeHtml(L.trackingInput)}</label>
          <input type="text" id="batchTracking" placeholder="${escapeHtml(L.trackingFilterPlaceholder)}" />
          <button type="button" class="btn btn-primary js-save">${escapeHtml(L.batchSave)}</button>
          <button type="button" class="btn js-stub">${escapeHtml(L.addAdditionalService)}</button>
        </div>
        <div class="pv-head-row">
          <label class="pv-selall"><input type="checkbox" id="pvSelectAll" /> ${escapeHtml(L.selectAll)}</label>
        </div>
        <div class="pv-table-wrap">
          <table class="pv-table">
            <thead>
              <tr>
                <th>${escapeHtml(L.productNumber)}</th>
                <th>${escapeHtml(L.image)}</th>
                <th class="pv-th-left">${escapeHtml(L.nameOptions)}</th>
                <th><div>${escapeHtml(L.trackingNoColon)}</div><div style="font-weight:400;font-size:10px;opacity:.95">${escapeHtml(L.orderNoLink)}</div></th>
                <th><div>${escapeHtml(L.unitQtyPriceLine1)}</div><div style="font-weight:400;font-size:10px;opacity:.95">${escapeHtml(L.unitQtyPriceLine2)}</div></th>
                <th><div>${escapeHtml(L.shippingLine1)}</div><div style="font-weight:400;font-size:10px;opacity:.95">${escapeHtml(L.shippingLine2)}</div></th>
                <th><div>${escapeHtml(L.rackHeaderLine1)}</div><div style="font-weight:400;font-size:10px;opacity:.95">${escapeHtml(L.rackHeaderLine2)}</div></th>
                <th>${escapeHtml(L.productStatus)}</th>
              </tr>
            </thead>
            <tbody>${productsHtml}</tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">${escapeHtml(L.additionalServices)}</div>
      <div class="section-body">
        <table class="info-table">${additionalBody}</table>
      </div>
      <div class="section-foot">
        <button type="button" class="btn js-stub">${escapeHtml(L.changeAdditionalServices)}</button>
      </div>
    </section>

    <section class="section">
      <div class="section-head">${escapeHtml(L.recipientSection)}</div>
      <div class="section-body">
        <table class="info-table">${recipientBody}</table>
      </div>
      <div class="section-foot">
        <button type="button" class="btn js-stub">${escapeHtml(L.changeRecipientAddress)}</button>
      </div>
    </section>

    <section class="section">
      <div class="section-head">${escapeHtml(L.orderInquirySection)}</div>
      <div class="section-body inquiry-area">
        <textarea id="inquiryText" placeholder="${escapeHtml(L.inquiryPlaceholder)}"></textarea>
      </div>
      <div class="inquiry-actions">
        <button type="button" class="btn btn-primary js-stub-inquiry">${escapeHtml(L.orderInquiry)}</button>
      </div>
    </section>
  </div>

  <footer class="page-footer">
    <button type="button" class="btn" id="btnClose">${escapeHtml(L.close)}</button>
  </footer>

  <script>
  (function () {
    var SAVED = ${stubSavedJs};
    var SOON = ${stubSoonJs};
    function toast(msg) {
      var host = document.getElementById('toastHost');
      if (!host) {
        host = document.createElement('div');
        host.id = 'toastHost';
        host.style.position = 'fixed';
        host.style.top = '12px';
        host.style.right = '12px';
        host.style.zIndex = '9999';
        host.style.display = 'flex';
        host.style.flexDirection = 'column';
        host.style.gap = '8px';
        document.body.appendChild(host);
      }
      var el = document.createElement('div');
      el.textContent = String(msg || '');
      el.style.background = '#ffffff';
      el.style.border = '1px solid #cbd5e1';
      el.style.borderRadius = '8px';
      el.style.padding = '10px 12px';
      el.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.12)';
      el.style.fontSize = '12px';
      el.style.color = '#0f172a';
      el.style.maxWidth = '320px';
      host.appendChild(el);
      setTimeout(function () {
        try { el.remove(); } catch (e) {}
      }, 2400);
    }
    document.getElementById('btnClose').addEventListener('click', function () { window.close(); });
    document.getElementById('pvSelectAll').addEventListener('change', function () {
      var on = this.checked;
      document.querySelectorAll('.pv-cb').forEach(function (el) { el.checked = on; });
    });
    document.querySelectorAll('.js-save').forEach(function (btn) {
      btn.addEventListener('click', function () { toast(SAVED); });
    });
    document.querySelectorAll('.js-stub').forEach(function (btn) {
      btn.addEventListener('click', function () { toast(SOON); });
    });
    var inqBtn = document.querySelector('.js-stub-inquiry');
    if (inqBtn) inqBtn.addEventListener('click', function () { toast(SOON); });
  })();
  </script>
</body>
</html>`;
}
