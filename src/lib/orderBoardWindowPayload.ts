import type { OrderBoardOrder } from "@/components/orders/OrderBoard";

const STORAGE_PREFIX = "obw_order_payload_";
/** Same-tab backup after moving payload out of `localStorage` (React Strict Mode runs effects twice). */
const SESSION_HANDOFF_PREFIX = "obw_handoff_";

const INBOUND_SCAN_STORAGE_PREFIX = "obw_inbound_scan_payload_";
const INBOUND_SCAN_SESSION_PREFIX = "obw_inbound_scan_handoff_";

export type InboundScanWindowPayload = {
  orders: OrderBoardOrder[];
  defaultWarehouse: string;
};

export function storageKeyForInboundScanPayload(token: string): string {
  return `${INBOUND_SCAN_STORAGE_PREFIX}${token}`;
}

function inboundScanSessionHandoffKey(token: string): string {
  return `${INBOUND_SCAN_SESSION_PREFIX}${token}`;
}

/** 입고 스캔 팝업: `?k=` + 주문표 스냅샷(`orders`) — `localStorage`로 탭 간 전달. */
export function putInboundScanWindowPayload(payload: InboundScanWindowPayload): string | null {
  const token =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    if (typeof window === "undefined") return null;
    window.localStorage.setItem(storageKeyForInboundScanPayload(token), JSON.stringify(payload));
    return token;
  } catch {
    return null;
  }
}

export function takeInboundScanWindowPayload(token: string | null): InboundScanWindowPayload | null {
  if (!token) return null;
  try {
    if (typeof window === "undefined") return null;

    const ssKey = inboundScanSessionHandoffKey(token);
    const fromSession = window.sessionStorage.getItem(ssKey);
    if (fromSession) {
      return JSON.parse(fromSession) as InboundScanWindowPayload;
    }

    const lsKey = storageKeyForInboundScanPayload(token);
    const raw = window.localStorage.getItem(lsKey);
    if (!raw) return null;

    window.localStorage.removeItem(lsKey);
    window.sessionStorage.setItem(ssKey, raw);
    return JSON.parse(raw) as InboundScanWindowPayload;
  } catch {
    return null;
  }
}

const ISSUE_PHOTO_STORAGE_PREFIX = "obw_issue_photo_payload_";
const ISSUE_PHOTO_SESSION_PREFIX = "obw_issue_photo_handoff_";

/** 입고 스캔과 동일한 주문 스냅샷 + 이슈 사진 저장 시 PATCH할 상품 줄(선택). */
export type IssuePhotoWindowPayload = {
  orders: OrderBoardOrder[];
  defaultWarehouse: string;
  focusedOrderNo?: string;
  focusedProductId?: string;
};

export function storageKeyForIssuePhotoPayload(token: string): string {
  return `${ISSUE_PHOTO_STORAGE_PREFIX}${token}`;
}

function issuePhotoSessionHandoffKey(token: string): string {
  return `${ISSUE_PHOTO_SESSION_PREFIX}${token}`;
}

export function putIssuePhotoWindowPayload(payload: IssuePhotoWindowPayload): string | null {
  const token =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    if (typeof window === "undefined") return null;
    window.localStorage.setItem(storageKeyForIssuePhotoPayload(token), JSON.stringify(payload));
    return token;
  } catch {
    return null;
  }
}

export function takeIssuePhotoWindowPayload(token: string | null): IssuePhotoWindowPayload | null {
  if (!token) return null;
  try {
    if (typeof window === "undefined") return null;

    const ssKey = issuePhotoSessionHandoffKey(token);
    const fromSession = window.sessionStorage.getItem(ssKey);
    if (fromSession) {
      return JSON.parse(fromSession) as IssuePhotoWindowPayload;
    }

    const lsKey = storageKeyForIssuePhotoPayload(token);
    const raw = window.localStorage.getItem(lsKey);
    if (!raw) return null;

    window.localStorage.removeItem(lsKey);
    window.sessionStorage.setItem(ssKey, raw);
    return JSON.parse(raw) as IssuePhotoWindowPayload;
  } catch {
    return null;
  }
}

export function storageKeyForOrderBoardPayload(token: string): string {
  return `${STORAGE_PREFIX}${token}`;
}

function sessionHandoffKey(token: string): string {
  return `${SESSION_HANDOFF_PREFIX}${token}`;
}

/**
 * Store order JSON for a tool route (`?k=`). Uses **localStorage** so a `window.open` child tab
 * can read the same payload (`sessionStorage` is not shared across tabs).
 */
export function putOrderBoardWindowPayload(order: OrderBoardOrder): string | null {
  const token =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    if (typeof window === "undefined") return null;
    window.localStorage.setItem(storageKeyForOrderBoardPayload(token), JSON.stringify(order));
    return token;
  } catch {
    return null;
  }
}

/**
 * Read one-time payload for `?k=`.
 *
 * - First reads `localStorage` (cross-tab), then **copies JSON into this tab’s `sessionStorage`**
 *   and removes `localStorage`, so a second call in the same tab (e.g. React Strict Mode) still works.
 * - If `localStorage` is already consumed, reads from `sessionStorage`.
 */
export function takeOrderBoardWindowPayload(token: string | null): OrderBoardOrder | null {
  if (!token) return null;
  try {
    if (typeof window === "undefined") return null;

    const ssKey = sessionHandoffKey(token);
    const fromSession = window.sessionStorage.getItem(ssKey);
    if (fromSession) {
      return JSON.parse(fromSession) as OrderBoardOrder;
    }

    const lsKey = storageKeyForOrderBoardPayload(token);
    const raw = window.localStorage.getItem(lsKey);
    if (!raw) return null;

    window.localStorage.removeItem(lsKey);
    window.sessionStorage.setItem(ssKey, raw);
    return JSON.parse(raw) as OrderBoardOrder;
  } catch {
    return null;
  }
}
