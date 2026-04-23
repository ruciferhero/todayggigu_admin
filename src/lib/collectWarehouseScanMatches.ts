import type { OrderBoardOrder, OrderBoardProduct } from "@/components/orders/OrderBoard";

/** 입고 스캔: 상품 라인의 trackingNo로만 검색 */
export function collectWarehouseScanMatches(
  list: OrderBoardOrder[],
  centerKey: string,
  needleRaw: string,
): { order: OrderBoardOrder; product: OrderBoardProduct }[] {
  const needle = needleRaw.trim().toLowerCase();
  if (!needle) return [];
  const out: { order: OrderBoardOrder; product: OrderBoardProduct }[] = [];
  const seen = new Set<string>();
  for (const o of list) {
    if (centerKey && o.center !== centerKey) continue;
    for (const p of o.products) {
      const tk = (p.trackingNo ?? "").toLowerCase();
      if (!tk.includes(needle)) continue;
      const key = `${o.orderNo}\0${p.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ order: o, product: p });
    }
  }
  return out;
}
