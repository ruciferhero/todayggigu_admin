import type { OrderBoardOrder } from "./OrderBoard";
import { escapeHtml } from "./orderViewWindowDocument";

export interface OrderLogWindowLabels {
  pageTitle: string;
  /** Full header line including order number (e.g. "■ 주문 로그 - P123") */
  headerTitle: string;
  colNo: string;
  colWorker: string;
  colContent: string;
  colRegisteredAt: string;
  close: string;
  entryOrderApply: string;
  entryOrderUpdated: string;
  entryProgressChange: string;
  detailTotalQty: string;
  detailTotalAmount: string;
  detailTrackingCount: string;
  detailCouponNo: string;
  workerSystem: string;
  none: string;
  won: string;
  itemsSuffix: string;
  lineUpdatedBody: string;
  progressLabel: string;
}

function splitDateTime(value: string): { date: string; time: string } {
  const v = value.trim();
  if (!v) return { date: "-", time: "" };
  const i = v.indexOf(" ");
  if (i === -1) return { date: v, time: "" };
  return { date: v.slice(0, i), time: v.slice(i + 1).trim() };
}

function contentBlock(title: string, lines: string[]): string {
  const body = lines.map((line) => `<div class="log-line">${escapeHtml(line)}</div>`).join("");
  return `<div class="log-content"><div class="log-content-title">${escapeHtml(title)}</div>${body}</div>`;
}

export function buildOrderLogWindowHtml(order: OrderBoardOrder, L: OrderLogWindowLabels): string {
  const worker2 = order.inquiryResponder?.trim() ? order.inquiryResponder : L.workerSystem;

  const row1Content = contentBlock(L.entryOrderApply, [
    `${L.detailTotalQty} : ${order.qty}${L.itemsSuffix}`,
    `${L.detailTotalAmount} : ${order.totalAmount.toLocaleString()}${L.won}`,
    `${L.detailTrackingCount} : ${order.trackingCount}`,
    `${L.detailCouponNo} : ${L.none}`,
  ]);

  const row2Content = contentBlock(L.entryOrderUpdated, [L.lineUpdatedBody]);

  const row3Content = contentBlock(L.entryProgressChange, [
    `${L.progressLabel}: ${order.progressStatus}`,
  ]);

  const rows: { no: number; worker: string; content: string; when: string }[] = [
    { no: 1, worker: L.workerSystem, content: row1Content, when: order.createdAt },
    { no: 2, worker: worker2, content: row2Content, when: order.updatedAt },
    { no: 3, worker: L.workerSystem, content: row3Content, when: order.updatedAt },
  ];

  const tbody = rows
    .map((r) => {
      const { date, time } = splitDateTime(r.when);
      return `<tr>
  <td class="td-no">${r.no}</td>
  <td class="td-worker">${escapeHtml(r.worker)}</td>
  <td class="td-content">${r.content}</td>
  <td class="td-date"><div>${escapeHtml(date)}</div>${time ? `<div>${escapeHtml(time)}</div>` : ""}</td>
</tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(L.pageTitle)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Malgun Gothic", system-ui, sans-serif; font-size: 13px; color: #111827; background: #fff; }
  .log-header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px;
    background: #4c1d95;
    color: #fff; font-weight: 700; font-size: 16px;
  }
  .log-header-icon {
    width: 12px; height: 12px; background: #fff; flex-shrink: 0;
  }
  .wrap { padding: 16px 18px 88px; max-width: 960px; margin: 0 auto; }
  .log-table { width: 100%; border-collapse: collapse; border: 1px solid #9ca3af; }
  .log-table thead th {
    background: #4b5563; color: #fff; font-size: 12px; font-weight: 600;
    padding: 10px 8px; border: 1px solid #6b7280; text-align: center;
  }
  .log-table tbody td {
    border: 1px solid #d1d5db; padding: 10px 8px; vertical-align: top;
    font-size: 12px; line-height: 1.45;
  }
  .td-no { width: 44px; text-align: center; background: #fafafa; }
  .td-worker { width: 100px; text-align: center; background: #fafafa; }
  .td-date { width: 120px; text-align: center; background: #fafafa; }
  .td-content { text-align: left; }
  .log-content-title { font-weight: 700; margin-bottom: 6px; }
  .log-line { margin-left: 0; }
  .footer {
    position: fixed; left: 0; right: 0; bottom: 0; padding: 16px; text-align: center;
    background: #f9fafb; border-top: 1px solid #e5e7eb;
  }
  .btn-close {
    min-width: 100px; padding: 8px 24px; font-size: 14px; cursor: pointer;
    background: #fff; color: #2563eb; border: 1px solid #93c5fd; border-radius: 2px;
  }
  .btn-close:hover { background: #eff6ff; }
</style>
</head>
<body>
  <header class="log-header">
    <span class="log-header-icon" aria-hidden="true"></span>
    <span>${escapeHtml(L.headerTitle)}</span>
  </header>
  <div class="wrap">
    <table class="log-table">
      <thead>
        <tr>
          <th>${escapeHtml(L.colNo)}</th>
          <th>${escapeHtml(L.colWorker)}</th>
          <th>${escapeHtml(L.colContent)}</th>
          <th>${escapeHtml(L.colRegisteredAt)}</th>
        </tr>
      </thead>
      <tbody>${tbody}</tbody>
    </table>
  </div>
  <footer class="footer">
    <button type="button" class="btn-close" id="btnClose">${escapeHtml(L.close)}</button>
  </footer>
  <script>
    document.getElementById("btnClose").addEventListener("click", function () { window.close(); });
  </script>
</body>
</html>`;
}
