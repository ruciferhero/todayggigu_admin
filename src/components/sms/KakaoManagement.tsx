"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface KakaoTemplateRecord {
  id: string;
  no: number;
  name: string;
  kakaoContent: string;
  replacementText: string;
  bytes: number;
  useStatus: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KakaoManagement() {
  const { t } = useLocale();

  // Data
  const [records] = useState<KakaoTemplateRecord[]>([]);

  // Editing state
  const [editingData, setEditingData] = useState<
    Record<string, Partial<KakaoTemplateRecord>>
  >({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handleTextChange = (id: string, field: string, value: string) => {
    setEditingData({
      ...editingData,
      [id]: {
        ...editingData[id],
        [field]: value,
      },
    });
  };

  const handleSave = (record: KakaoTemplateRecord) => {
    console.log("Save:", record.id, editingData[record.id]);
  };

  // Pagination
  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const paginatedRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 text-center w-16">No</th>
              <th className="px-3 py-3 text-left w-40">
                {t("sms.kakao.table.name")}
              </th>
              <th className="px-3 py-3 text-left" style={{ minWidth: 280 }}>
                {t("sms.kakao.table.kakaoContent")}
              </th>
              <th className="px-3 py-3 text-left" style={{ minWidth: 280 }}>
                {t("sms.kakao.table.replacementText")}
              </th>
              <th className="px-3 py-3 text-center w-24">
                {t("sms.kakao.table.bytes")}
              </th>
              <th className="px-3 py-3 text-center w-28">
                {t("sms.kakao.table.useStatus")}
              </th>
              <th className="px-3 py-3 text-center w-24">
                {t("sms.kakao.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-12 text-center text-gray-500"
                >
                  {t("sms.kakao.noData")}
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-100 hover:bg-gray-50 align-top"
                >
                  <td className="px-3 py-3 text-center">{record.no}</td>
                  <td className="px-3 py-3">{record.name}</td>
                  <td className="px-3 py-3">
                    <textarea
                      value={record.kakaoContent}
                      readOnly
                      rows={3}
                      className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm bg-gray-50 resize-none"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <textarea
                      defaultValue={record.replacementText}
                      onChange={(e) =>
                        handleTextChange(
                          record.id,
                          "replacementText",
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder={t("sms.kakao.placeholder.replacementText")}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="number"
                      defaultValue={record.bytes}
                      onChange={(e) =>
                        handleTextChange(record.id, "bytes", e.target.value)
                      }
                      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-center"
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <select
                      defaultValue={record.useStatus}
                      onChange={(e) =>
                        handleTextChange(
                          record.id,
                          "useStatus",
                          e.target.value
                        )
                      }
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="active">
                        {t("sms.kakao.status.active")}
                      </option>
                      <option value="inactive">
                        {t("sms.kakao.status.inactive")}
                      </option>
                    </select>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => handleSave(record)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium"
                    >
                      <Save className="w-3 h-3" />
                      {t("sms.kakao.save")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          {records.length} {t("sms.kakao.totalItems")}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
