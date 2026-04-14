"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, Eye, Check, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function SellerSettlement() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  const stats = [
    { label: "Pending", value: "0", icon: <Clock className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Processing", value: "0", icon: <AlertCircle className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Completed", value: "0", icon: <CheckCircle className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Amount", value: "\u20a90", icon: <DollarSign className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const tabs = ["all", "pending", "processing", "completed", "failed"];
  const data: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Seller Settlement</h1>
        <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between"><div><div className="text-xs text-gray-500">{s.label}</div><div className="text-2xl font-bold text-gray-900 mt-1">{s.value}</div></div><div className={`p-2 rounded-lg ${s.bg}`}><span className={s.color}>{s.icon}</span></div></div></div>))}
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>{tab}</button>))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Seller</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Period</label><input type="month" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Reset</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Search</button>
          </div>
        </div>
      </div>

      <div className="app-table-wrap">
        <table className="app-table">
          <thead><tr>
            <th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">No</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Seller</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Period</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Total Sales</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Commission</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Shipping Fee</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Settlement</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Orders</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Status</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Bank Info</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th>
          </tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={12} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500"><span>Total: 0</span><div className="flex gap-1"><button className="h-8 px-3 border border-gray-300 rounded-md disabled:opacity-50" disabled>&laquo;</button><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span><button className="h-8 px-3 border border-gray-300 rounded-md">&raquo;</button></div></div>
    </div>
  );
}
