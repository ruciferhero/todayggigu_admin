"use client";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Search, RotateCcw, Download, MessageSquare, Eye } from "lucide-react";

export default function InventoryQuestions() {
  const { t } = useLocale();
  const [currentPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<{ orderNo: string; userName: string; content: string; answer?: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const data: { key: string; orderNo: string; userName: string; category: string; content: string; status: string; createdAt: string; answeredBy?: string; answer?: string }[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t("orders.inventoryQuestions.title")}</h1>
        <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />{t("orders.action.excelDownload")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.orderNumber")}</label>
            <input type="text" placeholder={t("orders.filter.orderNoPlaceholder")} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.membershipCode")}</label>
            <input type="text" placeholder={t("orders.filter.userNamePlaceholder")} className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.category")}</label>
            <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md">
              <option>{t("orders.common.all")}</option>
              <option>{t("orders.inventoryQuestions.inventory")}</option>
              <option>{t("orders.inventoryQuestions.shipping")}</option>
              <option>{t("orders.inventoryQuestions.return")}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("orders.common.status")}</label>
            <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md">
              <option>{t("orders.common.all")}</option>
              <option>{t("orders.common.answered")}</option>
              <option>{t("orders.common.unanswered")}</option>
            </select>
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

      {/* Table */}
      <div className="app-table-wrap">
        <table className="app-table">
          <thead>
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.no")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.orderNumber")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.membershipCode")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.category")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.content")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.status")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.createdAt")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.answeredBy")}</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">{t("orders.common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={9} className="py-20 text-center text-gray-400">{t("page.underConstruction")}</td></tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item.key}>
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2 text-blue-600">{item.orderNo}</td>
                  <td className="px-3 py-2">{item.userName}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{item.category}</span></td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{item.content}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${item.status === "Answered" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{item.status === "Answered" ? t("orders.common.answered") : t("orders.common.unanswered")}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{item.createdAt}</td>
                  <td className="px-3 py-2">{item.answeredBy || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => { setSelectedQuestion(item); setModalVisible(true); }} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                        <Eye className="w-3 h-3" />{t("orders.common.detail")}
                      </button>
                      <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />{t("orders.common.reply")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{t("orders.common.total")}: {data.length}</span>
        <div className="flex gap-1">
          <button className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>&laquo;</button>
          <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">{currentPage}</span>
          <button className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50">&raquo;</button>
        </div>
      </div>

      {/* Question Detail Modal */}
      {modalVisible && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalVisible(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{t("orders.inventoryQuestions.detailTitle")}</h2>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium text-gray-500">{t("orders.inventoryQuestions.order")}:</span> {selectedQuestion.orderNo}</div>
              <div><span className="font-medium text-gray-500">{t("orders.inventoryQuestions.member")}:</span> {selectedQuestion.userName}</div>
              <div><span className="font-medium text-gray-500">{t("orders.inventoryQuestions.question")}:</span> {selectedQuestion.content}</div>
              <div><span className="font-medium text-gray-500">{t("orders.common.answer")}:</span> {selectedQuestion.answer || t("orders.common.notAnsweredYet")}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setModalVisible(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">{t("orders.common.close")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
