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

/** `GET manual/search`·PATCH 응답 `data.order`에 포함될 수 있는 구매비용 스냅샷. */
export type ManualQuotePersisted = {
  purchasecost?: number;
  exchangeRate?: number;
  officialRate?: number;
  fxmargin?: number;
  totalamount?: number;
  purchasefee_per?: number;
  purchasefee?: number;
  currentdeposit?: number;
  itemexceedcost?: number;
  localdeliveryfee?: number;
  localdelivery?: number;
  SMS_send?: string;
};

function readManualQuotePersistedFromRow(row: Record<string, unknown>): ManualQuotePersisted | undefined {
  const out: ManualQuotePersisted = {};
  let any = false;
  const takeNum = (key: keyof Omit<ManualQuotePersisted, "SMS_send">, keys: readonly string[]) => {
    for (const rk of keys) {
      if (!Object.prototype.hasOwnProperty.call(row, rk)) continue;
      const v = row[rk];
      if (v == null || v === "") continue;
      const n = typeof v === "number" ? v : Number(String(v).trim());
      if (!Number.isFinite(n)) continue;
      out[key] = n;
      any = true;
      return;
    }
  };
  takeNum("purchasecost", ["purchasecost"]);
  takeNum("exchangeRate", ["exchangeRate"]);
  takeNum("officialRate", ["officialRate"]);
  takeNum("fxmargin", ["fxmargin"]);
  takeNum("totalamount", ["totalamount"]);
  takeNum("purchasefee_per", ["purchasefee_per"]);
  takeNum("purchasefee", ["purchasefee"]);
  takeNum("currentdeposit", ["currentdeposit"]);
  takeNum("itemexceedcost", ["itemexceedcost"]);
  takeNum("localdeliveryfee", ["localdeliveryfee"]);
  takeNum("localdelivery", ["localdelivery"]);
  const sms = str(row.SMS_send ?? row.sms_send).trim();
  if (sms) {
    out.SMS_send = sms;
    any = true;
  }
  return any ? out : undefined;
}

/**
 * PATCH/GET 응답의 주문 객체에서 구매비용 팝업 상태를 복원한다.
 * `exchangeRate`는 백엔드가 정수(×100)로 줄 때가 많아 500 이상이면 ÷100 해서 ₩/¥ 로 쓴다.
 */
export function decodeManualPurchaseQuoteFromApiOrder(ord: Record<string, unknown>): {
  fxWonPerYuan?: number;
  productCostYuan?: number;
  feeYuan?: number;
  feePct?: number;
  includeLocal: boolean;
  localShipYuan: number;
  lineLocalSumYuan: number;
  includeExcess: boolean;
  excessWon: number;
  includeExtra: boolean;
  extraWon: number;
  smsSend: boolean;
} {
  const purchasecost = num(ord.purchasecost, NaN);
  const purchasefee = num(ord.purchasefee, NaN);
  const exRaw = num(ord.exchangeRate, NaN);
  let fx: number | undefined;
  if (Number.isFinite(exRaw) && exRaw > 0) {
    fx = exRaw >= 500 ? exRaw / 100 : exRaw;
  }
  let productCostYuan: number | undefined;
  let feeYuan: number | undefined;
  if (Number.isFinite(purchasecost) && fx != null && fx > 0) {
    productCostYuan = purchasecost / fx;
  }
  if (Number.isFinite(purchasefee) && fx != null && fx > 0) {
    feeYuan = purchasefee / fx;
  }
  const feePerRaw = num(ord.purchasefee_per, NaN);
  const feePct = Number.isFinite(feePerRaw) ? feePerRaw / 100 : undefined;
  const ldf = num(ord.localdeliveryfee, 0);
  const ld = num(ord.localdelivery, 0);
  const includeLocal = ldf > 0 || ld > 0;
  const localShipYuan = fx != null && fx > 0 && ldf > 0 ? ldf / fx : 0;
  const lineLocalSumYuan = fx != null && fx > 0 && ld > 0 ? ld / fx : 0;
  const exc = num(ord.itemexceedcost, 0);
  const includeExcess = exc > 0;
  const sms = str(ord.SMS_send ?? ord.sms_send).toLowerCase();
  const smsSend = sms === "yes" || sms === "y" || sms === "true" || sms === "1";
  const ta = num(ord.totalamount, NaN);
  let includeExtra = false;
  let extraWon = 0;
  if (
    Number.isFinite(ta) &&
    fx != null &&
    fx > 0 &&
    productCostYuan != null &&
    feeYuan != null
  ) {
    const baseWon = Math.round(
      (productCostYuan + feeYuan + (includeLocal ? localShipYuan + lineLocalSumYuan : 0)) * fx,
    );
    const diff = Math.round(ta - baseWon - (includeExcess ? exc : 0));
    if (diff > 1) {
      includeExtra = true;
      extraWon = diff;
    }
  }
  return {
    fxWonPerYuan: fx,
    productCostYuan,
    feeYuan,
    feePct,
    includeLocal,
    localShipYuan,
    lineLocalSumYuan,
    includeExcess,
    excessWon: includeExcess ? exc : 0,
    includeExtra,
    extraWon,
    smsSend,
  };
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

/** `additionalServiceIds` / `additionalServices` 등 문자열 배열 필드 */
function readManualStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== "string" && typeof v !== "number") continue;
    const s = String(v).trim();
    if (s) out.push(s);
  }
  return out;
}

