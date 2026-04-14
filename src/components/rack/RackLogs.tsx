"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search } from "lucide-react";

interface RackLogRecord {
  id: string;
  logNumber: string;
  rackNumber: string;
  trackingNumber: string;
  stockNumber: string;
  noDataNumber: string;
  registrationCode: string;
  memberName: string;
  registrationDate: string;
}

const RackLogs: React.FC = () => {
  const { t } = useLocale();
  const [pageSize, setPageSize] = useState(25);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sampleData] = useState<RackLogRecord[]>([
    { id: "1", logNumber: "130158", rackNumber: "BB-B-001", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 6:26 PM" },
    { id: "2", logNumber: "130152", rackNumber: "LC-B-006", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
    { id: "3", logNumber: "130152", rackNumber: "LC-B-002", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
    { id: "4", logNumber: "130151", rackNumber: "LC-B-006", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
    { id: "5", logNumber: "130146", rackNumber: "LC-B-002", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
    { id: "6", logNumber: "130146", rackNumber: "LC-B-006", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
    { id: "7", logNumber: "130146", rackNumber: "LC-B-002", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
    { id: "8", logNumber: "130147", rackNumber: "LC-B-006", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
    { id: "9", logNumber: "130146", rackNumber: "LC-B-002", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
    { id: "10", logNumber: "130145", rackNumber: "LC-B-006", trackingNumber: "KY400039252615", stockNumber: "", noDataNumber: "", registrationCode: "registration", memberName: "\uAD00\uB9AC\uC790", registrationDate: "February 13, 2025, 2:25 PM" },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("rack.log.title")}</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>{t("rack.log.filter.first")}</span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded-md px-2 py-1.5 text-sm">
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>{t("rack.log.filter.date")}</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded-md px-2 py-1.5 text-sm" />
            <span>~</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded-md px-2 py-1.5 text-sm" />
            <span>{t("rack.log.filter.rackNumber")}</span>
            <select className="border rounded-md px-2 py-1.5 text-sm w-36">
              <option value="all">{t("rack.log.all")}</option>
            </select>
            <span>{t("rack.log.filter.trackingNumber")}</span>
            <select className="border rounded-md px-2 py-1.5 text-sm w-36">
              <option value="all">{t("rack.log.all")}</option>
            </select>
            <span>{t("rack.log.filter.stockNumber")}</span>
            <select className="border rounded-md px-2 py-1.5 text-sm w-36">
              <option value="all">{t("rack.log.all")}</option>
            </select>
            <span>{t("rack.log.filter.noDataNumber")}</span>
            <select className="border rounded-md px-2 py-1.5 text-sm w-36">
              <option value="all">{t("rack.log.all")}</option>
            </select>
            <span>{t("rack.log.filter.memberName")}</span>
            <select className="border rounded-md px-2 py-1.5 text-sm w-36">
              <option value="all">{t("rack.log.all")}</option>
            </select>
            <button className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              <Search className="w-4 h-4" />
              {t("rack.log.search")}
            </button>
          </div>
        </div>

        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.log.logNumber")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.log.rackNumber")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.log.trackingNumber")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.log.stockNumber")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.log.noDataNumber")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.log.registrationCode")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.log.memberName")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.log.registrationDate")}</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-center">{record.logNumber}</td>
                  <td className="px-4 py-3 text-center">{record.rackNumber}</td>
                  <td className="px-4 py-3">{record.trackingNumber}</td>
                  <td className="px-4 py-3 text-center">{record.stockNumber}</td>
                  <td className="px-4 py-3 text-center">{record.noDataNumber}</td>
                  <td className="px-4 py-3 text-center">{record.registrationCode}</td>
                  <td className="px-4 py-3 text-center">{record.memberName}</td>
                  <td className="px-4 py-3">{record.registrationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RackLogs;
