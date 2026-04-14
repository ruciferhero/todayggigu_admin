"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, Plus, UserX, Shield, AlertTriangle, Eye, Trash2, MessageSquare } from "lucide-react";

export default function BlacklistMembers() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const stats = [
    { label: "Total Blacklisted", value: 0, icon: <UserX className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-50" },
    { label: "General Members", value: 0, icon: <Shield className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Business Members", value: 0, icon: <AlertTriangle className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Added This Month", value: 0, icon: <Plus className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-50" },
  ];

  const data: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Blacklist Members</h1>
        <div className="flex gap-2">
          <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
          <button className="h-9 px-4 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add to Blacklist</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div><div className="text-xs text-gray-500">{s.label}</div><div className="text-2xl font-bold text-gray-900 mt-1">{s.value}</div></div>
              <div className={`p-2 rounded-lg ${s.bg}`}><span className={s.color}>{s.icon}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Member ID</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Name</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Type</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option><option>General</option><option>Business</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Reset</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Search</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="app-table-wrap">
        <table className="app-table">
          <thead><tr>
            <th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">No</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Avatar</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Member ID</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Name</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Type</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Phone</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Email</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Reason</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Blocked Date</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th>
          </tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={11} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500"><span>Total: 0</span>
        <div className="flex gap-1"><button className="h-8 px-3 border border-gray-300 rounded-md disabled:opacity-50" disabled>&laquo;</button><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span><button className="h-8 px-3 border border-gray-300 rounded-md">&raquo;</button></div>
      </div>

      {/* Detail Modal */}
      {detailModalVisible && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailModalVisible(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Member Detail</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium text-gray-500">Name:</span> {selectedMember.name}</div>
              <div><span className="font-medium text-gray-500">Reason:</span> {selectedMember.reason}</div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDetailModalVisible(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md">Close</button>
              <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md">Remove from Blacklist</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
