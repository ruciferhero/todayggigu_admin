"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PointRecord {
  id: string;
  no: number;
  chargingPoint: number;
  location: string;
  date: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SMSPoints() {
  const { t } = useLocale();

  // Filter state
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );

  // Data
  const [records] = useState<PointRecord[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handleSearch = () => {
    console.log("Search:", year, month);
  };

  // Pagination
  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const paginatedRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Generate year options (current year - 2 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) =>
    String(currentYear - i)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-700">
          {t("sms.points.filter.year")}
        </span>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span className="text-sm font-medium text-gray-700">
          {t("sms.points.filter.month")}
        </span>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
        >
          {Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, "0");
            return (
              <option key={m} value={m}>
                {m}
              </option>
            );
          })}
        </select>
        <button
          onClick={handleSearch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <Search className="w-4 h-4" />
          {t("sms.points.search")}
        </button>
      </div>

      {/* Table */}
      <div className="app-table-wrap">
        <table className="app-table">
          <thead>
            <tr>
              <th className="px-4 py-3 text-center w-20">No</th>
              <th className="px-4 py-3 text-center w-40">
                {t("sms.points.table.chargingPoint")}
              </th>
              <th className="px-4 py-3 text-center">
                {t("sms.points.table.location")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("sms.points.table.date")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {t("sms.points.noData")}
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-center">{record.no}</td>
                  <td className="px-4 py-3 text-center">
                    {record.chargingPoint.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">{record.location}</td>
                  <td className="px-4 py-3">{record.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          {records.length} {t("sms.points.totalItems")}
        </div>
        <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
