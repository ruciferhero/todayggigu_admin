"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, CheckCircle, XCircle, Clock } from "lucide-react";

export default function MemberWithdrawalReview() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("pending");
  const data: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Member Withdrawal Review</h1>
        <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{l:"Pending",v:"0",c:"text-orange-500",b:"bg-orange-50",i:<Clock className="w-5 h-5"/>},{l:"Approved",v:"0",c:"text-green-500",b:"bg-green-50",i:<CheckCircle className="w-5 h-5"/>},{l:"Rejected",v:"0",c:"text-red-500",b:"bg-red-50",i:<XCircle className="w-5 h-5"/>}].map((s)=>(<div key={s.l} className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between"><div><div className="text-xs text-gray-500">{s.l}</div><div className="text-2xl font-bold text-gray-900 mt-1">{s.v}</div></div><div className={`p-2 rounded-lg ${s.b}`}><span className={s.c}>{s.i}</span></div></div></div>))}
      </div>
      <div className="flex gap-1 border-b border-gray-200">
        {["pending","approved","rejected","all"].map((tab)=>(<button key={tab} onClick={()=>setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize ${activeTab===tab?"text-blue-600 border-b-2 border-blue-600":"text-gray-500 hover:text-gray-700"}`}>{tab}</button>))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Member</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Bank</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Reset</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Search</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b"><th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300"/></th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">No</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Member</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Amount</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Bank</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Account</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Holder</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Status</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Date</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th></tr></thead>
          <tbody>{data.length===0?(<tr><td colSpan={10} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>):null}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500"><span>Total: 0</span><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span></div>
    </div>
  );
}
