import type { OrderBoardStatusItem } from "./OrderBoard";

/**
 * Row "진행상태" `<select>` options by current order `statusCode` (same codes as the sidebar filter).
 * Only listed `OrderBoardStatusItem.code` values appear, in sidebar label order.
 * Omit a `statusCode` key → fall back to every item in `flatStatusItems` (same as full filter list).
 *
 * Example: temp save (`BUY_TEMP`) → next step purchase quote (`BUY_EST`) or error warehouse (`ERR_IN`) only.
 */
export const BOARD_PROGRESS_SELECT_ALLOWED_CODES: Partial<Record<string, readonly string[]>> = {
  BUY_TEMP: ["BUY_EST", "ERR_IN"],
};

export function getProgressSelectOptionsForOrder(
  orderStatusCode: string,
  flatItems: readonly OrderBoardStatusItem[],
): OrderBoardStatusItem[] {
  const allowed = BOARD_PROGRESS_SELECT_ALLOWED_CODES[orderStatusCode];
  if (!allowed?.length) {
    return [...flatItems];
  }
  const allow = new Set(allowed);
  const picked = flatItems.filter((item) => allow.has(item.code));
  return picked.length > 0 ? picked : [...flatItems];
}

/** Value for the progress `<select>`: user override, else current status if allowed, else first allowed option. */
export function resolveProgressSelectValue(
  orderNo: string,
  orderStatusCode: string,
  progressOptions: readonly OrderBoardStatusItem[],
  progressSelectByOrder: Record<string, string>,
): string {
  const override = progressSelectByOrder[orderNo];
  if (override && progressOptions.some((s) => s.code === override)) {
    return override;
  }
  if (progressOptions.some((s) => s.code === orderStatusCode)) {
    return orderStatusCode;
  }
  return progressOptions[0]?.code ?? orderStatusCode;
}
