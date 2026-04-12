"use client";

import { AlertTriangle, ShoppingCart, Warehouse, ScanBarcode, AlertCircle, Scissors, PackageCheck, DollarSign, Tag, Plane } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import OrderBoard, { type OrderBoardOrder, type OrderBoardStatusGroup } from "@/components/orders/OrderBoard";

export default function VVICOrders() {
  const { t } = useLocale();

  const statusGroups: OrderBoardStatusGroup[] = [
    { title: t("orders.status.purchase"), icon: <ShoppingCart className="w-4 h-4" />, color: "text-purple-600", items: [
      { label: t("orders.status.tempSave"), code: "BUY_TEMP" }, { label: t("orders.status.purchaseQuote"), code: "BUY_EST" }, { label: t("orders.status.purchasePaymentPending"), code: "BUY_PAY_WAIT" },
      { label: t("orders.status.purchasePaymentComplete"), code: "BUY_PAY_DONE" }, { label: t("orders.status.purchasing"), code: "BUYING" }, { label: t("orders.status.problemProduct"), code: "PROBLEM_PRODUCT" }, { label: t("orders.status.purchaseComplete"), code: "BUY_COMPLETE" },
    ]},
    { title: t("orders.status.inOut"), icon: <Warehouse className="w-4 h-4" />, color: "text-blue-500", items: [
      { label: t("orders.status.centerArrivalExpected"), code: "WH_ARRIVE_EXPECTED" }, { label: t("orders.status.warehouseInProgress"), code: "WH_IN_PROGRESS" }, { label: t("orders.status.warehouseInComplete"), code: "WH_IN_DONE" },
      { label: t("orders.status.shipmentPaymentPending"), code: "SHIP_PAY_WAIT" }, { label: t("orders.status.shipmentPaymentComplete"), code: "SHIP_PAY_DONE" }, { label: t("orders.status.shipmentPending"), code: "WH_SHIP_WAIT" },
      { label: t("orders.status.shipmentComplete"), code: "WH_SHIPPED" }, { label: t("orders.status.additionalCostPaymentPending"), code: "ADD_COST_PAY_WAIT" }, { label: t("orders.status.additionalCostPaymentComplete"), code: "ADD_COST_PAY_DONE" },
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
      orderNo: "VV-250411-201", statusCode: "SHIP_PAY_DONE", center: "Weihai", applicationType: "VVIC", customsClearance: "Express",
      typeLabel: "VVIC", shippingMethod: t("orders.filter.shippingMethodAir"), isShipped: false, memberBadge: "VVIC",
      userName: "Studio Haze", receiver: "Ara Jung", trackingCount: 7, warehousedCount: 7, qty: 26, totalAmount: 1376000,
      paidAmount: 1492000, weight: 13.7, krTrack: "", shipDate: "2026-04-11", rack: "VV-01-04",
      warehouseStatus: t("orders.status.warehouseInComplete"), progressStatus: t("orders.status.shipmentPaymentComplete"),
      createdAt: "2026-04-08 18:11", updatedAt: "2026-04-11 09:02", inquiryResponder: "Amelia", buyer: "James",
      adminMemo: "Weight confirmed by warehouse team.",
      productMemo: "Steam ironing completed.", caution: "", userMemo: "Outbound after final payment confirmation.",
      products: [
        { id: "VV-201-1", productNo: "VP-10201", name: "Soft Knit Set", option: "Pink / Free", trackingNo: "CN2026040818001", orderNo: "VV-250411-201", unitPrice: 36000, quantity: 11, totalPrice: 396000, shippingCost: 11000, rackNo: "VV-01-04", prevRackNo: "", statusLabel: t("orders.status.shipmentPaymentComplete") },
        { id: "VV-201-2", productNo: "VP-10202", name: "Straight Slacks", option: "Navy / M", trackingNo: "CN2026040818002", orderNo: "VV-250411-201", unitPrice: 27500, quantity: 15, totalPrice: 412500, shippingCost: 15000, rackNo: "VV-01-04", prevRackNo: "VV-01-03", statusLabel: t("orders.status.shipmentPaymentComplete") },
      ],
    },
    {
      orderNo: "VV-250411-202", statusCode: "ADD_COST_PAY_WAIT", center: "Qingdao", applicationType: "VVIC", customsClearance: "General",
      typeLabel: "VVIC", shippingMethod: t("orders.filter.shippingMethodSea"), isShipped: false, memberBadge: "VVIC",
      userName: "Merry Closet", receiver: "Hyerin Kwon", trackingCount: 4, warehousedCount: 4, qty: 14, totalAmount: 742000,
      paidAmount: 742000, weight: 8.6, krTrack: "", shipDate: "2026-04-10", rack: "VV-02-11",
      warehouseStatus: t("orders.status.warehouseInComplete"), progressStatus: t("orders.status.additionalCostPaymentPending"),
      createdAt: "2026-04-07 14:22", updatedAt: "2026-04-10 17:48", inquiryResponder: "Henry", buyer: "Ella",
      adminMemo: "Oversize carton added by warehouse.",
      productMemo: "Polybag replacement done.", caution: "Extra carton fee pending payment.", userMemo: "Awaiting extra carton fee payment.",
      products: [
        { id: "VV-202-1", productNo: "VP-10210", name: "Cropped Cardigan", option: "Ivory / Free", trackingNo: "CN2026040714001", orderNo: "VV-250411-202", unitPrice: 28000, quantity: 8, totalPrice: 224000, shippingCost: 8000, rackNo: "VV-02-11", prevRackNo: "", statusLabel: t("orders.status.additionalCostPaymentPending") },
        { id: "VV-202-2", productNo: "VP-10211", name: "Pleats One-piece", option: "Black / Free", trackingNo: "CN2026040714002", orderNo: "VV-250411-202", unitPrice: 43000, quantity: 6, totalPrice: 258000, shippingCost: 6000, rackNo: "VV-02-11", prevRackNo: "", statusLabel: t("orders.status.additionalCostPaymentPending") },
      ],
    },
    {
      orderNo: "VV-250411-203", statusCode: "USER_REFUND_REQ", center: "Guangzhou", applicationType: "VVIC", customsClearance: "Self-clearance",
      typeLabel: "VVIC", shippingMethod: t("orders.filter.shippingMethodAirExpress"), isShipped: false, memberBadge: "VVIC",
      userName: "Velvet Muse", receiver: "Nari Yoon", trackingCount: 2, warehousedCount: 1, qty: 9, totalAmount: 468000,
      paidAmount: 468000, weight: 5.4, krTrack: "", shipDate: "2026-04-09", rack: "VV-HOLD-5",
      warehouseStatus: t("orders.status.error"), progressStatus: t("orders.status.userRefundRequest"),
      createdAt: "2026-04-05 09:55", updatedAt: "2026-04-11 12:20", inquiryResponder: "Jack", buyer: "Isabella",
      adminMemo: "Waiting for seller reply on defect claim.",
      productMemo: "Defect photo report attached.", caution: "Quality issue - do not ship.", userMemo: "Customer asked for full refund.",
      products: [
        { id: "VV-203-1", productNo: "VP-10220", name: "Frill Blouse", option: "White / Free", trackingNo: "", orderNo: "VV-250411-203", unitPrice: 24500, quantity: 5, totalPrice: 122500, shippingCost: 0, rackNo: "VV-HOLD-5", prevRackNo: "", statusLabel: t("orders.status.userRefundRequest") },
        { id: "VV-203-2", productNo: "VP-10221", name: "Mini Tweed Skirt", option: "Black / S", trackingNo: "", orderNo: "VV-250411-203", unitPrice: 39000, quantity: 4, totalPrice: 156000, shippingCost: 0, rackNo: "VV-HOLD-5", prevRackNo: "", statusLabel: t("orders.status.userRefundRequest") },
      ],
    },
  ];

  const buttons = (
    <>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2"><ScanBarcode className="w-4 h-4" />{t("orders.action.warehouseScan")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-red-500 to-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("orders.action.issueProduct")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-teal-500 to-teal-700 flex items-center gap-2"><Scissors className="w-4 h-4" />{t("orders.action.packingSplit")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-green-500 to-green-700 flex items-center gap-2"><PackageCheck className="w-4 h-4" />{t("orders.action.outboundList")}</button>
      <div className="w-px h-10 bg-gray-300" />
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><DollarSign className="w-4 h-4" />{t("orders.action.financeVvicProcessing")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><Tag className="w-4 h-4" />{t("orders.action.vvicLabelPrint")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><Plane className="w-4 h-4" />{t("orders.action.redfAir")}</button>
    </>
  );

  return <OrderBoard title={t("orders.vvic.title")} defaultSelectedLabel={t("orders.vvic.title")} statusGroups={statusGroups} orders={orders} actionButtons={buttons} />;
}
