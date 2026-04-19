import { apiFetch } from "../client";
import type { OrderBoardOrder, OrderBoardProduct } from "@/components/orders/OrderBoard";

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

/** API `progressStatus` / paymentStatus-style value → OrderBoard `statusCode` (row actions, filters). */
export const BOARD_CODE_BY_API_PROGRESS: Record<string, string> = {
 
  P_TEMPSAVE: "BUY_TEMP_SAVE",
  P_QUOTE: "BUY_EST",
  P_PENDING: "BUY_PAY_WAIT",
  P_PAY_COMPLETE: "BUY_PAY_DONE",
  P_AU_PURCHASING: "BUYING",
  P_MA_PROBLEM: "PROBLEM_PRODUCT",
  P_PROBLEM: "PROBLEM_PRODUCT",
  P_PUR_COMPLETE: "BUY_COMPLETE",
  IO_ARRIVE_EXPECTED: "WH_ARRIVE_EXPECTED",
  IO_DELAY: "LOCAL_DELAY",
  IO_PROGRESS: "WH_IN_PROGRESS",
  IO_WARE_COMPLETE: "WH_IN_DONE",
  IO_PAY_PENDING: "BUY_PAY_WAIT",
  IO_PENDING: "BUY_PAY_WAIT",
  IO_PAY_COMPLETE: "BUY_PAY_DONE",
  IO_SHIP_PAY_PENDING: "SHIP_PAY_WAIT",
  IO_SHIP_PAY_COMPLETE: "SHIP_PAY_DONE",
  IO_SHIP_PENDING: "WH_SHIP_WAIT",
  IO_SHIP_COMPLETE: "WH_SHIPPED",
  IO_COST_PENDING: "ADD_COST_PAY_WAIT",
  IO_COST_COMPLETE: "ADD_COST_PAY_DONE",
  E_ERROR: "ERR_IN",
  E_ORDER_CANCELLED: "ORDER_DISPOSAL",
  E_PLATFORM_REFUND_REQ: "PLAT_REFUND_REQ",
  E_PLATFORM_REFUND_PRO: "PLAT_REFUND_ING",
  E_PLATFORM_REFUND_IN_PROGRESS: "PLAT_REFUND_ING",
  E_PLATFORM_REFUND_COMPLETED: "PLAT_REFUND_DONE",
  E_CUSTOMER_RETURN_REQ: "USER_REFUND_REQ",
  E_CUSTOMER_REFUND_PROGRESS: "USER_REFUND_ING",
  E_CUSTOMER_REFUND_COMPLETED: "USER_REFUND_DONE",
  E_SHIPMENT_HOLD: "HOLD",
  E_FINAL_REFUND_REQ: "FINAL_REFUND_REQ",
  E_FINAL_REFUND_PROGRESS: "FINAL_REFUND_ING",
  E_FINAL_REFUND_COMPLETED: "FINAL_REFUND_DONE",
};

export function resolveBoardStatusCodeFromApiProgress(apiProgress: string): string {
  const k = apiProgress.trim();
  
  return BOARD_CODE_BY_API_PROGRESS[k] ?? k;
}

