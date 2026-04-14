"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SMSHistoryRecord {
  id: string;
  no: number;
  recipient: string;
  sendDate: string;
  message: string;
  type: string;
  status: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SendingHistory() {
  const { t } = useLocale();

  // Data
  const [records] = useState<SMSHistoryRecord[]>([]);

  // Search filters
  const [filterDate, setFilterDate] = useState("");
  const [filterPhone, setFilterPhone] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handleSearch = () => {
    console.log("Search:", { filterDate, filterPhone });
  };

  const handleReset = () => {
    setFilterDate("");
    setFilterPhone("");
  };

  // Pagination
  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const paginatedRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Search Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("sms.history.date")}
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder={t("sms.history.datePlaceholder")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("sms.history.phone")}
          </label>
          <input
            type="text"
            value={filterPhone}
            onChange={(e) => setFilterPhone(e.target.value)}
            placeholder={t("sms.history.phonePlaceholder")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>
        <button
          onClick={handleSearch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <Search className="w-4 h-4" />
          {t("sms.history.search")}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          {t("sms.history.reset")}
        </button>
      </div>

      {/* Table */}
      <div className="app-table-wrap">
        <table className="app-table">
          <thead>
            <tr>
              <th className="px-4 py-3 text-center w-16">No</th>
              <th className="px-4 py-3 text-left w-60">
                {t("sms.history.sendInfo")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("sms.history.message")}
              </th>
              <th className="px-4 py-3 text-center w-24">
                {t("sms.history.type")}
              </th>
              <th className="px-4 py-3 text-center w-32">
                {t("sms.history.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {t("sms.history.noData")}
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-center">{record.no}</td>
                  <td className="px-4 py-3">
                    <div>{record.recipient}</div>
                    <div className="text-xs text-gray-400">
                      {record.sendDate}
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate max-w-md">
                    {record.message}
                  </td>
                  <td className="px-4 py-3 text-center">{record.type}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Page Size */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          {records.length} {t("sms.history.totalItems")}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {t("sms.history.pageSize")}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
