"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ApiError } from "@/api/client";
import {
  decodeManualPurchaseQuoteFromApiOrder,
  patchManualOrderAdminMemo,
  patchManualOrderLineShippingCost,
  patchManualOrderPurchaseQuote,
} from "@/api/orders/manualSearch";
import type { OrderBoardOrder, OrderBoardProduct } from "@/components/orders/OrderBoard";
import {
  agencyKvLabelTd,
  agencyKvValueTd,
  agencyMainColumn,
  agencyOrderInfoTable,
  agencyOrderInfoTableSectionTh,
  agencyPageBg,
  agencyQuoteRowTd,
  agencyQuoteRowTh,
  agencyQuoteTable,
  agencyQuoteTableHeadTh,
  agencySection,
  agencySectionTitle,
  agencyTableMin720,
  agencyTableWrap,
  agencyTdBase,
  agencyThBase,
  agencyTheadRow,
  agencyToolbarTitle,
  type AgencyColAlign,
} from "@/components/orders/agencyToolWindowUi";
import { useLocale } from "@/contexts/LocaleContext";
import { emitOrderBoardMutationSignal } from "@/lib/orderBoardMutationSignal";

const MANUAL_ORDER_MUTATED_MSG = "todayggigu:manual-order-mutated";

function notifyManualOrderBoard(orderNo: string) {
  emitOrderBoardMutationSignal({ orderNo, at: Date.now(), source: "purchase-cost" });
  try {
    if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: MANUAL_ORDER_MUTATED_MSG, orderNo }, window.location.origin);
    }
  } catch {
    /* noop */
  }
}

function buildInitialQuoteState(order: OrderBoardOrder) {
  const p = order.manualQuotePersisted;
  const hasPersisted =
    p &&
    (p.purchasecost != null ||
      p.exchangeRate != null ||
      p.totalamount != null ||
      p.purchasefee != null ||
      (p.SMS_send != null && String(p.SMS_send).trim() !== ""));
  if (!hasPersisted || !p) {
    return {
      fxWonPerYuan: 231.84,
      productCostYuan: order.totalAmount,
      feeYuan: Number((order.totalAmount * 0.01).toFixed(2)),
      feePct: 1,
      localShipYuan: 0,
      includeLocal: false,
      extraWon: 500,
      includeExtra: false,
      excessWon: 2000,
      includeExcess: false,
      sms: "none" as "none" | "send",
    };
  }
  const row: Record<string, unknown> = { ...p };
  const d = decodeManualPurchaseQuoteFromApiOrder(row);
  return {
    fxWonPerYuan: d.fxWonPerYuan ?? 231.84,
    productCostYuan: d.productCostYuan ?? order.totalAmount,
    feeYuan: d.feeYuan ?? Number((order.totalAmount * 0.01).toFixed(2)),
    feePct: d.feePct ?? 1,
    localShipYuan: d.localShipYuan,
    includeLocal: d.includeLocal,
    extraWon: d.extraWon > 0 ? d.extraWon : 500,
    includeExtra: d.includeExtra,
    excessWon: d.excessWon > 0 ? d.excessWon : 2000,
    includeExcess: d.includeExcess,
    sms: (d.smsSend ? "send" : "none") as "none" | "send",
  };
}
import { showToast } from "@/lib/toast";

