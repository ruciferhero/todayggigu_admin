const ORDER_BOARD_MUTATION_SIGNAL_KEY = "obw_manual_order_mutation_signal";

export type OrderBoardMutationSignal = {
  orderNo: string;
  at: number;
  source: "purchase-cost" | "order-inquiry" | "order-board" | "additional-services" | "inbound-scan";
};

/** Emit cross-tab signal so OrderBoard can refresh manualSearch rows immediately. */
export function emitOrderBoardMutationSignal(signal: OrderBoardMutationSignal): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ORDER_BOARD_MUTATION_SIGNAL_KEY, JSON.stringify(signal));
  } catch {
    // no-op
  }
}

/** Subscribe to cross-tab mutation signal (`storage` event). */
export function subscribeOrderBoardMutationSignal(
  onSignal: (signal: OrderBoardMutationSignal) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key !== ORDER_BOARD_MUTATION_SIGNAL_KEY || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue) as OrderBoardMutationSignal;
      if (!parsed || typeof parsed.orderNo !== "string") return;
      onSignal(parsed);
    } catch {
      // ignore malformed payload
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
