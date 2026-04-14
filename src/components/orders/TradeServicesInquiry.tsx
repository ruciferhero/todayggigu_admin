"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download } from "lucide-react";

export default function TradeServicesInquiry() {
  const { t } = useLocale();
  const [currentPage] = useState(1);
  const data: unknown[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t("orders.tradeServices.inquiryTitle")}</h1>
        <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />{t("orders.action.excelDownload")}</button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.membershipCode")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.subject")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.status")}</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>{t("orders.common.all")}</option><option>{t("orders.common.answered")}</option><option>{t("orders.common.unanswered")}</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.filter.dateRange")}</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />{t("orders.action.reset")}</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />{t("orders.action.search")}</button>
          </div>
        </div>
      </div>
      <div className="app-table-wrap">
        <table className="app-table">
          <thead><tr><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.no")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.tradeNumber")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.membershipCode")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.subject")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.content")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.status")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.createdAt")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.actions")}</th></tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={8} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500"><span>{t("orders.common.total")}: 0</span><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span></div>
    </div>
  );
}
