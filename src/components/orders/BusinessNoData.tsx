"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  ShoppingCart,
  X,
  Search,
  RotateCcw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface StatusItem {
  label: string;
  count: number;
  code: string;
}

interface StatusGroup {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: StatusItem[];
}

export default function BusinessNoData() {
  const { t } = useLocale();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState(t("orders.noData.title"));
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // NoData status groups - general members only
  const STATUS_GROUPS: StatusGroup[] = useMemo(
    () => [
      {
        title: t("orders.noData.generalMember"),
        icon: <ShoppingCart className="w-4 h-4" />,
        color: "text-blue-500",
        items: [
          { label: t("orders.noData.unmatched"), count: 0, code: "UNMATCHED" },
          { label: t("orders.noData.matched"), count: 0, code: "MATCHED" },
          { label: t("orders.noData.unlinked"), count: 0, code: "UNLINKED" },
        ],
      },
    ],
    [t]
  );

  const totalCount = STATUS_GROUPS.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.count, 0),
    0
  );

  const getSelectedCount = () => {
    if (!selectedCode) return totalCount;
    const found = STATUS_GROUPS.flatMap((g) => g.items).find((i) => i.code === selectedCode);
    return found?.count ?? totalCount;
  };

  const handleStatusClick = (groupTitle: string, item: StatusItem) => {
    setSelectedCode(item.code);
    setSelectedLabel(`${groupTitle} > ${item.label}`);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setSelectedCode(null);
    setSelectedLabel(t("orders.noData.title"));
    setSelectedRowKeys([]);
    setCurrentPage(1);
  };

  const orders: any[] = [];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{t("orders.noData.title")}</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedCode ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {selectedLabel} ({getSelectedCount().toLocaleString()}
            {t("orders.common.count")})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4" />
            {t("orders.action.refresh")}
          </button>
          {selectedCode && (
            <button
              onClick={handleClearFilter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <X className="w-4 h-4" />
              {t("orders.action.viewAll")}
            </button>
          )}
        </div>
      </div>

      {/* Status Group Cards */}
      <div className="grid grid-cols-3 gap-3">
        {STATUS_GROUPS.map((group) => (
          <div
            key={group.title}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow col-span-1"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <span className={group.color}>{group.icon}</span>
              <span className="text-xs font-semibold text-gray-700 truncate">{group.title}</span>
            </div>
            <div className="py-1">
              {group.items.map((item) => (
                <div
                  key={item.code}
                  onClick={() => handleStatusClick(group.title, item)}
                  className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors text-xs ${
                    selectedCode === item.code
                      ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                      : "border-l-[3px] border-l-transparent hover:bg-gray-50"
                  }`}
                >
                  <span className={item.count === 0 ? "text-gray-300" : "text-gray-700"}>
                    {item.label}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[11px] font-medium ${
                      item.count === 0 ? "bg-gray-200 text-gray-400" : "bg-gray-900 text-white"
                    }`}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("orders.common.membershipCode")}
              </label>
              <input
                type="text"
                placeholder={t("orders.filter.userNamePlaceholder")}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("orders.common.trackingNumber")}
              </label>
              <input
                type="text"
                placeholder={t("orders.filter.trackingNoPlaceholder")}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("orders.filter.dateRange")}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                {t("orders.action.reset")}
              </button>
              <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                {t("orders.action.search")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="flex items-center justify-end">
        <button className="h-8 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          {t("orders.action.excelDownload")}
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-3 py-2">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="w-12 px-2 py-2 text-center text-xs font-medium text-gray-500">No</th>
              <th className="min-w-[120px] px-3 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.common.trackingNumber")}
              </th>
              <th className="w-[100px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.noData.productImage")}
              </th>
              <th className="w-[120px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.common.membershipCode")}
              </th>
              <th className="w-[100px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.noData.matchStatus")}
              </th>
              <th className="w-[120px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.common.createdAt")}
              </th>
              <th className="w-[100px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.common.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center text-gray-400">
                  {t("page.underConstruction")}
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-2 py-2 text-center text-xs text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-3 py-2 text-center text-xs font-semibold text-blue-600">
                    {order.trackingNumber}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded mx-auto" />
                  </td>
                  <td className="px-2 py-2 text-center text-xs">{order.memberCode}</td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] rounded-full ${
                        order.matchStatus === "matched"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {order.matchStatus === "matched" ? (
                        <span className="flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" />
                          {t("orders.noData.matched")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <XCircle className="w-3 h-3" />
                          {t("orders.noData.unmatched")}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center text-[11px]">{order.createdAt}</td>
                  <td className="px-2 py-2 text-center">
                    <button className="px-2 py-1 text-[11px] border border-gray-300 rounded hover:bg-gray-50 transition flex items-center gap-0.5 mx-auto">
                      <Eye className="w-3 h-3" />
                      {t("orders.action.viewOrder")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {t("orders.common.count")}: {orders.length.toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 px-2 text-sm border border-gray-300 rounded-md"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              &laquo;
            </button>
            <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
