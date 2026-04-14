"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, Pencil, Trash2, Shield, X } from "lucide-react";

interface Administrator {
  id: string;
  memberCode: string;
  memberLevel: string;
  memberName: string;
  userId: string;
  centerInCharge: string[];
  registrationDate: string;
}

const Administrators: React.FC = () => {
  const { t } = useLocale();
  const [modalVisible, setModalVisible] = useState(false);
  const [accessRightsModalVisible, setAccessRightsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Administrator | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);
  const [formData, setFormData] = useState({ userId: "", memberName: "", memberLevel: "", password: "", centerInCharge: [] as string[] });
  const [accessRights, setAccessRights] = useState<Record<string, boolean>>({});
  const [selectAllRights, setSelectAllRights] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Administrator | null>(null);

  const sampleData: Administrator[] = [
    { id: "1", memberCode: "12487", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "MBC", userId: "testtest", centerInCharge: ["\uAD11\uC8FC"], registrationDate: "2025-05-15 16:24" },
    { id: "2", memberCode: "12501", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "L \uAE40\uC740\uC815", userId: "testestesttest", centerInCharge: ["\uAD6D\uC81C"], registrationDate: "2025-05-25 11:56" },
    { id: "3", memberCode: "12144", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "\uBE44\uC988\uB137", userId: "LIUDANRONG", centerInCharge: ["\uAD11\uC8FC"], registrationDate: "2025-04-19 14:46" },
    { id: "4", memberCode: "12664", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "\uD55C\uC2B9\uD76C", userId: "RIANCHUNLING", centerInCharge: ["\uAD11\uC8FC", "\uAD6D\uC81C", "\uC774\uC6C3", "\uCCAD\uB3C4"], registrationDate: "2025-06-21 08:39" },
    { id: "5", memberCode: "12640", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "\uBB34\uBA85\uC528", userId: "RIMMUYAO", centerInCharge: ["\uAD11\uC8FC", "\uAD6D\uC81C", "\uC774\uC6C3", "\uCCAD\uB3C4"], registrationDate: "2025-06-12 11:13" },
    { id: "6", memberCode: "12618", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "\uC804\uB098\uD76C", userId: "QUANNAIHUA", centerInCharge: ["\uAD11\uC8FC", "\uAD6D\uC81C", "\uC774\uC6C3", "\uCCAD\uB3C4"], registrationDate: "2025-05-24 08:51" },
    { id: "7", memberCode: "12656", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "\uC624 \uC218 \uD604", userId: "CORRYUYAN", centerInCharge: ["\uAD6D\uC81C"], registrationDate: "2025-06-20 16:34" },
    { id: "8", memberCode: "11772", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "\uC18C \uB098 \uBB34", userId: "WANGYIPING", centerInCharge: ["\uAD6D\uC81C"], registrationDate: "2024-10-23 15:32" },
    { id: "9", memberCode: "11710", memberLevel: "\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790", memberName: "\uD669\uD76C", userId: "ZOULING", centerInCharge: ["\uAD6D\uC81C"], registrationDate: "2024-10-03 16:02" },
  ];

  const centerOptions = ["Guangzhou", "Jor", "neighbor", "Cheongdo", "Hangzhou"];

  const menuSections = [
    {
      key: "agency",
      label: t("settings.administrators.accessRightsModal.menu.agency"),
      items: [
        { id: "10101", label: "Total orders (10101)" },
        { id: "10108", label: "Unused (10108)" },
        { id: "10102", label: "Destination Order Management (10102)" },
        { id: "10103", label: "Deposit (Payment) Confirmation (10103)" },
        { id: "10105", label: "Unused (10105)" },
        { id: "10104", label: "No Data (10104)" },
        { id: "10106", label: "Order Inquiry (10106)" },
        { id: "10107", label: "Stock Inquiry (10107)" },
      ],
    },
    {
      key: "rocket",
      label: t("settings.administrators.accessRightsModal.menu.rocket"),
      items: [
        { id: "11601", label: "Rocket Order (11601)" },
        { id: "11602", label: "Deposit (Payment) Confirmation (11602)" },
      ],
    },
    {
      key: "trade",
      label: t("settings.administrators.accessRightsModal.menu.trade"),
      items: [
        { id: "11301", label: "Trade Service Comprehensive Management (11301)" },
        { id: "11302", label: "Deposit (Payment) Confirmation (11302)" },
      ],
    },
    {
      key: "payment",
      label: t("settings.administrators.accessRightsModal.menu.payment"),
      items: [
        { id: "11501", label: "Comprehensive Payment Agency Management (11501)" },
        { id: "11502", label: "Deposit (payment) confirmation (11502)" },
      ],
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({ userId: "", memberName: "", memberLevel: "", password: "", centerInCharge: [] });
    setModalVisible(true);
  };

  const handleEdit = (record: Administrator) => {
    setEditingRecord(record);
    setFormData({ userId: record.userId, memberName: record.memberName, memberLevel: record.memberLevel, password: "", centerInCharge: record.centerInCharge });
    setModalVisible(true);
  };

  const handleAccessRights = (record: Administrator) => {
    setSelectedAdmin(record);
    setAccessRights({ "agency-101": true, "agency-10101": true, "rocket-116": true, "rocket-11601": true });
    setAccessRightsModalVisible(true);
  };

  const handleModalOk = () => {
    console.log("Form values:", formData);
    setModalVisible(false);
  };

  const toggleCenter = (center: string) => {
    setFormData((prev) => ({
      ...prev,
      centerInCharge: prev.centerInCharge.includes(center) ? prev.centerInCharge.filter((c) => c !== center) : [...prev.centerInCharge, center],
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("settings.administrators.title")}</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" />
            {t("settings.administrators.addMember")}
          </button>
        </div>

        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.administrators.memberCode")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.administrators.memberLevel")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.administrators.memberName")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.administrators.userId")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.administrators.centerInCharge")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.administrators.registrationDate")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">-</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-center">{record.memberCode}</td>
                  <td className="px-4 py-3">{record.memberLevel}</td>
                  <td className="px-4 py-3">{record.memberName}</td>
                  <td className="px-4 py-3">{record.userId}</td>
                  <td className="px-4 py-3">{record.centerInCharge.join(", ")}</td>
                  <td className="px-4 py-3">{record.registrationDate}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800 text-xs">{t("settings.administrators.edit")}</button>
                      <button onClick={() => setDeleteConfirm(record)} className="text-red-600 hover:text-red-800 text-xs">{t("settings.administrators.delete")}</button>
                      <button onClick={() => handleAccessRights(record)} className="text-blue-600 hover:text-blue-800 text-xs">{t("settings.administrators.accessRights")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("settings.administrators.modal.title")}</h2>
              <button onClick={() => setModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.administrators.modal.userId")}</label>
                <input value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} placeholder="ID (required)" className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.administrators.modal.memberName")}</label>
                <input value={formData.memberName} onChange={(e) => setFormData({ ...formData, memberName: e.target.value })} placeholder="Korean name (required)" className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.administrators.modal.memberLevel")}</label>
                <select value={formData.memberLevel} onChange={(e) => setFormData({ ...formData, memberLevel: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                  <option value="">= Select</option>
                  <option value="\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790">\uC0AC\uC5C5\uC790\uAD00\uB9AC\uC790</option>
                  <option value="\uC77C\uBC18\uAD00\uB9AC\uC790">\uC77C\uBC18\uAD00\uB9AC\uC790</option>
                  <option value="\uC288\uD37C\uAD00\uB9AC\uC790">\uC288\uD37C\uAD00\uB9AC\uC790</option>
                </select>
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.administrators.modal.password")}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.administrators.modal.centerInCharge")}</label>
                <div className="flex flex-wrap gap-3">
                  {centerOptions.map((center) => (
                    <label key={center} className="flex items-center gap-1.5 text-sm">
                      <input type="checkbox" checked={formData.centerInCharge.includes(center)} onChange={() => toggleCenter(center)} className="rounded" />
                      {center}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("settings.administrators.close")}</button>
              <button onClick={handleModalOk} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("settings.administrators.save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Access Rights Modal */}
      {accessRightsModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("settings.administrators.accessRightsModal.title")}</h2>
              <button onClick={() => setAccessRightsModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <label className="flex items-center gap-2 mb-4 text-sm">
                <input type="checkbox" checked={selectAllRights} onChange={(e) => setSelectAllRights(e.target.checked)} className="rounded" />
                {t("settings.administrators.accessRightsModal.selectAll")}
              </label>

              <div className="border rounded">
                {menuSections.map((section) => (
                  <div key={section.key}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                      <span className="font-medium text-sm">{section.label}</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 text-xs">
                          <input type="checkbox" checked={!!accessRights[`${section.key}-${section.key === "agency" ? "101" : section.key === "rocket" ? "116" : section.key === "trade" ? "113" : "115"}`]} onChange={(e) => setAccessRights({ ...accessRights, [`${section.key}-${section.key === "agency" ? "101" : section.key === "rocket" ? "116" : section.key === "trade" ? "113" : "115"}`]: e.target.checked })} className="rounded" />
                          {t("settings.administrators.accessRightsModal.accessRights")} submenus
                        </label>
                        <label className="flex items-center gap-1.5 text-xs">
                          <input type="checkbox" className="rounded" />
                          {t("settings.administrators.accessRightsModal.selectAll")}
                        </label>
                      </div>
                    </div>
                    <div className="pl-10">
                      {section.items.map((item) => (
                        <div key={item.id} className="py-2 px-4 border-b border-gray-100 last:border-b-0">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!accessRights[`${section.key}-${item.id}`]} onChange={(e) => setAccessRights({ ...accessRights, [`${section.key}-${item.id}`]: e.target.checked })} className="rounded" />
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setAccessRightsModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("settings.administrators.close")}</button>
              <button onClick={() => { console.log("Access rights:", accessRights); setAccessRightsModalVisible(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("settings.administrators.save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">{t("settings.administrators.deleteConfirm")}</h3>
            <p className="text-sm text-gray-600 mb-4">{t("settings.administrators.deleteConfirmContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-md text-sm">{t("settings.administrators.cancel")}</button>
              <button onClick={() => { console.log("Delete:", deleteConfirm.id); setDeleteConfirm(null); }} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">{t("settings.administrators.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administrators;
