"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, X } from "lucide-react";

interface DepositAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  depositor: string;
  whetherToUse: string;
}

const DepositAccounts: React.FC = () => {
  const { t } = useLocale();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DepositAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DepositAccount | null>(null);
  const [formData, setFormData] = useState({ bankName: "", accountNumber: "", depositor: "", whetherToUse: "use" });

  const sampleData: DepositAccount[] = [
    { id: "1", bankName: "Kookmin Bank", accountNumber: "171301-04-303985", depositor: "Today's Global Purchase (Yedaesong)", whetherToUse: "use" },
  ];

  const handleRegister = () => {
    setEditingRecord(null);
    setFormData({ bankName: "", accountNumber: "", depositor: "", whetherToUse: "use" });
    setModalVisible(true);
  };

  const handleEdit = (record: DepositAccount) => {
    setEditingRecord(record);
    setFormData({ bankName: record.bankName, accountNumber: record.accountNumber, depositor: record.depositor, whetherToUse: record.whetherToUse });
    setModalVisible(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("settings.depositAccount.title")}</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button onClick={handleRegister} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" />{t("settings.depositAccount.register")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.depositAccount.id")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.depositAccount.bankName")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.depositAccount.accountNumber")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.depositAccount.depositor")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.depositAccount.whetherToUse")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">-</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">{record.id}</td>
                  <td className="px-4 py-3">{record.bankName}</td>
                  <td className="px-4 py-3">{record.accountNumber}</td>
                  <td className="px-4 py-3">{record.depositor}</td>
                  <td className="px-4 py-3 text-center">{record.whetherToUse === "use" ? t("settings.depositAccount.use") : t("settings.depositAccount.notUse")}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800 text-xs">{t("settings.depositAccount.correction")}</button>
                      <button onClick={() => setDeleteConfirm(record)} className="text-red-600 hover:text-red-800 text-xs">{t("settings.depositAccount.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("settings.depositAccount.modal.title")}</h2>
              <button onClick={() => setModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.depositAccount.modal.bankName")}</label>
                  <input value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.depositAccount.modal.accountNumber")}</label>
                  <input value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.depositAccount.modal.depositor")}</label>
                  <input value={formData.depositor} onChange={(e) => setFormData({ ...formData, depositor: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.depositAccount.modal.whetherToUse")}</label>
                  <select value={formData.whetherToUse} onChange={(e) => setFormData({ ...formData, whetherToUse: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                    <option value="use">{t("settings.depositAccount.use")}</option>
                    <option value="notUse">{t("settings.depositAccount.notUse")}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("settings.depositAccount.close")}</button>
              <button onClick={() => { console.log("Save:", formData); setModalVisible(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("settings.depositAccount.save")}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">{t("settings.depositAccount.deleteConfirm")}</h3>
            <p className="text-sm text-gray-600 mb-4">{t("settings.depositAccount.deleteConfirmContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-md text-sm">{t("settings.depositAccount.cancel")}</button>
              <button onClick={() => { setDeleteConfirm(null); }} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">{t("settings.depositAccount.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositAccounts;
