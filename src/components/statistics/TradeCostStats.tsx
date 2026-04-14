"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { TrendingUp, Search, Download } from "lucide-react";

interface TradeCostSummary {
  applicationType: string;
  chibaYonggun1: number;
  chibayong1: number;
  chibaYonggun2: number;
  chiba2: number;
  chibaYonggun3: number;
  pieceSet3: number;
  totalAmount: number;
}

interface TradeCostDetail {
  key: string;
  no: number;
  tradeNumber: string;
  applicationType: string;
  endDate: string;
  memberName: string;
  mailboxNumber: string;
  firstCost: string;
  secondaryCost: string;
  thirdCost: string;
}

export default function TradeCostStats() {
  const { t } = useLocale();
  const [selectedDays, setSelectedDays] = useState("30");
  const [selectedItem, setSelectedItem] = useState("all");
  const [startDate, setStartDate] = useState("2025-02-20");
  const [endDate, setEndDate] = useState("2025-02-20");
  const [currentPage, setCurrentPage] = useState(1);

  // Empty data arrays for API integration
  const summaryData: TradeCostSummary[] = [];
  const detailData: TradeCostDetail[] = [];

  const summaryHeaders = [
    "applicationType", "chibaYonggun1", "chibayong1", "chibaYonggun2",
    "chiba2", "chibaYonggun3", "pieceSet3", "totalAmount",
  ];

  const detailHeaders = [
    "no", "tradeNumber", "applicationType", "endDate",
    "memberName", "mailboxNumber", "firstCost", "secondaryCost", "thirdCost",
  ];

  const handleSearch = () => {
    console.log("Search clicked");
  };

  const handleExcelDownload = () => {
    console.log("Excel download clicked");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">{t("statistics.tradeCost.title")}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="90">90</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            />
            <span className="text-sm">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            />
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
            >
              <option value="all">{t("statistics.tradeCost.select")}</option>
            </select>
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              {t("statistics.common.search")}
            </button>
            <button
              onClick={handleExcelDownload}
              className="inline-flex items-center gap-1.5 bg-green-500 text-white px-4 py-1.5 rounded-md text-sm hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t("statistics.taxSettlement.excelDownload")}
            </button>
          </div>

          {/* Summary Table */}
          <div className="app-table-wrap">
            <table className="app-table min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  {summaryHeaders.map((h) => (
                    <th
                      key={h}
                      className={`border border-gray-300 px-3 py-2 font-medium min-w-[120px] ${
                        h === "applicationType" ? "text-left sticky left-0 bg-gray-50 min-w-[200px]" : "text-center"
                      }`}
                    >
                      {t(`statistics.tradeCost.${h}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                      {t("statistics.common.noData")}
                    </td>
                  </tr>
                ) : (
                  summaryData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="sticky left-0 z-[1]">
                        {row.applicationType}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{row.chibaYonggun1}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{row.chibayong1}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{row.chibaYonggun2}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{row.chiba2}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{row.chibaYonggun3}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{row.pieceSet3}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{row.totalAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Detail Table */}
          <div>
            <h3 className="text-base font-semibold mb-4">{t("statistics.tradeCost.detailList")}</h3>
            <div className="app-table-wrap">
              <table className="app-table min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {detailHeaders.map((h) => (
                      <th
                        key={h}
                        className={`border border-gray-300 px-3 py-2 font-medium min-w-[120px] ${
                          ["firstCost", "secondaryCost", "thirdCost"].includes(h) ? "text-right" : h === "no" ? "text-center" : "text-left"
                        }`}
                      >
                        {t(`statistics.tradeCost.${h}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detailData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                        {t("statistics.tradeCost.noData")}
                      </td>
                    </tr>
                  ) : (
                    detailData.map((row) => (
                      <tr key={row.key}>
                        <td className="border border-gray-300 px-3 py-2 text-center">{row.no}</td>
                        <td className="border border-gray-300 px-3 py-2">{row.tradeNumber}</td>
                        <td className="border border-gray-300 px-3 py-2">{row.applicationType}</td>
                        <td className="border border-gray-300 px-3 py-2">{row.endDate}</td>
                        <td className="border border-gray-300 px-3 py-2">{row.memberName}</td>
                        <td className="border border-gray-300 px-3 py-2">{row.mailboxNumber}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{row.firstCost}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{row.secondaryCost}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{row.thirdCost}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>total count: 0 / page {currentPage} / total 1</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  {t("statistics.common.previous")}
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  {t("statistics.common.next")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