export interface ManualSearchResult {
  progressStatusCounts: Map<string, number>;
  totalOrders: number;
  orders: OrderBoardOrder[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function parseEnvelope(raw: unknown, translate: (key: string) => string): ManualSearchResult {
  if (!isRecord(raw)) throw new Error("Invalid API response");
  const data = raw.data;
  if (!isRecord(data)) throw new Error("Invalid API response: missing data");

  const countsRaw = data.progressStatusCounts;
  const progressStatusCounts = new Map<string, number>();
  if (isRecord(countsRaw)) {
    for (const [key, val] of Object.entries(countsRaw)) {
      if (typeof val === "number" && Number.isFinite(val)) {
        progressStatusCounts.set(key, val);
      } else if (typeof val === "string" && val.trim() !== "") {
        const n = Number(val);
        if (Number.isFinite(n)) progressStatusCounts.set(key, n);
      }
    }
  }

  const rows = Array.isArray(data.orders) ? (data.orders as Record<string, unknown>[]) : [];
  const orders = rows.map((row) => mapManualApiOrderToBoard(row, translate));

  const pag = isRecord(data.pagination) ? data.pagination : {};
  const pageSize = num(pag.pageSize, 20);
  const totalOrders = num(data.totalOrders, rows.length);
  const totalFromPag = num(pag.total, totalOrders);
  const totalPagesRaw = num(pag.totalPages, Math.max(1, Math.ceil(totalFromPag / Math.max(1, pageSize))));

  return {
    progressStatusCounts,
    totalOrders,
    orders,
    pagination: {
      page: num(pag.page, 1),
      pageSize,
      total: totalFromPag,
      totalPages: Math.max(1, totalPagesRaw),
    },
  };
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v != null ? String(v) : fallback;
}

/** Prefer canonical `progressStatus` for filtering/display; typo field is legacy noise (often BS_*). */
function pickApiProgress(row: Record<string, unknown>): string {
  const canonical = str(row.progressStatus);
  if (canonical) return canonical;
  return str(row.progresSatatus);
}

export function mapManualApiOrderToBoard(
  row: Record<string, unknown>,
  translate: (key: string) => string,
): OrderBoardOrder {
  const orderNo = str(row.orderNumber || row.ordernumber);
  const apiProgress = pickApiProgress(row);
  const statusCode = resolveBoardStatusCodeFromApiProgress(apiProgress);

  const items = Array.isArray(row.items) ? (row.items as Record<string, unknown>[]) : [];
  const shipRaw = str(row.shippingmethod || row.transferMethod).toLowerCase();
  const shippingMethod =
    shipRaw === "air"
      ? translate("orders.filter.shippingMethodAir")
      : translate("orders.filter.shippingMethodSea");

  const orderType = str(row.orderType || row.requesttype);
  let typeLabel = translate("orders.status.purchaseAgency");
  if (orderType.toUpperCase() === "VVIC") typeLabel = translate("orders.filter.typeVVIC");
  else if (orderType.toUpperCase() === "GENERAL" || orderType === "General")
    typeLabel = translate("orders.status.purchaseAgency");

  const shippingStatus = str(row.shippingStatus).toLowerCase();
  const isShipped = shippingStatus === "auto" || shippingStatus === "shipped";

  let qty = 0;
  let totalAmount = 0;
  for (const it of items) {
    const q = num(it.quantity, 0);
    qty += q;
    totalAmount += typeof it.subtotal === "number" ? it.subtotal : num(it.totalpayamount, 0);
  }
  if (qty === 0 && typeof row.quantity === "number") qty = num(row.quantity, 0);

  const trackingCount = num(row.trackingCount, num(row.trackingcnt, 0));
  const warehousedCount = num(row.warehousedCount, num(row.incomingcnt, 0));
  const paidAmount =
    typeof row.paymentamount === "number"
      ? row.paymentamount
      : items.reduce((s, it) => s + num(it.paymentamount, num(it.totalpayamount, 0)), 0) || totalAmount;

  const firstTn = Array.isArray(row.trackingNumbers) && row.trackingNumbers.length
    ? str(row.trackingNumbers[0])
    : "";

  const products: OrderBoardProduct[] = items.map((it, idx) => {
    const img = str(it.imageUrl);
    const optionParts = [str(it.color), str(it.size)].filter(Boolean);
    const option = optionParts.length ? optionParts.join(" / ") : str(it.productoptionname || it.subject);
    const unit = num(it.revisedprice, num(it.price, 0));
    const q = num(it.quantity, 0);
    const lineTotal = typeof it.subtotal === "number" ? it.subtotal : unit * q;
    return {
      id: str(it._id, `${orderNo}-p-${idx}`),
      productNo: str(it.productNo || it.partnumber || it.skunumber),
      name: str(it.productname || it.subject),
      option: option || "—",
      trackingNo: str(it.trackingNumber || ""),
      orderNo,
      unitPrice: unit,
      quantity: q,
      totalPrice: lineTotal,
      shippingCost: num(it.actualshippingcost, num(it.currentshippingfee, 0)),
      rackNo: str(it.rackNumber || it.racknumber || ""),
      prevRackNo: str(it.preracknumber || ""),
      statusLabel: str(it.status || row.warehouseStatus, ""),
      image: img && img !== "manual-no-image" ? img : undefined,
      productMemo: str(it.productmemo || it.remarks || ""),
      caution: "",
      userMemo: "",
    };
  });

  const addr = isRecord(row.shippingAddress) ? row.shippingAddress : undefined;
  const receiver = str(row.recipient || (addr ? str(addr.recipient) : ""));
  const firstItem = items[0];
  const clearanceFromItem = firstItem && isRecord(firstItem) ? str(firstItem.customsclearanceitem) : "";

  return {
    orderNo,
    statusCode,
    center: "",
    applicationType: str(row.requesttype || row.orderType),
    customsClearance: str(row.customsclearanceitem) || clearanceFromItem || "—",
    typeLabel,
    shippingMethod,
    isShipped,
    memberBadge: str(row.memberno),
    userName: str(row.membername),
    receiver,
    trackingCount,
    warehousedCount,
    qty: qty || items.reduce((s, it) => s + num(it.quantity, 0), 0),
    totalAmount,
    paidAmount,
    weight: 0,
    krTrack: str(row.trackingnumber, firstTn),
    shipDate: (str(row.dispatchdate) || str(row.createdAt)).slice(0, 10),
    rack: str(
      row.racknumber,
      firstItem && isRecord(firstItem) ? str(firstItem.rackNumber || firstItem.racknumber) : "",
    ),
    warehouseStatus: str(row.warehouseStatus),
    progressStatus: str(row.progressStatus || apiProgress),
    createdAt: str(row.createdAt).replace("T", " ").slice(0, 16),
    updatedAt: str(row.updatedAt).replace("T", " ").slice(0, 16),
    inquiryResponder: undefined,
    buyer: undefined,
    adminMemo: str(row.adminmemo),
    productMemo: str(items[0]?.productmemo || items[0]?.remarks),
    caution: "",
    userMemo: "",
    products: products.length ? products : [],
  };
}

/**
 * `GET /orders/manual/search` with **no query string** — on this backend this is the only response
 * that includes `progressStatusCounts` (see API docs / Postman).
 */
export async function fetchManualOrderProgressCountsOnly(
  translate: (key: string) => string,
): Promise<Map<string, number>> {
  const raw = await apiFetch<unknown>("/orders/manual/search");
  return parseEnvelope(raw, translate).progressStatusCounts;
}

export async function fetchManualOrdersSearch(
  params: { progressStatus?: string; page?: number; pageSize?: number },
  translate: (key: string) => string,
): Promise<ManualSearchResult> {
  const qs = new URLSearchParams();
  if (params.progressStatus) qs.set("progressStatus", params.progressStatus);
  if (params.page != null) qs.set("page", String(params.page));
  if (params.pageSize != null) qs.set("pageSize", String(params.pageSize));
  const suffix = qs.toString();
  const path = suffix ? `/orders/manual/search?${suffix}` : `/orders/manual/search`;
  const raw = await apiFetch<unknown>(path);
  return parseEnvelope(raw, translate);
}
