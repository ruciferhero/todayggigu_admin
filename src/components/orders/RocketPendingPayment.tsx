"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { ShoppingCart, Warehouse, X, Download, Search, RotateCcw } from "lucide-react";

export default function RocketPendingPayment() {
  const { t } = useLocale();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("Rocket Pending Payment");
  const [currentPage, setCurrentPage] = useState(1);

  const paymentStatuses = [
    { label: t("orders.status.paymentPending") + " (Buy)", count: 0, code: "BUY_PAY_WAIT", color: "text-orange-500", icon: <ShoppingCart className="w-4 h-4" /> },
    { label: t("orders.status.paymentComplete") + " (Buy)", count: 0, code: "BUY_PAY_DONE", color: "text-green-500", icon: <ShoppingCart className="w-4 h-4" /> },
    { label: t("orders.status.paymentPending") + " (WH)", count: 0, code: "WH_PAY_WAIT", color: "text-blue-500", icon: <Warehouse className="w-4 h-4" /> },
    { label: t("orders.status.paymentComplete") + " (WH)", count: 0, code: "WH_PAY_DONE", color: "text-teal-500", icon: <Warehouse className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Rocket {t("orders.status.paymentPending")}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCode ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
            {selectedLabel}
          </span>
        </div>
        {selectedCode && (
          <button onClick={() => { setSelectedCode(null); setSelectedLabel("Rocket Pending Payment"); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <X className="w-4 h-4" /> {t("orders.action.viewAll")}
          </button>
        )}
      </div>

      {/* Payment Status Cards */}
      <div className="grid grid-cols-4 gap-3">
        {paymentStatuses.map((s) => (
          <div key={s.code} onClick={() => { setSelectedCode(s.code); setSelectedLabel(s.label); }}
            className={`bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition ${selectedCode === s.code ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={s.color}>{s.icon}</span>
                <span className="text-sm font-medium text-gray-700">{s.label}</span>
              </div>
              <span className={`text-2xl font-bold ${s.count > 0 ? "text-gray-900" : "text-gray-300"}`}>{s.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.filter.center")}</label>
            <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md">
              <option>{t("orders.filter.centerAll")}</option>
              <option>{t("orders.filter.centerWeihai")}</option>
              <option>{t("orders.filter.centerQingdao")}</option>
              <option>{t("orders.filter.centerGuangzhou")}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.membershipCode")}</label>
            <input type="text" placeholder={t("orders.filter.userNamePlaceholder")} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.orderNumber")}</label>
            <input type="text" placeholder={t("orders.filter.orderNoPlaceholder")} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" />
          </div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />{t("orders.action.reset")}
            </button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />{t("orders.action.search")}
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <button className="h-8 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />{t("orders.action.excelDownload")}
        </button>
      </div>

      {/* Table */}
      <div className="app-table-wrap">
        <table className="app-table">
          <thead>
            <tr>
              <th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">No</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.orderNumber")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">
                <div>{t("orders.common.membershipCode")}</div>
                <div>{t("orders.common.receiver")}</div>
              </th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.productType")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">
                <div>{t("orders.common.totalAmount")}</div>
                <div>({t("orders.common.weight")})</div>
              </th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.paidAmount")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.progressStatus")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.createdAt")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500">{t("orders.common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={10} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Total: 0</span>
        <div className="flex gap-1">
          <button className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>&laquo;</button>
          <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span>
          <button className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50">&raquo;</button>
        </div>
      </div>
    </div>
  );
}