/** 부가서비스 스키마: `items: [{ offerId, addservices[] }]` */
function readManualAdditionalServiceItems(row: Record<string, unknown>): Array<{ offerId: string; addservices: string[] }> {
  const raw =
    (Array.isArray(row.additionalServiceItems) ? row.additionalServiceItems : undefined) ??
    (Array.isArray(row.additionalserviceitems) ? row.additionalserviceitems : undefined) ??
    (Array.isArray(row.addServiceItems) ? row.addServiceItems : undefined) ??
    (Array.isArray(row.items) ? row.items : undefined) ??
    [];
  const rawItems = raw as Record<string, unknown>[];
  const mapped: Array<{ offerId: string; addservices: string[] }> = [];
  for (const it of rawItems) {
    const offerId = str(it.offerId).trim();
    const addservicesRaw = Array.isArray(it.addservices) ? it.addservices : [];
    const addservices: string[] = [];
    for (const v of addservicesRaw) {
      if (typeof v === "string" || typeof v === "number") {
        const s = String(v).trim();
        if (s) addservices.push(s);
        continue;
      }
      if (isRecord(v)) {
        const s = str(v.addServiceId || v.addserviceid).trim();
        if (s) addservices.push(s);
      }
    }
    if (!offerId || addservices.length === 0) continue;
    mapped.push({ offerId, addservices });
  }
  return mapped;
}

/** `item.inspectionImages` — 문자열 URL 또는 `{ url }` 객체 배열. */
function readInspectionImageUrls(it: Record<string, unknown>): string[] {
  const raw = it.inspectionImages;
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const el of raw) {
    if (typeof el === "string" && el.trim()) {
      out.push(el.trim());
      continue;
    }
    if (isRecord(el)) {
      const u = str(el.url || el.src || el.imageUrl || el.href).trim();
      if (u) out.push(u);
    }
  }
  return out;
}

