"use client";
import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Download, Search, RotateCcw, Plus, DollarSign, BarChart3, TrendingUp } from "lucide-react";

interface UsageItem {
  id: string; memberName: string; mailbox: string; classification: "payment" | "topup" | "adminAccrual" | "adminDeduction" | "refund";
  content: string; alipayId: string; depositAmountCny: number; remainingCny: number; usageDate: string; adminDesignatedDate: string;
}

const classColors: Record<string, string> = {
  payment: "bg-blue-100 text-blue-700", topup: "bg-green-100 text-green-700", adminAccrual: "bg-cyan-100 text-cyan-700",
  adminDeduction: "bg-orange-100 text-orange-700", refund: "bg-purple-100 text-purple-700",
};
const classLabels: Record<string, string> = {
  payment: "Payment Cost", topup: "Deposit Topup", adminAccrual: "Admin Accrual", adminDeduction: "Admin Deduction", refund: "Refund",
};

const mockData: UsageItem[] = [
  { id: "FX-USE-001", memberName: "Avenue Studio", mailbox: "TJ13793", classification: "payment", content: "1688 Order #20260408-001", alipayId: "avenue@alipay.cn", depositAmountCny: 8500, remainingCny: 26763, usageDate: "2026-04-08 10:15", adminDesignatedDate: "2026-04-08" },
  { id: "FX-USE-002", memberName: "Mode Archive", mailbox: "TJ22045", classification: "topup", content: "Monthly deposit recharge", alipayId: "", depositAmountCny: 50000, remainingCny: 134889, usageDate: "2026-04-09 14:30", adminDesignatedDate: "2026-04-09" },
  { id: "FX-USE-003", memberName: "Urban Avenue", mailbox: "TJ18820", classification: "adminDeduction", content: "Fee adjustment for March", alipayId: "", depositAmountCny: -1200, remainingCny: 21500, usageDate: "2026-04-10 09:00", adminDesignatedDate: "2026-04-10" },
  { id: "FX-USE-004", memberName: "Studio Haze", mailbox: "TJ30112", classification: "refund", content: "Refund for cancelled order FX-003", alipayId: "", depositAmountCny: 3000, remainingCny: 63069, usageDate: "2026-04-10 16:45", adminDesignatedDate: "2026-04-10" },
  { id: "FX-USE-005", memberName: "Avenue Studio", mailbox: "TJ13793", classification: "payment", content: "Alipay transfer to supplier", alipayId: "supplier_zhejiang@alipay.cn", depositAmountCny: 12300, remainingCny: 14463, usageDate: "2026-04-11 08:20", adminDesignatedDate: "2026-04-11" },
];

export default function ForexDepositUsage() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const stats = [
    { label: "Total Usage", value: mockData.length.toString(), icon: <BarChart3 className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Amount", value: `¥${Math.abs(mockData.reduce((s, d) => s + d.depositAmountCny, 0)).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-50" },
    { label: "Avg Amount", value: `¥${Math.round(Math.abs(mockData.reduce((s, d) => s + d.depositAmountCny, 0)) / mockData.length).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Forex Deposit Usage History</h1>
        <div className="flex gap-2">
          {Object.entries(classLabels).map(([key, label]) => (
            <button key={key} className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"><Download className="w-3 h-3" />{label}</button>
          ))}
          <button onClick={() => setModalOpen(true)} className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" />Register</button>
        </div>
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
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">Usage Date</label><div className="flex gap-1"><input type="date" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" /><input type="date" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" /></div></div>
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">Classification</label><select className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md"><option>All</option>{Object.entries(classLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="block text-[11px] font-medium text-gray-500 mb-0.5">Member</label><input type="text" placeholder="Member name" className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-md" /></div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button className="h-8 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Reset</button>
            <button className="h-8 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"><Search className="w-3 h-3" />Search</button>
          </div>
        </div>
      </div>

      <div className="app-table-wrap">
        <table className="app-table text-xs">
          <thead><tr>
            <th className="px-3 py-2 text-left font-medium text-gray-500">No</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Member</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Classification</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Content</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Alipay ID</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Amount CNY</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Remaining CNY</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Usage Date</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">Admin Date</th>
          </tr></thead>
          <tbody>
            {mockData.map((item, idx) => (
              <tr key={item.id}>
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2"><div className="text-blue-600 font-medium">{item.memberName}</div><div className="text-gray-400">{item.mailbox}</div></td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${classColors[item.classification]}`}>{classLabels[item.classification]}</span></td>
                <td className="px-3 py-2 max-w-[200px]">{item.content}</td>
                <td className="px-3 py-2 text-gray-500">{item.alipayId || "-"}</td>
                <td className={`px-3 py-2 text-right font-medium ${item.depositAmountCny < 0 ? "text-red-600" : "text-green-700"}`}>¥{item.depositAmountCny.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">¥{item.remainingCny.toLocaleString()}</td>
                <td className="px-3 py-2 text-gray-500">{item.usageDate}</td>
                <td className="px-3 py-2 text-gray-500">{item.adminDesignatedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Total: {mockData.length}</span>
        <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium text-xs">{currentPage}</span>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-96 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Deposit Registration</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Member (ID / Name)</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Content</label><textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md" rows={2} /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Amount (CNY)</label><div className="flex gap-2"><select className="h-9 w-16 px-2 text-sm border border-gray-300 rounded-md"><option>+</option><option>-</option></select><input type="number" className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-md" /></div></div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md">Cancel</button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
