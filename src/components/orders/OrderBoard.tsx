"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronDown, ChevronUp, Download, Eye, History, Minus, Plus,
  RotateCcw, Save, Search, Upload, X,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  fetchManualOrderProgressCountsOnly,
  fetchManualOrdersSearch,
  patchManualOrderAdminMemo,
  patchManualOrderLineCaution,
  patchManualOrderLineProductMemo,
  patchManualOrderLineRack,
  patchManualOrderLineTracking,
  patchManualOrderLineUserMemo,
  patchManualOrderProgress,
  resolveManualOrderPatchIdentifier,
} from "@/api/orders/manualSearch";
import { ApiError } from "@/api/client";
import {
  getProgressSelectOptionsForOrder,
  resolveProgressSelectValue,
  resolveProgressStatusApiParam,
} from "./orderBoardProgressColumnOptions";
import { buildOrderViewWindowHtml, type OrderViewWindowLabels } from "./orderViewWindowDocument";
import { buildOrderLogWindowHtml, type OrderLogWindowLabels } from "./orderLogWindowDocument";
import { putOrderBoardWindowPayload } from "@/lib/orderBoardWindowPayload";
import { downloadXlsxFromAoA } from "@/lib/excelDownload";
import { showToast } from "@/lib/toast";

/* ─── Public types ──────────────────────────────────────────────────────── */

export interface OrderBoardStatusItem {
  label: string;
  code: string;
  /** Query value for `GET /orders/manual/search?progressStatus=` when using manual search API */
  progressStatusParam?: string;
}
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
  /**
   * `GET …/orders/manual/search` 주문·라인 필드 `workPending` / `labelstate` / `issueproduct`.
   * 값이 `yes`인 항목만 상품 행 태그 `<ul>`에 표시.
   */
  manualStatusTags?: {
    workPending: boolean;
    labelState: boolean;
    issueProduct: boolean;
  };
}

