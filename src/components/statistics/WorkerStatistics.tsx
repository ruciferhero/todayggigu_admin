"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { HardHat, Search } from "lucide-react";

interface WorkerData {
  key: string;
  workerName: string;
  numberOfActualCases: number;
  actualAverage: number;
  numberOfPackages: number;
  packagingAverage: number;
}

export default function WorkerStatistics() {
  const { t } = useLocale();
  const [startDate, setStartDate] = useState("2022-02-20");
  const [endDate, setEndDate] = useState("2022-02-20");
  const [selectedWorkerClass, setSelectedWorkerClass] = useState("all");

  // Empty data arrays for API integration
  const workerData: WorkerData[] = [];

  const columns: { key: keyof WorkerData; align: string; width: string }[] = [
    { key: "workerName", align: "text-left", width: "min-w-[250px]" },
    { key: "numberOfActualCases", align: "text-center", width: "min-w-[150px]" },
    { key: "actualAverage", align: "text-center", width: "min-w-[150px]" },
    { key: "numberOfPackages", align: "text-center", width: "min-w-[150px]" },
    { key: "packagingAverage", align: "text-center", width: "min-w-[150px]" },
  ];

  const handleSearch = () => {
    console.log("Search clicked", { startDate, endDate, selectedWorkerClass });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <HardHat className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">{t("statistics.workerStatistics.title")}</h1>
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
              value={selectedWorkerClass}
              onChange={(e) => setSelectedWorkerClass(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
            >
              <option value="all">{t("statistics.workerStatistics.workerOfOrderClass")}</option>
            </select>
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
                  {columns.map(({ key, align, width }) => (
                    <th key={key} className={`border border-gray-300 px-3 py-2 font-medium ${align} ${width}`}>
                      {t(`statistics.workerStatistics.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workerData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                      {t("statistics.common.noData")}
                    </td>
                  </tr>
                ) : (
                  workerData.map((row) => (
                    <tr key={row.key}>
                      <td className="border border-gray-300 px-3 py-2 font-medium">{row.workerName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {row.numberOfActualCases === 0 ? "0" : row.numberOfActualCases.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {row.actualAverage === 0 ? "0" : row.actualAverage.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {row.numberOfPackages === 0 ? "0" : row.numberOfPackages.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {row.packagingAverage === 0 ? "0" : row.packagingAverage.toLocaleString()}
                      </td>
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
