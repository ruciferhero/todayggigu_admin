"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, X, CreditCard } from "lucide-react";

export default function PaymentAgencyManagement() {
  const { t } = useLocale();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("Payment Agency Management");
  const [currentPage] = useState(1);

  const statusGroups = [
    { title: "Payment Agency", items: [
      { label: "Waiting for payment", count: 6, code: "WAITING_PAYMENT" },
      { label: "Deposit completed", count: 1, code: "DEPOSIT_COMPLETED" },
      { label: "Payment at purchase", count: 2, code: "PAYMENT_AT_PURCHASE" },
      { label: "Agency completed", count: 14, code: "AGENCY_COMPLETED" },
      { label: "Refund request", count: 1, code: "REFUND_REQUEST" },
      { label: "Refund completed", count: 3, code: "REFUND_COMPLETED" },
      { label: "Cancellation", count: 1, code: "CANCELLATION" },
    ]},
  ];

  const data = [
    { no: 1, member: "A10012", paymentType: "Alipay", orderNo: "PA-20260411-01", amount: "1,280,000", currency: "CNY", status: "Waiting for payment", requestDate: "2026-04-11 10:22", completion: "-" },
    { no: 2, member: "B30441", paymentType: "WeChat", orderNo: "PA-20260410-14", amount: "680,000", currency: "CNY", status: "Deposit completed", requestDate: "2026-04-10 18:10", completion: "2026-04-10 18:45" },
    { no: 3, member: "C77820", paymentType: "Bank", orderNo: "PA-20260409-08", amount: "2,150,000", currency: "KRW", status: "Agency completed", requestDate: "2026-04-09 14:05", completion: "2026-04-09 17:30" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{t("menu.paymentAgency")}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCode ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{selectedLabel}</span>
        </div>
        {selectedCode && <button onClick={() => { setSelectedCode(null); setSelectedLabel("Payment Agency Management"); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"><X className="w-4 h-4" />{t("orders.action.viewAll")}</button>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {statusGroups.map((group) => (
          <div key={group.title}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100"><CreditCard className="w-4 h-4 text-blue-500" /><span className="text-sm font-semibold text-gray-700">{group.title}</span></div>
            <div className="grid grid-cols-7 gap-0">
              {group.items.map((item) => (
                <div key={item.code} onClick={() => { setSelectedCode(item.code); setSelectedLabel(item.label); }} className={`flex flex-col items-center justify-center py-3 cursor-pointer transition border-r border-gray-100 last:border-r-0 ${selectedCode === item.code ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                  <span className={`text-xl font-bold ${item.count > 0 ? "text-gray-900" : "text-gray-300"}`}>{item.count.toLocaleString()}</span>
                  <span className="text-[11px] text-gray-500 text-center mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Payment Type</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option><option>Alipay</option><option>WeChat</option><option>UnionPay</option><option>Bank</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.membershipCode")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.orderNumber")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.filter.dateRange")}</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2"><button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />{t("orders.action.reset")}</button><button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />{t("orders.action.search")}</button></div>
        </div>
      </div>

      <div className="flex justify-end"><button className="h-8 px-3 text-sm border border-gray-300 rounded-md flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />{t("orders.action.excelDownload")}</button></div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="w-10 px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">No</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.membershipCode")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Payment Type</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.orderNumber")}</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Amount</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Currency</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Status</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Request Date</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Completion</th><th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th></tr></thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.no} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-3 py-2">{row.no}</td>
                <td className="px-3 py-2">{row.member}</td>
                <td className="px-3 py-2">{row.paymentType}</td>
                <td className="px-3 py-2 text-blue-600">{row.orderNo}</td>
                <td className="px-3 py-2">{row.amount}</td>
                <td className="px-3 py-2">{row.currency}</td>
                <td className="px-3 py-2"><span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{row.status}</span></td>
                <td className="px-3 py-2">{row.requestDate}</td>
                <td className="px-3 py-2">{row.completion}</td>
                <td className="px-3 py-2"><button className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500"><span>Total: {data.length}</span><div className="flex gap-1"><button className="h-8 px-3 border border-gray-300 rounded-md disabled:opacity-50" disabled>&laquo;</button><span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span><button className="h-8 px-3 border border-gray-300 rounded-md">&raquo;</button></div></div>
    </div>
  );
}
