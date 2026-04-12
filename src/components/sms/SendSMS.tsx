"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MemberRecord {
  id: string;
  memberId: string;
  name: string;
  phone: string;
  createdAt: string;
}

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SendSMS() {
  const { t } = useLocale();

  // Form state
  const [recipientType, setRecipientType] = useState<"individual" | "group">(
    "individual"
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [groupValue, setGroupValue] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageLength, setMessageLength] = useState(0);

  // Tabs
  const [activeTab, setActiveTab] = useState<"storage" | "members">("storage");

  // Member list state
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearchId, setMemberSearchId] = useState("");
  const [memberSearchGrade, setMemberSearchGrade] = useState("");
  const [memberCurrentPage, setMemberCurrentPage] = useState(1);
  const memberPageSize = 10;

  // Data
  const members: MemberRecord[] = [];

  const messageTemplates: MessageTemplate[] = [
    {
      id: "1",
      title: "결제 요청",
      content: "12345 주문 건 배송비 결제 바랍니다.",
    },
    {
      id: "2",
      title: "주문(상품) 관련 방법",
      content: "12345 주문 건에 알림메시지가 있으니 확인바랍니다.",
    },
    {
      id: "3",
      title: "[국내도착] 통관완료(미결제)",
      content: "결제부탁합니다.",
    },
    {
      id: "4",
      title: "[국내도착] 국내배송",
      content: "택배업체에서 수거하였습니다. 익일 발송 예정",
    },
    {
      id: "5",
      title: "[해외 입/출고] 출고완료",
      content: "출고완료",
    },
    {
      id: "6",
      title: "[오류] 오류입고",
      content: "오류입고",
    },
  ];

  const gradeOptions = [
    { value: "basic", label: t("sms.grade.basic") },
    { value: "shippingAgency", label: t("sms.grade.shippingAgency") },
    { value: "shippingVip", label: t("sms.grade.shippingVip") },
    { value: "shippingSvip", label: t("sms.grade.shippingSvip") },
    { value: "purchaseBusiness", label: t("sms.grade.purchaseBusiness") },
    { value: "purchaseVip", label: t("sms.grade.purchaseVip") },
    { value: "ttBusiness", label: t("sms.grade.ttBusiness") },
    { value: "ttVip", label: t("sms.grade.ttVip") },
    { value: "ttSvip", label: t("sms.grade.ttSvip") },
  ];

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessageText(text);
    setMessageLength(text.length);
  };

  const handleTemplateClick = (template: MessageTemplate) => {
    setMessageText(template.content);
    setMessageLength(template.content.length);
  };

  const handleSend = () => {
    console.log("Send SMS:", {
      recipientType,
      phoneNumber,
      groupValue,
      messageText,
      selectedMembers,
    });
  };

  const handleClose = () => {
    setMessageText("");
    setMessageLength(0);
    setPhoneNumber("");
    setGroupValue("");
  };

  const handleSelectAllMembers = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(paginatedMembers.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, id]);
    } else {
      setSelectedMembers(selectedMembers.filter((k) => k !== id));
    }
  };

  // Member pagination
  const totalMemberPages = Math.ceil(members.length / memberPageSize) || 1;
  const paginatedMembers = members.slice(
    (memberCurrentPage - 1) * memberPageSize,
    memberCurrentPage * memberPageSize
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SMS Form */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("sms.form.recipient")}
            </label>
            <div className="space-y-2">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recipientType"
                    value="individual"
                    checked={recipientType === "individual"}
                    onChange={() => setRecipientType("individual")}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{t("sms.form.individual")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recipientType"
                    value="group"
                    checked={recipientType === "group"}
                    onChange={() => setRecipientType("group")}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{t("sms.form.group")}</span>
                </label>
              </div>
              {recipientType === "individual" ? (
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("sms.form.phonePlaceholder")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <select
                  value={groupValue}
                  onChange={(e) => setGroupValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("sms.form.selectGroup")}</option>
                  {gradeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Sender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("sms.form.sender")}
            </label>
            <input
              type="text"
              value="070-8286-6663"
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("sms.form.message")}
            </label>
            <textarea
              rows={6}
              value={messageText}
              onChange={handleMessageChange}
              placeholder={t("sms.form.messagePlaceholder")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Message Info */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              {t("sms.form.currentLength")}:{" "}
              <strong>{messageLength.toLocaleString()}</strong>{" "}
              {t("sms.form.bytes")}
            </p>
            <p className="text-xs text-gray-500">{t("sms.form.smsInfo")}</p>
            <p className="text-xs text-gray-500">{t("sms.form.lmsInfo")}</p>
            <p className="text-xs text-gray-500">{t("sms.form.mmsInfo")}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              {t("sms.form.send")}
            </button>
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            >
              <X className="w-4 h-4" />
              {t("sms.form.close")}
            </button>
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-7">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("storage")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "storage"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("sms.tabs.storage")}
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "members"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("sms.tabs.members")}
            </button>
          </div>

          {/* Tab Content: Message Storage */}
          {activeTab === "storage" && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t("sms.storage.title")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {messageTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <h4 className="text-sm font-medium text-gray-800 mb-1">
                      {template.title}
                    </h4>
                    <p className="text-xs text-gray-500 min-h-[48px]">
                      {template.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Member List */}
          {activeTab === "members" && (
            <div>
              {/* Member Search */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t("sms.member.memberId")}
                  </label>
                  <input
                    type="text"
                    value={memberSearchId}
                    onChange={(e) => setMemberSearchId(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t("sms.member.name")}
                  </label>
                  <select
                    value={memberSearchGrade}
                    onChange={(e) => setMemberSearchGrade(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-40"
                  >
                    <option value="">{t("sms.member.allGrades")}</option>
                    {gradeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    <Search className="w-3.5 h-3.5" />
                    {t("sms.member.search")}
                  </button>
                </div>
              </div>

              {/* Member Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left w-10">
                        <input
                          type="checkbox"
                          checked={
                            paginatedMembers.length > 0 &&
                            paginatedMembers.every((m) =>
                              selectedMembers.includes(m.id)
                            )
                          }
                          onChange={(e) =>
                            handleSelectAllMembers(e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-3 py-2 text-left">
                        {t("sms.member.memberId")}
                      </th>
                      <th className="px-3 py-2 text-left">
                        {t("sms.member.name")}
                      </th>
                      <th className="px-3 py-2 text-left">
                        {t("sms.member.phone")}
                      </th>
                      <th className="px-3 py-2 text-left">
                        {t("sms.member.createdAt")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-8 text-center text-gray-500 text-sm"
                        >
                          {t("sms.member.emptyText")}
                        </td>
                      </tr>
                    ) : (
                      paginatedMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(member.id)}
                              onChange={(e) =>
                                handleSelectMember(member.id, e.target.checked)
                              }
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-3 py-2">{member.memberId}</td>
                          <td className="px-3 py-2">{member.name}</td>
                          <td className="px-3 py-2">{member.phone}</td>
                          <td className="px-3 py-2">{member.createdAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Member Pagination */}
              <div className="flex items-center justify-end mt-3 gap-2">
                <button
                  disabled={memberCurrentPage <= 1}
                  onClick={() => setMemberCurrentPage(memberCurrentPage - 1)}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {memberCurrentPage} / {totalMemberPages}
                </span>
                <button
                  disabled={memberCurrentPage >= totalMemberPages}
                  onClick={() => setMemberCurrentPage(memberCurrentPage + 1)}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
