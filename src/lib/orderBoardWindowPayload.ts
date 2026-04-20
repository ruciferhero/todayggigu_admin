import type { OrderBoardOrder } from "@/components/orders/OrderBoard";

const STORAGE_PREFIX = "obw_order_payload_";
/** Same-tab backup after moving payload out of `localStorage` (React Strict Mode runs effects twice). */
const SESSION_HANDOFF_PREFIX = "obw_handoff_";

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
