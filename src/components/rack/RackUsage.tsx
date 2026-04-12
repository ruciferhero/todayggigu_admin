"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Eye } from "lucide-react";

interface RackUsageRecord {
  id: string;
  rackCode: string;
  rackNumber: string;
  size: string;
  registrant: string;
  stockNumber: string;
  locationNumber: string;
  registrationDate: string;
}

const RackUsage: React.FC = () => {
  const { t } = useLocale();

  const [sampleData] = useState<RackUsageRecord[]>([
    { id: "1", rackCode: "A-A", rackNumber: "A-008", size: "0*0", registrant: "2672990167", stockNumber: "7190", locationNumber: "", registrationDate: "April 04, 2025" },
    { id: "2", rackCode: "A-A", rackNumber: "A-002", size: "0*0", registrant: "1901200052177", stockNumber: "12214", locationNumber: "", registrationDate: "April 04, 2025" },
    { id: "3", rackCode: "A-A", rackNumber: "A-152", size: "0*0", registrant: "7731847146736", stockNumber: "7190", locationNumber: "", registrationDate: "April 04, 2025" },
    { id: "4", rackCode: "A-A", rackNumber: "A-193", size: "0*0", registrant: "\uC2DC\uAC04\uBC30\uC1A122206", stockNumber: "7197", locationNumber: "", registrationDate: "April 04, 2025" },
    { id: "5", rackCode: "A-A", rackNumber: "A-156", size: "0*0", registrant: "\uC2DC\uAC04\uBC30\uC1A122206", stockNumber: "4797", locationNumber: "", registrationDate: "April 04, 2025" },
    { id: "6", rackCode: "A-A", rackNumber: "A-253", size: "0*0", registrant: "\uC2DC\uAC04\uBC30\uC1A122206", stockNumber: "1256", locationNumber: "", registrationDate: "April 16, 2025" },
    { id: "7", rackCode: "A-A", rackNumber: "A-391", size: "0*0", registrant: "7731847138781", stockNumber: "7190", locationNumber: "", registrationDate: "April 16, 2025" },
    { id: "8", rackCode: "A-A", rackNumber: "A-235", size: "0*0", registrant: "1901747315421", stockNumber: "13794", locationNumber: "", registrationDate: "April 04, 2025" },
    { id: "9", rackCode: "A-A", rackNumber: "A-301", size: "0*0", registrant: "1901747315421", stockNumber: "7570", locationNumber: "", registrationDate: "April 04, 2025" },
    { id: "10", rackCode: "A-A", rackNumber: "A-310", size: "0*0", registrant: "7731847152612", stockNumber: "12911", locationNumber: "", registrationDate: "April 28, 2025" },
    { id: "11", rackCode: "A-A", rackNumber: "A-363", size: "0*0", registrant: "7731847156641", stockNumber: "7570", locationNumber: "", registrationDate: "April 04, 2025" },
    { id: "12", rackCode: "A-A", rackNumber: "A-323", size: "0*0", registrant: "1901200052445", stockNumber: "12911", locationNumber: "", registrationDate: "April 16, 2025" },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("rack.usage.title")}</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.usage.rackCode")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.usage.rackNumber")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.usage.size")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.usage.registrant")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.usage.stockNumber")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.usage.locationNumber")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("rack.usage.registrationDate")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("rack.usage.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">{record.rackCode}</td>
                  <td className="px-4 py-3 text-center">{record.rackNumber}</td>
                  <td className="px-4 py-3 text-center">{record.size}</td>
                  <td className="px-4 py-3">{record.registrant}</td>
                  <td className="px-4 py-3 text-center">{record.stockNumber}</td>
                  <td className="px-4 py-3 text-center">{record.locationNumber}</td>
                  <td className="px-4 py-3">{record.registrationDate}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">{t("rack.usage.detail")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RackUsage;
