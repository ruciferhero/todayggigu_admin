"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { BarChart3 } from "lucide-react";

interface AnnualOrderData {
  key: string;
  applicationItem: string;
  january: number;
  february: number;
  march: number;
  april: number;
  may: number;
  june: number;
  july: number;
  august: number;
  september: number;
  october: number;
  november: number;
  december: number;
}

interface MonthlyOrderData {
  key: string;
  applicationItem: string;
  [key: string]: string | number;
}

interface AnnualPaymentData {
  key: string;
  costClassification: string;
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
}

interface MonthlyPaymentData {
  key: string;
  costClassification: string;
  [key: string]: string;
}

const months = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export default function OrderStatistics() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<"annual" | "monthly">("annual");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("1");
  const [selectedCenter, setSelectedCenter] = useState("all");

  // Sample data for Annual Order Statistics
  const annualOrderData: AnnualOrderData[] = [];

  // Sample data for Annual Payment Cost
  const annualPaymentData: AnnualPaymentData[] = [];

  // Sample data for Monthly Order Statistics
  const monthlyOrderData: MonthlyOrderData[] = [];

  // Sample data for Monthly Payment Fee
  const monthlyPaymentData: MonthlyPaymentData[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">{t("statistics.orderStatistics.title")}</h1>
      </div>

      {/* Tabs */}
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
              {t("statistics.orderStatistics.annualOrderStatistics")}
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "monthly"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("statistics.orderStatistics.monthlyOrderStatistics")}
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
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
                >
                  <option value="all">{t("statistics.orderStatistics.all")}</option>
                  <option value="for">{t("statistics.orderStatistics.for")}</option>
                  <option value="guangzhou">{t("statistics.orderStatistics.guangzhou")}</option>
                </select>
                <span className="text-sm">{t("statistics.orderStatistics.center")}</span>
                <span className="text-xs text-gray-500">{t("statistics.orderStatistics.centerNote")}</span>
              </div>

              {/* Annual Order Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left font-medium sticky left-0 bg-gray-50 min-w-[180px]">
                        {t("statistics.orderStatistics.applicationItem")}
                      </th>
                      {months.map((m) => (
                        <th key={m} className="border border-gray-300 px-3 py-2 text-center font-medium min-w-[80px]">
                          {t(`statistics.orderStatistics.${m}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {annualOrderData.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                          {t("statistics.common.noData")}
                        </td>
                      </tr>
                    ) : (
                      annualOrderData.map((row) => (
                        <tr key={row.key} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium sticky left-0 bg-white">
                            {row.applicationItem}
                          </td>
                          {months.map((m) => (
                            <td key={m} className="border border-gray-300 px-3 py-2 text-center">
                              {(row as any)[m] === 0 ? "0" : (row as any)[m]?.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Annual Payment Cost */}
              <h3 className="text-base font-semibold mt-6">{t("statistics.orderStatistics.annualPaymentCost")}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left font-medium sticky left-0 bg-gray-50 min-w-[220px]">
                        {t("statistics.orderStatistics.costClassification")}
                      </th>
                      {months.map((m) => (
                        <th key={m} className="border border-gray-300 px-3 py-2 text-right font-medium min-w-[100px]">
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
                        <tr key={row.key} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium sticky left-0 bg-white">
                            {row.costClassification}
                          </td>
                          {months.map((m) => (
                            <td key={m} className="border border-gray-300 px-3 py-2 text-right">
                              <span className={(row as any)[m] !== "0" ? "text-red-500" : ""}>
                                {(row as any)[m]}
                              </span>
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
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
                >
                  <option value="all">{t("statistics.orderStatistics.all")}</option>
                  <option value="for">{t("statistics.orderStatistics.for")}</option>
                  <option value="guangzhou">{t("statistics.orderStatistics.guangzhou")}</option>
                </select>
                <span className="text-sm">{t("statistics.orderStatistics.center")}</span>
                <span className="text-xs text-gray-500">{t("statistics.orderStatistics.centerNote")}</span>
              </div>

              {/* Monthly Order Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left font-medium sticky left-0 bg-gray-50 min-w-[180px]">
                        {t("statistics.orderStatistics.applicationItem")}
                      </th>
                      {Array.from({ length: 31 }, (_, i) => (
                        <th key={i} className="border border-gray-300 px-2 py-2 text-center font-medium min-w-[60px]">
                          {i + 1}{t("statistics.orderStatistics.days")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyOrderData.length === 0 ? (
                      <tr>
                        <td colSpan={32} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                          {t("statistics.common.noData")}
                        </td>
                      </tr>
                    ) : (
                      monthlyOrderData.map((row) => (
                        <tr key={row.key} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium sticky left-0 bg-white">
                            {row.applicationItem}
                          </td>
                          {Array.from({ length: 31 }, (_, i) => (
                            <td key={i} className="border border-gray-300 px-2 py-2 text-center">
                              {row[`day${i + 1}`] === 0 ? "0" : (row[`day${i + 1}`] as number)?.toLocaleString?.() ?? "0"}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Monthly Payment Fee */}
              <h3 className="text-base font-semibold mt-6">{t("statistics.orderStatistics.monthlyPaymentFee")}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left font-medium sticky left-0 bg-gray-50 min-w-[220px]">
                        {t("statistics.orderStatistics.costClassification")}
                      </th>
                      {Array.from({ length: 31 }, (_, i) => (
                        <th key={i} className="border border-gray-300 px-2 py-2 text-right font-medium min-w-[90px]">
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
                        <tr key={row.key} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium sticky left-0 bg-white">
                            {row.costClassification}
                          </td>
                          {Array.from({ length: 31 }, (_, i) => (
                            <td key={i} className="border border-gray-300 px-2 py-2 text-right">
                              <span className={row[`day${i + 1}`] !== "0" ? "text-red-500" : ""}>
                                {row[`day${i + 1}`]}
                              </span>
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