export interface OrderBoardOrder {
  orderNo: string;
  statusCode: string;
  center: string;
  applicationType: string;
  customsClearance: string;
  /** API `custommethod` — 통관방식. 없으면 테이블 통관란에 `customsClearance` 폴백 */
  customsMethod?: string;
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
  /** `PATCH …/orders/manual/:id` — 있으면 Mongo `_id`(Postman), 없으면 `orderNo`로 PATCH */
  manualOrderPatchId?: string;
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
  /**
   * `manualSearchApi`: 주문·상태 카운트를 `GET /orders/manual/search`로 불러옵니다.
   * `orders`는 폴백·창고 셀렉트 옵션용으로만 쓰이며, 테이블 데이터는 API 결과를 사용합니다.
   */
  ordersDataSource?: "props" | "manualSearchApi";
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
  BUY_EST: [ "orders.rowAction.purchaseCost", "orders.rowAction.delete"],
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

function clampPopupSize(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * 주문문의: 내용(`max-w-6xl`, 상품표 `min-w-[900px]`) 비율은 유지하고 화면에 맞게 가변.
 * 구매비용: 기존 고정 크기.
 */
function agencyToolPopupDimensions(segment: "order-inquiry" | "purchase-cost"): { w: number; h: number } {
  const aw = window.screen.availWidth;
  const ah = window.screen.availHeight;
  if (segment === "purchase-cost") {
    return { w: 920, h: 720 };
  }
  const w = clampPopupSize(Math.round(aw * 0.88), 960, 1180);
  const h = clampPopupSize(Math.round(ah * 0.86), 640, 920);
  return { w, h };
}

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

function hasActivePanelFilters(f: OrderBoardSearchFilters): boolean {
  return Object.values(f).some((v) => String(v).trim() !== "");
}

function OrderBoardProgressSelectCell({
  order,
  flatStatusItems,
  t,
  progressSelectByOrder,
  setProgressSelectByOrder,
  onProgressChange,
}: {
  order: OrderBoardOrder;
  flatStatusItems: OrderBoardStatusItem[];
  t: (key: string) => string;
  progressSelectByOrder: Record<string, string>;
  setProgressSelectByOrder: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onProgressChange?: (order: OrderBoardOrder, boardCode: string) => void;
}) {
  const progressOptions = getProgressSelectOptionsForOrder(order.statusCode, flatStatusItems);
  const progressValue = resolveProgressSelectValue(
    order.orderNo,
    order.statusCode,
    progressOptions,
    progressSelectByOrder,
  );
  return (
    <select
      className="mx-auto block w-full max-w-[10rem] text-[10px] leading-snug border border-gray-300 rounded-md py-1 px-1 bg-white text-gray-800"
      aria-label={t("orders.common.progressStatus")}
      value={progressValue}
      onChange={(e) => {
        const boardCode = e.target.value;
        setProgressSelectByOrder((prev) => ({
          ...prev,
          [order.orderNo]: boardCode,
        }));
        onProgressChange?.(order, boardCode);
      }}
    >
      {!progressOptions.some((s) => s.code === order.statusCode) &&
        order.statusCode &&
        (order.progressStatus || order.statusCode) && (
          <option value={order.statusCode}>{order.progressStatus || order.statusCode}</option>
        )}
      {progressOptions.map((s) => (
        <option key={s.code} value={s.code}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function OrderBoard({
  title, defaultSelectedLabel, memberFilterLabel, memberFilterPlaceholder,
  statusGroups, orders, actionButtons, purchaseAgencyRowActions = false,
  mainPanelOverride,
  ordersDataSource = "props",
}: Props) {
  const { t } = useLocale();

  /**
   * 주문문의 / 구매비용: `localStorage` + `?k=` 로 표 데이터 넘긴 뒤 **팝업 창**.
   * 주문문의는 화면에 맞게 가변 크기, 구매비용은 고정(920×720).
   */
  const openPurchaseAgencyToolTab = useCallback(
    (order: OrderBoardOrder, segment: "order-inquiry" | "purchase-cost") => {
      const token = putOrderBoardWindowPayload(order);
      if (!token) return;
      const path = `/admin/orders/business/${segment}?k=${encodeURIComponent(token)}`;
      const url = `${window.location.origin}${path}`;
      const { w, h } = agencyToolPopupDimensions(segment);
      const left = Math.max(0, Math.floor((window.screen.availWidth - w) / 2));
      const top = Math.max(0, Math.floor((window.screen.availHeight - h) / 2));
      const features = [
        `width=${w}`,
        `height=${h}`,
        `left=${left}`,
        `top=${top}`,
        "scrollbars=yes",
        "resizable=yes",
        "menubar=no",
        "toolbar=no",
      ].join(",");
      const popup = window.open(url, "_blank", features);
      if (popup) popup.opener = null;
    },
    [],
  );

  const handlePurchaseAgencyRowAction = useCallback(
    (order: OrderBoardOrder, labelKey: string) => {
      if (labelKey === "orders.rowAction.orderInquiry") {
        openPurchaseAgencyToolTab(order, "order-inquiry");
        return;
      }
      if (labelKey === "orders.rowAction.purchaseCost") {
        openPurchaseAgencyToolTab(order, "purchase-cost");
        return;
      }
    },
    [openPurchaseAgencyToolTab],
  );

  const openOrderViewWindow = (order: OrderBoardOrder) => {
    const win = window.open("", "_blank");
    if (!win) return;

    const labels: OrderViewWindowLabels = {
      none: t("orders.common.none"),
      won: t("orders.common.won"),
      close: t("orders.common.close"),
      orderMemo: t("orders.expanded.orderMemo"),
      orderMemoPlaceholder: t("orders.expanded.orderMemoPlaceholder"),
      register: t("orders.action.register"),
      orderInquiry: t("orders.action.orderInquiry"),
      shippingCenterSection: t("orders.viewWindow.shippingCenterSection"),
      orderShipperMailbox: t("orders.viewWindow.orderShipperMailbox"),
      progressReceipt: t("orders.viewWindow.progressReceipt"),
      applicationCenterRow: t("orders.viewWindow.applicationCenterRow"),
      trackingRow: t("orders.viewWindow.trackingRow"),
      shippingMethod: t("orders.common.shippingMethod"),
      customsClearance: t("orders.common.customsClearance"),
      depositAutoPay: t("orders.viewWindow.depositAutoPay"),
      productInfoTitle: t("orders.viewWindow.productInfoTitle"),
      selectAll: t("orders.viewWindow.selectAll"),
      saveOrderMemo: t("orders.viewWindow.saveOrderMemo"),
      additionalServices: t("orders.viewWindow.additionalServices"),
      registeredCoupon: t("orders.viewWindow.registeredCoupon"),
      changeAdditionalServices: t("orders.viewWindow.changeAdditionalServices"),
      recipientSection: t("orders.viewWindow.recipientSection"),
      nameOrCompany: t("orders.viewWindow.nameOrCompany"),
      addressContact: t("orders.viewWindow.addressContact"),
      bizRegAddress: t("orders.viewWindow.bizRegAddress"),
      deliveryRequest: t("orders.viewWindow.deliveryRequest"),
      centerRequest: t("orders.viewWindow.centerRequest"),
      changeRecipientAddress: t("orders.viewWindow.changeRecipientAddress"),
      orderInquirySection: t("orders.viewWindow.orderInquirySection"),
      inquiryPlaceholder: t("orders.viewWindow.inquiryPlaceholder"),
      stubSaved: t("orders.viewWindow.stubSaved"),
      stubComingSoon: t("orders.viewWindow.stubComingSoon"),
      edit: t("orders.viewWindow.edit"),
      copy: t("orders.viewWindow.copy"),
      add: t("orders.viewWindow.add"),
      delete: t("orders.viewWindow.delete"),
      trackingSave: t("orders.viewWindow.trackingSave"),
      orderNoSave: t("orders.viewWindow.orderNoSave"),
      productNumber: t("orders.product.productNumber"),
      image: t("orders.product.image"),
      nameOptions: t("orders.product.nameOptions"),
      trackingNoColon: t("orders.product.trackingNoColon"),
      orderNoLink: t("orders.product.orderNoLink"),
      unitQtyPriceLine1: t("orders.product.unitQtyPriceLine1"),
      unitQtyPriceLine2: t("orders.product.unitQtyPriceLine2"),
      shippingLine1: t("orders.product.shippingLine1"),
      shippingLine2: t("orders.product.shippingLine2"),
      rackHeaderLine1: t("orders.product.rackHeaderLine1"),
      rackHeaderLine2: t("orders.product.rackHeaderLine2"),
      productStatus: t("orders.product.productStatus"),
      trackingInput: t("orders.product.trackingInput"),
      batchSave: t("orders.product.batchSave"),
      addAdditionalService: t("orders.product.addAdditionalService"),
      productLog: t("orders.product.productLog"),
      packingSplit: t("orders.action.packingSplit"),
      labelPrint: t("orders.product.labelPrint"),
      actualPhoto: t("orders.product.actualPhoto"),
      rackNoColon: t("orders.product.rackNoColon"),
      rackNoPlaceholder: t("orders.product.rackNoPlaceholder"),
      rackSave: t("orders.product.rackSave"),
      prevRackColon: t("orders.product.prevRackColon"),
      productMemo: t("orders.product.productMemo"),
      caution: t("orders.product.caution"),
      userMemo: t("orders.product.userMemo"),
      statusInbound: t("orders.product.statusInbound"),
      statusInboundDone: t("orders.product.statusInboundDone"),
      statusShipWait: t("orders.product.statusShipWait"),
      workPending: t("orders.inboundScan.workPending"),
      labelUnconfirmed: t("orders.product.labelUnconfirmed"),
      issueProduct: t("orders.action.issueProduct"),
      trackingFilterPlaceholder: t("orders.filter.trackingNoPlaceholder"),
    };

    win.document.write(buildOrderViewWindowHtml(order, labels));
    win.document.close();
  };

  const openOrderLogWindow = (order: OrderBoardOrder) => {
    const win = window.open("", "_blank");
    if (!win) return;

    const logLabels: OrderLogWindowLabels = {
      pageTitle: `${t("orders.viewLog.pageTitle")} - ${order.orderNo}`,
      headerTitle: t("orders.viewLog.headerTitle").replace("{{no}}", order.orderNo),
      colNo: t("orders.viewLog.colNo"),
      colWorker: t("orders.viewLog.colWorker"),
      colContent: t("orders.viewLog.colContent"),
      colRegisteredAt: t("orders.viewLog.colRegisteredAt"),
      close: t("orders.common.close"),
      entryOrderApply: t("orders.viewLog.entryOrderApply"),
      entryOrderUpdated: t("orders.viewLog.entryOrderUpdated"),
      entryProgressChange: t("orders.viewLog.entryProgressChange"),
      detailTotalQty: t("orders.viewLog.detailTotalQty"),
      detailTotalAmount: t("orders.viewLog.detailTotalAmount"),
      detailTrackingCount: t("orders.viewLog.detailTrackingCount"),
      detailCouponNo: t("orders.viewLog.detailCouponNo"),
      workerSystem: t("orders.viewLog.workerSystem"),
      none: t("orders.common.none"),
      won: t("orders.common.won"),
      itemsSuffix: t("orders.common.items"),
      lineUpdatedBody: t("orders.board.logLineUpdated"),
      progressLabel: t("orders.board.logLineStatus"),
    };

    win.document.write(buildOrderLogWindowHtml(order, logLabels));
    win.document.close();
  };

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
  const [inboundScanOpen, setInboundScanOpen] = useState(false);
  /** Row-local 입고상태 / 진행상태 select 값 (서버 반영 전 UI만) */
  const [warehouseSelectByOrder, setWarehouseSelectByOrder] = useState<Record<string, string>>({});
  const [progressSelectByOrder, setProgressSelectByOrder] = useState<Record<string, string>>({});
  /** 확장 행: `orderNo` → 선택된 상품 라인 `product.id` */
  const [productLineSelection, setProductLineSelection] = useState<Record<string, Set<string>>>({});
  const [apiRows, setApiRows] = useState<OrderBoardOrder[]>([]);
  const [apiProgressCounts, setApiProgressCounts] = useState<Map<string, number>>(new Map());
  const [apiLoading, setApiLoading] = useState(false);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  /** Total rows matching current server query (for header/footer when not using panel filters). */
  const [apiMatchTotal, setApiMatchTotal] = useState<number | null>(null);
  const apiExpandInit = useRef(false);
  const memoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const batchTrackingInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const rackInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const productMemoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const cautionInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const userMemoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  /* derived */
  const flatStatusItems = useMemo(() => statusGroups.flatMap((g) => g.items), [statusGroups]);

  const progressQueryParam = useMemo(() => {
    if (!selectedCode) return undefined;
    for (const g of statusGroups) {
      const hit = g.items.find((x) => x.code === selectedCode);
      if (hit) return hit.progressStatusParam ?? hit.code;
    }
    return selectedCode;
  }, [selectedCode, statusGroups]);

  const reloadManualSearchAfterMutation = useCallback(async () => {
    if (ordersDataSource !== "manualSearchApi") return;
    void fetchManualOrderProgressCountsOnly(t)
      .then((counts) => setApiProgressCounts(counts))
      .catch(() => {});
    setApiLoading(true);
    try {
      const res = await fetchManualOrdersSearch(
        { progressStatus: progressQueryParam, page: currentPage, pageSize },
        t,
      );
      setApiRows(res.orders);
      setApiTotalPages(res.pagination.totalPages);
      const matchTotal =
        res.pagination.total > 0
          ? res.pagination.total
          : res.totalOrders > 0
            ? res.totalOrders
            : res.orders.length;
      setApiMatchTotal(matchTotal);
    } catch {
      setApiRows([]);
      setApiMatchTotal(null);
      setApiTotalPages(1);
    } finally {
      setApiLoading(false);
    }
  }, [ordersDataSource, progressQueryParam, currentPage, pageSize, t]);

  const handleManualProgressChange = useCallback(
    (order: OrderBoardOrder, newBoardCode: string) => {
      if (ordersDataSource !== "manualSearchApi") return;
      const progressStatus = resolveProgressStatusApiParam(newBoardCode, flatStatusItems);
      patchManualOrderProgress(resolveManualOrderPatchIdentifier(order), progressStatus)
        .then(() => {
          setProgressSelectByOrder((prev) => {
            const next = { ...prev };
            delete next[order.orderNo];
            return next;
          });
          void reloadManualSearchAfterMutation();
        })
        .catch((e) => {
          setProgressSelectByOrder((prev) => {
            const next = { ...prev };
            delete next[order.orderNo];
            return next;
          });
          const msg =
            e instanceof ApiError ? e.message : t("orders.board.progressUpdateFailed");
          showToast({ message: msg, variant: "error" });
        });
    },
    [ordersDataSource, flatStatusItems, t, reloadManualSearchAfterMutation],
  );

  const toggleProductLineSelected = useCallback((orderNo: string, productId: string) => {
    setProductLineSelection((prev) => {
      const next = { ...prev };
      const cur = new Set(next[orderNo] ?? []);
      if (cur.has(productId)) cur.delete(productId);
      else cur.add(productId);
      next[orderNo] = cur;
      return next;
    });
  }, []);

  const handleAdminMemoRegister = useCallback(
    async (order: OrderBoardOrder) => {
      if (ordersDataSource !== "manualSearchApi") return;
      const el = memoInputRefs.current[order.orderNo];
      const v = el?.value ?? "";
      try {
        await patchManualOrderAdminMemo(order, v);
        await reloadManualSearchAfterMutation();
        showToast({ message: t("orders.board.memoSaved"), variant: "success" });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t("orders.board.manualPatchFailed"),
          variant: "error",
        });
      }
    },
    [ordersDataSource, reloadManualSearchAfterMutation, t],
  );

  const handleBatchTrackingSave = useCallback(
    async (order: OrderBoardOrder) => {
      if (ordersDataSource !== "manualSearchApi") return;
      const sel = productLineSelection[order.orderNo];
      if (!sel?.size) {
        showToast({ message: t("orders.board.batchSaveNoSelection"), variant: "warning" });
        return;
      }
      const tn = batchTrackingInputRefs.current[order.orderNo]?.value?.trim() ?? "";
      if (!tn) {
        showToast({ message: t("orders.board.batchSaveTrackingEmpty"), variant: "warning" });
        return;
      }
      try {
        for (const pid of sel) {
          const p = order.products.find((x) => x.id === pid);
          if (p) await patchManualOrderLineTracking(order, p, tn);
        }
        setProductLineSelection((prev) => ({ ...prev, [order.orderNo]: new Set() }));
        const inp = batchTrackingInputRefs.current[order.orderNo];
        if (inp) inp.value = "";
        await reloadManualSearchAfterMutation();
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t("orders.board.manualPatchFailed"),
          variant: "error",
        });
      }
    },
    [ordersDataSource, productLineSelection, reloadManualSearchAfterMutation, t],
  );

  const handleRackLineSave = useCallback(
    async (order: OrderBoardOrder, product: OrderBoardProduct) => {
      if (ordersDataSource !== "manualSearchApi") return;
      const k = `${order.orderNo}:::${product.id}`;
      const v = rackInputRefs.current[k]?.value?.trim() ?? "";
      if (!v) return;
      try {
        await patchManualOrderLineRack(order, product, v);
        const inp = rackInputRefs.current[k];
        if (inp) inp.value = "";
        await reloadManualSearchAfterMutation();
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t("orders.board.manualPatchFailed"),
          variant: "error",
        });
      }
    },
    [ordersDataSource, reloadManualSearchAfterMutation, t],
  );

  const handleProductMemoLineSave = useCallback(
    async (order: OrderBoardOrder, product: OrderBoardProduct) => {
      if (ordersDataSource !== "manualSearchApi") return;
      const k = `${order.orderNo}:::${product.id}`;
      const v = productMemoInputRefs.current[k]?.value ?? "";
      try {
        await patchManualOrderLineProductMemo(order, product, v);
        await reloadManualSearchAfterMutation();
        showToast({ message: t("orders.board.lineMemoSaved"), variant: "success" });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t("orders.board.manualPatchFailed"),
          variant: "error",
        });
      }
    },
    [ordersDataSource, reloadManualSearchAfterMutation, t],
  );

  const handleCautionLineSave = useCallback(
    async (order: OrderBoardOrder, product: OrderBoardProduct) => {
      if (ordersDataSource !== "manualSearchApi") return;
      const k = `${order.orderNo}:::${product.id}`;
      const v = cautionInputRefs.current[k]?.value ?? "";
      try {
        await patchManualOrderLineCaution(order, product, v);
        await reloadManualSearchAfterMutation();
        showToast({ message: t("orders.board.lineMemoSaved"), variant: "success" });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t("orders.board.manualPatchFailed"),
          variant: "error",
        });
      }
    },
    [ordersDataSource, reloadManualSearchAfterMutation, t],
  );

  const handleUserMemoLineSave = useCallback(
    async (order: OrderBoardOrder, product: OrderBoardProduct) => {
      if (ordersDataSource !== "manualSearchApi") return;
      const k = `${order.orderNo}:::${product.id}`;
      const v = userMemoInputRefs.current[k]?.value ?? "";
      try {
        await patchManualOrderLineUserMemo(order, product, v);
        await reloadManualSearchAfterMutation();
        showToast({ message: t("orders.board.lineMemoSaved"), variant: "success" });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t("orders.board.manualPatchFailed"),
          variant: "error",
        });
      }
    },
    [ordersDataSource, reloadManualSearchAfterMutation, t],
  );

  const baseOrders = ordersDataSource === "manualSearchApi" ? apiRows : orders;

  useEffect(() => {
    apiExpandInit.current = false;
  }, [selectedCode]);

  /** Counts only come from `GET /orders/manual/search` with no query params (backend contract). */
  useEffect(() => {
    if (ordersDataSource !== "manualSearchApi") return;
    let cancelled = false;
    fetchManualOrderProgressCountsOnly(t)
      .then((counts) => {
        if (!cancelled) setApiProgressCounts(counts);
      })
      .catch(() => {
        /* keep previous counts */
      });
    return () => {
      cancelled = true;
    };
  }, [ordersDataSource, t]);

  useEffect(() => {
    if (ordersDataSource !== "manualSearchApi") {
      setApiRows([]);
      setApiProgressCounts(new Map());
      setApiMatchTotal(null);
      setApiLoading(false);
      return;
    }
    let cancelled = false;
    setApiLoading(true);
    fetchManualOrdersSearch(
      { progressStatus: progressQueryParam, page: currentPage, pageSize },
      t,
    )
      .then((res) => {
        if (cancelled) return;
        setApiRows(res.orders);
        setApiTotalPages(res.pagination.totalPages);
        const matchTotal =
          res.pagination.total > 0
            ? res.pagination.total
            : res.totalOrders > 0
              ? res.totalOrders
              : res.orders.length;
        setApiMatchTotal(matchTotal);
      })
      .catch(() => {
        if (!cancelled) {
          setApiRows([]);
          setApiMatchTotal(null);
          setApiTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ordersDataSource, progressQueryParam, currentPage, pageSize, t]);

  useEffect(() => {
    if (ordersDataSource !== "manualSearchApi" || apiExpandInit.current || apiRows.length === 0) return;
    apiExpandInit.current = true;
    setExpandedProducts(new Set([apiRows[0].orderNo]));
  }, [ordersDataSource, apiRows]);

  const warehouseSelectOptions = useMemo(
    () => [
      t("orders.status.warehouseInProgress"),
      t("orders.status.warehouseInComplete"),
      t("orders.filter.warehouseStatusExpected"),
      t("orders.filter.warehouseStatusPartial"),
      t("orders.filter.warehouseStatusDone"),
    ],
    [t],
  );

  const warehouseSelectChoices = useMemo(() => {
    const set = new Set(warehouseSelectOptions);
    for (const o of baseOrders) {
      if (o.warehouseStatus) set.add(o.warehouseStatus);
    }
    return [...set];
  }, [warehouseSelectOptions, baseOrders]);

  const localStatusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.statusCode, (counts.get(o.statusCode) ?? 0) + 1);
    return counts;
  }, [orders]);

  const statusCounts = useMemo(() => {
    if (ordersDataSource !== "manualSearchApi") return localStatusCounts;
    const m = new Map<string, number>();
    for (const item of flatStatusItems) {
      const key = item.progressStatusParam ?? item.code;
      m.set(item.code, apiProgressCounts.get(key) ?? 0);
    }
    return m;
  }, [ordersDataSource, flatStatusItems, apiProgressCounts, localStatusCounts]);

  const filteredOrders = useMemo(() => {
    const serverFiltered =
      ordersDataSource === "manualSearchApi" && progressQueryParam !== undefined;
    const byStatus =
      !serverFiltered && selectedCode
        ? baseOrders.filter((o) => o.statusCode === selectedCode)
        : baseOrders;
    return applyOrderBoardSearchFilters(byStatus, filterApplied, t);
  }, [baseOrders, selectedCode, filterApplied, t, ordersDataSource, progressQueryParam]);

  const panelFiltered = hasActivePanelFilters(filterApplied);
  const totalPages = useMemo(() => {
    if (ordersDataSource === "manualSearchApi" && !panelFiltered) {
      return Math.max(1, apiTotalPages);
    }
    return Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  }, [ordersDataSource, panelFiltered, apiTotalPages, filteredOrders.length, pageSize]);

  const paginatedOrders = useMemo(() => {
    if (ordersDataSource === "manualSearchApi" && !panelFiltered) {
      return filteredOrders;
    }
    return filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [ordersDataSource, panelFiltered, filteredOrders, currentPage, pageSize]);

  const displayOrderCount = useMemo(() => {
    if (ordersDataSource === "manualSearchApi" && !panelFiltered && apiMatchTotal != null) {
      return apiMatchTotal;
    }
    return filteredOrders.length;
  }, [ordersDataSource, panelFiltered, apiMatchTotal, filteredOrders.length]);

  const handleExcelDownload = useCallback(() => {
    if (filteredOrders.length === 0) {
      showToast({ message: t("orders.board.excelExportEmpty"), variant: "warning" });
      return;
    }
    try {
      const headers = [
        t("orders.common.orderNumber"),
        t("orders.common.center"),
        t("orders.common.applicationType"),
        t("orders.common.shippingMethod"),
        t("orders.common.customsClearance"),
        t("orders.common.membershipCode"),
        t("orders.common.memberName"),
        t("orders.common.receiver"),
        t("orders.common.quantity"),
        t("orders.common.totalAmount"),
        t("orders.common.paidAmount"),
        t("orders.common.weight"),
        t("orders.common.trackingNumber"),
        t("orders.common.shipDate"),
        t("orders.common.rackNumber"),
        t("orders.common.warehouseStatus"),
        t("orders.common.progressStatus"),
        t("orders.common.createdAt"),
        t("orders.common.updatedAt"),
      ];
      const body = filteredOrders.map((o) => {
        const progressOptions = getProgressSelectOptionsForOrder(o.statusCode, flatStatusItems);
        const progressVal = resolveProgressSelectValue(
          o.orderNo,
          o.statusCode,
          progressOptions,
          progressSelectByOrder,
        );
        const progressLabel =
          progressOptions.find((s) => s.code === progressVal)?.label ??
          o.progressStatus ??
          o.statusCode ??
          "";
        const warehouseVal = warehouseSelectByOrder[o.orderNo] ?? o.warehouseStatus;
        return [
          o.orderNo,
          o.center,
          o.applicationType,
          o.shippingMethod,
          o.customsClearance,
          o.memberBadge,
          o.userName,
          o.receiver,
          o.qty,
          o.totalAmount,
          o.paidAmount,
          o.weight,
          o.krTrack,
          o.shipDate,
          o.rack,
          warehouseVal,
          progressLabel,
          o.createdAt,
          o.updatedAt,
        ];
      });
      downloadXlsxFromAoA(title, title, [headers, ...body]);
    } catch {
      showToast({ message: t("orders.board.excelExportFailed"), variant: "error" });
    }
  }, [filteredOrders, flatStatusItems, progressSelectByOrder, t, title, warehouseSelectByOrder]);

  const inboundScanContext = useMemo(() => {
    const o = paginatedOrders[0];
    const p = o?.products[0];
    if (!o || !p) return null;
    return { order: o, product: p };
  }, [paginatedOrders]);

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
            {displayOrderCount.toLocaleString()}
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
        <div className="flex items-center justify-between my-3">
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
            <button
              type="button"
              onClick={handleExcelDownload}
              className="h-8 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"
            >
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
        <div
          className={`app-table-wrap table-fixed w-full relative ${
            ordersDataSource === "manualSearchApi" && apiLoading ? "opacity-50" : ""
          }`}
        >
        
          <table className="app-table text-xs">
            <thead>
              <tr className="bg-gray-500">
                <th className="text-center w-3/22">{t("orders.common.orderNumber")}</th>
                <th className="text-center">
                  <div>{t("orders.common.applicationType")}</div>
                  <div>{t("orders.common.shippingMethod")}</div>
                  <div>{t("orders.common.customsClearance")}</div>
                </th>
                {/* <th className="text-center">
                  <div>{t("orders.common.productType")}</div>
                  <div>{t("orders.common.shippingMethod")}</div>
                  <div>{t("orders.common.shippingStatus")}</div>
                </th> */}
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
                  <div>{t("orders.common.rackNumber")}</div>
                </th>
                <th className="text-center">
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
                            onClick={() => openOrderViewWindow(order)}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <Eye className="w-3 h-3" />{t("orders.action.viewOrder")}
                          </button>
                          <button
                            type="button"
                            onClick={() => openOrderLogWindow(order)}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <History className="w-3 h-3" />{t("orders.action.log")}
                          </button>
                        </div>
                      </div>
                    </td>
                    {/* 신청구분 / 운송방식 / 통관방식 — API: requesttype, shippingmethod, custommethod */}
                    <td className="text-center px-1 align-middle">
                      <div className="text-[11px] font-medium text-amber-900">{order.applicationType || "—"}</div>
                      <div className="mt-0.5 text-[10px] text-gray-700">{order.shippingMethod || "—"}</div>
                      <div className="mt-0.5 text-[10px] text-gray-700">
                        {(order.customsMethod != null && order.customsMethod.trim() !== "" && order.customsMethod !== "—")
                          ? order.customsMethod
                          : order.customsClearance || "—"}
                      </div>
                    </td>
                    {/* Type / Method / Status */}
                    {/* <td className="text-center">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-purple-100 text-purple-700 rounded-full">{order.typeLabel}</span>
                      <div className="text-[10px] text-gray-500 mt-0.5">{order.shippingMethod}</div>
                      <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full mt-0.5 ${order.isShipped ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {order.isShipped ? t("orders.common.shipped") : t("orders.common.notShipped")}
                      </span>
                    </td> */}
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
                    <td className="text-center px-1 align-middle">
                      <OrderBoardProgressSelectCell
                        order={order}
                        flatStatusItems={flatStatusItems}
                        t={t}
                        progressSelectByOrder={progressSelectByOrder}
                        setProgressSelectByOrder={setProgressSelectByOrder}
                        onProgressChange={
                          ordersDataSource === "manualSearchApi" ? handleManualProgressChange : undefined
                        }
                      />
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
                                onClick={() => handlePurchaseAgencyRowAction(order, key)}
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
                      <td colSpan={8} className="px-6 py-4 ">
                        {/* Admin memo */}
                        <div className="flex items-center gap-2 text-xs mb-3">
                          <span className="font-bold min-w-[100px]">{t("orders.expanded.orderMemo")}:</span>
                          <input
                            key={`memo-${order.orderNo}-${order.adminMemo ?? ""}-${order.updatedAt ?? ""}`}
                            type="text"
                            defaultValue={order.adminMemo ?? ""}
                            placeholder={t("orders.expanded.orderMemoPlaceholder")}
                            className="flex-1 h-8 px-3 text-xs border border-gray-300 rounded-md"
                            ref={(el) => {
                              memoInputRefs.current[order.orderNo] = el;
                            }}
                          />
                          <button
                            type="button"
                            className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => void handleAdminMemoRegister(order)}
                          >
                            {t("orders.action.register")}
                          </button>
                        </div>

                        {/* Toolbar above product table */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500">{t("orders.product.trackingInput")}:</label>
                            <input
                              type="text"
                              placeholder={t("orders.filter.trackingNoPlaceholder")}
                              className="h-8 w-52 px-3 text-xs border border-gray-300 rounded-md"
                              ref={(el) => {
                                batchTrackingInputRefs.current[order.orderNo] = el;
                              }}
                            />
                            <button
                              type="button"
                              className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                              onClick={() => void handleBatchTrackingSave(order)}
                            >
                              <Save className="w-3 h-3" />{t("orders.product.batchSave")}
                            </button>
                            <button className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1">
                              <Plus className="w-3 h-3" />{t("orders.product.addAdditionalService")}
                            </button>
                          </div>
                        </div>

                        {/* Product table (8 columns — reference layout) */}
                        <div className="app-table-wrap">
                          <table className="app-table app-table-compact table-fixed w-full border border-gray-300">
                            <colgroup>
                              {Array.from({ length: 8 }, (_, i) => (
                                <col key={i} style={{ width: `${100 / 8}%` }} />
                              ))}
                            </colgroup>
                            <thead>
                              <tr className="bg-gray-500 text-white text-center">
                                <th className="text-center text-[11px] font-semibold px-1 py-2 align-middle">
                                  {t("orders.product.productNumber")}
                                </th>
                                <th className="text-center text-[11px] font-semibold px-1 py-2 align-middle">
                                  {t("orders.product.image")}
                                </th>
                                <th className="text-left text-[11px] font-semibold px-1 py-2 align-middle">
                                  {t("orders.product.nameOptions")}
                                </th>
                                <th className="text-center text-[11px] font-semibold px-1 py-2 align-middle">
                                  <div>{t("orders.product.trackingNoColon")}</div>
                                  <div className="text-[10px] font-normal opacity-95">{t("orders.product.orderNoLink")}</div>
                                </th>
                                <th className="text-center text-[11px] font-semibold px-1 py-2 align-middle">
                                  <div>{t("orders.product.unitQtyPriceLine1")}</div>
                                  <div className="text-[10px] font-normal opacity-95">{t("orders.product.unitQtyPriceLine2")}</div>
                                </th>
                                <th className="text-center text-[11px] font-semibold px-1 py-2 align-middle">
                                  <div>{t("orders.product.shippingLine1")}</div>
                                  <div className="text-[10px] font-normal opacity-95">{t("orders.product.shippingLine2")}</div>
                                </th>
                                <th className="text-center text-[11px] font-semibold px-1 py-2 align-middle">
                                  <div>{t("orders.product.rackHeaderLine1")}</div>
                                  <div className="text-[10px] font-normal opacity-95">{t("orders.product.rackHeaderLine2")}</div>
                                </th>
                                <th className="text-center text-[11px] font-semibold px-1 py-2 align-middle">
                                  {t("orders.product.productStatus")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.products.map((p, pIdx) => {
                                const lineProductMemo = p.productMemo ?? order.productMemo ?? "";
                                const lineCaution = p.caution ?? order.caution ?? "";
                                const lineUserMemo = p.userMemo ?? order.userMemo ?? "";
                                const rowNo = String(pIdx + 1).padStart(4, "0");
                                const won = t("orders.common.won");
                                const priceLine1 = `${won}${p.unitPrice.toLocaleString()} × ${p.quantity} = ${won}${p.totalPrice.toLocaleString()}`;
                                const priceLine2 = `${won}${p.unitPrice.toLocaleString()} × ${p.quantity} = ${won}${p.totalPrice.toLocaleString()}`;
                                return (
                                  <React.Fragment key={p.id}>
                                    <tr className="bg-white align-middle">
                                      {/* 1 상품번호 */}
                                      <td className="text-center align-middle px-1 py-2 border border-gray-200">
                                        <div className="flex flex-col items-center gap-1">
                                          <label className="flex items-center justify-center gap-1.5 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              className="rounded border-gray-300"
                                              checked={productLineSelection[order.orderNo]?.has(p.id) ?? false}
                                              onChange={() => toggleProductLineSelected(order.orderNo, p.id)}
                                            />
                                            <span className="text-[12px] font-semibold text-gray-900">{rowNo}</span>
                                          </label>
                                          <button
                                            type="button"
                                            className="text-[11px] font-medium text-red-600 hover:underline"
                                          >
                                            {t("orders.product.productLog")}
                                          </button>
                                          <button
                                            type="button"
                                            className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] text-gray-800 hover:bg-gray-50"
                                          >
                                            {t("orders.action.packingSplit")}
                                          </button>
                                        </div>
                                      </td>
                                      {/* 2 이미지 */}
                                      <td className="text-center align-middle px-1 py-2 border border-gray-200">
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded border border-gray-200 bg-slate-100 text-[9px] font-medium text-slate-500">
                                            {p.image ? (
                                              <img src={p.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                              "IMG"
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            className="rounded border border-gray-300 bg-white px-2 py-0.5 text-[10px] text-gray-800 hover:bg-gray-50"
                                          >
                                            {t("orders.product.labelPrint")}
                                          </button>
                                        </div>
                                      </td>
                                      {/* 3 상품명 / 옵션 */}
                                      <td className="text-left align-middle px-2 py-2 border border-gray-200">
                                        <div className="text-[12px] font-bold text-gray-900 leading-snug">{p.name}</div>
                                        <div className="mt-0.5 text-[11px] text-gray-700 whitespace-pre-wrap leading-snug">
                                          {p.option}
                                        </div>
                                      </td>
                                      {/* 4 운송장 / 주문번호 */}
                                      <td className="text-center align-middle px-1 py-2 border border-gray-200">
                                        <div className="text-[11px] text-gray-800">
                                          {t("orders.product.trackingNoColon")}:{p.trackingNo || "-"}
                                        </div>
                                        <button
                                          type="button"
                                          className="mt-1 inline-flex rounded border border-gray-300 bg-white px-2 py-0.5 text-[10px] text-gray-800 hover:bg-gray-50"
                                        >
                                          {t("orders.product.actualPhoto")}
                                        </button>
                                        <div className="mt-1">
                                          <button
                                            type="button"
                                            className="break-all text-[11px] font-medium text-blue-600 underline decoration-blue-400 hover:text-blue-800"
                                          >
                                            {p.orderNo}
                                          </button>
                                        </div>
                                      </td>
                                      {/* 5 단가×수량 */}
                                      <td className="text-right align-middle px-1 py-2 border border-gray-200">
                                        <div className="text-[11px] font-semibold leading-snug text-red-600">{priceLine1}</div>
                                        <div className="mt-1 text-[10px] leading-snug text-gray-600">{priceLine2}</div>
                                      </td>
                                      {/* 6 운비 */}
                                      <td className="text-center align-middle px-1 py-2 border border-gray-200">
                                        <input
                                          type="text"
                                          defaultValue={`${won} ${p.shippingCost.toLocaleString()}`}
                                          className="w-full max-w-[7rem] rounded border border-gray-300 bg-gray-100 py-1 text-center text-[11px] text-gray-800 mx-auto block"
                                        />
                                      </td>
                                      {/* 7 랙번호 */}
                                      <td className="text-left align-middle px-1 py-2 border border-gray-200">
                                        <div className="text-[11px] text-gray-800">
                                          {t("orders.product.rackNoColon")}: {p.rackNo || "-"}
                                        </div>
                                        <div className="mt-1 flex items-center gap-1">
                                          <input
                                            type="text"
                                            placeholder={t("orders.product.rackNoPlaceholder")}
                                            className="min-w-0 flex-1 rounded border border-gray-300 px-1 py-0.5 text-[11px]"
                                            ref={(el) => {
                                              rackInputRefs.current[`${order.orderNo}:::${p.id}`] = el;
                                            }}
                                          />
                                          <button
                                            type="button"
                                            className="shrink-0 rounded bg-teal-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-teal-700"
                                            onClick={() => void handleRackLineSave(order, p)}
                                          >
                                            {t("orders.product.rackSave")}
                                          </button>
                                        </div>
                                        <div className="mt-1 text-[10px] text-gray-500">
                                          {t("orders.product.prevRackColon")} {p.prevRackNo?.trim() ? p.prevRackNo : "—"}
                                        </div>
                                      </td>
                                      {/* 8 상품상태 */}
                                      <td className="text-center align-middle px-1 py-2 border border-gray-200">
                                       <select
                                          className="mx-auto mb-1 block w-full max-w-[10rem] text-[10px] leading-snug border border-gray-300 rounded-md py-1 px-1 bg-green-50 text-green-800"
                                          aria-label={t("orders.common.warehouseStatus")}
                                          value={
                                            warehouseSelectByOrder[order.orderNo] ??
                                            (warehouseSelectChoices.includes(order.warehouseStatus)
                                              ? order.warehouseStatus
                                              : (warehouseSelectChoices[0] ?? ""))
                                          }
                                          onChange={(e) =>
                                            setWarehouseSelectByOrder((prev) => ({
                                              ...prev,
                                              [order.orderNo]: e.target.value,
                                            }))
                                          }
                                        >
                                          {warehouseSelectChoices.map((label) => (
                                            <option key={label} value={label}>
                                              {label}
                                            </option>
                                          ))}
                                        </select>
                                        {(() => {
                                          const tags = p.manualStatusTags;
                                          if (
                                            !tags ||
                                            (!tags.workPending && !tags.labelState && !tags.issueProduct)
                                          ) {
                                            return null;
                                          }
                                          const liClass =
                                            "inline-block min-w-[4.5rem] rounded-sm border border-green-200 bg-green-100 px-1.5 py-0.5 text-center text-[10px] font-medium text-green-900";
                                          return (
                                            <ul className="mt-1.5 m-0 flex list-none flex-col items-center gap-0.5 p-0">
                                              {tags.workPending ? (
                                                <li key="wp" className={liClass}>
                                                  {t("orders.inboundScan.workPending")}
                                                </li>
                                              ) : null}
                                              {tags.labelState ? (
                                                <li key="ls" className={liClass}>
                                                  {t("orders.product.labelUnconfirmed")}
                                                </li>
                                              ) : null}
                                              {tags.issueProduct ? (
                                                <li key="ip" className={liClass}>
                                                  {t("orders.action.issueProduct")}
                                                </li>
                                              ) : null}
                                            </ul>
                                          );
                                        })()}
                                      </td>
                                    </tr>
                                    <tr className="bg-slate-50/90">
                                      <td colSpan={8} className="border border-gray-200 px-3 py-2 align-top">
                                        <div className="flex flex-col gap-2 ml-2 lg:flex-row lg:flex-wrap lg:items-center">
                                          <div className="flex min-w-0  flex-1 items-center gap-2 mx-2">
                                            <span className="shrink-0 text-[11px] font-semibold text-gray-700">
                                              {t("orders.product.productMemo")}
                                            </span>
                                            <input
                                              type="text"
                                              defaultValue={lineProductMemo}
                                              placeholder={t("orders.product.productMemo")}
                                              className="h-7 min-w-0 flex-1 rounded border border-gray-300 px-2 text-[11px]"
                                              ref={(el) => {
                                                productMemoInputRefs.current[`${order.orderNo}:::${p.id}`] = el;
                                              }}
                                            />
                                            <button
                                              type="button"
                                              className="shrink-0 rounded bg-blue-600 px-2 py-1 text-[10px] text-white hover:bg-blue-700"
                                              onClick={() => void handleProductMemoLineSave(order, p)}
                                            >
                                              {t("orders.action.register")}
                                            </button>
                                          </div>
                                          <div className="flex min-w-0  flex-1 items-center gap-2 mx-2">
                                            <span className="shrink-0 text-[11px] font-semibold text-orange-700">
                                              {t("orders.product.caution")}
                                            </span>
                                            <input
                                              type="text"
                                              defaultValue={lineCaution}
                                              placeholder={t("orders.product.caution")}
                                              className="h-7 min-w-0 flex-1 rounded border border-orange-300 bg-white px-2 text-[11px]"
                                              ref={(el) => {
                                                cautionInputRefs.current[`${order.orderNo}:::${p.id}`] = el;
                                              }}
                                            />
                                            {/* <button
                                              type="button"
                                              className="shrink-0 rounded bg-blue-600 px-2 py-1 text-[10px] text-white hover:bg-blue-700"
                                              onClick={() => void handleCautionLineSave(order, p)}
                                            >
                                              {t("orders.action.register")}
                                            </button> */}
                                          </div>
                                          <div className="flex min-w-0 flex-1 items-center gap-2 mx-2 ">
                                            <span className="shrink-0 text-[11px] font-semibold text-gray-700">
                                              {t("orders.product.userMemo")}
                                            </span>
                                            <input
                                              type="text"
                                              defaultValue={lineUserMemo}
                                              placeholder={t("orders.product.userMemo")}
                                              className="h-7 min-w-0 flex-1 rounded border border-gray-300 px-2 text-[11px]"
                                              ref={(el) => {
                                                userMemoInputRefs.current[`${order.orderNo}:::${p.id}`] = el;
                                              }}
                                            />
                                            {/* <button
                                              type="button"
                                              className="shrink-0 rounded bg-blue-600 px-2 py-1 text-[10px] text-white hover:bg-blue-700"
                                              onClick={() => void handleUserMemoLineSave(order, p)}
                                            >
                                              {t("orders.action.register")}
                                            </button> */}
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
          <span>{t("orders.common.count")}: {displayOrderCount.toLocaleString()}</span>
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
                              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-100 text-[10px] text-gray-500">
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

    </div>
  );
}
