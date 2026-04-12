"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CouponIssuanceRecord {
  id: string;
  couponType: string;
  issuanceType: string;
  couponTypeAndIssuance: string;
  amount: number;
  effectiveDate: string;
  memberName: string;
  memberId: string;
  isUsed: boolean;
  issuanceDate: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CouponIssuance() {
  const { t } = useLocale();

  // State
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Member modal state
  const [memberSearchType, setMemberSearchType] = useState("memberId");
  const [memberSearchText, setMemberSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [memberIssuanceType, setMemberIssuanceType] = useState("");
  const [memberPrice, setMemberPrice] = useState(5000);
  const [memberCount, setMemberCount] = useState(1);
  const [memberValidDays, setMemberValidDays] = useState(60);
  const [memberSmsOption, setMemberSmsOption] = useState("noSms");

  // Level modal state
  const [selectedLevel, setSelectedLevel] = useState("");
  const [levelIssuanceType, setLevelIssuanceType] = useState("");
  const [levelPrice, setLevelPrice] = useState(5000);
  const [levelCount, setLevelCount] = useState(1);
  const [levelValidDays, setLevelValidDays] = useState(60);
  const [levelSmsOption, setLevelSmsOption] = useState("noSms");

  // Filter state
  const [filterCouponType, setFilterCouponType] = useState("");
  const [filterIssuanceType, setFilterIssuanceType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMemberName, setFilterMemberName] = useState("");
  const [filterMemberId, setFilterMemberId] = useState("");
  const [filterOrderNumber, setFilterOrderNumber] = useState("");
  const [filterIsUsed, setFilterIsUsed] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Data
  const [records, setRecords] = useState<CouponIssuanceRecord[]>([]);

  const handleMemberSearch = () => {
    setSearchResults([
      { id: "MEMBER720", name: "홍길동" },
      { id: "MEMBER721", name: "김철수" },
      { id: "MEMBER722", name: "이영희" },
    ]);
  };

  const handleMemberIssuance = () => {
    console.log("Member issuance:", {
      member: selectedMember,
      issuanceType: memberIssuanceType,
      price: memberPrice,
      count: memberCount,
      validDays: memberValidDays,
      smsOption: memberSmsOption,
    });
    setMemberModalVisible(false);
    resetMemberForm();
  };

  const handleLevelIssuance = () => {
    console.log("Level issuance:", {
      level: selectedLevel,
      issuanceType: levelIssuanceType,
      price: levelPrice,
      count: levelCount,
      validDays: levelValidDays,
      smsOption: levelSmsOption,
    });
    setLevelModalVisible(false);
    resetLevelForm();
  };

  const resetMemberForm = () => {
    setMemberSearchType("memberId");
    setMemberSearchText("");
    setSearchResults([]);
    setSelectedMember(null);
    setMemberIssuanceType("");
    setMemberPrice(5000);
    setMemberCount(1);
    setMemberValidDays(60);
    setMemberSmsOption("noSms");
  };

  const resetLevelForm = () => {
    setSelectedLevel("");
    setLevelIssuanceType("");
    setLevelPrice(5000);
    setLevelCount(1);
    setLevelValidDays(60);
    setLevelSmsOption("noSms");
  };

  const handleDelete = () => {
    if (selectedRowKeys.length === 0) return;
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    setRecords(records.filter((record) => !selectedRowKeys.includes(record.id)));
    setSelectedRowKeys([]);
    setDeleteConfirmVisible(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(paginatedRecords.map((r) => r.id));
    } else {
      setSelectedRowKeys([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, id]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== id));
    }
  };

  const handleSearch = () => {
    console.log("Search filters:", {
      filterCouponType,
      filterIssuanceType,
      filterStartDate,
      filterEndDate,
      filterMemberName,
      filterMemberId,
      filterOrderNumber,
      filterIsUsed,
    });
  };

  const handleReset = () => {
    setFilterCouponType("");
    setFilterIssuanceType("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterMemberName("");
    setFilterMemberId("");
    setFilterOrderNumber("");
    setFilterIsUsed("");
  };

  // Pagination
  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const paginatedRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const levels = [
    { value: "all", label: t("coupons.issuance.level.all") },
    { value: "basic", label: t("coupons.issuance.level.basic") },
    { value: "shippingVip", label: t("coupons.issuance.level.shippingVip") },
    { value: "shippingSvip", label: t("coupons.issuance.level.shippingSvip") },
    {
      value: "purchaseBusiness",
      label: t("coupons.issuance.level.purchaseBusiness"),
    },
    { value: "purchase", label: t("coupons.issuance.level.purchase") },
    { value: "agencyVip", label: t("coupons.issuance.level.agencyVip") },
    { value: "ttBusiness", label: t("coupons.issuance.level.ttBusiness") },
    { value: "ttVip", label: t("coupons.issuance.level.ttVip") },
    { value: "ttPersonal", label: t("coupons.issuance.level.ttPersonal") },
  ];

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setMemberModalVisible(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            {t("coupons.issuance.memberButton")}
          </button>
          <button
            onClick={() => setLevelModalVisible(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <Users className="w-4 h-4" />
            {t("coupons.issuance.levelButton")}
          </button>
          {selectedRowKeys.length > 0 && (
            <span className="text-sm text-gray-500">
              {t("coupons.issuance.selectedCount").replace(
                "{count}",
                String(selectedRowKeys.length)
              )}
            </span>
          )}
          <button
            onClick={handleDelete}
            disabled={selectedRowKeys.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {t("coupons.issuance.deleteButton")}
          </button>
        </div>

        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.issuance.table.couponType")}
            </label>
            <select
              value={filterCouponType}
              onChange={(e) => setFilterCouponType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("coupons.issuance.filter.all")}</option>
              <option value="shipping">
                {t("coupons.issuance.shippingFee")}
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.issuance.table.issuanceType")}
            </label>
            <select
              value={filterIssuanceType}
              onChange={(e) => setFilterIssuanceType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("coupons.issuance.filter.all")}</option>
              <option value="membershipEvent">
                {t("coupons.issuance.filter.membershipEvent")}
              </option>
              <option value="adminIssued">
                {t("coupons.issuance.filter.adminIssued")}
              </option>
              <option value="upgradeEvent">
                {t("coupons.issuance.filter.upgradeEvent")}
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.issuance.filter.period")}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.issuance.table.isUsed")}
            </label>
            <select
              value={filterIsUsed}
              onChange={(e) => setFilterIsUsed(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("coupons.issuance.filter.all")}</option>
              <option value="true">{t("coupons.issuance.filter.used")}</option>
              <option value="false">
                {t("coupons.issuance.filter.unused")}
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.issuance.table.ownerMember")}
            </label>
            <input
              type="text"
              value={filterMemberName}
              onChange={(e) => setFilterMemberName(e.target.value)}
              placeholder={t("coupons.issuance.filter.memberNamePlaceholder")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.issuance.filter.memberId")}
            </label>
            <input
              type="text"
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              placeholder={t("coupons.issuance.filter.memberIdPlaceholder")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("coupons.issuance.filter.orderNumber")}
            </label>
            <input
              type="text"
              value={filterOrderNumber}
              onChange={(e) => setFilterOrderNumber(e.target.value)}
              placeholder={t("coupons.issuance.filter.orderNumberPlaceholder")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              {t("coupons.issuance.filter.search")}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            >
              {t("coupons.issuance.filter.reset")}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedRecords.length > 0 &&
                      paginatedRecords.every((r) =>
                        selectedRowKeys.includes(r.id)
                      )
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left w-16">No</th>
                <th className="px-4 py-3 text-left">
                  {t("coupons.issuance.table.couponTypeAndIssuance")}
                </th>
                <th className="px-4 py-3 text-left">
                  {t("coupons.issuance.table.amount")}
                </th>
                <th className="px-4 py-3 text-left">
                  {t("coupons.issuance.table.effectiveDate")}
                </th>
                <th className="px-4 py-3 text-left">
                  {t("coupons.issuance.table.ownerMember")}
                </th>
                <th className="px-4 py-3 text-left">
                  {t("coupons.issuance.table.isUsed")}
                </th>
                <th className="px-4 py-3 text-left">
                  {t("coupons.issuance.table.issuanceDate")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    {t("coupons.issuance.noData")}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRowKeys.includes(record.id)}
                        onChange={(e) =>
                          handleSelectRow(record.id, e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {record.couponTypeAndIssuance}
                    </td>
                    <td className="px-4 py-3">
                      ₩{record.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{record.effectiveDate}</td>
                    <td className="px-4 py-3">
                      <div>{record.memberName}</div>
                      <div className="text-xs text-gray-400">
                        ({record.memberId})
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          record.isUsed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.isUsed
                          ? t("coupons.issuance.filter.used")
                          : t("coupons.issuance.filter.unused")}
                      </span>
                    </td>
                    <td className="px-4 py-3">{record.issuanceDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {records.length} {t("coupons.issuance.totalItems")}
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

      {/* Member Issuance Modal */}
      {memberModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {t("coupons.issuance.modalTitle")}
              </h3>
              <button
                onClick={() => {
                  setMemberModalVisible(false);
                  resetMemberForm();
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Member Search */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.memberSearch")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <select
                      value={memberSearchType}
                      onChange={(e) => setMemberSearchType(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-36"
                    >
                      <option value="memberId">
                        {t("coupons.issuance.memberId")}
                      </option>
                      <option value="memberName">
                        {t("coupons.issuance.memberName")}
                      </option>
                      <option value="phone">
                        {t("coupons.issuance.phone")}
                      </option>
                    </select>
                    <input
                      type="text"
                      value={memberSearchText}
                      onChange={(e) => setMemberSearchText(e.target.value)}
                      placeholder={t("coupons.issuance.searchPlaceholder")}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleMemberSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      {t("coupons.issuance.filter.search")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="flex items-start gap-4">
                  <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                    {t("coupons.issuance.searchResults")}
                  </label>
                  <select
                    onChange={(e) => {
                      const member = searchResults.find(
                        (m) => m.id === e.target.value
                      );
                      if (member) setSelectedMember(member);
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">
                      {t("coupons.issuance.selectMemberPlaceholder")}
                    </option>
                    {searchResults.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selected Member */}
              {selectedMember && (
                <div className="flex items-start gap-4">
                  <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                    {t("coupons.issuance.selectedMember")}
                  </label>
                  <input
                    type="text"
                    value={`${selectedMember.name} (${selectedMember.id})`}
                    disabled
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
              )}

              {/* Coupon Type */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.couponType")}
                </label>
                <input
                  type="text"
                  value={t("coupons.issuance.shippingFee")}
                  disabled
                  className="w-48 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                />
              </div>

              {/* Amount */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.amount")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t("coupons.issuance.price")}</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ₩
                    </span>
                    <input
                      type="number"
                      value={memberPrice}
                      onChange={(e) => setMemberPrice(Number(e.target.value))}
                      min={0}
                      className="w-36 border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm"
                    />
                  </div>
                  <span className="text-sm">{t("coupons.issuance.count")}</span>
                  <input
                    type="number"
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    min={1}
                    className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <span className="text-sm">
                    {t("coupons.issuance.pieces")}
                  </span>
                </div>
              </div>

              {/* Issuance Type */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.issuanceType")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={memberIssuanceType}
                  onChange={(e) => setMemberIssuanceType(e.target.value)}
                  className="w-72 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">{t("coupons.issuance.filter.select")}</option>
                  <option value="membershipEvent">
                    {t("coupons.issuance.filter.membershipEvent")}
                  </option>
                  <option value="adminIssued">
                    {t("coupons.issuance.filter.adminIssued")}
                  </option>
                  <option value="upgradeEvent">
                    {t("coupons.issuance.filter.upgradeEvent")}
                  </option>
                </select>
              </div>

              {/* Valid Days */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.validDays")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {t("coupons.issuance.fromIssuanceDate")}
                  </span>
                  <input
                    type="number"
                    value={memberValidDays}
                    onChange={(e) => setMemberValidDays(Number(e.target.value))}
                    min={1}
                    className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <span className="text-sm">{t("coupons.issuance.days")}</span>
                </div>
              </div>

              {/* SMS Option */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.smsOption")}
                </label>
                <select
                  value={memberSmsOption}
                  onChange={(e) => setMemberSmsOption(e.target.value)}
                  className="w-48 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="noSms">{t("coupons.issuance.noSms")}</option>
                  <option value="sendSms">
                    {t("coupons.issuance.sendSms")}
                  </option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setMemberModalVisible(false);
                  resetMemberForm();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                {t("coupons.issuance.close")}
              </button>
              <button
                onClick={handleMemberIssuance}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                {t("coupons.issuance.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Issuance Modal */}
      {levelModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {t("coupons.issuance.modalTitle")}
              </h3>
              <button
                onClick={() => {
                  setLevelModalVisible(false);
                  resetLevelForm();
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Member Level */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.memberLevel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {levels.map((level) => (
                    <label key={level.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="memberLevel"
                        value={level.value}
                        checked={selectedLevel === level.value}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coupon Type */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.couponType")}
                </label>
                <input
                  type="text"
                  value={t("coupons.issuance.shippingFee")}
                  disabled
                  className="w-48 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                />
              </div>

              {/* Issuance Type */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.issuanceType")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={levelIssuanceType}
                  onChange={(e) => setLevelIssuanceType(e.target.value)}
                  className="w-72 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">{t("coupons.issuance.filter.select")}</option>
                  <option value="membershipEvent">
                    {t("coupons.issuance.filter.membershipEvent")}
                  </option>
                  <option value="adminIssued">
                    {t("coupons.issuance.filter.adminIssued")}
                  </option>
                  <option value="upgradeEvent">
                    {t("coupons.issuance.filter.upgradeEvent")}
                  </option>
                </select>
              </div>

              {/* Amount */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.amount")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t("coupons.issuance.price")}</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ₩
                    </span>
                    <input
                      type="number"
                      value={levelPrice}
                      onChange={(e) => setLevelPrice(Number(e.target.value))}
                      min={0}
                      className="w-36 border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm"
                    />
                  </div>
                  <span className="text-sm">{t("coupons.issuance.count")}</span>
                  <input
                    type="number"
                    value={levelCount}
                    onChange={(e) => setLevelCount(Number(e.target.value))}
                    min={1}
                    className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <span className="text-sm">
                    {t("coupons.issuance.pieces")}
                  </span>
                </div>
              </div>

              {/* Valid Days */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.validDays")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {t("coupons.issuance.fromIssuanceDate")}
                  </span>
                  <input
                    type="number"
                    value={levelValidDays}
                    onChange={(e) => setLevelValidDays(Number(e.target.value))}
                    min={1}
                    className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <span className="text-sm">{t("coupons.issuance.days")}</span>
                </div>
              </div>

              {/* SMS Option */}
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-medium text-gray-700 pt-2">
                  {t("coupons.issuance.smsOption")}
                </label>
                <select
                  value={levelSmsOption}
                  onChange={(e) => setLevelSmsOption(e.target.value)}
                  className="w-48 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="noSms">{t("coupons.issuance.noSms")}</option>
                  <option value="sendSms">
                    {t("coupons.issuance.sendSms")}
                  </option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setLevelModalVisible(false);
                  resetLevelForm();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                {t("coupons.issuance.close")}
              </button>
              <button
                onClick={handleLevelIssuance}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                {t("coupons.issuance.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                {t("coupons.issuance.deleteConfirmTitle")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("coupons.issuance.deleteConfirmContent").replace(
                  "{count}",
                  String(selectedRowKeys.length)
                )}
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setDeleteConfirmVisible(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                {t("coupons.issuance.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                {t("coupons.issuance.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
