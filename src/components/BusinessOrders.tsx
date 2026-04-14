"use client";

import { AlertTriangle, ShoppingCart, Warehouse, ScanBarcode, Scissors, AlertCircle, ClipboardList, PackageCheck, Printer, FileText, Package, Ship, Plane, Upload } from "lucide-react";
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
        { label: t("orders.status.paymentPending"), code: "PAY_WAIT" },
        { label: t("orders.status.paymentComplete"), code: "PAY_DONE" },
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
        { label: t("orders.status.orderCancellation"), code: "ORDER_CANCEL" },
        { label: t("orders.status.platformRefundRequest"), code: "PLAT_REFUND_REQ" },
        { label: t("orders.status.platformRefundProcessing"), code: "PLAT_REFUND_ING" },
        { label: t("orders.status.platformRefundComplete"), code: "PLAT_REFUND_DONE" },
        { label: t("orders.status.customerReturnProcessing"), code: "CUSTOMER_RETURN_ING" },
        { label: t("orders.status.customerReturnComplete"), code: "CUSTOMER_RETURN_DONE" },
        { label: t("orders.status.shipmentHold"), code: "HOLD" },
      ],
    },
  ];

  const allStatusItems = statusGroups.flatMap((group) => group.items);
  const centers = ["Weihai", "Qingdao", "Guangzhou"];
  const responders = ["Olivia", "Noah", "Sophia", "Emma"];
  const buyers = ["Leo", "Mason", "Aiden", "Lucas"];

  const orders: OrderBoardOrder[] = allStatusItems.flatMap((item, statusIndex) => {
    const targetCount = 3 + (statusIndex % 4); // 3~6

    return Array.from({ length: targetCount }, (_, itemIndex) => {
      const seed = statusIndex * 10 + itemIndex + 1;
      const orderNo = `PA-2604-${String(statusIndex + 1).padStart(2, "0")}${String(itemIndex + 1).padStart(2, "0")}`;
      const qty = 6 + (seed % 7);
      const unitPrice = 18000 + (seed % 5) * 4000;
      const totalAmount = qty * unitPrice;

      return {
        orderNo,
        statusCode: item.code,
        center: centers[seed % centers.length],
        applicationType: t("orders.status.purchaseAgency"),
        customsClearance: seed % 2 === 0 ? "General" : "Express",
        typeLabel: t("orders.status.purchaseAgency"),
        shippingMethod: seed % 2 === 0 ? t("orders.filter.shippingMethodSea") : t("orders.filter.shippingMethodAir"),
        isShipped: seed % 3 === 0,
        memberBadge: t("orders.status.purchaseAgency"),
        userName: `Member ${seed}`,
        receiver: `Receiver ${seed}`,
        trackingCount: 1 + (seed % 4),
        warehousedCount: 1 + (seed % 3),
        qty,
        totalAmount,
        paidAmount: totalAmount,
        weight: Number((2.5 + (seed % 6) * 0.8).toFixed(1)),
        krTrack: seed % 3 === 0 ? `KR90${100000 + seed}` : "",
        shipDate: `2026-04-${String(10 + (seed % 15)).padStart(2, "0")}`,
        rack: `R-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 20) + 1).padStart(2, "0")}`,
        warehouseStatus: t("orders.status.warehouseInProgress"),
        progressStatus: item.label,
        createdAt: `2026-04-${String(5 + (seed % 12)).padStart(2, "0")} 10:${String((seed * 7) % 60).padStart(2, "0")}`,
        updatedAt: `2026-04-${String(8 + (seed % 12)).padStart(2, "0")} 16:${String((seed * 9) % 60).padStart(2, "0")}`,
        inquiryResponder: responders[seed % responders.length],
        buyer: buyers[seed % buyers.length],
        adminMemo: `Status sample for ${item.label}`,
        productMemo: "Auto-generated mock data",
        caution: seed % 5 === 0 ? "Check package condition" : "",
        userMemo: "Please process quickly.",
        products: [
          {
            id: `${orderNo}-1`,
            productNo: `P-${98000 + seed}`,
            name: `Sample Product A-${seed}`,
            option: "Default / M",
            trackingNo: `CN26${String(1000000 + seed)}`,
            orderNo,
            unitPrice,
            quantity: Math.max(1, qty - 2),
            totalPrice: Math.max(1, qty - 2) * unitPrice,
            shippingCost: 8000 + (seed % 4) * 2000,
            rackNo: `R-${String((seed % 12) + 1).padStart(2, "0")}`,
            prevRackNo: "",
            statusLabel: item.label,
            productMemo: "Auto-generated mock data",
            caution: seed % 5 === 0 ? "Check package condition" : "",
            userMemo: "Please process quickly.",
          },
          {
            id: `${orderNo}-2`,
            productNo: `P-${98100 + seed}`,
            name: `Sample Product B-${seed}`,
            option: "Default / L",
            trackingNo: `CN26${String(2000000 + seed)}`,
            orderNo,
            unitPrice: unitPrice - 3000,
            quantity: 2,
            totalPrice: (unitPrice - 3000) * 2,
            shippingCost: 5000,
            rackNo: `R-${String((seed % 12) + 1).padStart(2, "0")}`,
            prevRackNo: `R-${String(((seed + 1) % 12) + 1).padStart(2, "0")}`,
            statusLabel: item.label,
            productMemo: `Line memo · ${orderNo}`,
            caution: "",
            userMemo: "Secondary line note",
          },
        ],
      };
    });
  });

  const buttons = (
    <div className="flex justify-between w-screen">
      <div className="flex gap-2">
      <button type="button" data-inbound-scan className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><ScanBarcode className="w-4 h-4" />{t("orders.action.warehouseScan")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-teal-500 to-teal-700 flex items-center gap-2"><Scissors className="w-4 h-4" />{t("orders.action.packingSplit")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-red-500 to-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{t("orders.action.issueProduct")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-purple-500 to-purple-700 flex items-center gap-2"><ClipboardList className="w-4 h-4" />{t("orders.action.workList")}</button>
      <button className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-green-500 to-green-700 flex items-center gap-2"><PackageCheck className="w-4 h-4" />{t("orders.action.outboundList")}</button>
      </div>
      {/* <div className="w-px h-10 bg-gray-300" /> */}
      <div className="flex gap-2">
        <button className="h-10 px-4 rounded-lg text-sm font-bold text-gray-500 border border-gray-500 bg-white hover:text-white  hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Printer className="w-4 h-4" />{t("orders.action.trackingPrint")}</button>
        <button className="h-10 px-4 rounded-lg text-sm font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Printer className="w-4 h-4" />{t("orders.action.hanjinWaybill")}</button>
        <button className="h-10 px-4 rounded-lg text-sm font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><FileText className="w-4 h-4" />{t("orders.action.meniFormNew")}</button>
        <button className="h-10 px-4 rounded-lg text-sm font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Package className="w-4 h-4" />{t("orders.action.meniProduct")}</button>
        <button className="h-10 px-4 rounded-lg text-sm font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Ship className="w-4 h-4" />{t("orders.action.seaPyeongtaek")}</button>
        <button className="h-10 px-4 rounded-lg text-sm font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Ship className="w-4 h-4" />{t("orders.action.redfSea")}</button>
        <button className="h-10 px-4 rounded-lg text-sm font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Plane className="w-4 h-4" />{t("orders.action.redfAir")}</button>
        <button className="h-10 px-4 rounded-lg text-sm font-bold text-gray-500 border border-gray-500 bg-white hover:text-white hover:border-blue-500 hover:bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2 "><Upload className="w-4 h-4" />{t("orders.action.trackingLoad")}</button>
      </div>
    </div>
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
      purchaseAgencyRowActions
    />
  );
}
