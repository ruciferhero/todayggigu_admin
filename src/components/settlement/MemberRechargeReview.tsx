"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, CheckCircle, XCircle, Eye, Clock, Settings } from "lucide-react";

export default function MemberRechargeReview() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("pending");

  const stats = [
    { label: "Pending", value: "0", color: "text-orange-500", bg: "bg-orange-50", icon: <Clock className="w-5 h-5" /> },
    { label: "Approved", value: "0", color: "text-green-500", bg: "bg-green-50", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Rejected", value: "0", color: "text-red-500", bg: "bg-red-50", icon: <XCircle className="w-5 h-5" /> },
  ];

  const data: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Member Recharge Review</h1>
        <div className="flex gap-2">
          <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" />Receiving Accounts</button>
          <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between"><div><div className="text-xs text-gray-500">{s.label}</div><div className="text-2xl font-bold text-gray-900 mt-1">{s.value}</div></div><div className={`p-2 rounded-lg ${s.bg}`}><span className={s.color}>{s.icon}</span></div></div></div>))}
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {["pending","approved","rejected","all"].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>{tab}</button>))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Member</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Remitter</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Currency</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option><option>KRW</option><option>USD</option><option>CNY</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Reset</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Search</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">No</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Member</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Remittance Method</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Remitter</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Recharge Amount</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Received Amount</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Service Fee</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Bank</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Status</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Date</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th>
          </tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={12} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500"><span>Total: 0</span><div className="flex gap-1"><button className="h-8 px-3 border border-gray-300 rounded-md disabled:opacity-50" disabled>&laquo;</button><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span><button className="h-8 px-3 border border-gray-300 rounded-md">&raquo;</button></div></div>
    </div>
  );
}
