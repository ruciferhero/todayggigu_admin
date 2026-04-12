"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { CheckCircle, XCircle, RefreshCw, Download, Search, RotateCcw, X, Link, Unlink } from "lucide-react";

export default function VVICNoData() {
  const { t } = useLocale();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState(t("orders.noData.vvicTitle"));
  const [selectedRowKeys] = useState<string[]>([]);
  const [currentPage] = useState(1);

  const statuses = [
    { label: t("orders.noData.unmatched"), count: 0, code: "UNMATCHED", color: "text-red-500", icon: <XCircle className="w-5 h-5" /> },
    { label: t("orders.noData.matched"), count: 0, code: "MATCHED", color: "text-green-500", icon: <CheckCircle className="w-5 h-5" /> },
    { label: t("orders.noData.unlinked"), count: 0, code: "UNLINKED", color: "text-gray-500", icon: <Unlink className="w-5 h-5" /> },
  ];

  const data: unknown[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{t("orders.noData.vvicTitle")}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCode ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
            {selectedLabel} (0)
          </span>
        </div>
        {selectedCode && (
          <button onClick={() => { setSelectedCode(null); setSelectedLabel(t("orders.noData.vvicTitle")); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <X className="w-4 h-4" />{t("orders.action.viewAll")}
          </button>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-3">
        {statuses.map((s) => (
          <div key={s.code} onClick={() => { setSelectedCode(s.code); setSelectedLabel(s.label); }}
            className={`bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition ${selectedCode === s.code ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className={s.color}>{s.icon}</span><span className="text-sm font-medium">{s.label}</span></div>
              <span className="text-2xl font-bold text-gray-300">{s.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.applicationType")}</label>
            <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>{t("orders.common.all")}</option><option>{t("orders.status.shipping")}</option><option>{t("orders.status.purchase")}</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.filter.dateRange")}</label>
            <input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.membershipCode")}</label>
            <input type="text" placeholder={t("orders.filter.userNamePlaceholder")} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.trackingNumber")}</label>
            <input type="text" placeholder={t("orders.filter.trackingNoPlaceholder")} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />{t("orders.action.reset")}</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />{t("orders.action.search")}</button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedRowKeys.length > 0 && (<>
            <button className="h-8 px-3 text-sm bg-green-600 text-white rounded-md flex items-center gap-1.5"><Link className="w-3.5 h-3.5" />{t("orders.action.match")} ({selectedRowKeys.length})</button>
            <button className="h-8 px-3 text-sm bg-red-500 text-white rounded-md flex items-center gap-1.5"><Unlink className="w-3.5 h-3.5" />{t("orders.action.unlink")}</button>
          </>)}
        </div>
        <div className="flex gap-2">
          <button className="h-8 px-3 text-sm border border-gray-300 rounded-md flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />{t("orders.action.refresh")}</button>
          <button className="h-8 px-3 text-sm border border-gray-300 rounded-md flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />{t("orders.action.excelDownload")}</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.no")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.center")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.noData.productImage")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500"><div>{t("orders.common.mailbox")}</div><div>{t("orders.common.memberName")}</div></th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500"><div>{t("orders.common.trackingNumber")}</div><div>{t("orders.common.rackNumber")}</div></th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.product.nameOptions")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.quantity")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.codFee")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.orderNumber")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.noData.matchStatus")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.createdAt")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.actions")}</th>
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={13} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{t("orders.common.total")}: 0</span>
        <div className="flex gap-1">
          <button className="h-8 px-3 border border-gray-300 rounded-md disabled:opacity-50" disabled>&laquo;</button>
          <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span>
          <button className="h-8 px-3 border border-gray-300 rounded-md">&raquo;</button>
        </div>
      </div>
    </div>
  );
}
