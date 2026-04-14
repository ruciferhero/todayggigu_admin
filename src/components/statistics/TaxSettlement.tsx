"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { FileText, Search, Download } from "lucide-react";

interface TaxSettlementData {
  key: string;
  no: number;
  agencyClassification: string;
  purchaseAmount: string;
  purchaseFee: string;
  region: string;
  transportationMethod: string;
  mailboxNumber: string;
  waybillNumber: string;
  orderNumber: string;
  receiver: string;
  recipientAddress: string;
  personalCustomsCode: string;
  productNameEnglish: string;
  ct: string;
  weight: string;
  shippingCosts: string;
  additionalServices: string;
  additionalCostPayment: string;
}

const columnKeys: (keyof TaxSettlementData)[] = [
  "no", "agencyClassification", "purchaseAmount", "purchaseFee",
  "region", "transportationMethod", "mailboxNumber", "waybillNumber",
  "orderNumber", "receiver", "recipientAddress", "personalCustomsCode",
  "productNameEnglish", "ct", "weight", "shippingCosts",
  "additionalServices", "additionalCostPayment",
];

export default function TaxSettlement() {
  const { t } = useLocale();
  const [startDate, setStartDate] = useState("2025-01-20");
  const [endDate, setEndDate] = useState("2025-02-20");
  const [selectedPeriod, setSelectedPeriod] = useState("3");
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [memberName, setMemberName] = useState("");
  const [waybillNumber, setWaybillNumber] = useState("");
  const [federalCode, setFederalCode] = useState("");

  // Empty data arrays for API integration
  const taxSettlementData: TaxSettlementData[] = [];

  const handleSearch = () => {
    console.log("Search clicked");
  };

  const handleExcelDownload = () => {
    console.log("Excel download clicked");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">{t("statistics.taxSettlement.title")}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
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
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-28"
            >
              <option value="1">1{t("statistics.orderStatistics.month")}</option>
              <option value="3">3{t("statistics.orderStatistics.month")}</option>
              <option value="6">6{t("statistics.orderStatistics.month")}</option>
            </select>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-28"
            >
              <option value="all">{t("statistics.orderStatistics.all")}</option>
            </select>
            <input
              type="text"
              placeholder={t("statistics.taxSettlement.memberName")}
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <input
              type="text"
              placeholder={t("statistics.taxSettlement.waybillNumber")}
              value={waybillNumber}
              onChange={(e) => setWaybillNumber(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
            />
            <input
              type="text"
              placeholder={t("statistics.taxSettlement.federalCode")}
              value={federalCode}
              onChange={(e) => setFederalCode(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
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

          {/* Table */}
          <div className="app-table-wrap">
            <table className="app-table min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  {columnKeys.map((col) => (
                    <th
                      key={col}
                      className={`border border-gray-300 px-3 py-2 font-medium whitespace-nowrap ${
                        col === "no" ? "min-w-[60px] text-center sticky left-0 bg-gray-50" :
                        col === "agencyClassification" ? "min-w-[150px] text-left" :
                        col === "recipientAddress" ? "min-w-[300px] text-left" :
                        col === "transportationMethod" ? "min-w-[200px] text-left" :
                        col === "productNameEnglish" ? "min-w-[200px] text-left" :
                        col === "personalCustomsCode" ? "min-w-[150px] text-left" :
                        "min-w-[120px] text-left"
                      }`}
                    >
                      {t(`statistics.taxSettlement.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {taxSettlementData.length === 0 ? (
                  <tr>
                    <td colSpan={columnKeys.length} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                      {t("statistics.common.noData")}
                    </td>
                  </tr>
                ) : (
                  taxSettlementData.map((row) => (
                    <tr key={row.key}>
                      {columnKeys.map((col) => (
                        <td
                          key={col}
                          className={`border border-gray-300 px-3 py-2 ${
                            col === "no" ? "text-center sticky left-0 bg-white" :
                            col === "ct" || col === "weight" ? "text-center" : ""
                          }`}
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
        </div>
      </div>
    </div>
  );
}
