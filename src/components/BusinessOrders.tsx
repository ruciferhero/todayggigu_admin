"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, ShoppingCart, Warehouse, ScanBarcode, Scissors, AlertCircle, ClipboardList,
  PackageCheck, Printer, FileText, Package, Ship, Plane, Upload, ChevronDown,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from "lucide-react";
import { useLocale, type Locale } from "@/contexts/LocaleContext";
import OrderBoard, {
  type OrderBoardOrder,
  type OrderBoardStatusGroup,
} from "@/components/orders/OrderBoard";

type ReleaseListRowModel = {
  id: string;
  shippingKey: "sea" | "air";
  mailbox: string;
  orderNo: string;
  boxes: number;
  boxCbm: number;
  plt: number;
  pltCbm: number;
  marks: number;
  totalCbm: number;
  status: "wh" | "payWait" | "payDone";
  confirmDisabled: boolean;
};

function fmtCbm(n: number) {
  return Math.abs(n - Math.round(n)) < 1e-6 ? String(Math.round(n)) : n.toFixed(2);
}

function intlLocaleTag(locale: Locale): string {
  if (locale === "ko") return "ko-KR";
  if (locale === "zh") return "zh-CN";
  return "en-US";
}

/** 6주 × 7일, 첫 열은 일요일 */
function getMonthMatrix(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const rows: { date: Date; inCurrentMonth: boolean }[][] = [];
  const cur = new Date(start);
  for (let w = 0; w < 6; w++) {
    const row: { date: Date; inCurrentMonth: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const inCurrentMonth = cur.getMonth() === month - 1 && cur.getFullYear() === year;
      row.push({ date: new Date(cur), inCurrentMonth });
      cur.setDate(cur.getDate() + 1);
    }
    rows.push(row);
  }
  return rows;
}

/** 참고 UI와 동일한 2020년 2월 데모 강조 */
const DEMO_FEB_2020_RING: Record<number, string> = {
  2: "bg-orange-200 text-orange-900 rounded-full",
  4: "bg-red-400 text-white rounded-full",
  5: "bg-green-400 text-white rounded-full",
  17: "bg-yellow-300 text-yellow-950 rounded-sm",
};

