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

  const orders: OrderBoardOrder[] = [
    {
      orderNo: "RO-250411-101", statusCode: "WH_IN_DONE", center: "Weihai", applicationType: "Rocket", customsClearance: "General",
      typeLabel: "Rocket", shippingMethod: t("orders.filter.shippingMethodSea"), isShipped: false, memberBadge: "Rocket",
      userName: "Rocket Select", receiver: "Jiyoon Han", trackingCount: 8, warehousedCount: 8, qty: 34, totalAmount: 1548000,
      paidAmount: 1679000, weight: 22.8, krTrack: "", shipDate: "2026-04-10", rack: "R-03-08",
      warehouseStatus: t("orders.status.warehouseInComplete"), progressStatus: t("orders.status.warehouseInComplete"),
      createdAt: "2026-04-08 09:30", updatedAt: "2026-04-11 07:20", inquiryResponder: "Grace", buyer: "Mia",
      adminMemo: "Ready for outbound payment confirmation.",
      productMemo: "Remove price tags before packing.", caution: "", userMemo: "Bundle by color family.",
      products: [
        { id: "RO-101-1", productNo: "P-88001", name: "Daily Cargo Pants", option: "Khaki / L", trackingNo: "CN2026040801001", orderNo: "RO-250411-101", unitPrice: 24000, quantity: 20, totalPrice: 480000, shippingCost: 18000, rackNo: "R-03-08", prevRackNo: "", statusLabel: t("orders.status.warehouseInComplete") },
        { id: "RO-101-2", productNo: "P-88002", name: "Striped Oxford Shirt", option: "Blue / Free", trackingNo: "CN2026040801002", orderNo: "RO-250411-101", unitPrice: 31000, quantity: 14, totalPrice: 434000, shippingCost: 12000, rackNo: "R-03-08", prevRackNo: "R-03-07", statusLabel: t("orders.status.warehouseInComplete") },
      ],
    },
    {
      orderNo: "RO-250411-102", statusCode: "LOCAL_DELAY", center: "Qingdao", applicationType: "Rocket", customsClearance: "Express",
      typeLabel: "Rocket", shippingMethod: t("orders.filter.shippingMethodAir"), isShipped: false, memberBadge: "Rocket",
      userName: "Mono Room", receiver: "Seungho Choi", trackingCount: 5, warehousedCount: 1, qty: 19, totalAmount: 882000,
      paidAmount: 882000, weight: 11.2, krTrack: "", shipDate: "2026-04-11", rack: "R-WAIT-02",
      warehouseStatus: t("orders.status.localDeliveryDelay"), progressStatus: t("orders.status.localDeliveryDelay"),
      createdAt: "2026-04-10 16:18", updatedAt: "2026-04-11 10:04", inquiryResponder: "Ethan", buyer: "Chloe",
      adminMemo: "Local courier delay from supplier district.",
      productMemo: "Barcode relabeling needed.", caution: "Delayed by 2 days - follow up with seller.", userMemo: "Need seller dispatch follow-up.",
      products: [
        { id: "RO-102-1", productNo: "P-88010", name: "Slim Denim", option: "Indigo / 30", trackingNo: "CN2026041001001", orderNo: "RO-250411-102", unitPrice: 33000, quantity: 9, totalPrice: 297000, shippingCost: 9000, rackNo: "R-WAIT-02", prevRackNo: "", statusLabel: t("orders.status.localDeliveryDelay") },
        { id: "RO-102-2", productNo: "P-88011", name: "Boxy Hoodie", option: "Gray / XL", trackingNo: "", orderNo: "RO-250411-102", unitPrice: 29500, quantity: 10, totalPrice: 295000, shippingCost: 10000, rackNo: "R-WAIT-02", prevRackNo: "", statusLabel: t("orders.status.localDeliveryDelay") },
      ],
    },
    {
      orderNo: "RO-250411-103", statusCode: "PLAT_REFUND_REQ", center: "Guangzhou", applicationType: "Rocket", customsClearance: "Self-clearance",
      typeLabel: "Rocket", shippingMethod: t("orders.filter.shippingMethodAirExpress"), isShipped: false, memberBadge: "Rocket",
      userName: "Canvas Lab", receiver: "Yuna Seo", trackingCount: 3, warehousedCount: 0, qty: 11, totalAmount: 624000,
      paidAmount: 624000, weight: 6.8, krTrack: "", shipDate: "2026-04-11", rack: "HOLD-RO-1",
      warehouseStatus: t("orders.status.error"), progressStatus: t("orders.status.platformRefundRequest"),
      createdAt: "2026-04-06 13:44", updatedAt: "2026-04-11 11:12", inquiryResponder: "Liam", buyer: "Ava",
      adminMemo: "Platform dispute ticket opened.",
      productMemo: "Inspection photo taken - defective items.", caution: "Do NOT ship - dispute in progress.", userMemo: "Cancel seller stock shortage items.",
      products: [
        { id: "RO-103-1", productNo: "P-88020", name: "Mockneck Tee", option: "Black / Free", trackingNo: "", orderNo: "RO-250411-103", unitPrice: 17000, quantity: 6, totalPrice: 102000, shippingCost: 0, rackNo: "HOLD-RO-1", prevRackNo: "", statusLabel: t("orders.status.platformRefundRequest") },
        { id: "RO-103-2", productNo: "P-88021", name: "Summer Shorts", option: "Cream / M", trackingNo: "", orderNo: "RO-250411-103", unitPrice: 22000, quantity: 5, totalPrice: 110000, shippingCost: 0, rackNo: "HOLD-RO-1", prevRackNo: "", statusLabel: t("orders.status.platformRefundRequest") },
      ],
    },
  ];

  const buttons = (
    <>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2"><ScanBarcode className="w-4 h-4" />{t("orders.action.warehouseScan")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-teal-500 to-teal-700 flex items-center gap-2"><Scissors className="w-4 h-4" />{t("orders.action.packingSplit")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-red-500 to-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("orders.action.issueProduct")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-purple-500 to-purple-700 flex items-center gap-2"><ClipboardList className="w-4 h-4" />{t("orders.action.workList")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-green-500 to-green-700 flex items-center gap-2"><PackageCheck className="w-4 h-4" />{t("orders.action.outboundList")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-orange-500 to-orange-700 flex items-center gap-2"><Rocket className="w-4 h-4" />{t("orders.action.rocketList")}</button>
    </>
  );

  return <OrderBoard title={t("orders.rocket.title")} defaultSelectedLabel={t("orders.rocket.title")} statusGroups={statusGroups} orders={orders} actionButtons={buttons} />;
}
