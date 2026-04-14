"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, MessageSquare, Eye, AlertCircle } from "lucide-react";

export default function OrderQuestions() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const data: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Order Questions</h1>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${filterStatus === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`} onClick={() => setFilterStatus("all")}>All</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${filterStatus === "unanswered" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`} onClick={() => setFilterStatus("unanswered")}>Unanswered</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${filterStatus === "answered" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`} onClick={() => setFilterStatus("answered")}>Answered</span>
          </div>
        </div>
        <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.orderNumber")}</label><input type="text" placeholder={t("orders.filter.orderNoPlaceholder")} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.membershipCode")}</label><input type="text" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Category</label><select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md"><option>All</option><option>General Inquiry</option><option>Shipping</option><option>Payment</option><option>Return/Refund</option></select></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.filter.dateRange")}</label><input type="date" className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" /></div>
          <div className="flex items-end gap-2">
            <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />{t("orders.action.reset")}</button>
            <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />{t("orders.action.search")}</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="app-table-wrap">
        <table className="app-table">
          <thead><tr>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">No</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.orderNumber")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.membershipCode")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Category</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Content</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Status</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.createdAt")}</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Answered At</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Answered By</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th>
          </tr></thead>
          <tbody>{data.length === 0 ? (<tr><td colSpan={10} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>) : null}</tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Total: 0</span>
        <div className="flex gap-1">
          <button className="h-8 px-3 border border-gray-300 rounded-md disabled:opacity-50" disabled>&laquo;</button>
          <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span>
          <button className="h-8 px-3 border border-gray-300 rounded-md">&raquo;</button>
        </div>
      </div>

      {/* Question Detail Modal */}
      {modalVisible && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalVisible(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Question Detail</h2>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium text-gray-500">Order:</span> {selectedQuestion.orderNo}</div>
              <div><span className="font-medium text-gray-500">Question:</span> {selectedQuestion.content}</div>
              <div><label className="block font-medium text-gray-500 mb-1">Answer:</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} placeholder="Enter your reply..." /></div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalVisible(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
