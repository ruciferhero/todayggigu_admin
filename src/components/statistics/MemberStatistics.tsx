"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Users } from "lucide-react";

interface AnnualMemberData {
  key: string;
  memberType: string;
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

interface MonthlyMemberData {
  key: string;
  memberType: string;
  applicationItem: string;
  [key: string]: string | number;
}

const months = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export default function MemberStatistics() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<"annual" | "monthly">("annual");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("1");
  const [selectedMemberType, setSelectedMemberType] = useState("all");

  // Empty data arrays for API integration
  const annualMemberData: AnnualMemberData[] = [];
  const monthlyMemberData: MonthlyMemberData[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">{t("statistics.memberStatistics.title")}</h1>
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
              {t("statistics.memberStatistics.annualMembershipStatistics")}
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "monthly"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("statistics.memberStatistics.monthlyMembershipStatistics")}
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
                  value={selectedMemberType}
                  onChange={(e) => setSelectedMemberType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
                >
                  <option value="all">{t("statistics.orderStatistics.all")}</option>
                  <option value="leeseomho">{t("statistics.memberStatistics.leeSeomHo")}</option>
                  <option value="leesombark">{t("statistics.memberStatistics.leeSeomBark")}</option>
                </select>
                <span className="text-sm">{t("statistics.memberStatistics.memberName")}</span>
                <span className="text-xs text-gray-500">{t("statistics.memberStatistics.memberNote")}</span>
              </div>

              {/* Annual Member Table */}
              <div className="app-table-wrap">
                <table className="app-table min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-[1] min-w-[150px] text-left font-medium">
                        {t("statistics.memberStatistics.memberType")}
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-medium min-w-[180px]">
                        {t("statistics.memberStatistics.applicationItem")}
                      </th>
                      {months.map((m) => (
                        <th key={m} className="border border-gray-300 px-3 py-2 text-center font-medium min-w-[80px]">
                          {t(`statistics.orderStatistics.${m}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {annualMemberData.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                          {t("statistics.common.noData")}
                        </td>
                      </tr>
                    ) : (
                      annualMemberData.map((row) => (
                        <tr key={row.key}>
                          <td className="sticky left-0 z-[1] font-medium">
                            {row.memberType}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 font-medium">
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
                  value={selectedMemberType}
                  onChange={(e) => setSelectedMemberType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
                >
                  <option value="all">{t("statistics.orderStatistics.all")}</option>
                  <option value="leeseomho">{t("statistics.memberStatistics.leeSeomHo")}</option>
                  <option value="leesombark">{t("statistics.memberStatistics.leeSeomBark")}</option>
                </select>
                <span className="text-sm">{t("statistics.memberStatistics.memberName")}</span>
                <span className="text-xs text-gray-500">{t("statistics.memberStatistics.memberNote")}</span>
              </div>

              {/* Monthly Member Table */}
              <div className="app-table-wrap">
                <table className="app-table min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-[1] min-w-[150px] text-left font-medium">
                        {t("statistics.memberStatistics.memberType")}
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-medium min-w-[180px]">
                        {t("statistics.memberStatistics.applicationItem")}
                      </th>
                      {Array.from({ length: 31 }, (_, i) => (
                        <th key={i} className="border border-gray-300 px-2 py-2 text-center font-medium min-w-[60px]">
                          {i + 1}{t("statistics.orderStatistics.days")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyMemberData.length === 0 ? (
                      <tr>
                        <td colSpan={33} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                          {t("statistics.common.noData")}
                        </td>
                      </tr>
                    ) : (
                      monthlyMemberData.map((row) => (
                        <tr key={row.key}>
                          <td className="sticky left-0 z-[1] font-medium">
                            {row.memberType}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 font-medium">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
