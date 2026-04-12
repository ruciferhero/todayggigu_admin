"use client";

import { AlertTriangle, ShoppingCart, Warehouse, ScanBarcode, Scissors, AlertCircle, ClipboardList, PackageCheck, Printer, FileText, Package, Ship, Plane } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import OrderBoard, {
  type OrderBoardOrder,
  type OrderBoardStatusGroup,
} from "@/components/orders/OrderBoard";

export default function BusinessOrders() {
  const { t } = useLocale();

  const statusGroups: OrderBoardStatusGroup[] = [
    {
      title: t("orders.status.purchase"),
      icon: <ShoppingCart className="w-4 h-4" />,
      color: "text-purple-600",
      items: [
        { label: t("orders.status.tempSave"), code: "BUY_TEMP" },
        { label: t("orders.status.purchaseQuote"), code: "BUY_EST" },
        { label: t("orders.status.purchasePaymentPending"), code: "BUY_PAY_WAIT" },
        { label: t("orders.status.purchasePaymentComplete"), code: "BUY_PAY_DONE" },
        { label: t("orders.status.purchasing"), code: "BUYING" },
        { label: t("orders.status.problemProduct"), code: "PROBLEM_PRODUCT" },
        { label: t("orders.status.purchaseComplete"), code: "BUY_COMPLETE" },
      ],
    },
    {
      title: t("orders.status.inOut"),
      icon: <Warehouse className="w-4 h-4" />,
      color: "text-blue-500",
      items: [
        { label: t("orders.status.centerArrivalExpected"), code: "WH_ARRIVE_EXPECTED" },
        { label: t("orders.status.localDeliveryDelay"), code: "LOCAL_DELAY" },
        { label: t("orders.status.warehouseInProgress"), code: "WH_IN_PROGRESS" },
        { label: t("orders.status.warehouseInComplete"), code: "WH_IN_DONE" },
        { label: t("orders.status.shipmentPaymentPending"), code: "SHIP_PAY_WAIT" },
        { label: t("orders.status.shipmentPending"), code: "WH_SHIP_WAIT" },
        { label: t("orders.status.shipmentComplete"), code: "WH_SHIPPED" },
        { label: t("orders.status.additionalCostPaymentPending"), code: "ADD_COST_PAY_WAIT" },
        { label: t("orders.status.additionalCostPaymentComplete"), code: "ADD_COST_PAY_DONE" },
        { label: t("orders.status.shippingProcessing"), code: "DELIVERY_IN_PROGRESS" },
        { label: t("orders.status.deliveryComplete"), code: "DELIVERY_DONE" },
      ],
    },
    {
      title: t("orders.status.error"),
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-500",
      items: [
        { label: t("orders.status.errorWarehouse"), code: "ERR_IN" },
        { label: t("orders.status.userRefundRequest"), code: "USER_REFUND_REQ" },
        { label: t("orders.status.userRefundProcessing"), code: "USER_REFUND_ING" },
        { label: t("orders.status.userRefundComplete"), code: "USER_REFUND_DONE" },
        { label: t("orders.status.platformRefundRequest"), code: "PLAT_REFUND_REQ" },
        { label: t("orders.status.platformRefundProcessing"), code: "PLAT_REFUND_ING" },
        { label: t("orders.status.platformRefundComplete"), code: "PLAT_REFUND_DONE" },
        { label: t("orders.status.finalRefundRequest"), code: "FINAL_REFUND_REQ" },
        { label: t("orders.status.finalRefundProcessing"), code: "FINAL_REFUND_ING" },
        { label: t("orders.status.finalRefundComplete"), code: "FINAL_REFUND_DONE" },
        { label: t("orders.status.orderDisposal"), code: "ORDER_DISPOSAL" },
        { label: t("orders.status.shipmentHold"), code: "HOLD" },
      ],
    },
  ];

  const orders: OrderBoardOrder[] = [
    {
      orderNo: "PA-250411-001",
      statusCode: "BUY_PAY_DONE",
      center: "Weihai",
      applicationType: t("orders.status.purchaseAgency"),
      customsClearance: "General",
      typeLabel: t("orders.status.purchaseAgency"),
      shippingMethod: t("orders.filter.shippingMethodSea"),
      isShipped: false,
      memberBadge: t("orders.status.purchaseAgency"),
      userName: "Avenue Studio",
      receiver: "Minji Kim",
      trackingCount: 6,
      warehousedCount: 3,
      qty: 28,
      totalAmount: 1845000,
      paidAmount: 1845000,
      weight: 18.2,
      krTrack: "",
      shipDate: "2026-04-09",
      rack: "A-02-14",
      warehouseStatus: t("orders.status.warehouseInProgress"),
      progressStatus: t("orders.status.purchasePaymentComplete"),
      createdAt: "2026-04-09 10:12",
      updatedAt: "2026-04-11 09:35",
      inquiryResponder: "Olivia",
      buyer: "Leo",
      adminMemo: "Supplier sent partial stock update.",
      productMemo: "Check linen quality before dispatch.",
      caution: "Fragile items - handle with care.",
      userMemo: "Please consolidate with next shipment.",
      products: [
        {
          id: "PA-001-1",
          productNo: "P-98234",
          name: "Women Linen Jacket",
          option: "Beige / M",
          trackingNo: "CN2026040912345",
          orderNo: "PA-250411-001",
          unitPrice: 42000,
          quantity: 12,
          totalPrice: 504000,
          shippingCost: 15000,
          rackNo: "A-02-14",
          prevRackNo: "",
          statusLabel: t("orders.status.purchasePaymentComplete"),
        },
        {
          id: "PA-001-2",
          productNo: "P-98235",
          name: "Wide Slacks",
          option: "Charcoal / L",
          trackingNo: "CN2026040912346",
          orderNo: "PA-250411-001",
          unitPrice: 28000,
          quantity: 16,
          totalPrice: 448000,
          shippingCost: 12000,
          rackNo: "A-02-15",
          prevRackNo: "A-02-14",
          statusLabel: t("orders.status.warehouseInProgress"),
        },
      ],
    },
    {
      orderNo: "PA-250411-002",
      statusCode: "WH_SHIPPED",
      center: "Qingdao",
      applicationType: t("orders.status.purchaseAgency"),
      customsClearance: "Express",
      typeLabel: t("orders.status.purchaseAgency"),
      shippingMethod: t("orders.filter.shippingMethodAir"),
      isShipped: true,
      memberBadge: t("orders.status.purchaseAgency"),
      userName: "Mode Archive",
      receiver: "Daniel Park",
      trackingCount: 4,
      warehousedCount: 4,
      qty: 18,
      totalAmount: 965000,
      paidAmount: 1123000,
      weight: 9.4,
      krTrack: "KR9081123345",
      shipDate: "2026-04-10",
      rack: "C-07-02",
      warehouseStatus: t("orders.status.warehouseInComplete"),
      progressStatus: t("orders.status.shipmentComplete"),
      createdAt: "2026-04-07 15:40",
      updatedAt: "2026-04-10 18:22",
      inquiryResponder: "Noah",
      buyer: "Emma",
      adminMemo: "Air cargo booked for Friday dispatch.",
      productMemo: "All items inspected and packed.",
      caution: "",
      userMemo: "Print individual SKU labels",
      products: [
        {
          id: "PA-002-1",
          productNo: "P-97110",
          name: "Ribbon Blouse",
          option: "Ivory / Free",
          trackingNo: "CN2026040723001",
          orderNo: "PA-250411-002",
          unitPrice: 23500,
          quantity: 10,
          totalPrice: 235000,
          shippingCost: 8000,
          rackNo: "C-07-02",
          prevRackNo: "C-07-01",
          statusLabel: t("orders.status.shipmentComplete"),
        },
        {
          id: "PA-002-2",
          productNo: "P-97111",
          name: "Pleated Skirt",
          option: "Black / M",
          trackingNo: "CN2026040723002",
          orderNo: "PA-250411-002",
          unitPrice: 31000,
          quantity: 8,
          totalPrice: 248000,
          shippingCost: 6000,
          rackNo: "C-07-02",
          prevRackNo: "",
          statusLabel: t("orders.status.shipmentComplete"),
        },
      ],
    },
    {
      orderNo: "PA-250411-003",
      statusCode: "FINAL_REFUND_ING",
      center: "Guangzhou",
      applicationType: t("orders.status.purchaseAgency"),
      customsClearance: "Self-clearance",
      typeLabel: t("orders.status.purchaseAgency"),
      shippingMethod: t("orders.filter.shippingMethodSeaExpress"),
      isShipped: false,
      memberBadge: t("orders.status.purchaseAgency"),
      userName: "Urban Avenue",
      receiver: "Soojin Lee",
      trackingCount: 2,
      warehousedCount: 0,
      qty: 7,
      totalAmount: 356000,
      paidAmount: 356000,
      weight: 4.1,
      krTrack: "",
      shipDate: "2026-04-08",
      rack: "HOLD-03",
      warehouseStatus: t("orders.status.error"),
      progressStatus: t("orders.status.finalRefundProcessing"),
      createdAt: "2026-04-05 11:08",
      updatedAt: "2026-04-11 08:15",
      inquiryResponder: "Sophia",
      buyer: "Mason",
      adminMemo: "Waiting for platform approval.",
      productMemo: "Defective batch - supplier notified.",
      caution: "Do NOT ship - pending refund approval.",
      userMemo: "Refund all defective pieces please.",
      products: [
        {
          id: "PA-003-1",
          productNo: "P-95880",
          name: "Knit Cardigan",
          option: "Mint / Free",
          trackingNo: "",
          orderNo: "PA-250411-003",
          unitPrice: 29000,
          quantity: 4,
          totalPrice: 116000,
          shippingCost: 0,
          rackNo: "HOLD-03",
          prevRackNo: "",
          statusLabel: t("orders.status.finalRefundProcessing"),
        },
        {
          id: "PA-003-2",
          productNo: "P-95881",
          name: "Basic Tee",
          option: "White / XL",
          trackingNo: "",
          orderNo: "PA-250411-003",
          unitPrice: 18000,
          quantity: 3,
          totalPrice: 54000,
          shippingCost: 0,
          rackNo: "HOLD-03",
          prevRackNo: "",
          statusLabel: t("orders.status.finalRefundProcessing"),
        },
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
      <div className="w-px h-10 bg-gray-300" />
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><Printer className="w-4 h-4" />{t("orders.action.hanjinWaybill")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><FileText className="w-4 h-4" />{t("orders.action.meniFormNew")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><Package className="w-4 h-4" />{t("orders.action.meniProduct")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><Ship className="w-4 h-4" />{t("orders.action.seaPyeongtaek")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><Ship className="w-4 h-4" />{t("orders.action.redfSea")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 flex items-center gap-2"><Plane className="w-4 h-4" />{t("orders.action.redfAir")}</button>
    </>
  );

  return (
    <OrderBoard
      title={t("orders.business.title")}
      defaultSelectedLabel={t("orders.business.title")}
      memberFilterLabel={t("orders.business.businessNumber")}
      memberFilterPlaceholder={t("orders.business.businessNumberPlaceholder")}
      statusGroups={statusGroups}
      orders={orders}
      actionButtons={buttons}
    />
  );
}
