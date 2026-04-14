"use client";

import { AlertTriangle, ShoppingCart, Warehouse, ScanBarcode, Scissors, AlertCircle, ClipboardList, PackageCheck, Rocket } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import OrderBoard, { type OrderBoardOrder, type OrderBoardStatusGroup } from "@/components/orders/OrderBoard";

export default function RocketOrders() {
  const { t } = useLocale();

  const statusGroups: OrderBoardStatusGroup[] = [
    { title: t("orders.status.purchase"), icon: <ShoppingCart className="w-4 h-4" />, color: "text-purple-600", items: [
      { label: t("orders.status.tempSave"), code: "BUY_TEMP" }, { label: t("orders.status.purchaseQuote"), code: "BUY_EST" }, { label: t("orders.status.purchasePaymentPending"), code: "BUY_PAY_WAIT" },
      { label: t("orders.status.purchasePaymentComplete"), code: "BUY_PAY_DONE" }, { label: t("orders.status.purchasing"), code: "BUYING" }, { label: t("orders.status.problemProduct"), code: "PROBLEM_PRODUCT" }, { label: t("orders.status.purchaseComplete"), code: "BUY_COMPLETE" },
    ]},
    { title: t("orders.status.inOut"), icon: <Warehouse className="w-4 h-4" />, color: "text-blue-500", items: [
      { label: t("orders.status.centerArrivalExpected"), code: "WH_ARRIVE_EXPECTED" }, { label: t("orders.status.localDeliveryDelay"), code: "LOCAL_DELAY" }, { label: t("orders.status.warehouseInProgress"), code: "WH_IN_PROGRESS" },
      { label: t("orders.status.warehouseInComplete"), code: "WH_IN_DONE" }, { label: t("orders.status.shipmentPaymentPending"), code: "SHIP_PAY_WAIT" }, { label: t("orders.status.shipmentPending"), code: "WH_SHIP_WAIT" },
      { label: t("orders.status.shipmentComplete"), code: "WH_SHIPPED" }, { label: t("orders.status.additionalCostPaymentPending"), code: "ADD_COST_PAY_WAIT" }, { label: t("orders.status.additionalCostPaymentComplete"), code: "ADD_COST_PAY_DONE" },
      { label: t("orders.status.shippingProcessing"), code: "DELIVERY_IN_PROGRESS" }, { label: t("orders.status.deliveryComplete"), code: "DELIVERY_DONE" },
    ]},
    { title: t("orders.status.error"), icon: <AlertTriangle className="w-4 h-4" />, color: "text-red-500", items: [
      { label: t("orders.status.errorWarehouse"), code: "ERR_IN" }, { label: t("orders.status.userRefundRequest"), code: "USER_REFUND_REQ" }, { label: t("orders.status.userRefundProcessing"), code: "USER_REFUND_ING" },
      { label: t("orders.status.userRefundComplete"), code: "USER_REFUND_DONE" }, { label: t("orders.status.platformRefundRequest"), code: "PLAT_REFUND_REQ" }, { label: t("orders.status.platformRefundProcessing"), code: "PLAT_REFUND_ING" },
      { label: t("orders.status.platformRefundComplete"), code: "PLAT_REFUND_DONE" }, { label: t("orders.status.finalRefundRequest"), code: "FINAL_REFUND_REQ" }, { label: t("orders.status.finalRefundProcessing"), code: "FINAL_REFUND_ING" },
      { label: t("orders.status.finalRefundComplete"), code: "FINAL_REFUND_DONE" }, { label: t("orders.status.orderDisposal"), code: "ORDER_DISPOSAL" }, { label: t("orders.status.shipmentHold"), code: "HOLD" },
    ]},
  ];

  const allStatusItems = statusGroups.flatMap((group) => group.items);
  const centers = ["Weihai", "Qingdao", "Guangzhou"];

  const orders: OrderBoardOrder[] = allStatusItems.flatMap((item, statusIndex) => {
    const targetCount = 3 + (statusIndex % 4); // 3~6
    return Array.from({ length: targetCount }, (_, itemIndex) => {
      const seed = statusIndex * 10 + itemIndex + 1;
      const orderNo = `RO-2604-${String(statusIndex + 1).padStart(2, "0")}${String(itemIndex + 1).padStart(2, "0")}`;
      const qty = 5 + (seed % 8);
      const unitPrice = 17000 + (seed % 6) * 3500;
      const totalAmount = qty * unitPrice;
      return {
        orderNo,
        statusCode: item.code,
        center: centers[seed % centers.length],
        applicationType: "Rocket",
        customsClearance: seed % 2 === 0 ? "General" : "Express",
        typeLabel: "Rocket",
        shippingMethod: seed % 2 === 0 ? t("orders.filter.shippingMethodSea") : t("orders.filter.shippingMethodAir"),
        isShipped: seed % 3 === 0,
        memberBadge: "Rocket",
        userName: `Rocket Member ${seed}`,
        receiver: `Receiver ${seed}`,
        trackingCount: 1 + (seed % 5),
        warehousedCount: 1 + (seed % 4),
        qty,
        totalAmount,
        paidAmount: totalAmount,
        weight: Number((2 + (seed % 8) * 0.9).toFixed(1)),
        krTrack: seed % 3 === 0 ? `KR77${100000 + seed}` : "",
        shipDate: `2026-04-${String(10 + (seed % 15)).padStart(2, "0")}`,
        rack: `RO-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 20) + 1).padStart(2, "0")}`,
        warehouseStatus: t("orders.status.warehouseInProgress"),
        progressStatus: item.label,
        createdAt: `2026-04-${String(6 + (seed % 10)).padStart(2, "0")} 09:${String((seed * 7) % 60).padStart(2, "0")}`,
        updatedAt: `2026-04-${String(8 + (seed % 10)).padStart(2, "0")} 15:${String((seed * 9) % 60).padStart(2, "0")}`,
        inquiryResponder: "Auto",
        buyer: "System",
        adminMemo: `Rocket sample: ${item.label}`,
        productMemo: "Auto-generated data",
        caution: seed % 6 === 0 ? "Check product condition" : "",
        userMemo: "Generated for status count testing",
        products: [
          { id: `${orderNo}-1`, productNo: `RP-${80000 + seed}`, name: `Rocket Item A-${seed}`, option: "Default / M", trackingNo: `CN26${1000000 + seed}`, orderNo, unitPrice, quantity: Math.max(1, qty - 2), totalPrice: Math.max(1, qty - 2) * unitPrice, shippingCost: 7000, rackNo: `RO-${String((seed % 12) + 1).padStart(2, "0")}`, prevRackNo: "", statusLabel: item.label, productMemo: "Auto-generated data", caution: seed % 6 === 0 ? "Check product condition" : "", userMemo: "Generated for status count testing" },
          { id: `${orderNo}-2`, productNo: `RP-${80100 + seed}`, name: `Rocket Item B-${seed}`, option: "Default / L", trackingNo: `CN26${2000000 + seed}`, orderNo, unitPrice: unitPrice - 2500, quantity: 2, totalPrice: (unitPrice - 2500) * 2, shippingCost: 5000, rackNo: `RO-${String((seed % 12) + 1).padStart(2, "0")}`, prevRackNo: `RO-${String(((seed + 1) % 12) + 1).padStart(2, "0")}`, statusLabel: item.label, productMemo: `Line 2 · ${orderNo}`, caution: "", userMemo: "Generated for status count testing" },
        ],
      };
    });
  });

  const buttons = (
    <>
      <button type="button" data-inbound-scan className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2"><ScanBarcode className="w-4 h-4" />{t("orders.action.warehouseScan")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-teal-500 to-teal-700 flex items-center gap-2"><Scissors className="w-4 h-4" />{t("orders.action.packingSplit")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-red-500 to-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("orders.action.issueProduct")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-purple-500 to-purple-700 flex items-center gap-2"><ClipboardList className="w-4 h-4" />{t("orders.action.workList")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-green-500 to-green-700 flex items-center gap-2"><PackageCheck className="w-4 h-4" />{t("orders.action.outboundList")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-orange-500 to-orange-700 flex items-center gap-2"><Rocket className="w-4 h-4" />{t("orders.action.rocketList")}</button>
    </>
  );

  return <OrderBoard title={t("orders.rocket.title")} defaultSelectedLabel={t("orders.rocket.title")} statusGroups={statusGroups} orders={orders} actionButtons={buttons} />;
}
