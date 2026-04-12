"use client";

import { AlertTriangle, Truck, Warehouse, ScanBarcode, AlertCircle, PackageCheck, Printer, FileText, Package, Ship, Plane } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import OrderBoard, { type OrderBoardOrder, type OrderBoardStatusGroup } from "@/components/orders/OrderBoard";

export default function ShippingAgencyOrders() {
  const { t } = useLocale();

  const statusGroups: OrderBoardStatusGroup[] = [
    {
      title: t("orders.status.purchase"),
      icon: <Truck className="w-4 h-4" />,
      color: "text-teal-600",
      items: [
        { label: t("orders.status.tempSave"), code: "DEL_TEMP" },
        { label: t("orders.status.purchaseQuote"), code: "DEL_EST" },
        { label: t("orders.status.purchasePaymentPending"), code: "DEL_PAY_WAIT" },
        { label: t("orders.status.purchasePaymentComplete"), code: "DEL_PAY_DONE" },
        { label: t("orders.status.purchasing"), code: "DEL_BUYING" },
        { label: t("orders.status.problemProduct"), code: "DEL_PROBLEM" },
        { label: t("orders.status.purchaseComplete"), code: "DEL_COMPLETE" },
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
        { label: t("orders.status.shipmentPaymentComplete"), code: "SHIP_PAY_DONE" },
        { label: t("orders.status.shipmentPending"), code: "WH_SHIP_WAIT" },
        { label: t("orders.status.shipmentComplete"), code: "WH_SHIPPED" },
        { label: t("orders.status.additionalCostPaymentPending"), code: "ADD_COST_PAY_WAIT" },
        { label: t("orders.status.additionalCostPaymentComplete"), code: "ADD_COST_PAY_DONE" },
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
      orderNo: "SA-250411-401", statusCode: "WH_IN_DONE", center: "Weihai", applicationType: t("orders.status.shippingAgency"), customsClearance: "General",
      typeLabel: t("orders.status.shippingAgency"), shippingMethod: t("orders.filter.shippingMethodSea"), isShipped: false, memberBadge: t("orders.status.shippingAgency"),
      userName: "Harbor Market", receiver: "Yeji Lim", trackingCount: 5, warehousedCount: 5, qty: 20, totalAmount: 680000, paidAmount: 680000, weight: 12.4,
      krTrack: "", shipDate: "2026-04-10", rack: "SA-02-05",
      warehouseStatus: t("orders.status.warehouseInComplete"), progressStatus: t("orders.status.warehouseInComplete"),
      createdAt: "2026-04-08 14:20", updatedAt: "2026-04-11 09:15", inquiryResponder: "Harper", buyer: "Lucas",
      adminMemo: "All items received and inspected.",
      productMemo: "Fabric items - check for moisture.", caution: "", userMemo: "Consolidate with next batch.",
      products: [
        { id: "SA-401-1", productNo: "SP-60101", name: "Home Fabric Set", option: "Mixed / 12 pcs", trackingNo: "CN2026040814001", orderNo: "SA-250411-401", unitPrice: 18000, quantity: 12, totalPrice: 216000, shippingCost: 12000, rackNo: "SA-02-05", prevRackNo: "", statusLabel: t("orders.status.warehouseInComplete") },
        { id: "SA-401-2", productNo: "SP-60102", name: "Cotton Towel Bundle", option: "White / 8 pcs", trackingNo: "CN2026040814002", orderNo: "SA-250411-401", unitPrice: 14500, quantity: 8, totalPrice: 116000, shippingCost: 8000, rackNo: "SA-02-05", prevRackNo: "SA-02-04", statusLabel: t("orders.status.warehouseInComplete") },
      ],
    },
    {
      orderNo: "SA-250411-402", statusCode: "WH_SHIPPED", center: "Qingdao", applicationType: t("orders.status.shippingAgency"), customsClearance: "Express",
      typeLabel: t("orders.status.shippingAgency"), shippingMethod: t("orders.filter.shippingMethodAir"), isShipped: true, memberBadge: t("orders.status.shippingAgency"),
      userName: "River Goods", receiver: "Sunwoo Bae", trackingCount: 9, warehousedCount: 9, qty: 31, totalAmount: 1194000, paidAmount: 1289000, weight: 15.3,
      krTrack: "KR5502998712", shipDate: "2026-04-10", rack: "SA-04-07",
      warehouseStatus: t("orders.status.shipmentComplete"), progressStatus: t("orders.status.shipmentComplete"),
      createdAt: "2026-04-07 17:06", updatedAt: "2026-04-10 19:22", inquiryResponder: "Evelyn", buyer: "Benjamin",
      adminMemo: "Dispatched via air cargo.",
      productMemo: "Outer carton reinforcement done.", caution: "", userMemo: "Print individual labels.",
      products: [
        { id: "SA-402-1", productNo: "SP-60201", name: "Storage Basket", option: "Natural / Large", trackingNo: "CN2026040717001", orderNo: "SA-250411-402", unitPrice: 21000, quantity: 15, totalPrice: 315000, shippingCost: 15000, rackNo: "SA-04-07", prevRackNo: "", statusLabel: t("orders.status.shipmentComplete") },
        { id: "SA-402-2", productNo: "SP-60202", name: "Table Runner", option: "Gray / 180cm", trackingNo: "CN2026040717002", orderNo: "SA-250411-402", unitPrice: 14500, quantity: 16, totalPrice: 232000, shippingCost: 8000, rackNo: "SA-04-07", prevRackNo: "SA-04-06", statusLabel: t("orders.status.shipmentComplete") },
      ],
    },
  ];

  const buttons = (
    <>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2"><ScanBarcode className="w-4 h-4" />{t("orders.action.warehouseScan")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-red-500 to-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("orders.action.issueProduct")}</button>
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
      title={t("menu.shippingAgency")}
      defaultSelectedLabel={t("menu.shippingAgency")}
      statusGroups={statusGroups}
      orders={orders}
      actionButtons={buttons}
    />
  );
}
