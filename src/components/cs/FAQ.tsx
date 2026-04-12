"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, Download, Search, RotateCcw } from "lucide-react";

interface FAQItem {
  _id: string;
  number: number;
  title: string;
  author: string;
  views: number;
  createdAt: string;
  content?: string;
  isHeader?: string;
  isSecret?: boolean;
  category?: string;
  messageCount?: number;
}

const FAQ: React.FC = () => {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [data] = useState<FAQItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [searchNumber, setSearchNumber] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchAuthor, setSearchAuthor] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [searchIsHeader, setSearchIsHeader] = useState("");
  const [searchContent, setSearchContent] = useState("");

  const handleExport = () => {};
  const handleAdd = () => {};
  const handleView = (record: FAQItem) => { void record; };
  const handleSearch = () => {};

  const handleReset = () => {
    setSearchNumber("");
    setSearchTitle("");
    setSearchAuthor("");
    setSearchDateFrom("");
    setSearchDateTo("");
    setSearchIsHeader("");
    setSearchContent("");
  };

  const headerOptions = [
    { value: "join-membership", label: t("cs.faq.header.joinMembership") },
    { value: "apply-shipping-agency", label: t("cs.faq.header.applyShippingAgency") },
    { value: "combined-packaging", label: t("cs.faq.header.combinedPackaging") },
    { value: "overseas-return", label: t("cs.faq.header.overseasReturn") },
    { value: "incoming-outgoing-delivery", label: t("cs.faq.header.incomingOutgoingDelivery") },
    { value: "service-cost", label: t("cs.faq.header.serviceCost") },
    { value: "customs-clearance", label: t("cs.faq.header.customsClearance") },
    { value: "compensation", label: t("cs.faq.header.compensation") },
  ];

  const tabItems = [{ key: "all", label: t("cs.faq.tab.all") }];
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-4">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("cs.faq.number")}</label>
            <input type="text" value={searchNumber} onChange={(e) => setSearchNumber(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("cs.faq.fieldTitle")}</label>
            <input type="text" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("cs.faq.author")}</label>
            <input type="text" value={searchAuthor} onChange={(e) => setSearchAuthor(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("cs.faq.createdAt")}</label>
            <div className="flex space-x-2">
              <input type="date" value={searchDateFrom} onChange={(e) => setSearchDateFrom(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="date" value={searchDateTo} onChange={(e) => setSearchDateTo(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("cs.faq.isHeader")}</label>
            <select value={searchIsHeader} onChange={(e) => setSearchIsHeader(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">{t("cs.faq.isHeader")}</option>
              {headerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("cs.faq.content")}</label>
            <input type="text" value={searchContent} onChange={(e) => setSearchContent(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={handleReset} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <RotateCcw className="w-4 h-4 mr-1" />{t("cs.common.reset")}
          </button>
          <button onClick={handleSearch} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4 mr-1" />{t("cs.common.search")}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end space-x-2">
        <button onClick={handleAdd} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" />{t("cs.common.add")}
        </button>
        <button onClick={handleExport} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Download className="w-4 h-4 mr-1" />{t("cs.faq.export")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">{t("cs.faq.number")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-96">{t("cs.faq.fieldTitle")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-36">{t("cs.faq.author")}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">{t("cs.faq.views")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-44">{t("cs.faq.createdAt")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">{t("cs.common.noData")}</td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-sm">{record.number}</td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => handleView(record)} className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[400px] block text-left">
                      {record.isSecret && "\u{1F512} "}{record.title}
                      {record.messageCount && record.messageCount > 0 && ` [${record.messageCount}]`}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{record.author}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">{record.views}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(record.createdAt).toLocaleString("ko-KR")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{t("cs.common.total")}: {totalItems}</div>
        <div className="flex items-center space-x-2">
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">&lt;</button>
          <span className="text-sm text-gray-700">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
