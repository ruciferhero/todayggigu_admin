"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, X } from "lucide-react";

interface MembershipLevel {
  id: string;
  gradeNumber: string;
  gradeName: string;
  numberOfDeliveries: string;
  purchaseFee: string;
  serviceFee: string;
  levelUpCoupon: string;
  pointAccumulation: string;
  exchangeRates: string;
  usageStatus: string;
}

const MembershipLevels: React.FC = () => {
  const { t } = useLocale();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MembershipLevel | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MembershipLevel | null>(null);
  const [formData, setFormData] = useState({
    gradeName: "", purchaseFee: "", serviceFee: "", deliveryStart: "", deliveryEnd: "",
    couponPrice: "", couponCount: "", pointAccumulation: "", exchangeRates: "", usageStatus: "active",
  });

  const sampleData: MembershipLevel[] = [
    { id: "1", gradeNumber: "1", gradeName: "\uBC30\uB300\uC9C0\uD68C\uC6D0", numberOfDeliveries: "\u20A9 - \u20A90", purchaseFee: "2%", serviceFee: "4%", levelUpCoupon: "\u20A90 / 0 / 0 / 0", pointAccumulation: "5%", exchangeRates: "\u20A9 / 5 %", usageStatus: "\uC0AC\uC6A9" },
    { id: "2", gradeNumber: "2", gradeName: "\uC0AC\uC5C5\uC790", numberOfDeliveries: "\u20A9 - \u20A90", purchaseFee: "0%", serviceFee: "0%", levelUpCoupon: "\u20A90 / 0 / 0 / 0", pointAccumulation: "0%", exchangeRates: "\u20A9 / 5 %", usageStatus: "\uC0AC\uC6A9\uC911" },
    { id: "3", gradeNumber: "3", gradeName: "\uBC30\uC1A1\uB300\uD589 VIP", numberOfDeliveries: "\u20A9 - \u20A90", purchaseFee: "1%", serviceFee: "3%", levelUpCoupon: "\u20A9 / 500 / 0 / 0", pointAccumulation: "5%", exchangeRates: "\u20A9 / 5 %", usageStatus: "\uC0AC\uC6A9" },
    { id: "4", gradeNumber: "4", gradeName: "\uAD6C\uB9E4\uB300\uD589 \uC0AC\uC5C5\uC790", numberOfDeliveries: "-500 - 1000", purchaseFee: "1%", serviceFee: "2%", levelUpCoupon: "\u20A90 / 0 / 0 / 0", pointAccumulation: "0%", exchangeRates: "\u20A9 / 5 %", usageStatus: "\uC0AC\uC6A9" },
    { id: "5", gradeNumber: "5", gradeName: "\uAD6C\uB9E4\uB300\uD589 VIP", numberOfDeliveries: "5000 - 50000", purchaseFee: "1%", serviceFee: "2%", levelUpCoupon: "\u20A90 / 0 / 0 / 0", pointAccumulation: "0%", exchangeRates: "\u20A9 / 5 %", usageStatus: "\uC0AC\uC6A9" },
    { id: "6", gradeNumber: "6", gradeName: "\uBC30\uC1A1\uB300\uD589 SVIP", numberOfDeliveries: "180000 - 1389000", purchaseFee: "1%", serviceFee: "5%", levelUpCoupon: "\u20A90 / 0 / 0", pointAccumulation: "5%", exchangeRates: "\u20A9 / 5 %", usageStatus: "\uC0AC\uC6A9" },
    { id: "7", gradeNumber: "7", gradeName: "TT \uC0AC\uC5C5\uC790", numberOfDeliveries: "1 - 1", purchaseFee: "1%", serviceFee: "2%", levelUpCoupon: "\u20A90 / 0 / 0", pointAccumulation: "0%", exchangeRates: "\u20A90 / 0", usageStatus: "\uC0AC\uC6A9\uC911" },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({ gradeName: "", purchaseFee: "", serviceFee: "", deliveryStart: "", deliveryEnd: "", couponPrice: "", couponCount: "", pointAccumulation: "", exchangeRates: "", usageStatus: "active" });
    setModalVisible(true);
  };

  const handleEdit = (record: MembershipLevel) => {
    setEditingRecord(record);
    setFormData({
      gradeName: record.gradeName, purchaseFee: parseFloat(record.purchaseFee).toString(), serviceFee: parseFloat(record.serviceFee).toString(),
      deliveryStart: "", deliveryEnd: "", couponPrice: "", couponCount: "",
      pointAccumulation: parseFloat(record.pointAccumulation).toString(), exchangeRates: "", usageStatus: "active",
    });
    setModalVisible(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("settings.membershipLevel.title")}</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" />{t("settings.membershipLevel.register")}
          </button>
        </div>
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.gradeNumber")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.membershipLevel.gradeName")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.numberOfDeliveries")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.purchaseFee")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.serviceFee")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.levelUpCoupon")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.pointAccumulation")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.exchangeRates")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.usageStatus")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.membershipLevel.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-center">{record.gradeNumber}</td>
                  <td className="px-4 py-3">{record.gradeName}</td>
                  <td className="px-4 py-3 text-center">{record.numberOfDeliveries}</td>
                  <td className="px-4 py-3 text-center">{record.purchaseFee}</td>
                  <td className="px-4 py-3 text-center">{record.serviceFee}</td>
                  <td className="px-4 py-3 text-center">{record.levelUpCoupon}</td>
                  <td className="px-4 py-3 text-center">{record.pointAccumulation}</td>
                  <td className="px-4 py-3 text-center">{record.exchangeRates}</td>
                  <td className="px-4 py-3 text-center">{record.usageStatus}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800 text-xs">{t("settings.membershipLevel.edit")}</button>
                      <button onClick={() => setDeleteConfirm(record)} className="text-red-600 hover:text-red-800 text-xs">{t("settings.membershipLevel.delete")}</button>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("settings.membershipLevel.modal.title")}</h2>
              <button onClick={() => setModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.membershipLevel.modal.gradeName")}</label>
                <input value={formData.gradeName} onChange={(e) => setFormData({ ...formData, gradeName: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.membershipLevel.modal.purchaseFee")}</label>
                <div className="flex items-center gap-2"><input type="number" value={formData.purchaseFee} onChange={(e) => setFormData({ ...formData, purchaseFee: e.target.value })} className="border rounded-md px-3 py-2 text-sm flex-1" /><span className="text-sm">%</span></div>
              </div>
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.membershipLevel.modal.serviceFee")}</label>
                <div className="flex items-center gap-2"><input type="number" value={formData.serviceFee} onChange={(e) => setFormData({ ...formData, serviceFee: e.target.value })} className="border rounded-md px-3 py-2 text-sm flex-1" /><span className="text-sm">%</span></div>
              </div>
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.membershipLevel.modal.numberOfDeliveries")}</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={formData.deliveryStart} onChange={(e) => setFormData({ ...formData, deliveryStart: e.target.value })} className="border rounded-md px-3 py-2 text-sm w-36" />
                  <span>~</span>
                  <input type="number" value={formData.deliveryEnd} onChange={(e) => setFormData({ ...formData, deliveryEnd: e.target.value })} className="border rounded-md px-3 py-2 text-sm w-36" />
                </div>
              </div>
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.membershipLevel.modal.levelUpCoupon")}</label>
                <div className="flex items-center gap-2">
                  <span>\u20A9</span>
                  <input type="number" value={formData.couponPrice} onChange={(e) => setFormData({ ...formData, couponPrice: e.target.value })} placeholder="Price" className="border rounded-md px-3 py-2 text-sm w-36" />
                  <span>x</span>
                  <input type="number" value={formData.couponCount} onChange={(e) => setFormData({ ...formData, couponCount: e.target.value })} placeholder="Count" className="border rounded-md px-3 py-2 text-sm w-36" />
                </div>
              </div>
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.membershipLevel.modal.pointAccumulation")}</label>
                <div className="flex items-center gap-2"><input type="number" value={formData.pointAccumulation} onChange={(e) => setFormData({ ...formData, pointAccumulation: e.target.value })} className="border rounded-md px-3 py-2 text-sm flex-1" /><span className="text-sm">%</span></div>
              </div>
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.membershipLevel.modal.exchangeRates")}</label>
                <div className="flex items-center gap-2"><input type="number" value={formData.exchangeRates} onChange={(e) => setFormData({ ...formData, exchangeRates: e.target.value })} className="border rounded-md px-3 py-2 text-sm flex-1" /><span className="text-sm">\u20A9</span></div>
              </div>
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-right">{t("settings.membershipLevel.modal.usageStatus")}</label>
                <select value={formData.usageStatus} onChange={(e) => setFormData({ ...formData, usageStatus: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                  <option value="active">{t("settings.membershipLevel.modal.active")}</option>
                  <option value="inactive">{t("settings.membershipLevel.modal.inactive")}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("settings.membershipLevel.cancel")}</button>
              <button onClick={() => { console.log("Save:", formData); setModalVisible(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("settings.membershipLevel.save")}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">{t("settings.membershipLevel.deleteConfirm")}</h3>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-md text-sm">{t("settings.membershipLevel.cancel")}</button>
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">{t("settings.membershipLevel.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipLevels;