/** `item.addservices` — 라인별 부가서비스 객체 목록 */
function readLineAdditionalServices(
  it: Record<string, unknown>,
): Array<{
  addServiceId: string;
  name: string;
  serviceType?: string;
  quantity?: number;
  price?: number;
  note?: string;
  icon?: string;
  imageUrl?: string;
}> {
  const raw = it.addservices;
  if (!Array.isArray(raw)) return [];
  const out: Array<{
    addServiceId: string;
    name: string;
    serviceType?: string;
    quantity?: number;
    price?: number;
    note?: string;
    icon?: string;
    imageUrl?: string;
  }> = [];
  for (const row of raw) {
    if (!isRecord(row)) continue;
    const addServiceId = str(row.addServiceId || row.addserviceid).trim();
    const name = str(row.name).trim();
    if (!addServiceId || !name) continue;
    const quantityRaw = Number(row.quantity);
    const priceRaw = Number(row.price);
    out.push({
      addServiceId,
      name,
      ...(str(row.serviceType).trim() ? { serviceType: str(row.serviceType).trim() } : {}),
      ...(Number.isFinite(quantityRaw) ? { quantity: quantityRaw } : {}),
      ...(Number.isFinite(priceRaw) ? { price: priceRaw } : {}),
      ...(str(row.note).trim() ? { note: str(row.note).trim() } : {}),
      ...(str(row.icon).trim() ? { icon: str(row.icon).trim() } : {}),
      ...(str(row.imageUrl || row.imageurl).trim()
        ? { imageUrl: str(row.imageUrl || row.imageurl).trim() }
        : {}),
    });
  }
  return out;
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

  const manualPurchaseMethod = str(
    row.dispatchmethod ||
      row.dispatchMethod ||
      row.dispatchmethodship ||
      row.dispatchMethodShip ||
      row.paymentMethod ||
      "",
  );

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
  let paidAmount =
    typeof row.paymentamount === "number"
      ? row.paymentamount
      : items.reduce((s, it) => s + num(it.paymentamount, num(it.totalpayamount, 0)), 0) || totalAmount;
  if (row.currentdeposit != null && row.currentdeposit !== "") {
    const cd = num(row.currentdeposit, NaN);
    if (Number.isFinite(cd)) paidAmount = cd;
  }

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
    const inspectionImages = readInspectionImageUrls(line);
    const additionalServices = readLineAdditionalServices(line);
    const sellerShip = num(it.sellershippingcost, NaN);
    const sellerShippingCost = Number.isFinite(sellerShip) ? sellerShip : undefined;
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
      ...(sellerShippingCost !== undefined ? { sellerShippingCost } : {}),
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
      inspectionImages: inspectionImages.length ? inspectionImages : undefined,
      additionalServices: additionalServices.length ? additionalServices : undefined,
      productOrderNumber: str(it.productordernumber || it.productOrderNumber || "").trim() || undefined,
      productMemo: str(it.productMemo || it.productmemo || it.remarks),
      caution: str(
        line.precautions ||
          (it as Record<string, unknown>).Caution ||
          it.caution ||
          it.cautionmemo ||
          it.cautionMemo,
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

  const intelTn = str(row.tracking_number_intel ?? row.trackingnumberintel).trim();
  const intelRack = str(row.rack_number_intel ?? row.racknumberintel).trim();

  return {
    orderNo,
    manualOrderPatchId: str(row._id || row.id || row.orderId, ""),
    statusCode,
    center: str(
      row.center ||
        row.warehouse ||
        row.shippingcenter ||
        row.shippingCenter ||
        row.logisticsRequest ||
        row.logisticscenterrequest,
    ),
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
    krTrack: intelTn || str(row.trackingnumber, firstTn),
    shipDate: (str(row.dispatchdate) || str(row.createdAt)).slice(0, 10),
    rack:
      intelRack ||
      str(
        row.racknumber,
        firstItem && isRecord(firstItem) ? str(firstItem.rackNumber || firstItem.racknumber) : "",
      ),
    warehouseStatus: str(row.warehouseStatus),
    progressStatus: apiProgress,
    manualPurchaseMethod: manualPurchaseMethod || undefined,
    manualQuotePersisted: readManualQuotePersistedFromRow(row),
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
      (items[0] as Record<string, unknown> | undefined)?.precautions ||
        (items[0] as Record<string, unknown> | undefined)?.Caution ||
        items[0]?.caution ||
        items[0]?.cautionmemo ||
        row.precautions ||
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
    ...(() => {
      const additionalServiceItems = readManualAdditionalServiceItems(row);
      const additionalServiceIds = readManualStringArray(
        row.additionalServiceIds ?? row.additionalserviceids,
      );
      const additionalServices = readManualStringArray(
        row.additionalServices ?? row.additionalservices,
      );
      return {
        ...(additionalServiceItems.length ? { additionalServiceItems } : {}),
        ...(additionalServiceIds.length ? { additionalServiceIds } : {}),
        ...(additionalServices.length ? { additionalServices } : {}),
      };
    })(),
  };
}

/**
 * `GET …/admin/orders/manual/:manualOrderIdentifier` — 단건 주문 (`data.order`).
 * 식별자는 Mongo `_id` 또는 `orderNumber` 등 백엔드 규약과 동일.
 */
export async function fetchManualOrder(
  manualOrderIdentifier: string,
  translate: (key: string) => string,
): Promise<OrderBoardOrder> {
  const id = manualOrderIdentifier.trim();
  if (!id) throw new Error("manualOrderIdentifier is required");
  const path = apiPath(`/admin/orders/manual/${encodeURIComponent(id)}`);
  const raw = await apiFetch<unknown>(path, { method: "GET" });
  if (!isRecord(raw)) throw new Error("Invalid API response");
  const data = raw.data;
  if (!isRecord(data)) throw new Error("Invalid API response: missing data");
  const order = data.order;
  if (!isRecord(order)) throw new Error("Invalid API response: missing data.order");
  return mapManualApiOrderToBoard(order, translate);
}

export type WarehouseScanMatchPair = { order: OrderBoardOrder; product: OrderBoardProduct };

/** 입고 스캔 등: 목록 매칭 후 단건 GET으로 `inspectionImages` 등 최신 라인 필드 반영. */
export async function enrichWarehouseScanMatchesFromApi(
  matches: WarehouseScanMatchPair[],
  translate: (key: string) => string,
): Promise<WarehouseScanMatchPair[]> {
  if (matches.length === 0) return matches;
  const ids = [...new Set(matches.map((m) => resolveManualOrderPatchIdentifier(m.order)))];
  const fresh = new Map<string, OrderBoardOrder>();
  await Promise.all(
    ids.map(async (id) => {
      try {
        const o = await fetchManualOrder(id, translate);
        fresh.set(id, o);
      } catch {
        /* 목록 데이터만 사용 */
      }
    }),
  );
  return matches.map((m) => {
    const id = resolveManualOrderPatchIdentifier(m.order);
    const fo = fresh.get(id);
    if (!fo) return m;
    const fp =
      fo.products.find((x) => x.id === m.product.id) ||
      fo.products.find((x) => x.productNo === m.product.productNo && m.product.productNo);
    if (!fp) return { order: fo, product: m.product };
    return { order: fo, product: fp };
  });
}

/** `PATCH …/orders/manual/:id` — arbitrary JSON body (e.g. partial update). */
export async function patchManualOrder(
  orderIdentifier: string,
  body: Record<string, string | number | boolean>,
): Promise<unknown> {
  const path = apiPath(`/admin/orders/manual/${encodeURIComponent(orderIdentifier)}`);
  return apiFetch<unknown>(path, { method: "PATCH", body });
}

/**
 * 부가서비스 — `PATCH …/admin/orders/manual/:manualOrderIdentifier`
 * 본문: `items: [{ offerId, addservices[] }]`
 * - `offerId`: 대상 상품/오퍼 식별자
 * - `addservices`: 카트 서비스 Mongo `_id` 배열
 * 동일 URL `GET …/manual/:id`의 `data.order.items[]`에도 같은 스키마가 내려올 수 있음.
 */
export async function patchManualOrderAdditionalServices(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  payload: {
    items: Array<{
      offerId: string;
      addservices: string[];
    }>;
  },
): Promise<unknown> {
  const orderIdentifier = resolveManualOrderPatchIdentifier(order);
  const path = apiPath(`/admin/orders/manual/${encodeURIComponent(orderIdentifier)}`);
  return apiFetch<unknown>(path, {
    method: "PATCH",
    body: {
      items: payload.items,
    },
  });
}

/** 정수 문자열 (백엔드가 문자열 숫자만 받는 경우). */
function manualOrderIntString(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n));
}

