"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Save,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EventCouponRecord {
  id: string;
  couponType: string;
  issuanceType: string;
  price: number;
  count: number;
  validDays: number;
  eventPeriod: string;
  createdAt: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EventCoupons() {
  const { t } = useLocale();

  // Form state
  const [price, setPrice] = useState(5000);
  const [count, setCount] = useState(1);
  const [validDays, setValidDays] = useState(60);
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");

  // Delete confirm
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Data
  const [records, setRecords] = useState<EventCouponRecord[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handleSave = () => {
    if (!eventStartDate || !eventEndDate) return;

    const eventPeriod = `${eventStartDate} ~ ${eventEndDate}`;

    const newRecord: EventCouponRecord = {
      id: Date.now().toString(),
      couponType: t("coupons.event.shippingFee"),
      issuanceType: t("coupons.event.membershipEvent"),
      price,
      count,
      validDays,
      eventPeriod,
      createdAt: new Date().toLocaleString("ko-KR"),
    };

    setRecords([newRecord, ...records]);
    setPrice(5000);
    setCount(1);
    setValidDays(60);
    setEventStartDate("");
    setEventEndDate("");
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      setRecords(records.filter((record) => record.id !== deleteTargetId));
    }
    setDeleteConfirmVisible(false);
    setDeleteTargetId(null);
  };

  // Pagination
  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const paginatedRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Form */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.event.couponType")}
            </label>
            <select
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 w-32"
            >
              <option>{t("coupons.event.shippingFee")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.event.issuanceType")}
            </label>
            <select
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 w-44"
            >
              <option>{t("coupons.event.membershipEvent")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.event.price")}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₩
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                className="w-36 border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.event.count")}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min={1}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <span className="text-sm text-gray-600">
                {t("coupons.event.pieces")}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.event.validDays")}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
                min={1}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <span className="text-sm text-gray-600">
                {t("coupons.event.days")}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.event.eventPeriod")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {t("coupons.event.save")}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left w-32">
                  {t("coupons.event.couponType")}
                </th>
                <th className="px-4 py-3 text-left w-44">
                  {t("coupons.event.issuanceType")}
                </th>
                <th className="px-4 py-3 text-left w-44">
                  {t("coupons.event.amount")}
                </th>
                <th className="px-4 py-3 text-left w-32">
                  {t("coupons.event.validDays")}
                </th>
                <th className="px-4 py-3 text-left w-48">
                  {t("coupons.event.eventPeriod")}
                </th>
                <th className="px-4 py-3 text-left w-44">
                  {t("coupons.event.createdAt")}
                </th>
                <th className="px-4 py-3 text-center w-24">
                  {t("coupons.event.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    {t("coupons.event.noData")}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{record.couponType}</td>
                    <td className="px-4 py-3">{record.issuanceType}</td>
                    <td className="px-4 py-3">
                      ₩{record.price.toLocaleString()} x {record.count}
                      {t("coupons.event.pieces")}
                    </td>
                    <td className="px-4 py-3">
                      {record.validDays}
                      {t("coupons.event.days")}
                    </td>
                    <td className="px-4 py-3">{record.eventPeriod}</td>
                    <td className="px-4 py-3">{record.createdAt}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 text-xs font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t("coupons.event.delete")}
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
            {records.length} {t("coupons.event.totalItems")}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                {t("coupons.event.deleteConfirmTitle")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("coupons.event.deleteConfirmContent")}
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setDeleteConfirmVisible(false);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                {t("coupons.event.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                {t("coupons.event.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
