"use client";

import { useMemo, useState } from "react";
import type { OrderBoardOrder, OrderBoardProduct } from "@/components/orders/OrderBoard";
import { useLocale } from "@/contexts/LocaleContext";
import { showToast } from "@/lib/toast";

function fmtYuan(n: number) {
  return `¥ ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtWon(n: number) {
  return `₩ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function PurchaseCostQuoteWindow({ order }: { order: OrderBoardOrder }) {
  const { t } = useLocale();
  const [sms, setSms] = useState("none");
  const [fxWonPerYuan, setFxWonPerYuan] = useState(231.84);
  const govRate = 216.84;
  const extraFx = 15;
  const [productCostYuan, setProductCostYuan] = useState(order.totalAmount);
  const [feeYuan, setFeeYuan] = useState(Number((order.totalAmount * 0.01).toFixed(2)));
  const [feePct, setFeePct] = useState(1);
  const [localShipYuan, setLocalShipYuan] = useState(0);
  const [includeLocal, setIncludeLocal] = useState(false);
  const [extraWon, setExtraWon] = useState(500);
  const [includeExtra, setIncludeExtra] = useState(false);
  const [excessWon, setExcessWon] = useState(1000);
  const [includeExcess, setIncludeExcess] = useState(false);
  const [adminMemo, setAdminMemo] = useState(order.adminMemo ?? "");

  const lineLocalSum = useMemo(
    () => order.products.reduce((s, p) => s + (p.shippingCost || 0), 0),
    [order.products],
  );

  const totalWon = useMemo(() => {
    const base = productCostYuan + feeYuan + (includeLocal ? localShipYuan + lineLocalSum : 0);
    let won = Math.round(base * fxWonPerYuan);
    if (includeExtra) won += extraWon;
    if (includeExcess) won += excessWon;
    return won;
  }, [
    productCostYuan,
    feeYuan,
    includeLocal,
    localShipYuan,
    lineLocalSum,
    fxWonPerYuan,
    includeExtra,
    extraWon,
    includeExcess,
    excessWon,
  ]);

  const memberLine = `${order.orderNo} / ${order.userName}${order.memberBadge ? ` ( ${order.memberBadge} )` : ""}`;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="bg-gradient-to-r from-teal-500 via-slate-500 to-purple-600 px-4 py-2 text-sm font-bold text-white">
        ■ {t("orders.tool.purchase.title")}
      </div>

      <div className="mx-auto max-w-6xl space-y-4 px-3 pt-4">
        <section className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
          <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-800">{t("orders.tool.purchase.sectionOrder")}</div>
          <div className="grid gap-2 p-3 text-xs sm:grid-cols-2">
            <div>
              <span className="text-gray-500">{t("orders.tool.purchase.orderMember")}</span>
              <div className="font-medium text-gray-900">{memberLine}</div>
            </div>
            <div>
              <span className="text-gray-500">{t("orders.tool.purchase.center")}</span>
              <div className="font-medium text-gray-900">{order.center || t("orders.common.none")}</div>
            </div>
            <div>
              <span className="text-gray-500">{t("orders.tool.purchase.trackingCount")}</span>
              <div>{order.trackingCount}</div>
            </div>
            <div>
              <span className="text-gray-500">{t("orders.common.receiver")}</span>
              <div>{order.receiver || "—"}</div>
            </div>
            <div>
              <span className="text-gray-500">{t("orders.tool.purchase.totalQty")}</span>
              <div>{order.qty}</div>
            </div>
            <div>
              <span className="text-gray-500">{t("orders.common.totalAmount")}</span>
              <div>
                {fmtYuan(order.totalAmount)} <span className="text-gray-500 text-[11px]">(~$)</span>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
          <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-800">{t("orders.viewWindow.productInfoTitle")}</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-xs">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="border border-gray-500 px-1 py-2">{t("orders.product.productNumber")}</th>
                  <th className="border border-gray-500 px-1 py-2">{t("orders.product.image")}</th>
                  <th className="border border-gray-500 px-1 py-2">{t("orders.tool.purchase.qty")}</th>
                  <th className="border border-gray-500 px-1 py-2">{t("orders.tool.purchase.unitPrice")}</th>
                  <th className="border border-gray-500 px-1 py-2">{t("orders.common.totalAmount")}</th>
                  <th className="border border-gray-500 px-1 py-2">{t("orders.tool.purchase.localDelivery")}</th>
                  <th className="border border-gray-500 px-1 py-2">{t("orders.tool.purchase.color")}</th>
                  <th className="border border-gray-500 px-1 py-2">{t("orders.tool.purchase.size")}</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((p: OrderBoardProduct) => (
                  <tr key={p.id} className="bg-white">
                    <td className="border border-gray-200 px-1 py-1 text-center">{p.productNo || p.id}</td>
                    <td className="border border-gray-200 px-1 py-1 text-center align-middle">
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
                    <td className="border border-gray-200 px-1 py-1 text-center">{p.quantity}</td>
                    <td className="border border-gray-200 px-1 py-1 text-center">{fmtYuan(p.unitPrice)}</td>
                    <td className="border border-gray-200 px-1 py-1 text-center">{fmtYuan(p.totalPrice)}</td>
                    <td className="border border-gray-200 px-1 py-1 text-center">
                      <input
                        type="text"
                        defaultValue={p.shippingCost ? String(p.shippingCost) : "0.00"}
                        className="w-full rounded border border-red-400 px-1 py-0.5 text-center"
                        readOnly
                      />
                    </td>
                    <td className="border border-gray-200 px-1 py-1">
                      {(p.option && p.option !== "—" ? p.option.split("/")[0] : "")?.trim() || "—"}
                    </td>
                    <td className="border border-gray-200 px-1 py-1">
                      {(p.option && p.option !== "—" ? p.option.split("/")[1] : "")?.trim() || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 p-3">
            <span className="text-xs font-medium text-gray-700">{t("orders.expanded.adminMemo")}</span>
            <input
              type="text"
              value={adminMemo}
              onChange={(e) => setAdminMemo(e.target.value)}
              className="min-w-[200px] flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
            />
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              onClick={() => showToast({ message: t("orders.viewWindow.stubSaved"), variant: "info" })}
            >
              {t("orders.product.rackSave")}
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
          <div className="bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-800">{t("orders.tool.purchase.sectionQuote")}</div>
          <div className="space-y-3 p-3 text-xs">
            <div className="flex flex-wrap items-start gap-2">
              <span className="min-w-[7rem] text-gray-700">{t("orders.tool.purchase.fxLabel")}</span>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <span>¥ 1.00 =</span>
                <input
                  type="number"
                  value={fxWonPerYuan}
                  onChange={(e) => setFxWonPerYuan(Number(e.target.value))}
                  className="w-24 rounded border border-red-400 px-1 py-0.5"
                />
                <span>₩</span>
                <p className="w-full text-[11px] text-gray-500">
                  * {t("orders.tool.purchase.fxNote")} : ₩{govRate} / {t("orders.tool.purchase.fxExtra")} : ₩{extraFx}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-[7rem] text-gray-700">{t("orders.tool.purchase.productCost")}</span>
              <input
                type="number"
                value={productCostYuan}
                onChange={(e) => setProductCostYuan(Number(e.target.value))}
                className="rounded border border-red-400 px-1 py-0.5"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-[7rem] text-gray-700">{t("orders.tool.purchase.purchaseFee")}</span>
              <input
                type="number"
                value={feeYuan}
                onChange={(e) => setFeeYuan(Number(e.target.value))}
                className="rounded border border-red-400 px-1 py-0.5"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-[7rem] text-gray-700">{t("orders.tool.purchase.feePct")}</span>
              <input
                type="number"
                value={feePct}
                onChange={(e) => setFeePct(Number(e.target.value))}
                className="w-14 rounded border border-red-400 px-1 py-0.5"
              />
              <span>%</span>
            </div>
            <label className="flex flex-wrap items-center gap-2">
              <input type="checkbox" checked={includeLocal} onChange={(e) => setIncludeLocal(e.target.checked)} />
              <span>{t("orders.tool.purchase.localCheck")}</span>
              <input
                type="number"
                value={localShipYuan}
                onChange={(e) => setLocalShipYuan(Number(e.target.value))}
                className="rounded border border-red-400 px-1 py-0.5"
              />
            </label>
            <label className="flex flex-wrap items-center gap-2">
              <input type="checkbox" checked={includeExtra} onChange={(e) => setIncludeExtra(e.target.checked)} />
              <span>{t("orders.tool.purchase.extraCheck")}</span>
              <input
                type="number"
                value={extraWon}
                onChange={(e) => setExtraWon(Number(e.target.value))}
                className="rounded border border-red-400 px-1 py-0.5"
              />
            </label>
            <label className="flex flex-wrap items-center gap-2">
              <input type="checkbox" checked={includeExcess} onChange={(e) => setIncludeExcess(e.target.checked)} />
              <span>{t("orders.tool.purchase.excessCheck")}</span>
              <input
                type="number"
                value={excessWon}
                onChange={(e) => setExcessWon(Number(e.target.value))}
                className="rounded border border-red-400 px-1 py-0.5"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2">
              <span className="min-w-[7rem] font-semibold">{t("orders.common.totalAmount")}</span>
              <input type="text" readOnly value={fmtWon(totalWon)} className="rounded border border-red-400 px-2 py-1 font-semibold" />
            </div>
            <div className="text-gray-600">
              {t("orders.tool.purchase.depositNow")} {fmtWon(0)}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2">
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
            onClick={() => showToast({ message: t("orders.viewWindow.stubSaved"), variant: "info" })}
          >
            {t("orders.product.rackSave")}
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
