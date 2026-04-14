"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DepositItem {
  id: string;
  paymentMethod: string;
  userId: string;
  tr: string;
  orderCreationTime: string;
  payerName: string;
  paymentAmountKRW: number;
  amountUsedKRW: number;
  remainingAmountKRW: number;
}

// Empty data - ready for API integration
const mockData: DepositItem[] = [];

export default function DepositStatus() {
  const { t } = useLocale();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const filteredData = useMemo(() => {
    if (!searchText) return mockData;
    const lower = searchText.toLowerCase();
    return mockData.filter(
      (item) =>
        item.payerName.toLowerCase().includes(lower) ||
        item.userId.toLowerCase().includes(lower) ||
        item.tr.toLowerCase().includes(lower)
    );
  }, [searchText]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">{t("members.depositTitle")}</h2>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("members.searchDeposit")}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
            <Download size={14} />
            {t("members.export")}
          </button>
        </div>

        {/* Table */}
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-gray-600 font-medium w-36">{t("members.paymentMethod")}</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium w-24">{t("members.userId")}</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium w-36">{t("members.tr")}</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium w-44">{t("members.orderCreationTime")}</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium w-36">{t("members.payerName")}</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium w-40">{t("members.paymentAmountKRW")}</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium w-40">{t("members.amountUsedKRW")}</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium w-44">{t("members.remainingAmountKRW")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    {t("members.noData")}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">{item.paymentMethod}</td>
                    <td className="py-3 px-4">{item.userId}</td>
                    <td className="py-3 px-4">{item.tr}</td>
                    <td className="py-3 px-4">{item.orderCreationTime}</td>
                    <td className="py-3 px-4">{item.payerName}</td>
                    <td className="py-3 px-4 text-right">
                      {"\u20A9"}{item.paymentAmountKRW.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {"\u20A9"}{item.amountUsedKRW.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-bold ${
                          item.remainingAmountKRW > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {"\u20A9"}{item.remainingAmountKRW.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {t("members.showing")} {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredData.length)} {t("members.of")}{" "}
              {filteredData.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
