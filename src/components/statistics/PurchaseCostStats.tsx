"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { ShoppingBag, Search, Download } from "lucide-react";

interface PurchaseCostSummary {
  key: string;
  costItems: string;
  totalWon: string;
  yuanAmount: string;
}

interface PurchaseCostData {
  key: string;
  no: number;
  purchaseCompletionDate: string;
  orderNumber: string;
  transportationMethod: string;
  productPurchaseCost: string;
  localShippingFee: string;
  purchaseFee: string;
  additionalCost: string;
  excessCostOfItems: string;
  productPurchaseCostPercent: string;
  localShippingFeePercent: string;
  purchaseFeePercent: string;
  additionalCostPercent: string;
  excessCostOfItemsPercent: string;
}

export default function PurchaseCostStats() {
  const { t } = useLocale();
  const [startDate, setStartDate] = useState("2025-02-01");
  const [endDate, setEndDate] = useState("2025-02-20");
  const [selectedYear, setSelectedYear] = useState("22");
  const [selectedCenter, setSelectedCenter] = useState("all");

  // Empty data arrays for API integration
  const summaryTableData: PurchaseCostSummary[] = [];
  const purchaseCostData: PurchaseCostData[] = [];

  const detailHeaders: { key: keyof PurchaseCostData; align: string }[] = [
    { key: "no", align: "text-center" },
    { key: "purchaseCompletionDate", align: "text-left" },
    { key: "orderNumber", align: "text-left" },
    { key: "transportationMethod", align: "text-left" },
    { key: "productPurchaseCost", align: "text-right" },
    { key: "localShippingFee", align: "text-right" },
    { key: "purchaseFee", align: "text-right" },
    { key: "additionalCost", align: "text-right" },
    { key: "excessCostOfItems", align: "text-right" },
    { key: "productPurchaseCostPercent", align: "text-right" },
    { key: "localShippingFeePercent", align: "text-right" },
    { key: "purchaseFeePercent", align: "text-right" },
    { key: "additionalCostPercent", align: "text-right" },
    { key: "excessCostOfItemsPercent", align: "text-right" },
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
        <ShoppingBag className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">{t("statistics.purchaseCost.title")}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              <option value="22">22</option>
              <option value="23">23</option>
              <option value="24">24</option>
              <option value="25">25</option>
            </select>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-28"
            >
              <option value="all">{t("statistics.orderStatistics.all")}</option>
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
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium min-w-[200px]">
                    {t("statistics.purchaseCost.costItems")}
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-medium min-w-[150px]">
                    {t("statistics.purchaseCost.totalWon")}
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-medium min-w-[150px]">
                    {t("statistics.purchaseCost.yuanAmount")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryTableData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                      {t("statistics.common.noData")}
                    </td>
                  </tr>
                ) : (
                  summaryTableData.map((row) => (
                    <tr key={row.key}>
                      <td className="border border-gray-300 px-3 py-2">{row.costItems}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{row.totalWon}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{row.yuanAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Detail Table */}
          <div className="app-table-wrap">
            <table className="app-table min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  {detailHeaders.map(({ key, align }) => (
                    <th
                      key={key}
                      className={`border border-gray-300 px-3 py-2 font-medium min-w-[120px] ${align} ${
                        key === "no" ? "min-w-[60px]" : key === "transportationMethod" ? "min-w-[200px]" : ""
                      }`}
                    >
                      {t(`statistics.purchaseCost.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchaseCostData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                      {t("statistics.common.noData")}
                    </td>
                  </tr>
                ) : (
                  purchaseCostData.map((row) => (
                    <tr key={row.key}>
                      {detailHeaders.map(({ key, align }) => (
                        <td key={key} className={`border border-gray-300 px-3 py-2 ${align}`}>
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
