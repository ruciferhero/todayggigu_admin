"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown, ChevronUp, Download, Eye, History, Minus, Plus,
  RotateCcw, Save, Search, Upload, X,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

/* ─── Public types ──────────────────────────────────────────────────────── */

export interface OrderBoardStatusItem { label: string; code: string }
export interface OrderBoardStatusGroup { title: string; icon: React.ReactNode; color: string; items: OrderBoardStatusItem[] }

export interface OrderBoardProduct {
  id: string;
  productNo: string;
  image?: string;
  name: string;
  option: string;
  trackingNo: string;
  orderNo: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  shippingCost: number;
  rackNo: string;
  prevRackNo: string;
  statusLabel: string;
}

export interface OrderBoardOrder {
  orderNo: string;
  statusCode: string;
  center: string;
  applicationType: string;
  customsClearance: string;
  typeLabel: string;
  shippingMethod: string;
  isShipped: boolean;
  memberBadge: string;
  userName: string;
  receiver: string;
  trackingCount: number;
  warehousedCount: number;
  qty: number;
  totalAmount: number;
  paidAmount: number;
  weight: number;
  krTrack: string;
  shipDate: string;
  rack: string;
  warehouseStatus: string;
  progressStatus: string;
  createdAt: string;
  updatedAt: string;
  inquiryResponder?: string;
  buyer?: string;
  adminMemo?: string;
  productMemo?: string;
  caution?: string;
  userMemo?: string;
  products: OrderBoardProduct[];
}

