"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, X, Globe, Plus } from "lucide-react";

export default function TradeServicesManagement() {
  const { t } = useLocale();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState(t("orders.tradeServices.managementTitle"));
  const [currentPage] = useState(1);

  const statusGroups = [
    { title: t("orders.tradeServices.marketResearchUnit"), color: "text-blue-600", items: [
      { label: t("orders.tradeServices.application"), count: 33, code: "MR_UNIT_APP" }, { label: t("orders.tradeServices.confirmed"), count: 0, code: "MR_UNIT_CONFIRM" },
      { label: t("orders.tradeServices.payment1"), count: 0, code: "MR_UNIT_PAY1" }, { label: t("orders.tradeServices.inProgress"), count: 0, code: "MR_UNIT_PROGRESS" },
      { label: t("orders.tradeServices.firstComplete"), count: 0, code: "MR_UNIT_COMP1" }, { label: t("orders.tradeServices.payment2"), count: 0, code: "MR_UNIT_PAY2" },
      { label: t("orders.tradeServices.shipped"), count: 0, code: "MR_UNIT_SHIP" }, { label: t("orders.tradeServices.cancelled"), count: 0, code: "MR_UNIT_CANCEL" },
    ]},
    { title: t("orders.tradeServices.marketResearchOem"), color: "text-purple-600", items: [
      { label: t("orders.tradeServices.application"), count: 0, code: "MR_OEM_APP" }, { label: t("orders.tradeServices.confirmed"), count: 0, code: "MR_OEM_CONFIRM" },
      { label: t("orders.tradeServices.payment1"), count: 0, code: "MR_OEM_PAY1" }, { label: t("orders.tradeServices.inProgress"), count: 0, code: "MR_OEM_PROGRESS" },
      { label: t("orders.tradeServices.shipped"), count: 0, code: "MR_OEM_SHIP" }, { label: t("orders.tradeServices.cancelled"), count: 0, code: "MR_OEM_CANCEL" },
    ]},
    { title: t("orders.tradeServices.productionAgency"), color: "text-green-600", items: [
      { label: t("orders.tradeServices.application"), count: 0, code: "PROD_APP" }, { label: t("orders.tradeServices.confirmed"), count: 0, code: "PROD_CONFIRM" },
      { label: t("orders.tradeServices.inProgress"), count: 0, code: "PROD_PROGRESS" }, { label: t("orders.tradeServices.shipped"), count: 0, code: "PROD_SHIP" },
      { label: t("orders.tradeServices.cancelled"), count: 0, code: "PROD_CANCEL" },
    ]},
    { title: t("orders.tradeServices.exportAgency"), color: "text-orange-600", items: [
      { label: t("orders.tradeServices.application"), count: 0, code: "EXPORT_APP" }, { label: t("orders.tradeServices.confirmed"), count: 0, code: "EXPORT_CONFIRM" },
      { label: t("orders.tradeServices.inProgress"), count: 0, code: "EXPORT_PROGRESS" }, { label: t("orders.tradeServices.shipped"), count: 0, code: "EXPORT_SHIP" },
      { label: t("orders.tradeServices.cancelled"), count: 0, code: "EXPORT_CANCEL" },
    ]},
    { title: t("orders.tradeServices.oneStopService"), color: "text-red-600", items: [
      { label: t("orders.tradeServices.application"), count: 0, code: "ONESTOP_APP" }, { label: t("orders.tradeServices.inProgress"), count: 0, code: "ONESTOP_PROGRESS" },
      { label: t("orders.tradeServices.completed"), count: 0, code: "ONESTOP_COMP" }, { label: t("orders.tradeServices.cancelled"), count: 0, code: "ONESTOP_CANCEL" },
    ]},
  ];

  const data: unknown[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{t("orders.tradeServices.title")}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCode ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{selectedLabel}</span>
        </div>
        <div className="flex gap-2">
          {selectedCode && (<button onClick={() => { setSelectedCode(null); setSelectedLabel(t("orders.tradeServices.managementTitle")); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"><X className="w-4 h-4" />{t("orders.action.viewAll")}</button>)}
          <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />{t("orders.action.newApplication")}</button>
        </div>
      </div>

      {/* Status Groups Grid */}
      <div className="grid grid-cols-5 gap-3">
        {statusGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <Globe className={`w-4 h-4 ${group.color}`} />
              <span className="text-xs font-semibold text-gray-700 truncate">{group.title}</span>
            </div>
            <div className="py-1">
              {group.items.map((item) => (
                <div key={item.code} onClick={() => { setSelectedCode(item.code); setSelectedLabel(`${group.title} > ${item.label}`); }}
                  className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors text-xs ${selectedCode === item.code ? "bg-blue-50 border-l-[3px] border-l-blue-500" : "border-l-[3px] border-l-transparent hover:bg-gray-50"}`}>
                  <span className={item.count === 0 ? "text-gray-300" : "text-gray-700"}>{item.label}</span>
                  <span className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[11px] font-medium ${item.count === 0 ? "bg-gray-200 text-gray-400" : "bg-gray-900 text-white"}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.tradeNumber")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.membershipCode")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.category")}</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>{t("orders.common.all")}</option><option>{t("orders.tradeServices.export")}</option><option>{t("orders.tradeServices.import")}</option><option>{t("orders.tradeServices.customs")}</option><option>{t("orders.tradeServices.consulting")}</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.filter.dateRange")}</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />{t("orders.action.reset")}</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />{t("orders.action.search")}</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end"><button className="h-8 px-3 text-sm border border-gray-300 rounded-md flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />{t("orders.action.excelDownload")}</button></div>

      {/* Table */}
      <div className="app-table-wrap">
        <table className="app-table">
          <thead><tr>
            <th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.no")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.tradeNumber")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.applicationDate")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.category")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.center")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.membershipCode")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.title")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.progressStatus")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.quotation")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.paidAmount")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.actions")}</th>
          </tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={12} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500"><span>{t("orders.common.total")}: 0</span>
        <div className="flex gap-1"><button className="h-8 px-3 border border-gray-300 rounded-md disabled:opacity-50" disabled>&laquo;</button><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span><button className="h-8 px-3 border border-gray-300 rounded-md">&raquo;</button></div>
      </div>
    </div>
  );
}
