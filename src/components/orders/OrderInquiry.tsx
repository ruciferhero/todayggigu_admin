"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Search,
  RotateCcw,
  Eye,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface InquiryRecord {
  key: string;
  orderNo: string;
  userName: string;
  userId: string;
  category: string;
  status: string;
  content: string;
  answer: string;
  createdAt: string;
  answeredAt: string;
  answeredBy: string;
  unreadCount?: number;
}

export default function OrderInquiry() {
  const { t } = useLocale();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchType, setSearchType] = useState<string>("content");
  const [searchText, setSearchText] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const inquiries: InquiryRecord[] = [];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t("orders.inquiry.title")}</h1>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("orders.inquiry.all")}</option>
            <option value="answered">{t("orders.inquiry.answered")}</option>
            <option value="unanswered">{t("orders.inquiry.unanswered")}</option>
          </select>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="content">{t("orders.inquiry.searchByContent")}</option>
            <option value="orderNo">{t("orders.inquiry.searchByOrderNo")}</option>
            <option value="memberName">{t("orders.inquiry.searchByMemberName")}</option>
          </select>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("orders.inquiry.searchPlaceholder")}
            className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            {t("orders.action.search")}
          </button>
          <button className="h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            {t("orders.action.reset")}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-12 px-2 py-2 text-center text-xs font-medium text-gray-500">No</th>
              <th className="w-[140px] px-3 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.inquiry.orderNo")}
              </th>
              <th className="w-[150px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.inquiry.memberNameId")}
              </th>
              <th className="w-[100px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.inquiry.memberManager")}
              </th>
              <th className="min-w-[200px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.inquiry.content")}
              </th>
              <th className="w-[100px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.inquiry.writer")}
              </th>
              <th className="w-[100px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.inquiry.status")}
              </th>
              <th className="w-[120px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.inquiry.registeredDate")}
              </th>
              <th className="w-[100px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.inquiry.answerer")}
              </th>
              <th className="w-[80px] px-2 py-2 text-center text-xs font-medium text-gray-500">
                {t("orders.common.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-20 text-center text-gray-400">
                  {t("page.underConstruction")}
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry, index) => (
                <tr key={inquiry.key} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-2 py-2 text-center text-xs text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                      {inquiry.orderNo}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="text-xs">{inquiry.userName}</div>
                    <div className="text-[11px] text-gray-500">{inquiry.userId}</div>
                  </td>
                  <td className="px-2 py-2 text-center text-xs text-gray-400">-</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setModalVisible(true);
                      }}
                      className="text-xs text-blue-600 hover:underline truncate block max-w-[300px]"
                    >
                      {inquiry.unreadCount && inquiry.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] mr-1">
                          {inquiry.unreadCount}
                        </span>
                      )}
                      {inquiry.content}
                    </button>
                  </td>
                  <td className="px-2 py-2 text-center text-xs">{inquiry.userName}</td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] rounded-full ${
                        inquiry.status === "answered"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {inquiry.status === "answered"
                        ? t("orders.inquiry.answered")
                        : t("orders.inquiry.unanswered")}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center text-[11px]">{inquiry.createdAt}</td>
                  <td className="px-2 py-2 text-center text-xs">
                    {inquiry.answeredBy || "-"}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button className="px-2 py-1 text-[11px] text-red-500 border border-red-300 rounded hover:bg-red-50 transition">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {t("orders.common.count")}: {inquiries.length.toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 px-2 text-sm border border-gray-300 rounded-md"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              &laquo;
            </button>
            <span className="h-8 px-3 flex items-center border border-gray-300 rounded-md bg-blue-50 text-blue-700 font-medium">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {modalVisible && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {t("orders.inquiry.detail")} - {selectedInquiry.orderNo}
              </h3>
              <button
                onClick={() => setModalVisible(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">{t("orders.inquiry.orderNo")}:</span>
                  <span className="ml-2">{selectedInquiry.orderNo}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">{t("orders.inquiry.memberNameId")}:</span>
                  <span className="ml-2">{selectedInquiry.userName} ({selectedInquiry.userId})</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-500 mb-1">{t("orders.inquiry.content")}:</div>
                <div className="text-sm">{selectedInquiry.content}</div>
              </div>
              {selectedInquiry.answer && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-600 mb-1">{t("orders.inquiry.answer")}:</div>
                  <div className="text-sm">{selectedInquiry.answer}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  {t("orders.inquiry.replyPlaceholder")}
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder={t("orders.inquiry.replyPlaceholder")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                {t("orders.action.cancel")}
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {t("orders.inquiry.reply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
