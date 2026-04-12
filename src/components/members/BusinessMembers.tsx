"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Download,
  Search,
  Users,
  Crown,
  UserPlus,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Gift,
  Save,
} from "lucide-react";

interface BusinessMember {
  _id: string;
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  mailbox: string | null;
  level: string;
  totalAmount: number;
  applicationAcceptance: string;
  referredBy: string | null;
  points: number;
  personInCharge: string;
  orderCount: number;
  adminDesignatedDate: string | null;
  lastLogin: string | null;
  joinedAt: string | null;
  isBusiness: boolean;
  isEmailVerified: boolean;
  depositBalance: number;
  birthday: string | null;
  gender: string | null;
  addresses: any[];
  memo: string | null;
  unpaidAmount: number;
  pictureUrl: string | null;
}

// Empty data - ready for API integration
const mockMembers: BusinessMember[] = [];

export default function BusinessMembers() {
  const { t } = useLocale();
  const [searchText, setSearchText] = useState("");
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BusinessMember | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Message form
  const [msgType, setMsgType] = useState("sms");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgContent, setMsgContent] = useState("");

  // Statistics
  const [statistics] = useState({
    total: 0,
    vip: 0,
    newThisMonth: 0,
    dormant: 0,
  });

  const filteredMembers = useMemo(() => {
    return mockMembers.filter((m) => {
      if (searchText) {
        const lower = searchText.toLowerCase();
        if (
          !m.name.toLowerCase().includes(lower) &&
          !m.email.toLowerCase().includes(lower) &&
          !m.id.toLowerCase().includes(lower)
        )
          return false;
      }
      if (emailVerifiedFilter !== "all") {
        if (emailVerifiedFilter === "true" && !m.isEmailVerified) return false;
        if (emailVerifiedFilter === "false" && m.isEmailVerified) return false;
      }
      return true;
    });
  }, [searchText, emailVerifiedFilter]);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredMembers.length / pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedMembers.map((m) => m._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    }
  };

  const openEditModal = (member: BusinessMember) => {
    setSelectedMember(member);
    setEditModalVisible(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">{t("members.businessTitle")}</h2>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users size={16} />
            {t("members.totalBusiness")}
          </div>
          <div className="text-2xl font-bold text-gray-800">{statistics.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Crown size={16} />
            {t("members.vipMembers")}
          </div>
          <div className="text-2xl font-bold text-yellow-600">{statistics.vip}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <UserPlus size={16} />
            {t("members.newThisMonth")}
          </div>
          <div className="text-2xl font-bold text-green-600">{statistics.newThisMonth}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <AlertTriangle size={16} />
            {t("members.dormantMembers")}
          </div>
          <div className="text-2xl font-bold text-gray-500">{statistics.dormant}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("members.searchMember")}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <select
              value={emailVerifiedFilter}
              onChange={(e) => setEmailVerifiedFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t("members.emailVerificationAll")}</option>
              <option value="true">{t("members.emailVerified")}</option>
              <option value="false">{t("members.emailUnverified")}</option>
            </select>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
            <Download size={14} />
            {t("members.excelDownload")}
          </button>
        </div>

        {/* Selected actions bar */}
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-100">
            <span className="text-sm text-blue-700">
              {selectedRows.length} {t("members.selected")}
            </span>
            <button className="px-2 py-1 text-xs border border-blue-300 text-blue-700 rounded hover:bg-blue-100">
              {t("members.sendSelectedMessage")}
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedRows.length === paginatedMembers.length && paginatedMembers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-24">{t("members.membershipCode")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-28">{t("members.memberName")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-36">{t("members.memberId")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-28">{t("members.mailbox")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-28">{t("members.phone")}</th>
                <th className="text-right py-3 px-3 text-gray-600 font-medium w-28">{t("members.deposit")} ({"\u20A9"})</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-28">{t("members.applicationAcceptance")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-24">{t("members.referredBy")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-40">{t("members.email")}</th>
                <th className="text-right py-3 px-3 text-gray-600 font-medium w-28">{t("members.recommendationPoints")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-24">{t("members.personInCharge")}</th>
                <th className="text-center py-3 px-3 text-gray-600 font-medium w-20">{t("members.orderCount")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-40">{t("members.adminDesignatedDate")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-24">{t("members.lastLogin")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-24">{t("members.joinedAt")}</th>
                <th className="text-center py-3 px-3 text-gray-600 font-medium w-36">{t("members.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center py-12 text-gray-400">
                    {t("members.noData")}
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedRows.includes(member._id)}
                        onChange={(e) => handleSelectRow(member._id, e.target.checked)}
                      />
                    </td>
                    <td className="py-3 px-3 text-gray-700 break-all">{member.id || ""}</td>
                    <td className="py-3 px-3">
                      <span className="text-blue-600 underline cursor-pointer">
                        {member.name || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-3">{member.userId || ""}</td>
                    <td className="py-3 px-3">
                      {member.mailbox ? (
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs">
                          {member.mailbox}
                        </span>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="py-3 px-3">{member.phone || ""}</td>
                    <td className="py-3 px-3 text-right font-bold">
                      {(member.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-gray-400">{member.applicationAcceptance || ""}</td>
                    <td className="py-3 px-3">{member.referredBy || ""}</td>
                    <td className="py-3 px-3">{member.email || ""}</td>
                    <td className="py-3 px-3 text-right">{member.points}</td>
                    <td className="py-3 px-3 text-gray-400">{member.personInCharge || ""}</td>
                    <td className="py-3 px-3 text-center">{member.orderCount || 0}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          className="border border-gray-300 rounded px-2 py-1 text-xs w-28"
                          defaultValue={member.adminDesignatedDate || ""}
                        />
                        <button className="p-1 text-blue-600 hover:text-blue-700">
                          <Save size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">{member.lastLogin || ""}</td>
                    <td className="py-3 px-3">{member.joinedAt || ""}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 justify-center text-xs">
                        <a
                          className="text-blue-600 hover:underline cursor-pointer"
                          onClick={() => openEditModal(member)}
                        >
                          {t("members.edit")}
                        </a>
                        <span className="text-gray-300">|</span>
                        <a className="text-red-500 hover:underline cursor-pointer">
                          {t("members.black")}
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {t("members.showing")} {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredMembers.length)} {t("members.of")}{" "}
              {filteredMembers.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {editModalVisible && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {t("members.detailTitle")} - {selectedMember.name}
              </h3>
              <button onClick={() => setEditModalVisible(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {["basic", "order", "memo"].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "basic" && t("members.tabBasic")}
                  {tab === "order" && t("members.tabOrder")}
                  {tab === "memo" && t("members.tabMemo")}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "basic" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("members.memberId")}</span>
                    <p className="font-medium">{selectedMember.userId}</p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("members.memberName")}</span>
                    <p className="font-medium">{selectedMember.name}</p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 col-span-2">
                    <span className="text-gray-500">{t("members.email")}</span>
                    <p className="font-medium flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {selectedMember.email}
                      {selectedMember.isEmailVerified && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          {t("members.emailVerified")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 col-span-2">
                    <span className="text-gray-500">{t("members.phone")}</span>
                    <p className="font-medium flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {selectedMember.phone || "-"}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("members.points")}</span>
                    <p className="font-medium flex items-center gap-2">
                      <Gift size={14} className="text-gray-400" />
                      {(selectedMember.points || 0).toLocaleString()}P
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("members.deposit")}</span>
                    <p className="font-medium">
                      {(selectedMember.depositBalance || 0).toLocaleString()} {t("members.currency")}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "order" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("members.totalOrders")}</span>
                    <p className="font-bold">{selectedMember.orderCount} {t("members.count")}</p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("members.totalPayment")}</span>
                    <p className="font-bold text-blue-600">
                      {(selectedMember.totalAmount || 0).toLocaleString()} {t("members.currency")}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("members.unpaid")}</span>
                    <p className={selectedMember.unpaidAmount > 0 ? "font-bold text-red-500" : ""}>
                      {selectedMember.unpaidAmount > 0
                        ? `${selectedMember.unpaidAmount.toLocaleString()} ${t("members.currency")}`
                        : "-"}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("members.averageOrder")}</span>
                    <p className="font-medium">
                      {selectedMember.orderCount > 0
                        ? Math.floor((selectedMember.totalAmount || 0) / selectedMember.orderCount).toLocaleString()
                        : 0}{" "}
                      {t("members.currency")}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "memo" && (
                <div>
                  <textarea
                    rows={6}
                    defaultValue={selectedMember.memo || ""}
                    placeholder={t("members.adminMemoPlaceholder")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-4 text-right">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                      {t("members.save")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                onClick={() => setEditModalVisible(false)}
              >
                {t("members.close")}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                onClick={() => {
                  setEditModalVisible(false);
                  setSelectedMember(selectedMember);
                  setMessageModalVisible(true);
                }}
              >
                {t("members.sendMessage")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {messageModalVisible && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {t("members.sendMessageTitle")} - {selectedMember.name}
              </h3>
              <button onClick={() => setMessageModalVisible(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("members.sendMethod")}
                </label>
                <select
                  value={msgType}
                  onChange={(e) => setMsgType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sms">{t("members.sms")}</option>
                  <option value="email">{t("members.emailMethod")}</option>
                  <option value="both">{t("members.both")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("members.subject")}
                </label>
                <input
                  type="text"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder={t("members.subjectPlaceholder")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("members.content")}
                </label>
                <textarea
                  rows={6}
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder={t("members.contentPlaceholder")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                onClick={() => setMessageModalVisible(false)}
              >
                {t("members.cancel")}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                {t("members.send")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
