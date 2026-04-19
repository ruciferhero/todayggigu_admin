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
        { label: t("orders.status.tempSave"), code: "P_TEMPSAVE" },
        { label: t("orders.status.purchaseQuote"), code: "P_QUOTE" },
        { label: t("orders.status.purchasePaymentPending"), code: "P_PENDING" },
        { label: t("orders.status.purchasePaymentComplete"), code: "P_PAY_COMPLETE" },
        { label: t("orders.status.purchasing"), code: "P_AU_PURCHASING" },
        { label: t("orders.status.problemProduct"), code: "P_MA_PROBLEM" },
        { label: t("orders.status.purchaseComplete"), code: "P_PUR_COMPLETE" },
      ],
    },
    {
      title: t("orders.status.inOut"),
      icon: <Warehouse className="w-4 h-4" />,
      color: "text-blue-500",
      items: [
        { label: t("orders.status.centerArrivalExpected"), code: "WH_ARRIVE_EXPECTED" },
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
        { label: t("orders.status.shipmentHold"), code: "DEL_SHIP_HOLD" }
      ],
    },
    {
      title: t("orders.status.return"),
      icon: <Package className="w-4 h-4" />,
      color: "text-yellow-500",
      items: [
        { label: t("orders.status.returnRequest"), code: "RETURN_REQUEST" },
        { label: t("orders.status.returnPaymentPending"), code: "RETURN_PAYMENT_PENDING" },
        { label: t("orders.status.returnPaymentComplete"), code: "RETURN_PAYMENT_COMPLETE" },
        { label: t("orders.status.returnComplete"), code: "RETURN_COMPLETE" },
      ],
    },
  ];

  const allStatusItems = statusGroups.flatMap((group) => group.items);
  const centers = ["Weihai", "Qingdao", "Guangzhou"];

  const orders: OrderBoardOrder[] = allStatusItems.flatMap((item, statusIndex) => {
    const targetCount = 3 + (statusIndex % 4); // 3~6
    return Array.from({ length: targetCount }, (_, itemIndex) => {
      const seed = statusIndex * 10 + itemIndex + 1;
      const orderNo = `SA-2604-${String(statusIndex + 1).padStart(2, "0")}${String(itemIndex + 1).padStart(2, "0")}`;
      const qty = 5 + (seed % 8);
      const unitPrice = 16000 + (seed % 6) * 3000;
      const totalAmount = qty * unitPrice;
      return {
        orderNo,
        statusCode: item.code,
        center: centers[seed % centers.length],
        applicationType: t("orders.status.shippingAgency"),
        customsClearance: seed % 2 === 0 ? "General" : "Express",
        typeLabel: t("orders.status.shippingAgency"),
        shippingMethod: seed % 2 === 0 ? t("orders.filter.shippingMethodSea") : t("orders.filter.shippingMethodAir"),
        isShipped: seed % 3 === 0,
        memberBadge: t("orders.status.shippingAgency"),
        userName: `Shipping Member ${seed}`,
        receiver: `Receiver ${seed}`,
        trackingCount: 1 + (seed % 5),
        warehousedCount: 1 + (seed % 4),
        qty,
        totalAmount,
        paidAmount: totalAmount,
        weight: Number((2 + (seed % 8) * 0.8).toFixed(1)),
        krTrack: seed % 3 === 0 ? `KR66${100000 + seed}` : "",
        shipDate: `2026-04-${String(10 + (seed % 15)).padStart(2, "0")}`,
        rack: `SA-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 20) + 1).padStart(2, "0")}`,
        warehouseStatus: t("orders.status.warehouseInProgress"),
        progressStatus: item.label,
        createdAt: `2026-04-${String(6 + (seed % 10)).padStart(2, "0")} 11:${String((seed * 5) % 60).padStart(2, "0")}`,
        updatedAt: `2026-04-${String(8 + (seed % 10)).padStart(2, "0")} 16:${String((seed * 7) % 60).padStart(2, "0")}`,
        inquiryResponder: "Auto",
        buyer: "System",
        adminMemo: `Shipping sample: ${item.label}`,
        productMemo: "Auto-generated data",
        caution: seed % 6 === 0 ? "Re-check packaging status" : "",
        userMemo: "Generated for status count testing",
        products: [
          { id: `${orderNo}-1`, productNo: `SP-${60000 + seed}`, name: `Shipping Item A-${seed}`, option: "Default / Mixed", trackingNo: `CN26${5000000 + seed}`, orderNo, unitPrice, quantity: Math.max(1, qty - 2), totalPrice: Math.max(1, qty - 2) * unitPrice, shippingCost: 7000, rackNo: `SA-${String((seed % 12) + 1).padStart(2, "0")}`, prevRackNo: "", statusLabel: item.label, productMemo: "Auto-generated data", caution: seed % 6 === 0 ? "Re-check packaging status" : "", userMemo: "Generated for status count testing" },
          { id: `${orderNo}-2`, productNo: `SP-${60100 + seed}`, name: `Shipping Item B-${seed}`, option: "Default / Box", trackingNo: `CN26${6000000 + seed}`, orderNo, unitPrice: unitPrice - 2000, quantity: 2, totalPrice: (unitPrice - 2000) * 2, shippingCost: 5000, rackNo: `SA-${String((seed % 12) + 1).padStart(2, "0")}`, prevRackNo: `SA-${String(((seed + 1) % 12) + 1).padStart(2, "0")}`, statusLabel: item.label, productMemo: `Line 2 · ${orderNo}`, caution: "", userMemo: "Generated for status count testing" },
        ],
      };
    });
  });

  const buttons = (
    <>
      <button type="button" data-inbound-scan className="h-10 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center gap-2"><ScanBarcode className="w-4 h-4" />{t("orders.action.warehouseScan")}</button>
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
