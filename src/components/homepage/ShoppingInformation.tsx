"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, Plus, Eye, Edit, Trash2 } from "lucide-react";

export default function ShoppingInformation() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const data: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Shopping Information</h1>
        <div className="flex gap-2">
          <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
          <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add Info</button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Title</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Category</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option><option>Shipping Guide</option><option>Customs Info</option><option>FAQ</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Status</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option><option>Published</option><option>Draft</option></select></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Reset</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Search</button>
          </div>
        </div>
      </div>
      <div className="app-table-wrap">
        <table className="app-table">
          <thead><tr><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">No</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Title</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Category</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Views</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Status</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Created</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Updated</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th></tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={8} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500"><span>Total: 0</span><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span></div>
    </div>
  );
}
