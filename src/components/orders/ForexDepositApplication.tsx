"use client";
import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Download, Search, RotateCcw, FileText, DollarSign, Clock, CheckCircle } from "lucide-react";

interface ApplicationItem {
  id: string; memberName: string; depositorCompany: string; applicationAmountUsd: number; usdDepositAmount: number;
  actualDepositCny: number; feeRate: number; actualFeeCny: number; actualRechargeCny: number; remittanceDate: string;
  completionStatus: "completed" | "pending"; applicationDate: string; completionDate: string; adminDesignatedDate: string;
  smsStatus: "sent" | "unsent"; memo: string;
}

const mockData: ApplicationItem[] = [
  { id: "FX-APP-001", memberName: "Avenue Studio", depositorCompany: "Avenue Co., Ltd", applicationAmountUsd: 5000, usdDepositAmount: 5000, actualDepositCny: 35800, feeRate: 1.5, actualFeeCny: 537, actualRechargeCny: 35263, remittanceDate: "2026-04-08", completionStatus: "completed", applicationDate: "2026-04-07 09:30", completionDate: "2026-04-08 14:20", adminDesignatedDate: "2026-04-08", smsStatus: "sent", memo: "Regular monthly deposit." },
  { id: "FX-APP-002", memberName: "Mode Archive", depositorCompany: "Mode Trading Inc.", applicationAmountUsd: 12000, usdDepositAmount: 12000, actualDepositCny: 85920, feeRate: 1.2, actualFeeCny: 1031, actualRechargeCny: 84889, remittanceDate: "2026-04-09", completionStatus: "completed", applicationDate: "2026-04-08 15:45", completionDate: "2026-04-09 11:10", adminDesignatedDate: "2026-04-09", smsStatus: "sent", memo: "" },
  { id: "FX-APP-003", memberName: "Urban Avenue", depositorCompany: "Urban Avenue LLC", applicationAmountUsd: 3000, usdDepositAmount: 0, actualDepositCny: 0, feeRate: 1.5, actualFeeCny: 0, actualRechargeCny: 0, remittanceDate: "", completionStatus: "pending", applicationDate: "2026-04-11 08:22", completionDate: "", adminDesignatedDate: "", smsStatus: "unsent", memo: "Awaiting remittance confirmation." },
  { id: "FX-APP-004", memberName: "Studio Haze", depositorCompany: "Haze Global", applicationAmountUsd: 8500, usdDepositAmount: 8500, actualDepositCny: 60860, feeRate: 1.3, actualFeeCny: 791, actualRechargeCny: 60069, remittanceDate: "2026-04-10", completionStatus: "completed", applicationDate: "2026-04-09 11:00", completionDate: "2026-04-10 16:30", adminDesignatedDate: "2026-04-10", smsStatus: "sent", memo: "" },
];

export default function ForexDepositApplication() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows] = useState<Set<string>>(new Set(mockData.map((d) => d.id)));

  const stats = [
    { label: "Total Applications", value: mockData.length.toString(), icon: <FileText className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Pending", value: mockData.filter((d) => d.completionStatus === "pending").length.toString(), icon: <Clock className="w-5 h-5" />, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Completed", value: mockData.filter((d) => d.completionStatus === "completed").length.toString(), icon: <CheckCircle className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Amount", value: `$${mockData.reduce((s, d) => s + d.applicationAmountUsd, 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Forex Deposit Application Details</h1>
        <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 w-52">
            <div className="flex items-center justify-between">
              <div><div className="text-[11px] text-gray-500">{s.label}</div><div className="text-xl font-bold text-gray-900 mt-1">{s.value}</div></div>
              <div className={`p-2 rounded-lg ${s.bg}`}><span className={s.color}>{s.icon}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">Application Date</label><div className="flex gap-1"><input type="date" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" /><input type="date" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" /></div></div>
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">Completion Status</label><select className="h-8 w-28 px-2 text-xs border border-gray-300 rounded-md"><option>All</option><option>Completed</option><option>Pending</option></select></div>
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">SMS Status</label><select className="h-8 w-28 px-2 text-xs border border-gray-300 rounded-md"><option>All</option><option>Sent</option><option>Unsent</option></select></div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Reset</button>
            <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"><Search className="w-3 h-3" />Search</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2 text-left font-medium text-gray-500">No</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Member</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Depositor Company</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Application USD</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Deposit USD</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Deposit CNY</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Fee %</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Fee CNY</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Recharge CNY</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Remittance Date</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500">Completion</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Application Date</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Completion Date</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500">SMS</th>
          </tr></thead>
          <tbody>
            {mockData.map((item, idx) => (
              <React.Fragment key={item.id}>
                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2 text-blue-600 font-medium">{item.memberName}</td>
                  <td className="px-3 py-2">{item.depositorCompany}</td>
                  <td className="px-3 py-2 text-right font-medium">${item.applicationAmountUsd.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">${item.usdDepositAmount.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">¥{item.actualDepositCny.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{item.feeRate}%</td>
                  <td className="px-3 py-2 text-right">¥{item.actualFeeCny.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-medium text-green-700">¥{item.actualRechargeCny.toLocaleString()}</td>
                  <td className="px-3 py-2">{item.remittanceDate || "-"}</td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.completionStatus === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{item.completionStatus}</span></td>
                  <td className="px-3 py-2 text-gray-500">{item.applicationDate}</td>
                  <td className="px-3 py-2 text-gray-500">{item.completionDate || "-"}</td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.smsStatus === "sent" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.smsStatus}</span></td>
                </tr>
                {expandedRows.has(item.id) && (
                  <tr className="border-b border-gray-100 bg-slate-50/50">
                    <td colSpan={14} className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 min-w-[60px]">Memo:</span>
                        <input type="text" defaultValue={item.memo} placeholder="Enter memo..." className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded-md" />
                        <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">{t("orders.action.register")}</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Total: {mockData.length}</span>
        <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium text-xs">{currentPage}</span>
      </div>
    </div>
  );
}
