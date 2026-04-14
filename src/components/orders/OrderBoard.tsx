"use client";

import React, { useMemo, useState } from "react";
import {
  Camera,
  ChevronDown, ChevronUp, Download, Eye, History, Minus, Plus,
  RotateCcw, Save, Search, Upload, X,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

/* ─── Public types ──────────────────────────────────────────────────────── */

export interface OrderBoardStatusItem { label: string; code: string }
export interface OrderBoardStatusGroup { title: string; icon: React.ReactNode; color: string; items: OrderBoardStatusItem[] }

export interface OrderBoardProduct {
  id: string;
  productNo: string;
  image?: string;
  name: string;
  option: string;
  trackingNo: string;
  orderNo: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  shippingCost: number;
  rackNo: string;
  prevRackNo: string;
  statusLabel: string;
  /** Per-line memos; when omitted, order-level memos are used in the UI */
  productMemo?: string;
  caution?: string;
  userMemo?: string;
}

export interface OrderBoardOrder {
  orderNo: string;
  statusCode: string;
  center: string;
  applicationType: string;
  customsClearance: string;
  typeLabel: string;
  shippingMethod: string;
  isShipped: boolean;
  memberBadge: string;
  userName: string;
  receiver: string;
  trackingCount: number;
  warehousedCount: number;
  qty: number;
  totalAmount: number;
  paidAmount: number;
  weight: number;
  krTrack: string;
  shipDate: string;
  rack: string;
  warehouseStatus: string;
  progressStatus: string;
  createdAt: string;
  updatedAt: string;
  inquiryResponder?: string;
  buyer?: string;
  adminMemo?: string;
  productMemo?: string;
  caution?: string;
  userMemo?: string;
  products: OrderBoardProduct[];
}

interface Props {
  title: string;
  defaultSelectedLabel: string;
  memberFilterLabel?: string;
  memberFilterPlaceholder?: string;
  statusGroups: OrderBoardStatusGroup[];
  orders: OrderBoardOrder[];
  actionButtons?: React.ReactNode;
  /** 구매대행 주문: 상태별 관리 버튼 (개인·주문복사·주문문의 공통 + 상태별 추가) */
  purchaseAgencyRowActions?: boolean;
  /** 설정 시 필터·툴바·주문 테이블·페이지네이션 대신 이 콘텐츠만 표시 */
  mainPanelOverride?: React.ReactNode;
}

/** i18n keys for purchase-agency row actions (first three are always shown). */
const PURCHASE_AGENCY_ROW_BASE: readonly string[] = [
  "orders.rowAction.personal",
  "orders.rowAction.orderCopy",
  "orders.rowAction.orderInquiry",
];

const PURCHASE_AGENCY_ROW_EXTRA_BY_STATUS: Record<string, readonly string[]> = {
  BUY_TEMP: ["orders.rowAction.delete"],
  /* 접수신청 단계: 현재 보드의 구매견적(BUY_EST)에 매핑 */
  BUY_EST: ["orders.rowAction.split", "orders.rowAction.delete"],
  WH_ARRIVE_EXPECTED: ["orders.rowAction.agencyExtraCost"],
  LOCAL_DELAY: ["orders.rowAction.agencyExtraCost"],
  WH_IN_PROGRESS: ["orders.rowAction.agencyExtraCost", "orders.rowAction.split"],
  WH_IN_DONE: [
    "orders.rowAction.agencyExtraCost",
    "orders.rowAction.bundle",
    "orders.rowAction.split",
    "orders.rowAction.shippingCost",
    "orders.rowAction.trackingIssueReissue",
    "orders.action.hanjinWaybill",
  ],
  SHIP_PAY_WAIT: [
    "orders.rowAction.intlShippingBank",
    "orders.rowAction.intlShippingReset",
    "orders.rowAction.trackingIssueReissue",
    "orders.action.hanjinWaybill",
    "orders.rowAction.trackingBoxSub",
  ],
  SHIP_PAY_DONE: [
    "orders.rowAction.trackingIssueReissue",
    "orders.action.hanjinWaybill",
    "orders.rowAction.trackingBoxSub",
  ],
  WH_SHIP_WAIT: ["orders.action.hanjinWaybill"],
  WH_SHIPPED: ["orders.action.additionalCost"],
  ADD_COST_PAY_WAIT: ["orders.rowAction.addCostBank", "orders.rowAction.addCostReset"],
  HOLD: ["orders.rowAction.split", "orders.rowAction.holdHistory"],
};

function purchaseAgencyRowActionKeys(statusCode: string): string[] {
  const extra = PURCHASE_AGENCY_ROW_EXTRA_BY_STATUS[statusCode] ?? [];
  return [...PURCHASE_AGENCY_ROW_BASE, ...extra];
}

function rowActionButtonClass(labelKey: string): string {
  const base =
    "min-w-0 w-full px-1.5 py-1 text-[10px] rounded text-center leading-snug whitespace-normal [word-break:keep-all]";
  if (labelKey === "orders.rowAction.delete") {
    return `${base} border border-red-300 text-red-700 hover:bg-red-50`;
  }
  if (labelKey === "orders.rowAction.personal") {
    return `${base} bg-blue-600 text-white hover:bg-blue-700`;
  }
  return `${base} border border-gray-300 hover:bg-gray-50 text-gray-800`;
}

/** 일반 데이터 열 10개 = 각 1단위, 관리 열 = 1.5단위(항상 일반 열의 1.5배 너비) → 합계 11.5 */
const ORDER_BOARD_COL_SUM_UNITS = 11.5;
const ORDER_BOARD_DATA_COL_W = `calc(100% / ${ORDER_BOARD_COL_SUM_UNITS})`;
const ORDER_BOARD_ACTION_COL_W = `calc(100% * 1.5 / ${ORDER_BOARD_COL_SUM_UNITS})`;

const ORDER_PRODUCT_CHECK_COL_PX = 40;

/** Panel filter values applied on "Search" (draft mirrors inputs until then). */
interface OrderBoardSearchFilters {
  center: string;
  productType: string;
  shippingMethod: string;
  shippedMode: string;
  dateFrom: string;
  dateTo: string;
  memberQuery: string;
  orderNoQuery: string;
  trackingQuery: string;
}

function emptyOrderBoardSearchFilters(): OrderBoardSearchFilters {
  return {
    center: "",
    productType: "",
    shippingMethod: "",
    shippedMode: "",
    dateFrom: "",
    dateTo: "",
    memberQuery: "",
    orderNoQuery: "",
    trackingQuery: "",
  };
}

function applyOrderBoardSearchFilters(
  list: OrderBoardOrder[],
  f: OrderBoardSearchFilters,
  translate: (key: string) => string,
): OrderBoardOrder[] {
  let out = list;
  if (f.center) out = out.filter((o) => o.center === f.center);
  if (f.productType === "purchase") {
    out = out.filter((o) => o.typeLabel === translate("orders.filter.typePurchase"));
  } else if (f.productType === "shipping") {
    out = out.filter((o) => o.typeLabel === translate("orders.filter.typeShipping"));
  } else if (f.productType === "vvic") {
    out = out.filter((o) => o.typeLabel === translate("orders.filter.typeVVIC"));
  }
  if (f.shippingMethod === "air") {
    out = out.filter((o) => o.shippingMethod === translate("orders.filter.shippingMethodAir"));
  } else if (f.shippingMethod === "sea") {
    out = out.filter((o) => o.shippingMethod === translate("orders.filter.shippingMethodSea"));
  }
  /* Demo mapping: 자동 = 배송완료, 수동 = 미배송 (실서비스 필드 연동 시 교체) */
  if (f.shippedMode === "auto") out = out.filter((o) => o.isShipped);
  else if (f.shippedMode === "manual") out = out.filter((o) => !o.isShipped);

  if (f.dateFrom) {
    out = out.filter((o) => (o.createdAt ?? "").slice(0, 10) >= f.dateFrom);
  }
  if (f.dateTo) {
    out = out.filter((o) => (o.createdAt ?? "").slice(0, 10) <= f.dateTo);
  }
  const mq = f.memberQuery.trim().toLowerCase();
  if (mq) {
    out = out.filter(
      (o) =>
        o.userName.toLowerCase().includes(mq) ||
        o.memberBadge.toLowerCase().includes(mq) ||
        o.receiver.toLowerCase().includes(mq),
    );
  }
  const oq = f.orderNoQuery.trim().toLowerCase();
  if (oq) out = out.filter((o) => o.orderNo.toLowerCase().includes(oq));
  const tq = f.trackingQuery.trim().toLowerCase();
  if (tq) {
    out = out.filter(
      (o) =>
        (o.krTrack && o.krTrack.toLowerCase().includes(tq)) ||
        o.products.some((p) => p.trackingNo.toLowerCase().includes(tq)),
    );
  }
  return out;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function OrderBoard({
  title, defaultSelectedLabel, memberFilterLabel, memberFilterPlaceholder,
  statusGroups, orders, actionButtons, purchaseAgencyRowActions = false,
  mainPanelOverride,
}: Props) {
  const { t } = useLocale();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState(defaultSelectedLabel);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    () => new Set(orders[0] ? [orders[0].orderNo] : []),
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filterDraft, setFilterDraft] = useState<OrderBoardSearchFilters>(emptyOrderBoardSearchFilters);
  const [filterApplied, setFilterApplied] = useState<OrderBoardSearchFilters>(emptyOrderBoardSearchFilters);
  const [orderColumnModal, setOrderColumnModal] = useState<
    { mode: "view" | "log"; order: OrderBoardOrder } | null
  >(null);
  const [inboundScanOpen, setInboundScanOpen] = useState(false);

  /* derived */
  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.statusCode, (counts.get(o.statusCode) ?? 0) + 1);
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const byStatus = selectedCode
      ? orders.filter((o) => o.statusCode === selectedCode)
      : orders;
    return applyOrderBoardSearchFilters(byStatus, filterApplied, t);
  }, [orders, selectedCode, filterApplied, t]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const inboundScanContext = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const o = filteredOrders[start] ?? filteredOrders[0];
    const p = o?.products[0];
    if (!o || !p) return null;
    return { order: o, product: p };
  }, [filteredOrders, currentPage, pageSize]);

  /* helpers */
  const toggle = (orderNo: string) =>
    setExpandedProducts((prev) => {
      const n = new Set(prev);
      if (n.has(orderNo)) {
        n.delete(orderNo);
      } else {
        n.add(orderNo);
      }
      return n;
    });
  const clear = () => {
    setSelectedCode(null);
    setSelectedLabel(defaultSelectedLabel);
    setCurrentPage(1);
  };

  const runSearch = () => {
    setFilterApplied({ ...filterDraft });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const empty = emptyOrderBoardSearchFilters();
    setFilterDraft(empty);
    setFilterApplied(empty);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 ">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedCode ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {selectedLabel} (
            {filteredOrders.length.toLocaleString()}
            {t("orders.common.count")})
          </span>
        </div>
        {selectedCode && (
          <button
            onClick={clear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <X className="w-4 h-4" />
            {t("orders.action.viewAll")}
          </button>
        )}
      </div>

      {/* ── Status group cards ────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap items-start">
        {statusGroups.map((group) => (
          <div
            key={group.title}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow w-56 shrink-0"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <span className={group.color}>{group.icon}</span>
              <span className="text-xs font-semibold text-gray-700 truncate">{group.title}</span>
            </div>
            <div className="py-1">
              {group.items.map((item) => {
                const count = statusCounts.get(item.code) ?? 0;
                return (
                  <div
                    key={item.code}
                    onClick={() => {
                      setSelectedCode(item.code);
                      setSelectedLabel(`${group.title} > ${item.label}`);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors text-xs ${
                      selectedCode === item.code
                        ? "bg-blue-200 border-l-[3px] border-l-blue-500"
                        : "border-l-[3px] border-l-transparent hover:bg-blue-200"
                    }`}
                  >
                    <span className={count === 0 ? "text-gray-300" : "text-gray-500"}>
                      {item.label}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[11px] font-medium ${
                        count === 0 ? "bg-gray-200 text-gray-400" : "bg-gray-600 text-white"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick action buttons (data-inbound-scan opens modal) ─── */}
      {actionButtons && (
        <div
          className="flex gap-2 flex-wrap"
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest("[data-inbound-scan]")) {
              e.preventDefault();
              e.stopPropagation();
              setInboundScanOpen(true);
            }
          }}
        >
          {actionButtons}
        </div>
      )}

      {/* ── Table (또는 mainPanelOverride로 대체) ───────────────────── */}
      <div className=" bg-white border rounded-md p-4 border-gray-300" >
        {mainPanelOverride != null ? (
          mainPanelOverride
        ) : (
        <>
        {/* ── Filters ───────────────────────────────────────────────── */}
        <form
          className="bg-white rounded-sm border border-gray-300 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
        >
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.filter.center")}</label>
              <select
                value={filterDraft.center}
                onChange={(e) => setFilterDraft((p) => ({ ...p, center: e.target.value }))}
                className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md"
              >
                <option value="">{t("orders.filter.centerAll")}</option>
                <option value="Weihai">{t("orders.filter.centerWeihai")}</option>
                <option value="Qingdao">{t("orders.filter.centerQingdao")}</option>
                <option value="Guangzhou">{t("orders.filter.centerGuangzhou")}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.productType")}</label>
              <select
                value={filterDraft.productType}
                onChange={(e) => setFilterDraft((p) => ({ ...p, productType: e.target.value }))}
                className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md"
              >
                <option value="">{t("orders.filter.typeAll")}</option>
                <option value="shipping">{t("orders.filter.typeShipping")}</option>
                <option value="purchase">{t("orders.filter.typePurchase")}</option>
                <option value="vvic">{t("orders.filter.typeVVIC")}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.shippingMethod")}</label>
              <select
                value={filterDraft.shippingMethod}
                onChange={(e) => setFilterDraft((p) => ({ ...p, shippingMethod: e.target.value }))}
                className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md"
              >
                <option value="">{t("orders.filter.shippingMethodAll")}</option>
                <option value="air">{t("orders.filter.shippingMethodAir")}</option>
                <option value="sea">{t("orders.filter.shippingMethodSea")}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.shippingStatus")}</label>
              <select
                value={filterDraft.shippedMode}
                onChange={(e) => setFilterDraft((p) => ({ ...p, shippedMode: e.target.value }))}
                className="h-8 w-28 px-2 text-xs border border-gray-300 rounded-md"
              >
                <option value="">{t("orders.filter.shippedAll")}</option>
                <option value="auto">{t("orders.filter.shippedAuto")}</option>
                <option value="manual">{t("orders.filter.shippedManual")}</option>
              </select>
            </div>
            {filtersExpanded && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.filter.dateRange")}</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={filterDraft.dateFrom}
                      onChange={(e) => setFilterDraft((p) => ({ ...p, dateFrom: e.target.value }))}
                      className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md"
                    />
                    <input
                      type="date"
                      value={filterDraft.dateTo}
                      onChange={(e) => setFilterDraft((p) => ({ ...p, dateTo: e.target.value }))}
                      className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{memberFilterLabel ?? t("orders.common.membershipCode")}</label>
                  <input
                    type="text"
                    value={filterDraft.memberQuery}
                    onChange={(e) => setFilterDraft((p) => ({ ...p, memberQuery: e.target.value }))}
                    placeholder={memberFilterPlaceholder ?? t("orders.filter.userNamePlaceholder")}
                    className="h-8 w-36 px-2 text-xs border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.orderNumber")}</label>
                  <input
                    type="text"
                    value={filterDraft.orderNoQuery}
                    onChange={(e) => setFilterDraft((p) => ({ ...p, orderNoQuery: e.target.value }))}
                    placeholder={t("orders.filter.orderNoPlaceholder")}
                    className="h-8 w-36 px-2 text-xs border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.trackingNumber")}</label>
                  <input
                    type="text"
                    value={filterDraft.trackingQuery}
                    onChange={(e) => setFilterDraft((p) => ({ ...p, trackingQuery: e.target.value }))}
                    placeholder={t("orders.filter.trackingNoPlaceholder")}
                    className="h-8 w-36 px-2 text-xs border border-gray-300 rounded-md"
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setFiltersExpanded((p) => !p)}
                className="h-8 px-3 text-xs text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 flex items-center gap-1"
              >
                {filtersExpanded ? <><ChevronUp className="w-3.5 h-3.5" />{t("orders.action.collapse")}</> : <><ChevronDown className="w-3.5 h-3.5" />{t("orders.action.showMore")}</>}
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />{t("orders.action.reset")}
              </button>
              <button
                type="submit"
                className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
              >
                <Search className="w-3 h-3" />{t("orders.action.search")}
              </button>
            </div>
          </div>
        </form>

        {/* ── Toolbar ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <select className="h-8 px-3 text-sm border border-gray-300 rounded-md">
              <option value="">{t("orders.action.statusChangeSelect")}</option>
              {statusGroups.flatMap((g) => g.items).map((s) => (
                <option key={s.code} value={s.code}>{s.label}</option>
              ))}
            </select>
            <select className="h-8 px-3 text-sm border border-gray-300 rounded-md">
              <option value="no">{t("orders.action.smsNotSend")}</option>
              <option value="yes">{t("orders.action.smsSend")}</option>
            </select>
            <button className="h-8 px-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {t("orders.action.statusChange")}
            </button>

            
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />{t("orders.action.excelDownload")}
            </button>
            <button className="h-8 px-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />{t("orders.action.trackingBatchRegister")}
            </button>
          </div>
        </div>

        {/* ── Order table ───────────────────────────────────────────── */}
        {/* <div className="mt-4 app-table-wrap">
          <table className="app-table table-fixed"> */}
        <div className="app-table-wrap table-fixed w-full">
        
          <table className="app-table text-xs">
            <thead>
              <tr className="bg-gray-500">
                <th className="text-center w-3/22">{t("orders.common.orderNumber")}</th>
                <th className="text-center">
                  <div>{t("orders.common.center")}</div>
                  <div>{t("orders.common.applicationType")}</div>
                  <div>{t("orders.common.customsClearance")}</div>
                </th>
                <th className="text-center">
                  <div>{t("orders.common.productType")}</div>
                  <div>{t("orders.common.shippingMethod")}</div>
                  <div>{t("orders.common.shippingStatus")}</div>
                </th>
                <th className="text-center">
                  <div>{t("orders.common.membershipCode")}</div>
                  <div>{t("orders.common.receiver")}</div>
                </th>
                <th className="text-center">
                  <div>{t("orders.common.quantity")}</div>
                  <div>{t("orders.common.totalAmount")}</div>
                </th>
                <th className="text-center">
                  <div>{t("orders.common.paidAmount")}</div>
                  <div>({t("orders.common.weight")})</div>
                </th>
                <th className="text-center">
                  <div>{t("orders.common.trackingNumber")}</div>
                  <div>{t("orders.common.shipDate")}/{t("orders.common.rackNumber")}</div>
                </th>
                <th className="text-center">
                  <div>{t("orders.common.warehouseStatus")}</div>
                  <div>{t("orders.common.progressStatus")}</div>
                </th>
                <th className="text-center">
                  <div>{t("orders.common.createdAt")}</div>
                  <div>{t("orders.common.updatedAt")}</div>
                </th>
                {/* <th className="text-center">
                  <div>{t("orders.common.inquiryResponder")}</div>
                  <div>{t("orders.common.buyer")}</div>
                </th> */}
                <th className="app-table-sticky-head w-3/22">{t("orders.common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <React.Fragment key={order.orderNo}>
                  {/* ── Main row ── */}
                  <tr>
                    {/* Order No + expand/view/log */}
                    <td className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-blue-600">{order.orderNo}</span>
                        <button onClick={() => toggle(order.orderNo)} className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100">
                          {expandedProducts.has(order.orderNo) ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </button>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setOrderColumnModal({ mode: "view", order })}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <Eye className="w-3 h-3" />{t("orders.action.viewOrder")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderColumnModal({ mode: "log", order })}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <History className="w-3 h-3" />{t("orders.action.log")}
                          </button>
                        </div>
                      </div>
                    </td>
                    {/* Center / Application / Customs */}
                    <td className="text-center">
                      <div className="text-[11px] font-medium">{order.center}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{order.applicationType}</div>
                      <span className="inline-block px-2 py-0.5 text-[10px] bg-sky-100 text-sky-700 rounded-full mt-0.5">
                        {order.customsClearance}
                      </span>
                    </td>
                    {/* Type / Method / Status */}
                    <td className="text-center">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-purple-100 text-purple-700 rounded-full">{order.typeLabel}</span>
                      <div className="text-[10px] text-gray-500 mt-0.5">{order.shippingMethod}</div>
                      <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full mt-0.5 ${order.isShipped ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {order.isShipped ? t("orders.common.shipped") : t("orders.common.notShipped")}
                      </span>
                    </td>
                    {/* Member / Receiver */}
                    <td className="text-center">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-700 rounded-full">{order.memberBadge}</span>
                      <div className="text-xs text-blue-600 underline mt-0.5">{order.userName}</div>
                      <div className="text-[11px] text-gray-500">{order.receiver}</div>
                    </td>
                    {/* Qty / Total */}
                    <td className="text-center">
                      <strong className="text-xs">{order.qty}{t("orders.common.items")}</strong>
                      <div className="text-xs text-red-500 font-bold">{order.totalAmount.toLocaleString()}{t("orders.common.won")}</div>
                    </td>
                    {/* Paid / Weight */}
                    <td className="text-center">
                      <strong className="text-xs">{order.paidAmount.toLocaleString()}{t("orders.common.won")}</strong>
                      <div className="text-[11px] text-gray-400">({order.weight}kg)</div>
                    </td>
                    {/* Tracking / Ship date / Rack */}
                    <td className="text-center">
                      {order.krTrack ? (
                        <span className="inline-block px-2 py-0.5 text-[11px] bg-green-100 text-green-700 rounded-full">{order.krTrack}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] bg-gray-100 text-gray-500 rounded-full">{t("orders.common.notRegistered")}</span>
                      )}
                      <div className="text-[10px] text-gray-500 mt-0.5">{order.shipDate} · {order.rack}</div>
                    </td>
                    {/* Warehouse / Progress */}
                    <td className="text-center">
                      <span className="inline-block px-2 py-0.5 text-[11px] bg-green-100 text-green-700 rounded-full mb-1">{order.warehouseStatus}</span>
                      <div className="text-[11px] text-gray-600">{order.progressStatus}</div>
                    </td>
                    {/* Created / Updated */}
                    <td className="text-center">
                      <div className="text-[11px]">{order.createdAt}</div>
                      <div className="text-[11px] text-gray-400">{order.updatedAt}</div>
                    </td>
                    {/* Responder / Buyer */}
                    {/* <td className="text-center">
                      {order.inquiryResponder ? <span className="text-xs text-blue-600">{order.inquiryResponder}</span> : <span className="text-xs text-gray-400">{t("orders.common.none")}</span>}
                      <div className="text-[11px]">{order.buyer ?? "-"}</div>
                    </td> */}
                    {/* Actions */}
                    <td className="app-table-sticky-cell">
                      <div className="grid w-full grid-cols-2 gap-1">
                        {purchaseAgencyRowActions
                          ? purchaseAgencyRowActionKeys(order.statusCode).map((key) => (
                              <button
                                key={`${order.orderNo}-${key}`}
                                type="button"
                                className={rowActionButtonClass(key)}
                              >
                                {t(key)}
                              </button>
                            ))
                          : (
                            <>
                              <button type="button" className="min-w-0 w-full rounded border border-gray-300 bg-blue-600 px-1.5 py-1 text-[10px] leading-snug text-white hover:bg-blue-700 col-span-2">{t("orders.action.orderCopy")}</button>
                              <button type="button" className="min-w-0 w-full rounded border border-gray-300 px-1.5 py-1 text-[10px] leading-snug hover:bg-gray-50">{t("orders.action.additionalCost")}</button>
                              <button type="button" className="min-w-0 w-full rounded border border-gray-300 px-1.5 py-1 text-[10px] leading-snug hover:bg-gray-50">{t("orders.action.orderInquiry")}</button>
                              <button type="button" className="min-w-0 col-span-2 w-full rounded border border-gray-300 px-1.5 py-1 text-[10px] leading-snug hover:bg-gray-50">{t("orders.action.trackingRegister")}</button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>

                  {/* ── Expanded product section ── */}
                  {expandedProducts.has(order.orderNo) && (
                    <tr className="border-b border-slate-200 bg-slate-50/90 transition-colors duration-150 hover:bg-slate-100">
                      <td colSpan={1}></td>
                      <td colSpan={10} className="px-6 py-4 ">
                        {/* Admin memo */}
                        <div className="flex items-center gap-2 text-xs mb-3">
                          <span className="font-bold min-w-[100px]">{t("orders.expanded.orderMemo")}:</span>
                          <input
                            type="text"
                            defaultValue={order.adminMemo ?? ""}
                            placeholder={t("orders.expanded.orderMemoPlaceholder")}
                            className="flex-1 h-8 px-3 text-xs border border-gray-300 rounded-md"
                          />
                          <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {t("orders.action.register")}
                          </button>
                        </div>

                        {/* Toolbar above product table */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500">{t("orders.product.trackingInput")}:</label>
                            <input type="text" placeholder={t("orders.filter.trackingNoPlaceholder")} className="h-8 w-52 px-3 text-xs border border-gray-300 rounded-md" />
                            <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1">
                              <Save className="w-3 h-3" />{t("orders.product.batchSave")}
                            </button>
                            <button className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1">
                              <Plus className="w-3 h-3" />{t("orders.product.addAdditionalService")}
                            </button>
                          </div>
                        </div>

                        {/* Product table */}
                        <div className="app-table-wrap">
                          <table className="app-table app-table-compact table-fixed">
                            <colgroup>
                              <col style={{ width: ORDER_PRODUCT_CHECK_COL_PX }} />
                              {Array.from({ length: 8 }, (_, i) => (
                                <col
                                  key={i}
                                  style={{
                                    width: `calc((100% - ${ORDER_PRODUCT_CHECK_COL_PX}px) / 8)`,
                                  }}
                                />
                              ))}
                            </colgroup>
                            <thead>
                              <tr>
                                <th className="text-center">
                                  <input type="checkbox" className="rounded border-gray-300" />
                                </th>
                                <th className="text-left">{t("orders.product.productNumber")}</th>
                                <th className="text-left">{t("orders.product.image")}</th>
                                <th className="text-left">{t("orders.product.nameOptions")}</th>
                                <th className="text-left">{t("orders.product.trackingOrderNo")}</th>
                                <th className="text-right">{t("orders.product.unitQtyPrice")}</th>
                                <th className="text-right">{t("orders.product.shippingCosts")}</th>
                                <th className="text-left">{t("orders.product.rackPrevRack")}</th>
                                <th className="text-left">{t("orders.product.productStatus")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.products.map((p) => {
                                const lineProductMemo = p.productMemo ?? order.productMemo ?? "";
                                const lineCaution = p.caution ?? order.caution ?? "";
                                const lineUserMemo = p.userMemo ?? order.userMemo ?? "";
                                return (
                                  <React.Fragment key={p.id}>
                                    <tr className="">
                                      <td className="text-center row-span-2">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                      </td>
                                      <td className="text-left font-medium text-blue-600">{p.productNo}</td>
                                      <td className="text-left">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-200 text-[10px] font-semibold text-slate-500">
                                          {p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover" /> : "IMG"}
                                        </div>
                                      </td>
                                      <td className="text-left">
                                        <div className="font-medium text-slate-800">{p.name}</div>
                                        <div className="text-slate-500">{p.option}</div>
                                      </td>
                                      <td className="text-left">
                                        <div className="text-slate-700">{p.trackingNo || "-"}</div>
                                        <div className="text-slate-400">{p.orderNo}</div>
                                      </td>
                                      <td className="text-right">
                                        <span className="text-slate-500">{p.unitPrice.toLocaleString()}</span>
                                        <span className="text-slate-400"> × {p.quantity} = </span>
                                        <span className="font-semibold text-slate-800">{p.totalPrice.toLocaleString()}{t("orders.common.won")}</span>
                                      </td>
                                      <td className="text-right">{p.shippingCost.toLocaleString()}{t("orders.common.won")}</td>
                                      <td className="text-left">
                                        <div>{p.rackNo}</div>
                                        {p.prevRackNo && <div className="text-slate-400">{p.prevRackNo}</div>}
                                      </td>
                                      <td className="text-left">
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700">{p.statusLabel}</span>
                                      </td>
                                    </tr>
                                    <tr className="bg-slate-50/90 ">
                                      <td className="p-0" />
                                      <td className="p-0" />
                                      <td colSpan={7} className="align-top px-2 py-2">
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2 justify-around">
                                            <label className="text-[11px] w-1/6 text-center font-semibold text-gray-700 block mb-0.5">{t("orders.product.productMemo")}</label>
                                            <input
                                              type="text"
                                              defaultValue={lineProductMemo}
                                              placeholder={t("orders.product.productMemo")}
                                              className=" h-7 w-4/6 px-2 text-[11px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />                                            
                                            <button className="h-7 w-1/6 px-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"> {t("orders.action.register")}</button>
                                          </div>
                                          <div className=" flex items-center gap-2 justify-around">
                                            <label className="text-[11px] w-1/6  text-center font-semibold text-orange-700 block mb-0.5">{t("orders.product.caution")}</label>
                                            <input
                                              type="text"
                                              defaultValue={lineCaution}
                                              placeholder={t("orders.product.caution")}
                                              className="w-4/5 h-7 w-4/6 px-2 text-[11px] border border-orange-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                                            />
                                              <button className="h-7 w-1/6 px-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"> {t("orders.action.register")}</button>
                                          </div>
                                          <div className="flex items-center gap-2 justify-around">
                                            <label className="text-[11px] w-1/6 text-center font-semibold text-gray-700 block mb-0.5">{t("orders.product.userMemo")}</label>
                                            <input
                                              type="text"
                                              defaultValue={lineUserMemo}
                                              placeholder={t("orders.product.userMemo")}
                                              className="w-4/6 h-7 px-2 text-[11px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button className="h-7 w-1/6 px-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"> {t("orders.action.register")}</button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{t("orders.common.count")}: {filteredOrders.length.toLocaleString()}</span>
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="h-8 px-2 text-sm border border-gray-300 rounded-md">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">&laquo;</button>
              <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">&raquo;</button>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {inboundScanOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inbound-scan-modal-title"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setInboundScanOpen(false)}
        >
          <div
            className="w-full max-w-sm max-h-[92vh] overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="inbound-scan-modal-title"
              className="border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-center text-sm font-semibold text-gray-900"
            >
              {t("orders.action.warehouseScan")}
            </div>
            <div className="overflow-y-auto p-3 space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-600"
              >
                <Camera className="h-4 w-4 shrink-0" />
                {t("orders.inboundScan.takePhoto")}
              </button>
              <button
                type="button"
                className="flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs font-medium">{t("orders.inboundScan.upload")}</span>
              </button>
              <button
                type="button"
                className="w-full rounded-lg bg-gray-200 py-3 text-sm font-semibold text-gray-800 shadow-inner hover:bg-gray-300"
              >
                {t("orders.inboundScan.inboundComplete")}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-gray-200 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-300"
                >
                  {t("orders.inboundScan.workPending")}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-gray-200 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-300"
                >
                  {t("orders.inboundScan.issuePhoto")}
                </button>
              </div>

              {inboundScanContext ? (
                <>
                  <p className="text-center text-xs text-gray-800">
                    <span className="text-gray-600">{t("orders.common.orderNumber")}</span>
                    <span className="mx-1">:</span>
                    <span className="font-bold text-red-600">{inboundScanContext.order.orderNo}</span>
                  </p>
                  <div className="flex gap-2 rounded-lg border border-gray-200 bg-white p-2">
                    
                    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-gray-200">
                      <table className="w-full border-collapse text-xs">
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <th className="w-[38%] border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.product.productNumber")}
                            </th>
                            <td className="bg-white px-2 py-2 text-gray-900">{inboundScanContext.product.productNo}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.inboundScan.productName")}
                            </th>
                            <td className="bg-white px-2 py-2 text-gray-900">{inboundScanContext.product.name}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.inboundScan.productImage")}
                            </th>
                            <td className="bg-white px-2 py-2">
                              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-100 text-[10px] text-gray-500">
                                {inboundScanContext.product.image ? (
                                  <img src={inboundScanContext.product.image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  "IMG"
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.inboundScan.colorSize")}
                            </th>
                            <td className="bg-white px-2 py-2 text-gray-800">{inboundScanContext.product.option}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.common.quantity")}
                            </th>
                            <td className="bg-white px-2 py-2 text-gray-900">{inboundScanContext.product.quantity}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.inboundScan.barcode")}
                            </th>
                            <td className="bg-white px-2 py-2">
                              <input
                                type="text"
                                defaultValue="s123456789"
                                className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.inboundScan.barcodePhoto")}
                            </th>
                            <td className="bg-white px-2 py-2">
                              <button
                                type="button"
                                className="flex min-h-[4rem] w-full flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-orange-300 bg-orange-50/50 text-orange-700 hover:bg-orange-50"
                              >
                                <Plus className="h-5 w-5" />
                                <span className="text-[11px] font-medium">{t("orders.inboundScan.imageUpload")}</span>
                              </button>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.product.productMemo")}
                            </th>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                defaultValue={
                                  inboundScanContext.product.productMemo ??
                                  inboundScanContext.order.productMemo ??
                                  ""
                                }
                                placeholder={t("orders.product.productMemo")}
                                className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium text-gray-700">
                              {t("orders.common.status")}
                            </th>
                            <td className="bg-white px-2 py-2">
                              <select className="h-8 w-full rounded border border-gray-300 bg-white px-2 text-xs">
                                <option>{t("orders.status.warehouseInComplete")}</option>
                                <option>{t("orders.status.warehouseInProgress")}</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <th className="border-r border-gray-200 bg-gray-100 px-2 py-2 align-top text-left font-medium text-gray-700">
                              {t("orders.inboundScan.orderNoBracket").replace(
                                "{{no}}",
                                inboundScanContext.order.orderNo,
                              )}
                            </th>
                            <td className="bg-white px-2 py-2">
                              <textarea
                                rows={3}
                                defaultValue={`${inboundScanContext.product.productNo}-26包邮》等卖家改价 /`}
                                className="w-full resize-y rounded border border-gray-300 px-2 py-1.5 text-xs"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <p className="py-6 text-center text-xs text-gray-500">{t("orders.inboundScan.noProductSample")}</p>
              )}
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-3 py-2.5 flex justify-end">
              <button
                type="button"
                onClick={() => setInboundScanOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t("orders.common.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {orderColumnModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-column-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOrderColumnModal(null)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 shrink-0">
              <h2 id="order-column-modal-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {orderColumnModal.mode === "view" ? (
                  <>
                    <Eye className="w-5 h-5 text-blue-600" />
                    {t("orders.action.viewOrder")}
                  </>
                ) : (
                  <>
                    <History className="w-5 h-5 text-blue-600" />
                    {t("orders.action.log")}
                  </>
                )}
                <span className="text-sm font-normal text-gray-500">({orderColumnModal.order.orderNo})</span>
              </h2>
              <button
                type="button"
                onClick={() => setOrderColumnModal(null)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label={t("orders.common.close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 text-sm text-gray-800">
              {orderColumnModal.mode === "view" ? (
                <dl className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-x-3 gap-y-2 text-xs">
                  <dt className="text-gray-500">{t("orders.common.orderNumber")}</dt>
                  <dd className="font-medium text-blue-600">{orderColumnModal.order.orderNo}</dd>
                  <dt className="text-gray-500">{t("orders.common.center")}</dt>
                  <dd>{orderColumnModal.order.center}</dd>
                  <dt className="text-gray-500">{t("orders.common.applicationType")}</dt>
                  <dd>{orderColumnModal.order.applicationType}</dd>
                  <dt className="text-gray-500">{t("orders.common.customsClearance")}</dt>
                  <dd>{orderColumnModal.order.customsClearance}</dd>
                  <dt className="text-gray-500">{t("orders.common.productType")}</dt>
                  <dd>{orderColumnModal.order.typeLabel}</dd>
                  <dt className="text-gray-500">{t("orders.common.shippingMethod")}</dt>
                  <dd>{orderColumnModal.order.shippingMethod}</dd>
                  <dt className="text-gray-500">{t("orders.common.membershipCode")}</dt>
                  <dd>{orderColumnModal.order.memberBadge}</dd>
                  <dt className="text-gray-500">{t("orders.common.receiver")}</dt>
                  <dd>{orderColumnModal.order.receiver}</dd>
                  <dt className="text-gray-500">{t("orders.common.quantity")}</dt>
                  <dd>{orderColumnModal.order.qty}{t("orders.common.items")}</dd>
                  <dt className="text-gray-500">{t("orders.common.totalAmount")}</dt>
                  <dd>{orderColumnModal.order.totalAmount.toLocaleString()}{t("orders.common.won")}</dd>
                  <dt className="text-gray-500">{t("orders.common.paidAmount")}</dt>
                  <dd>{orderColumnModal.order.paidAmount.toLocaleString()}{t("orders.common.won")}</dd>
                  <dt className="text-gray-500">{t("orders.common.weight")}</dt>
                  <dd>{orderColumnModal.order.weight}kg</dd>
                  <dt className="text-gray-500">{t("orders.common.warehouseStatus")}</dt>
                  <dd>{orderColumnModal.order.warehouseStatus}</dd>
                  <dt className="text-gray-500">{t("orders.common.progressStatus")}</dt>
                  <dd>{orderColumnModal.order.progressStatus}</dd>
                  <dt className="text-gray-500">{t("orders.common.createdAt")}</dt>
                  <dd>{orderColumnModal.order.createdAt}</dd>
                  <dt className="text-gray-500">{t("orders.common.updatedAt")}</dt>
                  <dd>{orderColumnModal.order.updatedAt}</dd>
                  <dt className="text-gray-500">{t("orders.common.inquiryResponder")}</dt>
                  <dd>{orderColumnModal.order.inquiryResponder ?? t("orders.common.none")}</dd>
                  <dt className="text-gray-500">{t("orders.common.buyer")}</dt>
                  <dd>{orderColumnModal.order.buyer ?? "-"}</dd>
                </dl>
              ) : (
                <ul className="space-y-3 border-l-2 border-gray-200 pl-4 ml-1">
                  <li className="relative">
                    <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    <p className="text-xs text-gray-500">{orderColumnModal.order.createdAt}</p>
                    <p className="font-medium text-gray-900">{t("orders.board.logLineCreated")}</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2 w-2 rounded-full bg-slate-400 ring-2 ring-white" />
                    <p className="text-xs text-gray-500">{orderColumnModal.order.updatedAt}</p>
                    <p className="font-medium text-gray-900">{t("orders.board.logLineUpdated")}</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2 w-2 rounded-full bg-slate-400 ring-2 ring-white" />
                    <p className="text-xs text-gray-500">{orderColumnModal.order.updatedAt}</p>
                    <p className="font-medium text-gray-900">
                      {t("orders.board.logLineStatus")}: {orderColumnModal.order.progressStatus}
                    </p>
                  </li>
                </ul>
              )}
            </div>
            <div className="border-t border-gray-200 px-5 py-3 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setOrderColumnModal(null)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("orders.common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