function fmtYuan(n: number) {
  return `¥ ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtWon(n: number) {
  return `₩ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtSavedAt(ts: number) {
  return new Date(ts).toLocaleString();
}

type ProductCol = {
  key: string;
  label: string;
  align: AgencyColAlign;
  cell: (p: OrderBoardProduct) => ReactNode;
};

export default function PurchaseCostQuoteWindow({ order }: { order: OrderBoardOrder }) {
  const { t } = useLocale();
  const initialQuote = useMemo(() => buildInitialQuoteState(order), [order]);
  const [sms, setSms] = useState<"none" | "send">(initialQuote.sms);
  const [products, setProducts] = useState<OrderBoardProduct[]>(order.products);
  const [savingShippingByProductId, setSavingShippingByProductId] = useState<Record<string, boolean>>({});
  const [savingQuote, setSavingQuote] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [fxWonPerYuan, setFxWonPerYuan] = useState(initialQuote.fxWonPerYuan);
  const govRate = 216.84;
  const extraFx = 15;
  const [productCostYuan, setProductCostYuan] = useState(initialQuote.productCostYuan);
  const [feeYuan, setFeeYuan] = useState(initialQuote.feeYuan);
  const [feePct, setFeePct] = useState(initialQuote.feePct);
  const [localShipYuan, setLocalShipYuan] = useState(initialQuote.localShipYuan);
  const [includeLocal, setIncludeLocal] = useState(initialQuote.includeLocal);
  const [extraWon, setExtraWon] = useState(initialQuote.extraWon);
  const [includeExtra, setIncludeExtra] = useState(initialQuote.includeExtra);
  const [excessWon, setExcessWon] = useState(initialQuote.excessWon);
  const [includeExcess, setIncludeExcess] = useState(initialQuote.includeExcess);
  const [adminMemo, setAdminMemo] = useState(order.adminMemo ?? "");

  const lineLocalSum = useMemo(
    () => products.reduce((s, p) => s + (p.shippingCost || 0), 0),
    [products],
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

  const handleOrderMemoRegister = async () => {
    try {
      await patchManualOrderAdminMemo(order, adminMemo);
      showToast({ message: t("orders.board.memoSaved"), variant: "success" });
      notifyManualOrderBoard(order.orderNo);
      setLastSavedAt(Date.now());
    } catch (e) {
      showToast({
        message: e instanceof ApiError ? e.message : t("orders.board.manualPatchFailed"),
        variant: "error",
      });
    }
  };

  const handleLineShippingInput = (productId: string, nextRaw: string) => {
    const next = Number(nextRaw);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, shippingCost: Number.isFinite(next) ? next : 0 } : p)),
    );
  };

  const handleLineShippingSave = async (product: OrderBoardProduct) => {
    const shippingCost = Number(product.shippingCost);
    const normalized = Number.isFinite(shippingCost) ? Number(shippingCost.toFixed(2)) : 0;
    setSavingShippingByProductId((prev) => ({ ...prev, [product.id]: true }));
    try {
      await patchManualOrderLineShippingCost(order, product, normalized);
      showToast({ message: t("orders.board.lineMemoSaved"), variant: "success" });
      notifyManualOrderBoard(order.orderNo);
      setLastSavedAt(Date.now());
    } catch (e) {
      showToast({
        message: e instanceof ApiError ? e.message : t("orders.board.manualPatchFailed"),
        variant: "error",
      });
    } finally {
      setSavingShippingByProductId((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleQuoteRegister = async () => {
    setSavingQuote(true);
    try {
      const raw = await patchManualOrderPurchaseQuote(order, {
        fxWonPerYuan,
        officialRateWon: govRate,
        additionalFxMarginWon: extraFx,
        productCostYuan,
        feeYuan,
        feePct,
        includeLocal,
        localShipYuan,
        lineLocalSumYuan: lineLocalSum,
        includeExcess,
        excessWon,
        totalWon,
        trackingIntel: (order.krTrack || products[0]?.trackingNo || "").trim(),
        rackIntel: (order.rack || products[0]?.rackNo || "").trim(),
        smsSend: sms === "send",
      });
      const env = raw as { data?: { order?: unknown } } | null | undefined;
      const o = env?.data?.order;
      if (o && typeof o === "object" && !Array.isArray(o)) {
        const d = decodeManualPurchaseQuoteFromApiOrder(o as Record<string, unknown>);
        if (d.fxWonPerYuan != null) setFxWonPerYuan(d.fxWonPerYuan);
        if (d.productCostYuan != null) setProductCostYuan(Number(d.productCostYuan.toFixed(2)));
        if (d.feeYuan != null) setFeeYuan(Number(d.feeYuan.toFixed(2)));
        if (d.feePct != null) setFeePct(d.feePct);
        setIncludeLocal(d.includeLocal);
        setLocalShipYuan(d.localShipYuan);
        setIncludeExcess(d.includeExcess);
        setExcessWon(d.excessWon > 0 ? d.excessWon : 2000);
        setIncludeExtra(d.includeExtra);
        setExtraWon(d.extraWon > 0 ? d.extraWon : 500);
        setSms(d.smsSend ? "send" : "none");
      }
      showToast({ message: t("orders.viewWindow.stubSaved"), variant: "success" });
      notifyManualOrderBoard(order.orderNo);
      setLastSavedAt(Date.now());
    } catch (e) {
      showToast({
        message:
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : t("orders.board.manualPatchFailed"),
        variant: "error",
      });
    } finally {
      setSavingQuote(false);
    }
  };

  const productCols: ProductCol[] = [
      {
        key: "productNo",
        label: t("orders.product.productNumber"),
        align: "left",
        cell: (p) => p.productNo || p.id,
      },
      {
        key: "image",
        label: t("orders.product.image"),
        align: "center",
        cell: (p) =>
          p.image ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center bg-gray-50 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-500">
              {t("orders.tool.noImage")}
            </div>
          ),
      },
      {
        key: "qty",
        label: t("orders.tool.purchase.qty"),
        align: "center",
        cell: (p) => p.quantity,
      },
      {
        key: "unit",
        label: t("orders.tool.purchase.unitPrice"),
        align: "center",
        cell: (p) => fmtYuan(p.unitPrice),
      },
      {
        key: "total",
        label: t("orders.common.totalAmount"),
        align: "center",
        cell: (p) => fmtYuan(p.totalPrice),
      },
      {
        key: "local",
        label: t("orders.tool.purchase.localDelivery"),
        align: "center",
        cell: (p) => (
          <input
            type="number"
            step="0.01"
            value={Number.isFinite(p.shippingCost) ? p.shippingCost : 0}
            onChange={(e) => handleLineShippingInput(p.id, e.target.value)}
            onBlur={() => void handleLineShippingSave(p)}
            className={`w-full rounded border px-1 py-0.5 text-center ${
              savingShippingByProductId[p.id]
                ? "cursor-wait border-gray-300 bg-gray-100 text-gray-500"
                : "border-red-400 bg-white"
            }`}
            disabled={!!savingShippingByProductId[p.id]}
          />
        ),
      },
      {
        key: "color",
        label: t("orders.tool.purchase.color"),
        align: "left",
        cell: (p) => (p.option && p.option !== "—" ? p.option.split("/")[0] : "")?.trim() || "—",
      },
      {
        key: "size",
        label: t("orders.tool.purchase.size"),
        align: "left",
        cell: (p) => (p.option && p.option !== "—" ? p.option.split("/")[1] : "")?.trim() || "—",
      },
  ];

  return (
    <div className={agencyPageBg}>
      <div className={agencyToolbarTitle}>■ {t("orders.tool.purchase.title")}</div>

      <div className={agencyMainColumn}>
        <section className={agencySection}>
          <table className={agencyOrderInfoTable}>
            <thead>
              <tr>
                <th colSpan={4} className={agencyOrderInfoTableSectionTh}>
                  {t("orders.tool.purchase.sectionOrder")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={agencyKvLabelTd}>{t("orders.tool.purchase.orderMember")}</td>
                <td className={agencyKvValueTd}>{memberLine}</td>
                <td className={agencyKvLabelTd}>{t("orders.tool.purchase.center")}</td>
                <td className={agencyKvValueTd}>{order.center || t("orders.common.none")}</td>
              </tr>
              <tr>
                <td className={agencyKvLabelTd}>{t("orders.tool.purchase.trackingCount")}</td>
                <td className={agencyKvValueTd}>{order.trackingCount}</td>
                <td className={agencyKvLabelTd}>{t("orders.common.receiver")}</td>
                <td className={agencyKvValueTd}>{order.receiver || "—"}</td>
              </tr>
              <tr>
                <td className={agencyKvLabelTd}>{t("orders.tool.purchase.totalQty")}</td>
                <td className={agencyKvValueTd}>{order.qty}</td>
                <td className={agencyKvLabelTd}>{t("orders.common.totalAmount")}</td>
                <td className={agencyKvValueTd}>
                  {fmtYuan(order.totalAmount)} <span className="text-gray-500 text-[11px]">(~$)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={agencySection}>
          <div className={agencySectionTitle}>{t("orders.viewWindow.productInfoTitle")}</div>
          <div className={agencyTableWrap}>
            <table className={agencyTableMin720}>
              <thead>
                <tr className={agencyTheadRow}>
                  {productCols.map((c) => (
                    <th key={c.key} className={agencyThBase(c.align)}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    {productCols.map((c) => (
                      <td key={c.key} className={`${agencyTdBase(c.align)} align-middle`}>
                        {c.cell(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 p-3">
            <span className="text-xs font-medium text-gray-700">{t("orders.expanded.orderMemo")}</span>
            <input
              type="text"
              value={adminMemo}
              onChange={(e) => setAdminMemo(e.target.value)}
              placeholder={t("orders.expanded.orderMemoPlaceholder")}
              className="min-w-[200px] flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
            />
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              onClick={() => void handleOrderMemoRegister()}
            >
              {t("orders.action.register")}
            </button>
          </div>
        </section>

        <section className={agencySection}>
          <table className={agencyQuoteTable}>
            <thead>
              <tr>
                <th colSpan={4} className={agencyQuoteTableHeadTh}>
                  {t("orders.tool.purchase.sectionQuote")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className={agencyQuoteRowTh}>
                  {t("orders.tool.purchase.fxLabel")}
                </th>
                <td colSpan={3} className={agencyQuoteRowTd}>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-gray-700">¥ 1.00 = ₩</span>
                    <input
                      type="number"
                      step="0.01"
                      value={fxWonPerYuan}
                      onChange={(e) => setFxWonPerYuan(Number(e.target.value))}
                      className="w-24 rounded border border-red-500 bg-white px-1.5 py-1 text-right font-medium outline-none focus:ring-1 focus:ring-red-300"
                    />
                    <span className="text-[11px] leading-snug text-gray-600">
                      * {t("orders.tool.purchase.fxNote")} : ₩{govRate.toLocaleString()} / {t("orders.tool.purchase.fxExtra")} : ₩
                      {extraFx.toLocaleString()}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <th scope="row" className={agencyQuoteRowTh}>
                  {t("orders.tool.purchase.productCost")}
                </th>
                <td className={agencyQuoteRowTd}>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      value={productCostYuan}
                      onChange={(e) => setProductCostYuan(Number(e.target.value))}
                      className="min-w-0 w-12 flex-1 rounded border border-red-500 bg-white px-1.5 py-1 text-right outline-none focus:ring-1 focus:ring-red-300"
                    />
                  </div>
                </td>
                <th scope="row" className={agencyQuoteRowTh}>
                  {t("orders.tool.purchase.purchaseFee")}
                </th>
                <td className={agencyQuoteRowTd}>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      value={feeYuan}
                      onChange={(e) => setFeeYuan(Number(e.target.value))}
                      className="min-w-0 w-12 flex-1 rounded border border-red-500 bg-white px-1.5 py-1 text-right outline-none focus:ring-1 focus:ring-red-300"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <span className="text-gray-700">{t("orders.tool.purchase.feePct")} :</span>
                    <input
                      type="number"
                      value={feePct}
                      onChange={(e) => setFeePct(Number(e.target.value))}
                      className="w-12 rounded border border-red-500 bg-white px-1.5 py-1 text-center outline-none focus:ring-1 focus:ring-red-300"
                    />
                    <span className="text-gray-700">%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <th scope="row" className={agencyQuoteRowTh}>
                  <label className="flex cursor-pointer flex-col items-center gap-1.5 py-0.5">
                    <input
                      type="checkbox"
                      checked={includeLocal}
                      onChange={(e) => setIncludeLocal(e.target.checked)}
                      className="rounded border-gray-400"
                    />
                    <span className="text-center leading-tight">{t("orders.tool.purchase.localCheck")}</span>
                  </label>
                </th>
                <td className={agencyQuoteRowTd}>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      value={localShipYuan}
                      disabled={!includeLocal}
                      onChange={(e) => setLocalShipYuan(Number(e.target.value))}
                      className={`min-w-0 max-w-[10rem] flex-1 rounded border px-1.5 py-1 text-right outline-none ${
                        includeLocal
                          ? "border-red-500 bg-white focus:ring-1 focus:ring-red-300"
                          : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-600"
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">{t("orders.tool.purchase.hintLocalBase")}</p>
                </td>
                <th scope="row" className={agencyQuoteRowTh}>
                  <label className="flex cursor-pointer flex-col items-center gap-1.5 py-0.5">
                    <input
                      type="checkbox"
                      checked={includeExtra}
                      onChange={(e) => setIncludeExtra(e.target.checked)}
                      className="rounded border-gray-400"
                    />
                    <span className="text-center leading-tight">{t("orders.tool.purchase.extraCheck")}</span>
                  </label>
                </th>
                <td className={agencyQuoteRowTd}>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">₩</span>
                    <input
                      type="number"
                      value={extraWon}
                      disabled={!includeExtra}
                      onChange={(e) => setExtraWon(Number(e.target.value))}
                      className={`min-w-0 max-w-[10rem] flex-1 rounded border px-1.5 py-1 text-right outline-none ${
                        includeExtra
                          ? "border-red-500 bg-white focus:ring-1 focus:ring-red-300"
                          : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-600"
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">{t("orders.tool.purchase.hintExtraBase")}</p>
                </td>
              </tr>
              <tr>
                <th scope="row" className={agencyQuoteRowTh}>
                  <label className="flex cursor-pointer flex-col items-center gap-1.5 py-0.5">
                    <input
                      type="checkbox"
                      checked={includeExcess}
                      onChange={(e) => setIncludeExcess(e.target.checked)}
                      className="rounded border-gray-400"
                    />
                    <span className="text-center leading-tight">{t("orders.tool.purchase.excessCheck")}</span>
                  </label>
                </th>
                <td className={agencyQuoteRowTd}>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">₩</span>
                    <input
                      type="number"
                      value={excessWon}
                      disabled={!includeExcess}
                      onChange={(e) => setExcessWon(Number(e.target.value))}
                      className={`min-w-0  flex-1 rounded border px-1.5 py-1 text-right outline-none ${
                        includeExcess
                          ? "border-red-500 bg-white focus:ring-1 focus:ring-red-300"
                          : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-600"
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">{t("orders.tool.purchase.hintExcessBase")}</p>
                </td>
                <th scope="row" className={`${agencyQuoteRowTh} bg-gray-100`} aria-hidden="true">
                  &nbsp;
                </th>
                <td className={`${agencyQuoteRowTd} bg-gray-50`} aria-hidden="true">
                  &nbsp;
                </td>
              </tr>
              <tr>
                <th scope="row" className={agencyQuoteRowTh}>
                  {t("orders.tool.purchase.totalWonLabel")}
                </th>
                <td className={agencyQuoteRowTd}>
                  <input
                    type="text"
                    readOnly
                    value={fmtWon(totalWon)}
                    className="w-full max-w-[14rem] rounded border border-red-500 bg-white px-2 py-1.5 text-left text-sm font-bold text-gray-900 outline-none"
                  />
                </td>
                <th scope="row" className={agencyQuoteRowTh}>
                  {t("orders.tool.purchase.depositNow")}
                </th>
                <td className={agencyQuoteRowTd}>
                  <span className="text-sm font-semibold text-gray-900">{fmtWon(order.paidAmount ?? 0)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          {lastSavedAt ? (
            <span className="mr-auto text-xs text-gray-500">
              {t("orders.common.updatedAt")}: {fmtSavedAt(lastSavedAt)}
            </span>
          ) : null}
          <select
            value={sms}
            onChange={(e) => setSms(e.target.value === "send" ? "send" : "none")}
            className="h-9 rounded border border-gray-300 bg-white px-2 text-xs"
          >
            <option value="none">{t("orders.action.smsNotSend")}</option>
            <option value="send">{t("orders.action.smsSend")}</option>
          </select>
          <button
            type="button"
            className="h-9 rounded bg-blue-600 px-6 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => void handleQuoteRegister()}
            disabled={savingQuote}
          >
            {t("orders.action.register")}
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