function ReleaseMonthCalendar({ locale }: { locale: Locale }) {
  const [view, setView] = useState({ year: 2020, month: 2 });
  const tag = intlLocaleTag(locale);
  const title = new Intl.DateTimeFormat(tag, { year: "numeric", month: "long" }).format(
    new Date(view.year, view.month - 1, 1),
  );
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const ref = new Date(2024, 5, 2 + i);
    return new Intl.DateTimeFormat(tag, { weekday: "short" }).format(ref);
  });
  const matrix = useMemo(() => getMonthMatrix(view.year, view.month), [view.year, view.month]);

  const goPrevYear = () => setView((v) => ({ ...v, year: v.year - 1 }));
  const goNextYear = () => setView((v) => ({ ...v, year: v.year + 1 }));
  const goPrevMonth = () =>
    setView((v) => (v.month === 1 ? { year: v.year - 1, month: 12 } : { ...v, month: v.month - 1 }));
  const goNextMonth = () =>
    setView((v) => (v.month === 12 ? { year: v.year + 1, month: 1 } : { ...v, month: v.month + 1 }));

  const navBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50";

  return (
    <div className="inline-block min-w-[280px] max-w-sm rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-1">
        <div className="flex gap-0.5">
          <button type="button" className={navBtn} onClick={goPrevYear} aria-label="Previous year">
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button type="button" className={navBtn} onClick={goPrevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="min-w-0 flex-1 text-center text-sm font-semibold text-gray-900">{title}</div>
        <div className="flex gap-0.5">
          <button type="button" className={navBtn} onClick={goNextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" className={navBtn} onClick={goNextYear} aria-label="Next year">
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-gray-600">
        {weekdayLabels.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-xs">
        {matrix.map((week, wi) =>
          week.map(({ date, inCurrentMonth }, di) => {
            const day = date.getDate();
            const isDemoFeb =
              inCurrentMonth && view.year === 2020 && view.month === 2 && DEMO_FEB_2020_RING[day];
            const ring = isDemoFeb ? DEMO_FEB_2020_RING[day] : "";
            return (
              <div key={`${wi}-${di}`} className="flex h-8 items-center justify-center">
                <span
                  className={`flex h-7 min-w-[1.75rem] items-center justify-center px-1 ${
                    inCurrentMonth ? "text-gray-900" : "text-gray-300"
                  } ${ring}`}
                >
                  {day}
                </span>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

function BusinessOutboundReleaseListPanel({ t, locale }: { t: (key: string) => string; locale: Locale }) {
  const rows = useMemo<ReleaseListRowModel[]>(
    () => [
      { id: "1", shippingKey: "sea", mailbox: "TG7464", orderNo: "P25A161688", boxes: 8, boxCbm: 2, plt: 2, pltCbm: 2.5, marks: 8, totalCbm: 4.5, status: "wh", confirmDisabled: false },
      { id: "2", shippingKey: "air", mailbox: "TG8201", orderNo: "P25A161702", boxes: 7, boxCbm: 2, plt: 2, pltCbm: 2.47, marks: 9, totalCbm: 4.47, status: "payWait", confirmDisabled: true },
      { id: "3", shippingKey: "sea", mailbox: "TG7464", orderNo: "P25A161710", boxes: 6, boxCbm: 2, plt: 2, pltCbm: 2.5, marks: 8, totalCbm: 4.5, status: "payDone", confirmDisabled: false },
      { id: "4", shippingKey: "air", mailbox: "TG9012", orderNo: "P25A161725", boxes: 7, boxCbm: 2, plt: 1, pltCbm: 2.8, marks: 7, totalCbm: 4.8, status: "wh", confirmDisabled: false },
      { id: "5", shippingKey: "sea", mailbox: "TG7464", orderNo: "P25A161731", boxes: 5, boxCbm: 2, plt: 2, pltCbm: 2.5, marks: 9, totalCbm: 4.5, status: "payWait", confirmDisabled: true },
      { id: "6", shippingKey: "air", mailbox: "TG7733", orderNo: "P25A161740", boxes: 5, boxCbm: 3, plt: 2, pltCbm: 3.2, marks: 8, totalCbm: 6.2, status: "payDone", confirmDisabled: false },
    ],
    [],
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          boxes: acc.boxes + r.boxes,
          boxCbm: acc.boxCbm + r.boxCbm,
          plt: acc.plt + r.plt,
          pltCbm: acc.pltCbm + r.pltCbm,
          marks: acc.marks + r.marks,
          totalCbm: acc.totalCbm + r.totalCbm,
        }),
        { boxes: 0, boxCbm: 0, plt: 0, pltCbm: 0, marks: 0, totalCbm: 0 },
      ),
    [rows],
  );

  const statusLabel = (s: ReleaseListRowModel["status"]) => {
    if (s === "wh") return t("orders.releaseList.statusWarehousingDone");
    if (s === "payWait") return t("orders.releaseList.statusPaymentWait");
    return t("orders.releaseList.statusPaymentDone");
  };

  const cellBorder = "border border-gray-300 px-2 py-2 align-middle text-center";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 items-start">
        <div className="flex items-center gap-2">
          <label htmlFor="release-list-center" className="shrink-0 text-sm font-medium text-gray-800">
            {t("orders.releaseList.centerLabel")}
          </label>
          <select
            id="release-list-center"
            defaultValue=""
            className="h-9 min-w-[220px] rounded border border-gray-300 bg-white px-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{t("orders.releaseList.centerPlaceholder")}</option>
            <option value="Weihai">{t("orders.filter.centerWeihai")}</option>
            <option value="Qingdao">{t("orders.filter.centerQingdao")}</option>
            <option value="Guangzhou">{t("orders.filter.centerGuangzhou")}</option>
          </select>
        </div>
        <ReleaseMonthCalendar locale={locale} />
      </div>
      <div className="app-table-wrap table-fixed w-full">
      <table className="app-table text-xs">
        <thead>
          <tr className="bg-[#f2f2f2]">
            <th className={`${cellBorder} font-semibold text-gray-800 w-[88px]`}>
              <span className="inline-flex items-center justify-center gap-0.5">
                {t("orders.releaseList.shippingMethod")}
                <ChevronDown className="h-3.5 w-3.5 text-gray-500 shrink-0" aria-hidden />
              </span>
            </th>
            <th className={`${cellBorder} font-semibold text-gray-800`}>{t("orders.releaseList.mailbox")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800`}>{t("orders.common.orderNumber")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-14`}>{t("orders.releaseList.boxCount")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-16`}>{t("orders.releaseList.boxCbm")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-14`}>{t("orders.releaseList.pltCount")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-16`}>{t("orders.releaseList.pltCbm")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-14`}>{t("orders.releaseList.markCount")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-16`}>{t("orders.releaseList.totalCbm")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 min-w-[5.5rem]`}>{t("orders.releaseList.actualStatus")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-20`}>{t("orders.releaseList.remarks")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-24`}>{t("orders.releaseList.releaseImage")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-[5.5rem]`}>{t("orders.releaseList.confirmRelease")}</th>
            <th className={`${cellBorder} font-semibold text-gray-800 w-16`}>{t("orders.rowAction.delete")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="bg-white">
              <td className={cellBorder}>
                <select
                  defaultValue={r.shippingKey}
                  className="mx-auto h-7 max-w-[5.5rem] rounded border border-gray-300 bg-white px-1 text-[11px]"
                  aria-label={t("orders.releaseList.shippingMethod")}
                >
                  <option value="sea">{t("orders.filter.shippingMethodSea")}</option>
                  <option value="air">{t("orders.filter.shippingMethodAir")}</option>
                </select>
              </td>
              <td className={`${cellBorder} font-medium text-gray-800`}>{r.mailbox}</td>
              <td className={`${cellBorder} text-blue-600 font-medium`}>{r.orderNo}</td>
              <td className={cellBorder}>{r.boxes}</td>
              <td className={cellBorder}>{r.boxCbm}</td>
              <td className={cellBorder}>{r.plt}</td>
              <td className={cellBorder}>{fmtCbm(r.pltCbm)}</td>
              <td className={cellBorder}>{r.marks}</td>
              <td className={cellBorder}>{fmtCbm(r.totalCbm)}</td>
              <td className={`${cellBorder} text-gray-800`}>{statusLabel(r.status)}</td>
              <td className={cellBorder}>
                <button
                  type="button"
                  className="inline-flex min-w-[3rem] items-center justify-center rounded bg-teal-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-teal-600"
                >
                  {t("orders.action.register")}
                </button>
              </td>
              <td className={cellBorder}>
                <button
                  type="button"
                  className="mx-auto flex flex-col items-center justify-center gap-0.5 text-[10px] text-gray-600 hover:text-blue-600"
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  <span>{t("orders.releaseList.uploadLabel")}</span>
                </button>
              </td>
              <td className={cellBorder}>
                <button
                  type="button"
                  disabled={r.confirmDisabled}
                  className="w-full min-w-0 rounded border border-blue-400 bg-white px-1.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-white"
                >
                  {t("orders.releaseList.confirmRelease")}
                </button>
              </td>
              <td className={cellBorder}>
                <button
                  type="button"
                  className="w-full min-w-0 rounded border border-red-400 bg-white px-1.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                >
                  {t("orders.rowAction.delete")}
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-[#fafafa] font-semibold">
            <td className={`${cellBorder} text-left`} colSpan={3}>
              {t("orders.releaseList.sum")}
            </td>
            <td className={cellBorder}>{totals.boxes}</td>
            <td className={cellBorder}>{totals.boxCbm}</td>
            <td className={cellBorder}>{totals.plt}</td>
            <td className={cellBorder}>{fmtCbm(totals.pltCbm)}</td>
            <td className={cellBorder}>{totals.marks}</td>
            <td className={cellBorder}>{fmtCbm(totals.totalCbm)}</td>
            <td className={cellBorder} colSpan={4} />
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default function BusinessOrders() {
  const { t, locale } = useLocale();
  const [releaseListOpen, setReleaseListOpen] = useState(false);

  const statusGroups: OrderBoardStatusGroup[] = [
    {
      title: t("orders.status.purchase"),
      icon: <ShoppingCart className="w-4 h-4" />,
      color: "text-purple-600",
      items: [
        { label: t("orders.status.tempSave"), code: "BUY_TEMP" },
        { label: t("orders.status.purchaseQuote"), code: "BUY_EST" },
        { label: t("orders.status.purchasePaymentPending"), code: "BUY_PAY_WAIT" },
        { label: t("orders.status.purchasePaymentComplete"), code: "BUY_PAY_DONE" },
        { label: t("orders.status.purchasing"), code: "BUYING" },
        { label: t("orders.status.problemProduct"), code: "PROBLEM_PRODUCT" },
        { label: t("orders.status.purchaseComplete"), code: "BUY_COMPLETE" },
      ],
    },
    {
      title: t("orders.status.inOut"),
      icon: <Warehouse className="w-4 h-4" />,
      color: "text-blue-500",
      items: [
        { label: t("orders.status.centerArrivalExpected"), code: "WH_ARRIVE_EXPECTED" },
        { label: t("orders.status.localDeliveryDelay"), code: "LOCAL_DELAY" },
        { label: t("orders.status.warehouseInProgress"), code: "WH_IN_PROGRESS" },
        { label: t("orders.status.warehouseInComplete"), code: "WH_IN_DONE" },
        { label: t("orders.status.paymentPending"), code: "PAY_WAIT" },
        { label: t("orders.status.paymentComplete"), code: "PAY_DONE" },
        { label: t("orders.status.shipmentPaymentPending"), code: "SHIP_PAY_WAIT" },
        { label: t("orders.status.shipmentPaymentComplete"), code: "SHIP_PAY_DONE" },
        { label: t("orders.status.shipmentPending"), code: "WH_SHIP_WAIT" },
        { label: t("orders.status.shipmentComplete"), code: "WH_SHIPPED" },
        { label: t("orders.status.additionalCostPaymentPending"), code: "ADD_COST_PAY_WAIT" },
        { label: t("orders.status.additionalCostPaymentComplete"), code: "ADD_COST_PAY_DONE" },
     
      ],
    },
    {
      title: t("orders.status.error"),
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-500",
      items: [
        { label: t("orders.status.errorWarehouse"), code: "ERR_IN" },
        { label: t("orders.status.orderCancellation"), code: "ORDER_CANCEL" },
        { label: t("orders.status.platformRefundRequest"), code: "PLAT_REFUND_REQ" },
        { label: t("orders.status.platformRefundProcessing"), code: "PLAT_REFUND_ING" },
        { label: t("orders.status.platformRefundComplete"), code: "PLAT_REFUND_DONE" },
        { label: t("orders.status.customerReturnProcessing"), code: "CUSTOMER_RETURN_ING" },
        { label: t("orders.status.customerReturnComplete"), code: "CUSTOMER_RETURN_DONE" },
        { label: t("orders.status.shipmentHold"), code: "HOLD" },
      ],
    },
  ];

  const allStatusItems = statusGroups.flatMap((group) => group.items);
  const centers = ["Weihai", "Qingdao", "Guangzhou"];
  const responders = ["Olivia", "Noah", "Sophia", "Emma"];
  const buyers = ["Leo", "Mason", "Aiden", "Lucas"];

  const orders: OrderBoardOrder[] = allStatusItems.flatMap((item, statusIndex) => {
    const targetCount = 3 + (statusIndex % 4); // 3~6

    return Array.from({ length: targetCount }, (_, itemIndex) => {
      const seed = statusIndex * 10 + itemIndex + 1;
      const orderNo = `PA-2604-${String(statusIndex + 1).padStart(2, "0")}${String(itemIndex + 1).padStart(2, "0")}`;
      const qty = 6 + (seed % 7);
      const unitPrice = 18000 + (seed % 5) * 4000;
      const totalAmount = qty * unitPrice;

      return {
        orderNo,
        statusCode: item.code,
        center: centers[seed % centers.length],
        applicationType: t("orders.status.purchaseAgency"),
        customsClearance: seed % 2 === 0 ? "General" : "Express",
        typeLabel: t("orders.status.purchaseAgency"),
        shippingMethod: seed % 2 === 0 ? t("orders.filter.shippingMethodSea") : t("orders.filter.shippingMethodAir"),
        isShipped: seed % 3 === 0,
        memberBadge: t("orders.status.purchaseAgency"),
        userName: `Member ${seed}`,
        receiver: `Receiver ${seed}`,
        trackingCount: 1 + (seed % 4),
        warehousedCount: 1 + (seed % 3),
        qty,
        totalAmount,
        paidAmount: totalAmount,
        weight: Number((2.5 + (seed % 6) * 0.8).toFixed(1)),
        krTrack: seed % 3 === 0 ? `KR90${100000 + seed}` : "",
        shipDate: `2026-04-${String(10 + (seed % 15)).padStart(2, "0")}`,
        rack: `R-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 20) + 1).padStart(2, "0")}`,
        warehouseStatus: t("orders.status.warehouseInProgress"),
        progressStatus: item.label,
        createdAt: `2026-04-${String(5 + (seed % 12)).padStart(2, "0")} 10:${String((seed * 7) % 60).padStart(2, "0")}`,
        updatedAt: `2026-04-${String(8 + (seed % 12)).padStart(2, "0")} 16:${String((seed * 9) % 60).padStart(2, "0")}`,
        inquiryResponder: responders[seed % responders.length],
        buyer: buyers[seed % buyers.length],
        adminMemo: `Status sample for ${item.label}`,
        productMemo: "Auto-generated mock data",
        caution: seed % 5 === 0 ? "Check package condition" : "",
        userMemo: "Please process quickly.",
        products: [
          {
            id: `${orderNo}-1`,
            productNo: `P-${98000 + seed}`,
            name: `Sample Product A-${seed}`,
            option: "Default / M",
            trackingNo: `CN26${String(1000000 + seed)}`,
            orderNo,
            unitPrice,
            quantity: Math.max(1, qty - 2),
            totalPrice: Math.max(1, qty - 2) * unitPrice,
            shippingCost: 8000 + (seed % 4) * 2000,
            rackNo: `R-${String((seed % 12) + 1).padStart(2, "0")}`,
            prevRackNo: "",
            statusLabel: item.label,
            productMemo: "Auto-generated mock data",
            caution: seed % 5 === 0 ? "Check package condition" : "",
            userMemo: "Please process quickly.",
          },
          {
            id: `${orderNo}-2`,
            productNo: `P-${98100 + seed}`,
            name: `Sample Product B-${seed}`,
            option: "Default / L",
            trackingNo: `CN26${String(2000000 + seed)}`,
            orderNo,
            unitPrice: unitPrice - 3000,
            quantity: 2,
            totalPrice: (unitPrice - 3000) * 2,
            shippingCost: 5000,
            rackNo: `R-${String((seed % 12) + 1).padStart(2, "0")}`,
            prevRackNo: `R-${String(((seed + 1) % 12) + 1).padStart(2, "0")}`,
            statusLabel: item.label,
            productMemo: `Line memo · ${orderNo}`,
            caution: "",
            userMemo: "Secondary line note",
          },
        ],
      };
    });
  });

  const buttons = (
    <div className="flex justify-between w-screen">
      <div className="flex gap-2">
      <button type="button" data-inbound-scan className="h-8 px-2 rounded-lg text-xs font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><ScanBarcode className="w-4 h-4" />{t("orders.action.warehouseScan")}</button>
      <button className="h-8 px-2 rounded-lg text-xs font-bold text-white bg-gradient-to-br from-teal-500 to-teal-700 flex items-center gap-2"><Scissors className="w-4 h-4" />{t("orders.action.packingSplit")}</button>
      <button className="h-8 px-2 rounded-lg text-xs font-bold text-white bg-gradient-to-br from-red-500 to-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("orders.action.issueList")}</button>
      <button className="h-8 px-2 rounded-lg text-xs font-bold text-white bg-gradient-to-br from-purple-500 to-purple-700 flex items-center gap-2"><ClipboardList className="w-4 h-4" />{t("orders.action.workList")}</button>
      <button
        type="button"
        aria-pressed={releaseListOpen}
        onClick={() => setReleaseListOpen((v) => !v)}
        className={`h-8 px-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
          releaseListOpen
            ? "text-white bg-gradient-to-br from-emerald-600 to-emerald-800 ring-2 ring-offset-1 ring-emerald-500 shadow-md"
            : "text-white bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
        }`}
      >
        <PackageCheck className="w-4 h-4" />
        {t("orders.action.outboundList")}
      </button>
      </div>
      {/* <div className="w-px h-10 bg-gray-300" /> */}
      <div className="flex gap-2">
        <button className="h-8 px-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-500 bg-white hover:text-white  hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Printer className="w-4 h-4" />{t("orders.action.trackingPrint")}</button>
        <button className="h-8 px-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Printer className="w-4 h-4" />{t("orders.action.hanjinWaybill")}</button>
        <button className="h-8 px-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><FileText className="w-4 h-4" />{t("orders.action.meniFormNew")}</button>
        <button className="h-8 px-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Package className="w-4 h-4" />{t("orders.action.meniProduct")}</button>
        <button className="h-8 px-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Ship className="w-4 h-4" />{t("orders.action.seaPyeongtaek")}</button>
        <button className="h-8 px-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Ship className="w-4 h-4" />{t("orders.action.redfSea")}</button>
        <button className="h-8 px-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Plane className="w-4 h-4" />{t("orders.action.redfAir")}</button>
        <button className="h-8 px-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Upload className="w-4 h-4" />{t("orders.action.trackingLoad")}</button>
      </div>
    </div>
  );

  return (
    <OrderBoard
      title={t("orders.business.title")}
      defaultSelectedLabel={t("orders.business.title")}
      memberFilterLabel={t("orders.business.businessNumber")}
      memberFilterPlaceholder={t("orders.business.businessNumberPlaceholder")}
      statusGroups={statusGroups}
      orders={orders}
      actionButtons={buttons}
      purchaseAgencyRowActions
      mainPanelOverride={
        releaseListOpen ? <BusinessOutboundReleaseListPanel t={t} locale={locale} /> : undefined
      }
    />
  );
}