interface Props {
  title: string;
  defaultSelectedLabel: string;
  memberFilterLabel?: string;
  memberFilterPlaceholder?: string;
  statusGroups: OrderBoardStatusGroup[];
  orders: OrderBoardOrder[];
  actionButtons?: React.ReactNode;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function OrderBoard({
  title, defaultSelectedLabel, memberFilterLabel, memberFilterPlaceholder,
  statusGroups, orders, actionButtons,
}: Props) {
  const { t } = useLocale();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState(defaultSelectedLabel);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    () => new Set(orders[0] ? [orders[0].orderNo] : []),
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  /* derived */
  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.statusCode, (counts.get(o.statusCode) ?? 0) + 1);
    return counts;
  }, [orders]);

  const statusOptions = useMemo(
    () => statusGroups.flatMap((g) => g.items),
    [statusGroups],
  );

  const filteredOrders = selectedCode
    ? orders.filter((o) => o.statusCode === selectedCode)
    : orders;

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  /* helpers */
  const toggle = (orderNo: string) =>
    setExpandedProducts((prev) => {
      const n = new Set(prev);
      if (n.has(orderNo)) {
        n.delete(orderNo);
      } else {
        n.add(orderNo);
      }
      return n;
    });
  const toggleRow = (orderNo: string) =>
    setSelectedRowKeys((prev) =>
      prev.includes(orderNo) ? prev.filter((k) => k !== orderNo) : [...prev, orderNo],
    );
  const toggleAll = (nos: string[]) =>
    setSelectedRowKeys(
      nos.length > 0 && nos.every((n) => selectedRowKeys.includes(n)) ? [] : nos,
    );
  const clear = () => {
    setSelectedCode(null);
    setSelectedLabel(defaultSelectedLabel);
    setSelectedRowKeys([]);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedCode ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {selectedLabel} (
            {(selectedCode
              ? (statusCounts.get(selectedCode) ?? 0)
              : orders.length
            ).toLocaleString()}
            {t("orders.common.count")})
          </span>
        </div>
        {selectedCode && (
          <button
            onClick={clear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <X className="w-4 h-4" />
            {t("orders.action.viewAll")}
          </button>
        )}
      </div>

      {/* ── Status group cards ────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap items-start">
        {statusGroups.map((group) => (
          <div
            key={group.title}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow w-56 shrink-0"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <span className={group.color}>{group.icon}</span>
              <span className="text-xs font-semibold text-gray-700 truncate">{group.title}</span>
            </div>
            <div className="py-1">
              {group.items.map((item) => {
                const count = statusCounts.get(item.code) ?? 0;
                return (
                  <div
                    key={item.code}
                    onClick={() => {
                      setSelectedCode(item.code);
                      setSelectedLabel(`${group.title} > ${item.label}`);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors text-xs ${
                      selectedCode === item.code
                        ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                        : "border-l-[3px] border-l-transparent hover:bg-gray-50"
                    }`}
                  >
                    <span className={count === 0 ? "text-gray-300" : "text-gray-700"}>
                      {item.label}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[11px] font-medium ${
                        count === 0 ? "bg-gray-200 text-gray-400" : "bg-gray-900 text-white"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick action buttons ──────────────────────────────────── */}
      {actionButtons && (
        <div className="flex gap-2 flex-wrap">
          {actionButtons}
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.filter.center")}</label>
            <select className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md">
              <option>{t("orders.filter.centerAll")}</option>
              <option>{t("orders.filter.centerWeihai")}</option>
              <option>{t("orders.filter.centerQingdao")}</option>
              <option>{t("orders.filter.centerGuangzhou")}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.productType")}</label>
            <select className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md">
              <option>{t("orders.filter.typeAll")}</option>
              <option>{t("orders.filter.typeShipping")}</option>
              <option>{t("orders.filter.typePurchase")}</option>
              <option>{t("orders.filter.typeVVIC")}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.shippingMethod")}</label>
            <select className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md">
              <option>{t("orders.filter.shippingMethodAll")}</option>
              <option>{t("orders.filter.shippingMethodAir")}</option>
              <option>{t("orders.filter.shippingMethodSea")}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.shippingStatus")}</label>
            <select className="h-8 w-28 px-2 text-xs border border-gray-300 rounded-md">
              <option>{t("orders.filter.shippedAll")}</option>
              <option>{t("orders.filter.shippedAuto")}</option>
              <option>{t("orders.filter.shippedManual")}</option>
            </select>
          </div>
          {filtersExpanded && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.filter.dateRange")}</label>
                <div className="flex gap-1">
                  <input type="date" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" />
                  <input type="date" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{memberFilterLabel ?? t("orders.common.membershipCode")}</label>
                <input type="text" placeholder={memberFilterPlaceholder ?? t("orders.filter.userNamePlaceholder")} className="h-8 w-36 px-2 text-xs border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.orderNumber")}</label>
                <input type="text" placeholder={t("orders.filter.orderNoPlaceholder")} className="h-8 w-36 px-2 text-xs border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t("orders.common.trackingNumber")}</label>
                <input type="text" placeholder={t("orders.filter.trackingNoPlaceholder")} className="h-8 w-36 px-2 text-xs border border-gray-300 rounded-md" />
              </div>
            </>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={() => setFiltersExpanded((p) => !p)} className="h-8 px-3 text-xs text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 flex items-center gap-1">
              {filtersExpanded ? <><ChevronUp className="w-3.5 h-3.5" />{t("orders.action.collapse")}</> : <><ChevronDown className="w-3.5 h-3.5" />{t("orders.action.showMore")}</>}
            </button>
            <button className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"><RotateCcw className="w-3 h-3" />{t("orders.action.reset")}</button>
            <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"><Search className="w-3 h-3" />{t("orders.action.search")}</button>
          </div>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select className="h-8 px-3 text-sm border border-gray-300 rounded-md">
            <option value="">{t("orders.action.statusChangeSelect")}</option>
            {statusOptions.map((s) => (
              <option key={s.code} value={s.code}>{s.label}</option>
            ))}
          </select>
          <select className="h-8 px-3 text-sm border border-gray-300 rounded-md">
            <option value="no">{t("orders.action.smsNotSend")}</option>
            <option value="yes">{t("orders.action.smsSend")}</option>
          </select>
          <button className="h-8 px-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {t("orders.action.statusChange")}
          </button>

          
        </div>
        <div className="flex items-center gap-2">
          {selectedRowKeys.length > 0 && (
            <button className="h-8 px-3 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">
              {t("orders.action.batchProcess")} ({selectedRowKeys.length})
            </button>
          )}
          <button className="h-8 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />{t("orders.action.excelDownload")}
          </button>
          <button className="h-8 px-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />{t("orders.action.trackingBatchRegister")}
          </button>
        </div>
      </div>

      {/* ── Order table ───────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedRowKeys.includes(o.orderNo))}
                  onChange={() => toggleAll(paginatedOrders.map((o) => o.orderNo))}
                />
              </th>
              <th className="w-12 px-2 py-2 text-center text-xs font-medium text-gray-500">No</th>
              <th className="min-w-[140px] px-3 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.common.orderNumber")}
              </th>
              {/* Center / Application Classification / Customs clearance method */}
              <th className="w-[120px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.center")}</div>
                <div>{t("orders.common.applicationType")}</div>
                <div>{t("orders.common.customsClearance")}</div>
              </th>
              <th className="w-[110px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.productType")}</div>
                <div>{t("orders.common.shippingMethod")}</div>
                <div>{t("orders.common.shippingStatus")}</div>
              </th>
              <th className="w-[110px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.membershipCode")}</div>
                <div>{t("orders.common.receiver")}</div>
              </th>
              {/* Tracking/Warehoused count is HIDDEN */}
              <th className="w-[120px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.quantity")}</div>
                <div>{t("orders.common.totalAmount")}</div>
              </th>
              <th className="w-[110px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.paidAmount")}</div>
                <div>({t("orders.common.weight")})</div>
              </th>
              <th className="w-[160px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.trackingNumber")}</div>
                <div>{t("orders.common.shipDate")}/{t("orders.common.rackNumber")}</div>
              </th>
              <th className="w-[160px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.warehouseStatus")}</div>
                <div>{t("orders.common.progressStatus")}</div>
              </th>
              <th className="w-[120px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.createdAt")}</div>
                <div>{t("orders.common.updatedAt")}</div>
              </th>
              <th className="w-[100px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                <div>{t("orders.common.inquiryResponder")}</div>
                <div>{t("orders.common.buyer")}</div>
              </th>
              <th className="min-w-[260px] px-2 py-2 text-center text-xs font-medium text-gray-500 sticky right-0 bg-gray-50">
                {t("orders.common.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order, index) => (
              <React.Fragment key={order.orderNo}>
                {/* ── Main row ── */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" className="rounded border-gray-300" checked={selectedRowKeys.includes(order.orderNo)} onChange={() => toggleRow(order.orderNo)} />
                  </td>
                  <td className="px-2 py-2 text-center text-xs text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  {/* Order No + expand/view/log */}
                  <td className="px-3 py-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-blue-600">{order.orderNo}</span>
                      <button onClick={() => toggle(order.orderNo)} className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100">
                        {expandedProducts.has(order.orderNo) ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      </button>
                      <div className="flex gap-1">
                        <button className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"><Eye className="w-3 h-3" />{t("orders.action.viewOrder")}</button>
                        <button className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"><History className="w-3 h-3" />{t("orders.action.log")}</button>
                      </div>
                    </div>
                  </td>
                  {/* Center / Application / Customs */}
                  <td className="px-2 py-2 text-center">
                    <div className="text-[11px] font-medium">{order.center}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{order.applicationType}</div>
                    <span className="inline-block px-2 py-0.5 text-[10px] bg-sky-100 text-sky-700 rounded-full mt-0.5">
                      {order.customsClearance}
                    </span>
                  </td>
                  {/* Type / Method / Status */}
                  <td className="px-2 py-2 text-center">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-purple-100 text-purple-700 rounded-full">{order.typeLabel}</span>
                    <div className="text-[10px] text-gray-500 mt-0.5">{order.shippingMethod}</div>
                    <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full mt-0.5 ${order.isShipped ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {order.isShipped ? t("orders.common.shipped") : t("orders.common.notShipped")}
                    </span>
                  </td>
                  {/* Member / Receiver */}
                  <td className="px-2 py-2 text-center">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-700 rounded-full">{order.memberBadge}</span>
                    <div className="text-xs text-blue-600 underline mt-0.5">{order.userName}</div>
                    <div className="text-[11px] text-gray-500">{order.receiver}</div>
                  </td>
                  {/* Qty / Total */}
                  <td className="px-2 py-2 text-right">
                    <strong className="text-xs">{order.qty}{t("orders.common.items")}</strong>
                    <div className="text-xs text-red-500 font-bold">{order.totalAmount.toLocaleString()}{t("orders.common.won")}</div>
                  </td>
                  {/* Paid / Weight */}
                  <td className="px-2 py-2 text-right">
                    <strong className="text-xs">{order.paidAmount.toLocaleString()}{t("orders.common.won")}</strong>
                    <div className="text-[11px] text-gray-400">({order.weight}kg)</div>
                  </td>
                  {/* Tracking / Ship date / Rack */}
                  <td className="px-2 py-2">
                    {order.krTrack ? (
                      <span className="inline-block px-2 py-0.5 text-[11px] bg-green-100 text-green-700 rounded-full">{order.krTrack}</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[11px] bg-gray-100 text-gray-500 rounded-full">{t("orders.common.notRegistered")}</span>
                    )}
                    <div className="text-[10px] text-gray-500 mt-0.5">{order.shipDate} · {order.rack}</div>
                  </td>
                  {/* Warehouse / Progress */}
                  <td className="px-2 py-2">
                    <span className="inline-block px-2 py-0.5 text-[11px] bg-green-100 text-green-700 rounded-full mb-1">{order.warehouseStatus}</span>
                    <div className="text-[11px] text-gray-600">{order.progressStatus}</div>
                  </td>
                  {/* Created / Updated */}
                  <td className="px-2 py-2 text-center">
                    <div className="text-[11px]">{order.createdAt}</div>
                    <div className="text-[11px] text-gray-400">{order.updatedAt}</div>
                  </td>
                  {/* Responder / Buyer */}
                  <td className="px-2 py-2 text-center">
                    {order.inquiryResponder ? <span className="text-xs text-blue-600">{order.inquiryResponder}</span> : <span className="text-xs text-gray-400">{t("orders.common.none")}</span>}
                    <div className="text-[11px]">{order.buyer ?? "-"}</div>
                  </td>
                  {/* Actions */}
                  <td className="px-2 py-2 sticky right-0 bg-white">
                    <div className="flex flex-wrap gap-1">
                      <button className="px-2 py-1 text-[11px] bg-blue-600 text-white rounded hover:bg-blue-700">{t("orders.action.orderCopy")}</button>
                      <button className="px-2 py-1 text-[11px] border border-gray-300 rounded hover:bg-gray-50">{t("orders.action.additionalCost")}</button>
                      <button className="px-2 py-1 text-[11px] border border-gray-300 rounded hover:bg-gray-50">{t("orders.action.orderInquiry")}</button>
                      <button className="px-2 py-1 text-[11px] border border-gray-300 rounded hover:bg-gray-50">{t("orders.action.trackingRegister")}</button>
                    </div>
                  </td>
                </tr>

                {/* ── Expanded product section ── */}
                {expandedProducts.has(order.orderNo) && (
                  <tr className="border-b border-gray-100 bg-slate-50/70">
                    <td colSpan={13} className="px-6 py-4">
                      {/* Admin memo */}
                      <div className="flex items-center gap-2 text-xs mb-3">
                        <span className="font-bold min-w-[100px]">{t("orders.expanded.adminMemo")}:</span>
                        <input
                          type="text"
                          defaultValue={order.adminMemo ?? ""}
                          placeholder={t("orders.expanded.adminMemoPlaceholder")}
                          className="flex-1 h-8 px-3 text-xs border border-gray-300 rounded-md"
                        />
                        <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
                          {t("orders.action.register")}
                        </button>
                      </div>

                      {/* Toolbar above product table */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-500">{t("orders.product.trackingInput")}:</label>
                          <input type="text" placeholder={t("orders.filter.trackingNoPlaceholder")} className="h-8 w-52 px-3 text-xs border border-gray-300 rounded-md" />
                          <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1">
                            <Save className="w-3 h-3" />{t("orders.product.batchSave")}
                          </button>
                          <button className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1">
                            <Plus className="w-3 h-3" />{t("orders.product.addAdditionalService")}
                          </button>
                        </div>
                      </div>

                      {/* Product table */}
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-100 text-slate-600">
                            <tr>
                              <th className="w-8 px-2 py-2"><input type="checkbox" className="rounded border-gray-300" /></th>
                              <th className="px-3 py-2 text-left">{t("orders.product.productNumber")}</th>
                              <th className="px-3 py-2 text-left">{t("orders.product.image")}</th>
                              <th className="px-3 py-2 text-left">{t("orders.product.nameOptions")}</th>
                              <th className="px-3 py-2 text-left">{t("orders.product.trackingOrderNo")}</th>
                              <th className="px-3 py-2 text-right">{t("orders.product.unitQtyPrice")}</th>
                              <th className="px-3 py-2 text-right">{t("orders.product.shippingCosts")}</th>
                              <th className="px-3 py-2 text-left">{t("orders.product.rackPrevRack")}</th>
                              <th className="px-3 py-2 text-left">{t("orders.product.productStatus")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.products.map((p) => (
                              <tr key={p.id} className="border-t border-slate-100">
                                <td className="px-2 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                                <td className="px-3 py-3 text-blue-600 font-medium">{p.productNo}</td>
                                <td className="px-3 py-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-200 text-[10px] font-semibold text-slate-500">
                                    {p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover" /> : "IMG"}
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="font-medium text-slate-800">{p.name}</div>
                                  <div className="text-slate-500">{p.option}</div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="text-slate-700">{p.trackingNo || "-"}</div>
                                  <div className="text-slate-400">{p.orderNo}</div>
                                </td>
                                <td className="px-3 py-3 text-right">
                                  <span className="text-slate-500">{p.unitPrice.toLocaleString()}</span>
                                  <span className="text-slate-400"> × {p.quantity} = </span>
                                  <span className="font-semibold text-slate-800">{p.totalPrice.toLocaleString()}{t("orders.common.won")}</span>
                                </td>
                                <td className="px-3 py-3 text-right">{p.shippingCost.toLocaleString()}{t("orders.common.won")}</td>
                                <td className="px-3 py-3">
                                  <div>{p.rackNo}</div>
                                  {p.prevRackNo && <div className="text-slate-400">{p.prevRackNo}</div>}
                                </td>
                                <td className="px-3 py-3">
                                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700">{p.statusLabel}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Below product table: Product Memo, Caution, User Memo */}
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                          <label className="text-xs font-semibold text-gray-700 block mb-1">{t("orders.product.productMemo")}</label>
                          <input type="text" defaultValue={order.productMemo ?? ""} placeholder={t("orders.product.productMemo")} className="w-full h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2">
                          <label className="text-xs font-semibold text-orange-700 block mb-1">{t("orders.product.caution")}</label>
                          <input type="text" defaultValue={order.caution ?? ""} placeholder={t("orders.product.caution")} className="w-full h-8 px-2 text-xs border border-orange-300 rounded-md bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
                        </div>
                        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                          <label className="text-xs font-semibold text-gray-700 block mb-1">{t("orders.product.userMemo")}</label>
                          <input type="text" defaultValue={order.userMemo ?? ""} placeholder={t("orders.product.userMemo")} className="w-full h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{t("orders.common.count")}: {filteredOrders.length.toLocaleString()}</span>
        <div className="flex items-center gap-2">
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="h-8 px-2 text-sm border border-gray-300 rounded-md">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <div className="flex gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">&laquo;</button>
            <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">&raquo;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