/** 환율·마진 등 소수 → 정수(×100, 원화 표시 단위와 맞춤). */
function manualOrderRateIntString(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n * 100));
}

/** 진행상태만 변경 — Postman과 동일 `{ "progressStatus": "<code>" }` 한 필드만 전송. */
export function patchManualOrderProgress(
  orderIdentifier: string,
  apiProgressCode: string,
): Promise<unknown> {
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

/** 관리자 주문복사/삭제 엔드포인트는 `_id`를 요구함. */
function resolveManualAdminOrderId(
  order: Pick<OrderBoardOrder, "manualOrderPatchId" | "orderNo">,
): string {
  const id = order.manualOrderPatchId?.trim();
  if (id) return id;
  throw new Error(`Missing manual order _id for ${order.orderNo}`);
}

/** 주문 메모(`ordermemo`)만 갱신. */
export async function patchManualOrderAdminMemo(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  adminMemo: string,
): Promise<unknown> {
  return patchManualOrder(resolveManualOrderPatchIdentifier(order), { ordermemo: adminMemo.trim() });
}

/** 관리자 주문복사 — `POST /admin/orders/maual/:id/copy` (`:id` is Mongo `_id`). */
export async function postAdminManualOrderCopy(
  order: Pick<OrderBoardOrder, "manualOrderPatchId" | "orderNo">,
): Promise<void> {
  const id = resolveManualAdminOrderId(order);
  await apiFetch<unknown>(apiPath(`/admin/orders/maual/${encodeURIComponent(id)}/copy`), {
    method: "POST",
  });
}

/** 관리자 주문삭제 — `DELETE /admin/orders/:id` (`:id` is Mongo `_id`). */
export async function deleteAdminOrderById(
  order: Pick<OrderBoardOrder, "manualOrderPatchId" | "orderNo">,
): Promise<void> {
  const id = resolveManualAdminOrderId(order);
  await apiFetch<unknown>(apiPath(`/admin/orders/${encodeURIComponent(id)}`), {
    method: "DELETE",
  });
}

/**
 * 구매비용 견적 저장 — `PATCH …/admin/orders/manual/:mongoId` JSON 본문.
 * 백엔드는 **모든 값이 문자열**이고 키 이름·`SMS_send` 철자를 그대로 사용한다.
 *
 * 금액류(`purchasecost`, `purchasefee`, `totalamount`, `currentdeposit`, `itemexceedcost`,
 * `localdeliveryfee`, `localdelivery`)는 **원(KRW) 정수** 문자열로 보낸다 (¥ 입력값 × 적용환율).
 * `exchangeRate` / `officialRate` / `fxmargin`은 입력 소수를 보존하기 위해 **×100 후 정수** 문자열.
 *
 * `:id`는 반드시 Mongo **`manualOrderPatchId`** (예: `69e5cb13e6f29e61c0e80bc2`). 주문번호만으로는 호출하지 않는다.
 */
export async function patchManualOrderPurchaseQuote(
  order: Pick<
    OrderBoardOrder,
    | "orderNo"
    | "manualOrderPatchId"
    | "paidAmount"
    | "krTrack"
    | "rack"
    | "progressStatus"
    | "applicationType"
    | "shippingMethod"
    | "manualPurchaseMethod"
  >,
  quote: {
    fxWonPerYuan: number;
    officialRateWon: number;
    additionalFxMarginWon: number;
    productCostYuan: number;
    feeYuan: number;
    feePct: number;
    includeLocal: boolean;
    localShipYuan: number;
    lineLocalSumYuan: number;
    includeExcess: boolean;
    excessWon: number;
    totalWon: number;
    trackingIntel: string;
    rackIntel: string;
    smsSend: boolean;
  },
): Promise<unknown> {
  const id = order.manualOrderPatchId?.trim();
  if (!id) {
    throw new Error(
      "manualOrderPatchId (Mongo _id) is required for PATCH /admin/orders/manual/:id. Open purchase cost from the manual order board.",
    );
  }

  const fx = quote.fxWonPerYuan;
  const progress = order.progressStatus?.trim() || "P_PENDING";
  const purchaseMethod =
    order.manualPurchaseMethod?.trim() ||
    [order.applicationType, order.shippingMethod].filter(Boolean).join("|").trim() ||
    "buy_manual";

  const purchasecostWon = Math.round(quote.productCostYuan * fx);
  const purchasefeeWon = Math.round(quote.feeYuan * fx);
  const localdeliveryfeeWon = quote.includeLocal ? Math.round(quote.localShipYuan * fx) : 0;
  const localdeliveryWon = quote.includeLocal ? Math.round(quote.lineLocalSumYuan * fx) : 0;

  const body: Record<string, string> = {
    progressStatus: progress,
    purchasecost: manualOrderIntString(purchasecostWon),
    tracking_number_intel: quote.trackingIntel.trim(),
    exchangeRate: manualOrderRateIntString(fx),
    officialRate: manualOrderRateIntString(quote.officialRateWon),
    fxmargin: manualOrderRateIntString(quote.additionalFxMarginWon),
    totalamount: manualOrderIntString(quote.totalWon),
    /** 수수료율(%) — 소수 둘째 자리까지 ×100 (예: 1% → "100", 1.25% → "125") */
    purchasefee_per: manualOrderIntString(Math.round(quote.feePct * 100)),
    purchasefee: manualOrderIntString(purchasefeeWon),
    currentdeposit: manualOrderIntString(order.paidAmount ?? 0),
    itemexceedcost: quote.includeExcess ? manualOrderIntString(quote.excessWon) : "0",
    localdeliveryfee: manualOrderIntString(localdeliveryfeeWon),
    localdelivery: manualOrderIntString(localdeliveryWon),
    rack_number_intel: quote.rackIntel.trim(),
    purchaseMethod,
    SMS_send: quote.smsSend ? "yes" : "no",
  };

  return patchManualOrder(id, body);
}

/** 상품 행 현지배송비(`currentshippingfee`/`actualshippingcost`) 저장. */
export async function patchManualOrderLineShippingCost(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  shippingCostYuan: number,
): Promise<unknown> {
  const productNo = product.productNo.trim();
  const lineId = product.id.trim();
  const productId = productNo || lineId;
  return patchManualOrder(resolveManualOrderPatchIdentifier(order), {
    currentshippingfee: Number.isFinite(shippingCostYuan) ? shippingCostYuan.toFixed(2) : "0",
    actualshippingcost: Number.isFinite(shippingCostYuan) ? shippingCostYuan.toFixed(2) : "0",
    productid: productId,
    partnumber: productNo || productId,
    lineid: lineId,
  });
}

/** 라인별 운송장번호 갱신(본문 키는 API 스키마 소문자). */
export async function patchManualOrderLineTracking(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  trackingNumber: string,
): Promise<unknown> {
  const productNo = product.productNo.trim();
  const lineId = product.id.trim();
  const productId = productNo || lineId;
  return patchManualOrder(resolveManualOrderPatchIdentifier(order), {
    trackingnumber: trackingNumber.trim(),
    productid: productId,
    partnumber: productNo || productId,
    lineid: lineId,
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
): Promise<unknown> {
  const productNo = product.productNo.trim();
  const lineId = product.id.trim();
  const productId = productNo || lineId;
  const rack = rackNumber.trim();
  const prevRack =
    (typeof product.rackNo === "string" && product.rackNo.trim()) ||
    (typeof product.prevRackNo === "string" && product.prevRackNo.trim()) ||
    "";
  return patchManualOrder(resolveManualOrderPatchIdentifier(order), {
    rackNumber: rack,
    preracknumber: prevRack,
    productid: productId,
    partnumber: productNo || productId,
    lineid: lineId,
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
): Promise<unknown> {
  const productNo = product.productNo.trim();
  const lineId = product.id.trim();
  const productId = productNo || lineId;
  return patchManualOrder(resolveManualOrderPatchIdentifier(order), {
    ...memoFields,
    productid: productId,
    partnumber: productNo || productId,
    lineid: lineId,
  });
}

/** 라인별 상품메모 갱신. */
export function patchManualOrderLineProductMemo(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  productMemo: string,
): Promise<unknown> {
  return patchManualOrderLineMemoPayload(order, product, { productMemo: productMemo.trim() });
}


export function patchManualOrderLineUnitPrice(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  unitPrice: number,
): Promise<unknown> {
  return patchManualOrderLineMemoPayload(order, product, { unitPrice: unitPrice.toFixed(2) });
}

/** 라인별 주의사항 갱신. */
export function patchManualOrderLineCaution(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  caution: string,
): Promise<unknown> {
  return patchManualOrderLineMemoPayload(order, product, { Caution: caution.trim() });
}

/** 라인별 사용자메모 갱신. */
export function patchManualOrderLineUserMemo(
  order: Pick<OrderBoardOrder, "orderNo" | "manualOrderPatchId">,
  product: Pick<OrderBoardProduct, "id" | "productNo">,
  userMemo: string,
): Promise<unknown> {
  return patchManualOrderLineMemoPayload(order, product, { userMemo: userMemo.trim() });
}

/**
 * `GET /orders/manual/search` with **no query string** — on this backend this is the only response
 * that includes `progressStatusCounts` (see API docs / Postman).
 */
export async function fetchManualOrderProgressCountsOnly(
  translate: (key: string) => string,
): Promise<Map<string, number>> {
  const raw = await apiFetch<unknown>(apiPath("/admin/orders/manual/search"));
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
  const path = suffix ? `${apiPath("/admin/orders/manual/search")}?${suffix}` : apiPath("/admin/orders/manual/search");
  const raw = await apiFetch<unknown>(path);
  return parseEnvelope(raw, translate);
}
