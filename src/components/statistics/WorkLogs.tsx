"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { ClipboardList, Search, Download } from "lucide-react";

interface WorkerLogData {
  key: string;
  no: number;
  orderNumber: string;
  memberNamePostOffice: string;
  recipientName: string;
  waybillNumber: string;
  packagingDate: string;
  workerName: string;
  shippingDate: string;
  note: string;
}

const columnKeys: (keyof WorkerLogData)[] = [
  "no", "orderNumber", "memberNamePostOffice", "recipientName",
  "waybillNumber", "packagingDate", "workerName", "shippingDate", "note",
];

export default function WorkLogs() {
  const { t } = useLocale();
  const [selectedId, setSelectedId] = useState("ID");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [operationLog, setOperationLog] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [waybillNumber, setWaybillNumber] = useState("");
  const [workerNameFilter, setWorkerNameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Empty data arrays for API integration
  const workerLogData: WorkerLogData[] = [];
  const totalCount = 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSearch = () => {
    console.log("Search clicked");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">{t("statistics.workerLog.title")}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-20"
            >
              <option value="ID">ID</option>
            </select>
            <input
              type="text"
              placeholder={t("statistics.workerLog.trackingNumber")}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <input
              type="text"
              placeholder={t("statistics.workerLog.orderNumber")}
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <input
              type="text"
              placeholder={t("statistics.workerLog.operationLog")}
              value={operationLog}
              onChange={(e) => setOperationLog(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <input
              type="text"
              placeholder={t("statistics.workerLog.workerName")}
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <input
              type="text"
              placeholder={t("statistics.workerLog.recipientName")}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <input
              type="text"
              placeholder={t("statistics.workerLog.waybillNumber")}
              value={waybillNumber}
              onChange={(e) => setWaybillNumber(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <input
              type="text"
              placeholder={t("statistics.workerLog.workerName")}
              value={workerNameFilter}
              onChange={(e) => setWorkerNameFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              {t("statistics.common.search")}
            </button>
          </div>

          {/* Table */}
          <div className="app-table-wrap">
            <table className="app-table min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  {columnKeys.map((col) => (
                    <th
                      key={col}
                      className={`border border-gray-300 px-3 py-2 font-medium whitespace-nowrap ${
                        col === "no" ? "min-w-[60px] text-center" :
                        col === "memberNamePostOffice" ? "min-w-[200px] text-left" :
                        col === "packagingDate" ? "min-w-[180px] text-left" :
                        col === "waybillNumber" ? "min-w-[150px] text-left" :
                        col === "note" ? "min-w-[100px] text-left" :
                        "min-w-[120px] text-left"
                      }`}
                    >
                      {col === "note" ? "-" : t(`statistics.workerLog.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workerLogData.length === 0 ? (
                  <tr>
                    <td colSpan={columnKeys.length} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                      {t("statistics.common.noData")}
                    </td>
                  </tr>
                ) : (
                  workerLogData.map((row) => (
                    <tr key={row.key}>
                      {columnKeys.map((col) => (
                        <td
                          key={col}
                          className={`border border-gray-300 px-3 py-2 ${col === "no" ? "text-center" : ""}`}
                        >
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>total count: {totalCount} / page {currentPage} of total {totalPages} page</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                {t("statistics.common.previous")}
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{currentPage}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                {t("statistics.common.next")}
              </button>
              <select
                value={pageSize}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                onChange={() => {}}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
