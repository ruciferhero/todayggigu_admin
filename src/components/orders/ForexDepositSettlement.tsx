"use client";
import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Download, Search, RotateCcw, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface SettlementItem {
  id: string; memberName: string; mailbox: string; classification: "deposit" | "withdrawal" | "refund";
  applicationInfo: string; applicationAmount: number; currency: "USD" | "CNY" | "JPY";
  status: "completed" | "processing" | "pending"; applicationDate: string; adminDesignatedDate: string;
  smsStatus: "sent" | "unsent"; request: string; adminMemo: string;
}

const classColors: Record<string, string> = { deposit: "bg-blue-100 text-blue-700", withdrawal: "bg-orange-100 text-orange-700", refund: "bg-purple-100 text-purple-700" };
const statusColors: Record<string, string> = { completed: "bg-green-100 text-green-700", processing: "bg-yellow-100 text-yellow-700", pending: "bg-red-100 text-red-700" };

const mockData: SettlementItem[] = [
  { id: "FX-PAY-001", memberName: "Avenue Studio", mailbox: "TJ13793", classification: "deposit", applicationInfo: "site-av-001", applicationAmount: 5000, currency: "USD", status: "completed", applicationDate: "2026-04-07 09:30", adminDesignatedDate: "2026-04-08", smsStatus: "sent", request: "", adminMemo: "Regular deposit processed." },
  { id: "FX-PAY-002", memberName: "Mode Archive", mailbox: "TJ22045", classification: "deposit", applicationInfo: "site-mo-002", applicationAmount: 12000, currency: "USD", status: "completed", applicationDate: "2026-04-08 15:45", adminDesignatedDate: "2026-04-09", smsStatus: "sent", request: "Expedite processing", adminMemo: "" },
  { id: "FX-PAY-003", memberName: "Urban Avenue", mailbox: "TJ18820", classification: "withdrawal", applicationInfo: "site-ua-003", applicationAmount: 2000, currency: "USD", status: "processing", applicationDate: "2026-04-10 10:00", adminDesignatedDate: "", smsStatus: "unsent", request: "Urgent withdrawal needed", adminMemo: "Verifying bank details." },
  { id: "FX-PAY-004", memberName: "Studio Haze", mailbox: "TJ30112", classification: "refund", applicationInfo: "site-sh-004", applicationAmount: 85000, currency: "JPY", status: "pending", applicationDate: "2026-04-11 08:00", adminDesignatedDate: "", smsStatus: "unsent", request: "Refund for cancelled order", adminMemo: "" },
  { id: "FX-PAY-005", memberName: "Merry Closet", mailbox: "TJ25601", classification: "deposit", applicationInfo: "site-mc-005", applicationAmount: 28000, currency: "CNY", status: "completed", applicationDate: "2026-04-09 13:20", adminDesignatedDate: "2026-04-09", smsStatus: "sent", request: "", adminMemo: "CNY direct deposit." },
];

export default function ForexDepositSettlement() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows] = useState<Set<string>>(new Set(mockData.map((d) => d.id)));

  const stats = [
    { label: "Total Payments", value: mockData.length.toString(), icon: <DollarSign className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Completed", value: mockData.filter((d) => d.status === "completed").length.toString(), icon: <CheckCircle className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total USD", value: `$${mockData.filter((d) => d.currency === "USD").reduce((s, d) => s + d.applicationAmount, 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Processing", value: mockData.filter((d) => d.status !== "completed").length.toString(), icon: <Clock className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Forex Deposit Settlement Details</h1>
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
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">Classification</label><select className="h-8 w-28 px-2 text-xs border border-gray-300 rounded-md"><option>All</option><option>Deposit</option><option>Withdrawal</option><option>Refund</option></select></div>
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">Status</label><select className="h-8 w-28 px-2 text-xs border border-gray-300 rounded-md"><option>All</option><option>Completed</option><option>Processing</option><option>Pending</option></select></div>
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">Date</label><div className="flex gap-1"><input type="date" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" /><input type="date" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" /></div></div>
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">SMS</label><select className="h-8 w-24 px-2 text-xs border border-gray-300 rounded-md"><option>All</option><option>Sent</option><option>Unsent</option></select></div>
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
            <th className="px-3 py-2 text-center font-medium text-gray-500">Classification</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Application Info</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Amount</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500">Currency</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Application Date</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Admin Date</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500">SMS</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {mockData.map((item, idx) => (
              <React.Fragment key={item.id}>
                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2"><div className="text-blue-600 font-medium">{item.memberName}</div><div className="text-gray-400">{item.mailbox}</div></td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${classColors[item.classification]}`}>{item.classification}</span></td>
                  <td className="px-3 py-2 text-gray-600">{item.applicationInfo}</td>
                  <td className="px-3 py-2 text-right font-medium">{item.applicationAmount.toLocaleString()}</td>
                  <td className="px-3 py-2 text-center"><span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium">{item.currency}</span></td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
                  <td className="px-3 py-2 text-gray-500">{item.applicationDate}</td>
                  <td className="px-3 py-2 text-gray-500">{item.adminDesignatedDate || "-"}</td>
                  <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.smsStatus === "sent" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.smsStatus}</span></td>
                  <td className="px-3 py-2 text-center">{item.smsStatus === "unsent" && <button className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700">Process</button>}</td>
                </tr>
                {expandedRows.has(item.id) && (
                  <tr className="border-b border-gray-100 bg-slate-50/50">
                    <td colSpan={11} className="px-6 py-2">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-semibold text-gray-700 min-w-[60px]">Request:</span>
                          <input type="text" defaultValue={item.request} placeholder="Request..." className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded-md" />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-semibold text-gray-700 min-w-[80px]">Admin Memo:</span>
                          <input type="text" defaultValue={item.adminMemo} placeholder="Memo..." className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded-md" />
                          <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">{t("orders.action.register")}</button>
                        </div>
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
