"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { CreditCard } from "lucide-react";

interface AnnualPaymentData {
  key: string;
  applicationItem: string;
  [key: string]: string | number;
}

interface MonthlyPaymentData {
  key: string;
  applicationItem: string;
  [key: string]: string | number;
}

const months = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export default function PaymentAgencyStats() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<"annual" | "monthly">("annual");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("1");

  // Empty data arrays for API integration
  const annualPaymentData: AnnualPaymentData[] = [];
  const annualPaymentCostData: AnnualPaymentData[] = [];
  const monthlyPaymentData: MonthlyPaymentData[] = [];
  const monthlyPaymentFeeData: MonthlyPaymentData[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">{t("statistics.paymentAgency.title")}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("annual")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "annual"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("statistics.paymentAgency.annualPaymentAgencyStatistics")}
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "monthly"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("statistics.paymentAgency.monthlyPaymentAgencyStatistics")}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "annual" ? (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
                <span className="text-sm">{t("statistics.orderStatistics.year")}</span>
                <span className="text-xs text-gray-500 ml-4">{t("statistics.paymentAgency.note")}</span>
              </div>

              {/* Annual Payment Agency Table */}
              <div className="app-table-wrap">
                <table className="app-table min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-[1] min-w-[180px] text-left font-medium">
                        {t("statistics.paymentAgency.applicationItem")}
                      </th>
                      {months.map((m) => (
                        <th key={m} className="border border-gray-300 px-3 py-2 text-center font-medium min-w-[80px]">
                          {t(`statistics.orderStatistics.${m}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {annualPaymentData.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                          {t("statistics.common.noData")}
                        </td>
                      </tr>
                    ) : (
                      annualPaymentData.map((row) => (
                        <tr key={row.key}>
                          <td className="sticky left-0 z-[1] font-medium">
                            {row.applicationItem}
                          </td>
                          {months.map((m) => (
                            <td key={m} className="border border-gray-300 px-3 py-2 text-center">
                              {row[m] ?? 0}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Annual Payment Cost */}
              <h3 className="text-base font-semibold mt-6">{t("statistics.paymentAgency.annualPaymentCost")}</h3>
              <div className="app-table-wrap">
                <table className="app-table min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-[1] min-w-[180px] text-left font-medium">
                        {t("statistics.paymentAgency.applicationItem")}
                      </th>
                      {months.map((m) => (
                        <th key={m} className="border border-gray-300 px-3 py-2 text-center font-medium min-w-[80px]">
                          {t(`statistics.orderStatistics.${m}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {annualPaymentCostData.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                          {t("statistics.common.noData")}
                        </td>
                      </tr>
                    ) : (
                      annualPaymentCostData.map((row) => (
                        <tr key={row.key}>
                          <td className="sticky left-0 z-[1] font-medium">
                            {row.applicationItem}
                          </td>
                          {months.map((m) => (
                            <td key={m} className="border border-gray-300 px-3 py-2 text-center">
                              {row[m] ?? 0}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Monthly Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
                <span className="text-sm">{t("statistics.orderStatistics.year")}</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <span className="text-sm">{t("statistics.orderStatistics.month")}</span>
                <span className="text-xs text-gray-500 ml-4">{t("statistics.paymentAgency.monthlyNote")}</span>
              </div>

              {/* Monthly Payment Agency Table */}
              <div className="app-table-wrap">
                <table className="app-table min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-[1] min-w-[180px] text-left font-medium">
                        {t("statistics.paymentAgency.applicationItem")}
                      </th>
                      {Array.from({ length: 31 }, (_, i) => (
                        <th key={i} className="border border-gray-300 px-2 py-2 text-center font-medium min-w-[60px]">
                          {i + 1}{t("statistics.orderStatistics.days")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyPaymentData.length === 0 ? (
                      <tr>
                        <td colSpan={32} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                          {t("statistics.common.noData")}
                        </td>
                      </tr>
                    ) : (
                      monthlyPaymentData.map((row) => (
                        <tr key={row.key}>
                          <td className="sticky left-0 z-[1] font-medium">
                            {row.applicationItem}
                          </td>
                          {Array.from({ length: 31 }, (_, i) => (
                            <td key={i} className="border border-gray-300 px-2 py-2 text-center">
                              {row[`day${i + 1}`] ?? 0}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Monthly Payment Fee */}
              <h3 className="text-base font-semibold mt-6">{t("statistics.paymentAgency.monthlyPaymentFee")}</h3>
              <div className="app-table-wrap">
                <table className="app-table min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-[1] min-w-[180px] text-left font-medium">
                        {t("statistics.paymentAgency.applicationItem")}
                      </th>
                      {Array.from({ length: 31 }, (_, i) => (
                        <th key={i} className="border border-gray-300 px-2 py-2 text-center font-medium min-w-[60px]">
                          {i + 1}{t("statistics.orderStatistics.days")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyPaymentFeeData.length === 0 ? (
                      <tr>
                        <td colSpan={32} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                          {t("statistics.common.noData")}
                        </td>
                      </tr>
                    ) : (
                      monthlyPaymentFeeData.map((row) => (
                        <tr key={row.key}>
                          <td className="sticky left-0 z-[1] font-medium">
                            {row.applicationItem}
                          </td>
                          {Array.from({ length: 31 }, (_, i) => (
                            <td key={i} className="border border-gray-300 px-2 py-2 text-center">
                              {row[`day${i + 1}`] ?? 0}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
