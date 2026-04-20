"use client";

import { useMemo, useState } from "react";
import type { OrderBoardOrder, OrderBoardProduct } from "@/components/orders/OrderBoard";
import { useLocale } from "@/contexts/LocaleContext";
import { showToast } from "@/lib/toast";

function fmtYuan(n: number) {
  return `¥ ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function approxUsdFromYuan(yuan: number) {
  const rate = 0.146;
  return `(~$ ${(yuan * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
}

export default function OrderInquiryToolWindow({ order }: { order: OrderBoardOrder }) {
  const { t } = useLocale();
  const [body, setBody] = useState("");
  const [sms, setSms] = useState("none");

  const yuanTotal = order.totalAmount;
  const summaryRows = useMemo(
    () => [
      {
        k: "a",
        cells: [
          t("orders.tool.inquiry.summary.applicationShipped"),
          `${order.typeLabel} / ${order.isShipped ? t("orders.tool.inquiry.shippedAuto") : t("orders.tool.inquiry.manualPayment")}`,
        ],
      },
      {
        k: "b",
        cells: [
          t("orders.tool.inquiry.summary.centerMethod"),
          order.center || order.shippingMethod ? `${order.center || "—"} / ${order.shippingMethod}` : "—",
        ],
      },
      { k: "c", cells: [t("orders.common.receiver"), order.receiver || "—"] },
      {
        k: "d",
        cells: [
          t("orders.tool.inquiry.summary.trackIn"),
          `${order.trackingCount} / ${order.warehousedCount}`,
        ],
      },
      {
        k: "e",
        cells: [
          t("orders.tool.inquiry.summary.qtyAmount"),
          <span key="qa" className="text-red-600 font-semibold">
            {order.qty} / {fmtYuan(yuanTotal)} <span className="text-gray-600 font-normal text-sm">{approxUsdFromYuan(yuanTotal)}</span>
          </span>,
        ],
      },
      { k: "f", cells: [t("orders.tool.inquiry.summary.rack"), order.rack || ""] },
      {
        k: "g",
        cells: [
          t("orders.tool.inquiry.summary.warehouseProgress"),
          `${order.warehouseStatus || "—"} / ${order.progressStatus || order.statusCode}`,
        ],
      },
      {
        k: "h",
        cells: [t("orders.tool.inquiry.summary.date"), `${order.createdAt}\n${order.updatedAt}`],
      },
    ],
    [order, t, yuanTotal],
  );

  const productCols: { key: string; label: string }[] = [
    { key: "no", label: t("orders.tool.inquiry.col.no") },
    { key: "img", label: t("orders.product.image") },
    { key: "name", label: t("orders.tool.inquiry.col.nameCustoms") },
    { key: "code", label: t("orders.tool.inquiry.col.codeBrand") },
    { key: "track", label: t("orders.tool.inquiry.col.trackOrder") },
    { key: "opt", label: t("orders.tool.inquiry.col.colorSize") },
    { key: "price", label: t("orders.tool.inquiry.col.unitQtyTotal") },
    { key: "rack", label: t("orders.tool.inquiry.col.rackPrev") },
    { key: "st", label: t("orders.common.warehouseStatus") },
  ];

  const rowProduct = (p: OrderBoardProduct, i: number) => (
    <tr key={p.id} className="border-b border-gray-200 bg-white">
      <td className="border border-gray-300 px-1 py-1 text-center text-[11px]">{p.productNo || String(i + 1)}</td>
      <td className="border border-gray-300 px-1 py-1 text-center align-middle">
        {p.image ? (
          <div className="mx-auto flex h-20 w-20 items-center justify-center bg-gray-50 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="mx-auto flex h-20 w-20 items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-500">
            {t("orders.tool.noImage")}
          </div>
        )}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-[11px]">{p.name}</td>
      <td className="border border-gray-300 px-1 py-1 text-[11px]">{p.productNo}</td>
      <td className="border border-gray-300 px-1 py-1 text-[11px]">
        {p.trackingNo} / {p.orderNo}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-[11px] whitespace-pre-wrap">{p.option}</td>
      <td className="border border-gray-300 px-1 py-1 text-[11px]">
        {fmtYuan(p.unitPrice)} × {p.quantity} / {fmtYuan(p.totalPrice)} {approxUsdFromYuan(p.totalPrice)}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-[11px]">
        {p.rackNo || "—"} / {p.prevRackNo || "—"}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-center text-[11px]">{p.statusLabel || "—"}</td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="bg-teal-600 px-4 py-2 text-sm font-bold text-white">■ {t("orders.tool.inquiry.title")}</div>

      <div className="mx-auto max-w-6xl px-3 pt-4">
        <div className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
          <div className="border-b border-gray-200 py-3 text-center text-sm font-semibold">
            {t("orders.common.orderNumber")} : {order.orderNo}
          </div>
          <table className="w-full border-collapse text-xs">
            <tbody>
              {summaryRows.map((row) => (
                <tr key={row.k}>
                  <td className="w-[28%] border border-gray-200 bg-gray-50 px-2 py-2 text-center text-gray-700">
                    {row.cells[0]}
                  </td>
                  <td className="border border-gray-200 px-2 py-2 text-gray-900 whitespace-pre-line">{row.cells[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 overflow-x-auto rounded border border-gray-300 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead>
              <tr className="bg-gray-600 text-white">
                {productCols.map((c) => (
                  <th key={c.key} className="border border-gray-500 px-1 py-2 text-[11px] font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{order.products.map((p, i) => rowProduct(p, i))}</tbody>
          </table>
        </div>

        <div className="mt-4 rounded border border-gray-300 bg-white p-2 shadow-sm">
          <div className="mb-1 flex flex-wrap items-center gap-1 border-b border-gray-200 pb-1 text-[11px]">
            <select className="h-7 rounded border px-1" defaultValue="Malgun Gothic">
              <option>Malgun Gothic</option>
            </select>
            <select className="h-7 rounded border px-1" defaultValue="9">
              <option>9pt</option>
            </select>
            <button type="button" className="h-7 rounded border px-2 font-bold">
              B
            </button>
            <button type="button" className="h-7 rounded border px-2 italic">
              I
            </button>
            <button type="button" className="h-7 rounded border px-2 underline">
              U
            </button>
            <span className="ml-auto flex items-center gap-1 text-gray-600">
              {t("orders.tool.inquiry.photo")} 📷
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full resize-y border-0 p-2 text-sm outline-none focus:ring-0"
            placeholder={t("orders.viewWindow.inquiryPlaceholder")}
          />
          <div className="flex items-center justify-between border-t border-gray-100 pt-1 text-[11px] text-gray-500">
            <span>↕ {t("orders.tool.inquiry.resizeHint")}</span>
            <div className="flex gap-2">
              <span className="rounded border px-2 py-0.5">Editor</span>
              <span className="rounded border px-2 py-0.5">HTML</span>
              <span className="rounded border px-2 py-0.5">TEXT</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <select
            value={sms}
            onChange={(e) => setSms(e.target.value)}
            className="h-9 rounded border border-gray-300 bg-white px-2 text-xs"
          >
            <option value="none">{t("orders.action.smsNotSend")}</option>
            <option value="send">{t("orders.action.smsSend")}</option>
          </select>
          <button
            type="button"
            className="h-9 rounded bg-blue-600 px-6 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => showToast({ message: t("orders.viewWindow.stubComingSoon"), variant: "info" })}
          >
            {t("orders.tool.send")}
          </button>
          <button
            type="button"
            className="h-9 rounded border border-blue-500 bg-white px-6 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            onClick={() => window.close()}
          >
            {t("orders.common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
