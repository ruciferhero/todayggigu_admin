"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, Plus, Edit, Save } from "lucide-react";

export default function ShippingRates() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const data: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Shipping Rates</h1>
        <div className="flex gap-2">
          <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
          <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add</button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="grid grid-cols-3 gap-3"><div><label className="block text-xs font-medium text-gray-500 mb-1">Center</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option><option>Weihai</option><option>Qingdao</option><option>Guangzhou</option></select></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Service Type</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option><option>Rocket LCL</option><option>Air</option><option>Sea</option></select></div><div className="flex items-end gap-2"><button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Reset</button><button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Search</button></div></div></div>
      <div className="app-table-wrap">
        <table className="app-table">
          <thead><tr>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">No</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Weight</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Basic Member</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Shipping Agency</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">SA VIP</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">SA SVIP</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Purchase Agent</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">VIP Purchase</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">TT Business</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">TT VIP</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">TT SVIP</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th>
          </tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={20} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500"><span>Total: 0</span><div className="flex gap-1"><button className="h-8 px-3 border border-gray-300 rounded-md disabled:opacity-50" disabled>&laquo;</button><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span><button className="h-8 px-3 border border-gray-300 rounded-md">&raquo;</button></div></div>
    </div>
  );
}
