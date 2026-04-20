import { apiFetch } from "../client";
import type { OrderBoardOrder, OrderBoardProduct } from "@/components/orders/OrderBoard";

/** Prefix paths with `NEXT_PUBLIC_API_VERSION` (e.g. `v1`) → `/v1/orders/manual/...` */
function apiPath(path: string): string {
  const raw = (process.env.NEXT_PUBLIC_API_VERSION || "").trim();
  const v = raw.replace(/^\/+|\/+$/g, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!v) return p;
  return `/${v}${p}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

/**
 * Postman `PATCH …/orders/manual/:id` 본문·`GET …/manual/search` 쿼리·주문 행: **`progressStatus`** (camelCase).
 */
const PROGRESS_STATUS_FIELD = "progressStatus" as const;

/** API 진행 코드 → OrderBoard `statusCode` (row actions, filters). */
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

/** 상품 라인·주문 행 이전 랙번호 — 백엔드·Postman 필드명 변형 통합 (`preracknumber`, `preRackNumber` 등). */
function readItemPrevRackNo(it: Record<string, unknown>): string {
  const keys = [
    "preracknumber",
    "preRackNumber",
    "prevRackNumber",
    "prevracknumber",
    "prev_racknumber",
    "pre_racknumber",
    "preRackNo",
    "prevRackNo",
  ];
  for (const k of keys) {
    const v = it[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

/** `workPending` / `labelstate` / `issueproduct` — 태그는 `yes`일 때만 표시. */
function isManualSearchYesFlag(v: unknown): boolean {
  const s = str(v).trim().toLowerCase();
  return s === "yes" || s === "y" || s === "true" || s === "1";
}

/** 라인에 키가 있으면 라인 값만 사용, 없으면 주문 행에서 조회. */
function readManualLineYesField(
  line: Record<string, unknown>,
  orderRow: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(line, k)) return isManualSearchYesFlag(line[k]);
  }
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(orderRow, k)) return isManualSearchYesFlag(orderRow[k]);
  }
  return false;
}

/** GET 주문 행에서 진행 코드 읽기: `progressStatus` 우선, 서버가 쓰는 오타 키는 폴백. */
function readManualOrderProgressApiCode(row: Record<string, unknown>): string {
  return (
    str(row[PROGRESS_STATUS_FIELD]) ||
    str(row["prograssStatus"]) ||
    str(row["progressatatus"]) ||
    str(row["progresSatatus"])
  );
}

/** `requesttype` — 테이블 신청구분 표시 */
function formatManualApiRequestType(value: string, translate: (key: string) => string): string {
  const u = value.trim();
  if (!u) return "—";
  const up = u.toUpperCase();
  if (up === "GENERAL") return translate("orders.manualApi.requestTypeGeneral");
  if (up === "VVIC") return translate("orders.filter.typeVVIC");
  return u;
}

/** `shippingmethod` — air / sea / ship 등 */
function formatManualApiShippingMethod(value: string, translate: (key: string) => string): string {
  const s = value.trim().toLowerCase();
  if (!s) return "—";
  if (s === "air") return translate("orders.filter.shippingMethodAir");
  if (s === "sea") return translate("orders.filter.shippingMethodSea");
  if (s === "ship" || s === "shipping") return translate("orders.manualApi.shippingShip");
  return value.trim();
}

/** `custommethod` — 통관방식 */
function formatManualApiCustomMethod(value: string, translate: (key: string) => string): string {
  const s = value.trim().toLowerCase();
  if (!s) return "—";
  if (s === "individual") return translate("orders.manualApi.customsIndividual");
  if (s === "corporate" || s === "company" || s === "business")
    return translate("orders.manualApi.customsCorporate");
  return value.trim();
}

export function mapManualApiOrderToBoard(
  row: Record<string, unknown>,
  translate: (key: string) => string,
): OrderBoardOrder {
  const orderNo = str(row.orderNumber || row.ordernumber);
  const apiProgress = readManualOrderProgressApiCode(row);
  const statusCode = resolveBoardStatusCodeFromApiProgress(apiProgress);

  const items = Array.isArray(row.items) ? (row.items as Record<string, unknown>[]) : [];

  const requestRaw = str(row.requesttype || row.orderType);
  const applicationType = formatManualApiRequestType(requestRaw, translate);

  const shipRaw = str(row.shippingmethod || row.transferMethod);
  const shippingMethod = formatManualApiShippingMethod(shipRaw, translate);

  const orderType = requestRaw;
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
    const line = it as Record<string, unknown>;
    const imgRaw = str(it.imageUrl || it.productimgurl || it.productImgUrl || it.image);
    const img = imgRaw && imgRaw !== "manual-no-image" ? imgRaw : "";
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
      prevRackNo: (() => {
        const fromLine = readItemPrevRackNo(it as Record<string, unknown>);
        if (fromLine) return fromLine;
        if (items.length === 1) {
          const fromOrder = readItemPrevRackNo(row);
          if (fromOrder) return fromOrder;
        }
        return "";
      })(),
      statusLabel: str(it.status || row.warehouseStatus, ""),
      image: img || undefined,
      productMemo: str(it.productMemo || it.productmemo || it.remarks),
      caution: str(
        (it as Record<string, unknown>).Caution || it.caution || it.cautionmemo || it.cautionMemo,
      ),
      userMemo: str(it.userMemo || it.usermemo),
      manualStatusTags: {
        workPending: readManualLineYesField(line, row, ["workPending", "workpending"] as const),
        labelState: readManualLineYesField(line, row, ["labelstate", "labelState"] as const),
        issueProduct: readManualLineYesField(line, row, ["issueproduct", "issueProduct"] as const),
      },
    };
  });

  const addr = isRecord(row.shippingAddress) ? row.shippingAddress : undefined;
  const receiver = str(row.recipient || (addr ? str(addr.recipient) : ""));
  const firstItem = items[0];
  const clearanceFromItem = firstItem && isRecord(firstItem) ? str(firstItem.customsclearanceitem) : "";
  const customMethodRaw = str(row.custommethod || row.customMethod);
  const customsMethod = customMethodRaw
    ? formatManualApiCustomMethod(customMethodRaw, translate)
    : undefined;

  return {
    orderNo,
    manualOrderPatchId: str(row._id || row.id, ""),
    statusCode,
    center: str(row.center || row.warehouse || row.shippingcenter || row.shippingCenter),
    applicationType,
    customsClearance: str(row.customsclearanceitem) || clearanceFromItem || "—",
    customsMethod,
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
    progressStatus: apiProgress,
    createdAt: str(row.createdAt).replace("T", " ").slice(0, 16),
    updatedAt: str(row.updatedAt).replace("T", " ").slice(0, 16),
    inquiryResponder: undefined,
    buyer: undefined,
    adminMemo: str(row.ordermemo || row.adminmemo),
    productMemo: str(
      (items[0] as Record<string, unknown> | undefined)?.productMemo ||
        items[0]?.productmemo ||
        items[0]?.remarks ||
        row.productMemo ||
        row.productmemo ||
        row.remarks,
    ),
    caution: str(
      (items[0] as Record<string, unknown> | undefined)?.Caution ||
        items[0]?.caution ||
        items[0]?.cautionmemo ||
        row.Caution ||
        row.caution ||
        row.cautionmemo,
    ),
    userMemo: str(
      (items[0] as Record<string, unknown> | undefined)?.userMemo ||
        items[0]?.usermemo ||
        row.userMemo ||
        row.usermemo,
    ),
    products: products.length ? products : [],
  };
}

/** `PATCH …/orders/manual/:id` — arbitrary JSON body (e.g. partial update). */
export async function patchManualOrder(
  orderIdentifier: string,
  body: Record<string, string | number | boolean>,
): Promise<void> {
  const path = apiPath(`/orders/manual/${encodeURIComponent(orderIdentifier)}`);
  await apiFetch<unknown>(path, { method: "PATCH", body });
}

/** 진행상태만 변경 — Postman과 동일 `{ "progressStatus": "<code>" }` 한 필드만 전송. */
export function patchManualOrderProgress(
  orderIdentifier: string,
  apiProgressCode: string,
): Promise<void> {
  return patchManualOrder(orderIdentifier, {
    [PROGRESS_STATUS_FIELD]: apiProgressCode,
  });
}

/** `PATCH …/orders/manual/:id` URL에 넣을 식별자 — Mongo `_id`가 있으면 우선(그림 2 Postman), 없으면 주문번호. */
export function resolveManualOrderPatchIdentifier(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
): string {
  const id = order.manualOrderPatchId?.trim();
  if (id) return id;
  return order.orderNo;
}

/** 주문 메모(`ordermemo`)만 갱신. */
export async function patchManualOrderAdminMemo(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  adminMemo: string,
): Promise<void> {
  await patchManualOrder(resolveManualOrderPatchIdentifier(order), { ordermemo: adminMemo.trim() });
}

/** 라인별 운송장번호 갱신(본문 키는 API 스키마 소문자). */
export async function patchManualOrderLineTracking(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  trackingNumber: string,
): Promise<void> {
  await patchManualOrder(resolveManualOrderPatchIdentifier(order), {
    trackingnumber: trackingNumber.trim(),
    productid: product.id.trim(),
    partnumber: product.productNo.trim(),
  });
}

/**
 * 라인별 랙번호·이전 랙번호 갱신.
 * API 예: `{ "rackNumber": "S-01-01-001", "preracknumber": "P-01-001", "productid", "partnumber" }`
 * PATCH `…/orders/manual/:id` — `:id`는 `manualOrderPatchId` 또는 주문번호(`P00000001`).
 */
export async function patchManualOrderLineRack(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo" | "rackNo" | "prevRackNo">,
  rackNumber: string,
): Promise<void> {
  const rack = rackNumber.trim();
  const prevRack =
    (typeof product.rackNo === "string" && product.rackNo.trim()) ||
    (typeof product.prevRackNo === "string" && product.prevRackNo.trim()) ||
    "";
  await patchManualOrder(resolveManualOrderPatchIdentifier(order), {
    rackNumber: rack,
    preracknumber: prevRack,
    productid: product.id.trim(),
    partnumber: product.productNo.trim(),
  });
}

/**
 * 라인 식별 + 메모 필드 PATCH.
 * Postman 스키마: `productMemo`, `userMemo`, `Caution`(대문자 C) + 라인 식별용 `productid`, `partnumber`.
 */
function patchManualOrderLineMemoPayload(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  memoFields: Record<string, string>,
): Promise<void> {
  return patchManualOrder(resolveManualOrderPatchIdentifier(order), {
    ...memoFields,
    productid: product.id.trim(),
    partnumber: product.productNo.trim(),
  });
}

/** 라인별 상품메모 갱신. */
export function patchManualOrderLineProductMemo(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  productMemo: string,
): Promise<void> {
  return patchManualOrderLineMemoPayload(order, product, { productMemo: productMemo.trim() });
}

/** 라인별 주의사항 갱신. */
export function patchManualOrderLineCaution(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  caution: string,
): Promise<void> {
  return patchManualOrderLineMemoPayload(order, product, { Caution: caution.trim() });
}

/** 라인별 사용자메모 갱신. */
export function patchManualOrderLineUserMemo(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  userMemo: string,
): Promise<void> {
  return patchManualOrderLineMemoPayload(order, product, { userMemo: userMemo.trim() });
}

/**
 * `GET /orders/manual/search` with **no query string** — on this backend this is the only response
 * that includes `progressStatusCounts` (see API docs / Postman).
 */
export async function fetchManualOrderProgressCountsOnly(
  translate: (key: string) => string,
): Promise<Map<string, number>> {
  const raw = await apiFetch<unknown>(apiPath("/orders/manual/search"));
  return parseEnvelope(raw, translate).progressStatusCounts;
}

export async function fetchManualOrdersSearch(
  params: {
    progressStatus?: string;
    /** `GET …/manual/search?…&orderNumber=P00000007` — Postman과 동일 쿼리 키 */
    orderNumber?: string;
    page?: number;
    pageSize?: number;
  },
  translate: (key: string) => string,
): Promise<ManualSearchResult> {
  const qs = new URLSearchParams();
  if (params.progressStatus) qs.set(PROGRESS_STATUS_FIELD, params.progressStatus);
  const on = params.orderNumber?.trim();
  if (on) qs.set("orderNumber", on);
  if (params.page != null) qs.set("page", String(params.page));
  if (params.pageSize != null) qs.set("pageSize", String(params.pageSize));
  const suffix = qs.toString();
  const path = suffix ? `${apiPath("/orders/manual/search")}?${suffix}` : apiPath("/orders/manual/search");
  const raw = await apiFetch<unknown>(path);
  return parseEnvelope(raw, translate);
}
