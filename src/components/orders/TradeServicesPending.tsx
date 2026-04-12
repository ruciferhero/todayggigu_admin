"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { ShoppingCart, Warehouse, X, Search, RotateCcw } from "lucide-react";

export default function TradeServicesPending() {
  const { t } = useLocale();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState(t("orders.tradeServices.pendingDefault"));

  const paymentStatuses = [
    { label: t("orders.tradeServices.paymentWaiting1"), count: 0, code: "TS_PAY1", color: "text-orange-500", icon: <ShoppingCart className="w-5 h-5" /> },
    { label: t("orders.tradeServices.paymentCompleted1"), count: 0, code: "TS_PAYCOMP1", color: "text-green-500", icon: <ShoppingCart className="w-5 h-5" /> },
    { label: t("orders.tradeServices.paymentWaiting2"), count: 0, code: "TS_PAY2", color: "text-blue-500", icon: <Warehouse className="w-5 h-5" /> },
    { label: t("orders.tradeServices.paymentCompleted2"), count: 0, code: "TS_PAYCOMP2", color: "text-teal-500", icon: <Warehouse className="w-5 h-5" /> },
  ];

  const data: unknown[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{t("orders.tradeServices.pendingTitle")}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCode ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{selectedLabel}</span>
        </div>
        {selectedCode && (<button onClick={() => { setSelectedCode(null); setSelectedLabel(t("orders.tradeServices.pendingDefault")); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"><X className="w-4 h-4" />{t("orders.action.viewAll")}</button>)}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {paymentStatuses.map((s) => (
          <div key={s.code} onClick={() => { setSelectedCode(s.code); setSelectedLabel(s.label); }}
            className={`bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition ${selectedCode === s.code ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className={s.color}>{s.icon}</span><span className="text-sm font-medium text-gray-700">{s.label}</span></div>
              <span className="text-2xl font-bold text-gray-300">{s.count}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.membershipCode")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.tradeNumber")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.filter.dateRange")}</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />{t("orders.action.reset")}</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />{t("orders.action.search")}</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b"><th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.no")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.tradeNumber")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.membershipCode")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.category")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.quotation")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.paidAmount")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.status")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.date")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.actions")}</th></tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={10} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>
    </div>
  );
}
