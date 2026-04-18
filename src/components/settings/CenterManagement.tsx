"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, AlignJustify, Pencil, Trash2, X, GripVertical, Upload } from "lucide-react";

interface Center {
  id: string;
  nation: string;
  center: string;
  centerCode: string;
  unitOfMeasurement: string;
  transportationMethod: string;
  address: string;
  phoneNumber: string;
  shippingCenter: string;
  whetherToUse: string;
}

const CenterManagement: React.FC = () => {
  const { t } = useLocale();
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [alignmentModalVisible, setAlignmentModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Center | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Center | null>(null);
  const [formData, setFormData] = useState({
    nation: "", centerName: "", centerCode: "", alCode: "", city: "", state: "",
    address1: "", address2: "", phoneNumber: "", weightUnit: "", transportationMethods: [] as string[],
    whetherToUse: "use", briefSummary: "",
  });

  const [centerOrder, setCenterOrder] = useState([
    { id: "1", name: t("settings.center.alignmentModal.center1") },
    { id: "2", name: t("settings.center.alignmentModal.center2") },
    { id: "3", name: t("settings.center.alignmentModal.center3") },
    { id: "4", name: t("settings.center.alignmentModal.center4") },
    { id: "5", name: t("settings.center.alignmentModal.center5") },
    { id: "6", name: t("settings.center.alignmentModal.center6") },
  ]);

  const sampleData: Center[] = [
    { id: "1", nation: "Republic of Korea (1)", center: "Incheon (4)", centerCode: "ICN", unitOfMeasurement: "kg", transportationMethod: "Haeun Incheon and Incheon CJ, Haeun LCL, Rocket LCL...", address: "MCI Logistics, Seogu, Pyeongtaek-si", phoneNumber: "070-4179-9683", shippingCenter: "Anhui Center", whetherToUse: "use" },
    { id: "2", nation: "China (2)", center: "For (5)", centerCode: "WH", unitOfMeasurement: "kg", transportationMethod: "Haeun Incheon ( Office)...", address: "MICS Yiwu-si 240", phoneNumber: "180-7888-2982", shippingCenter: "Shipping Center", whetherToUse: "use" },
    { id: "3", nation: "China (3)", center: "Cheongdo (7)", centerCode: "QD", unitOfMeasurement: "kg", transportationMethod: "Air express, Incheon (CJ)...", address: "\uCCAD\uB3C4 \uD3C9\uB3C4\uAD6C", phoneNumber: "177-6476-1070", shippingCenter: "Shipping Center", whetherToUse: "Not in use" },
    { id: "4", nation: "China (4)", center: "Guangzhou (8)", centerCode: "GZ", unitOfMeasurement: "kg", transportationMethod: "Haeun Incheon (CJ)...", address: "\uAD11\uC800\uC6B0 / \uD558\uC774\uC8FC\uAD6C", phoneNumber: "180-2752-7541", shippingCenter: "Shipping Center", whetherToUse: "use" },
    { id: "5", nation: "China (5)", center: "Lee Woo (12)", centerCode: "YW", unitOfMeasurement: "kg", transportationMethod: "Haeun LCL, Rocket LCL...", address: "\uC774\uC6B0\uC2DC 1\uCE35", phoneNumber: "180-6791-7903", shippingCenter: "Shipping Center", whetherToUse: "use" },
  ];

  const transportOptions = [
    "Haeun Incheon (CJ)", "Haeun Incheon ( Office)", "Incheon Marine & Aerospace (Hanjin)",
    "Haeun Pyeongtaek (CJ)", "Haeun Pyeongtaek (Hanjin)", "Shipping business operator",
    "LCL (Mon/Wed/Fri cargo ship)", "LCL (Tuesday/Thursday/Sunday ferry)", "Aviation",
    "Air express", "EMS Shipping", "EMS Airlines", "airline operators",
    "VVIC (Airline)Airline", "VVIC (Land) Air", "Special delivery",
    "LCL (Mon/Wed/Fri Gunsan Port)", "LCL (Mon~Fri/Sun Incheon Port)",
    "Rocket Aerospace", "Rocket Shipping (CJ)", "Rocket LCL (Tuesday/Thursday)",
  ];

  const handleRegister = () => {
    setEditingRecord(null);
    setFormData({ nation: "", centerName: "", centerCode: "", alCode: "", city: "", state: "", address1: "", address2: "", phoneNumber: "", weightUnit: "", transportationMethods: [], whetherToUse: "use", briefSummary: "" });
    setRegisterModalVisible(true);
  };

  const handleEdit = (record: Center) => {
    setEditingRecord(record);
    setFormData({ ...formData, nation: record.nation, centerName: record.center, centerCode: record.centerCode, phoneNumber: record.phoneNumber, whetherToUse: record.whetherToUse === "use" ? "use" : "notUse" });
    setRegisterModalVisible(true);
  };

  const toggleTransport = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      transportationMethods: prev.transportationMethods.includes(method) ? prev.transportationMethods.filter((m) => m !== method) : [...prev.transportationMethods, method],
    }));
  };

  const moveCenter = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= centerOrder.length) return;
    const newOrder = [...centerOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setCenterOrder(newOrder);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("settings.center.title")}</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex gap-2">
          <button onClick={handleRegister} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" />
            {t("settings.center.centerRegistration")}
          </button>
          <button onClick={() => setAlignmentModalVisible(true)} className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 text-sm">
            <AlignJustify className="w-4 h-4" />
            {t("settings.center.centerAlignment")}
          </button>
        </div>

        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.center.nation")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.center.center")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.center.centerCode")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.center.unitOfMeasurement")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 max-w-[300px]">{t("settings.center.transportationMethod")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.center.address")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.center.phoneNumber")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("settings.center.shippingCenter")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t("settings.center.whetherToUse")}</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">-</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3">{record.nation}</td>
                  <td className="px-4 py-3">{record.center}</td>
                  <td className="px-4 py-3 text-center">{record.centerCode}</td>
                  <td className="px-4 py-3 text-center">{record.unitOfMeasurement}</td>
                  <td className="px-4 py-3 max-w-[300px] truncate">{record.transportationMethod}</td>
                  <td className="px-4 py-3 max-w-[250px] truncate">{record.address}</td>
                  <td className="px-4 py-3">{record.phoneNumber}</td>
                  <td className="px-4 py-3">{record.shippingCenter}</td>
                  <td className="px-4 py-3 text-center">{record.whetherToUse}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800 text-xs">{t("settings.center.correction")}</button>
                      <button onClick={() => setDeleteConfirm(record)} className="text-red-600 hover:text-red-800 text-xs">{t("settings.center.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit Modal */}
      {registerModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("settings.center.modal.title")}</h2>
              <button onClick={() => setRegisterModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.center.modal.nation")}</label>
                  <select value={formData.nation} onChange={(e) => setFormData({ ...formData, nation: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                    <option value="">= Select</option>
                    <option value="korea">Republic of Korea</option>
                    <option value="china">China</option>
                  </select>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.center.modal.centerName")}</label>
                  <input value={formData.centerName} onChange={(e) => setFormData({ ...formData, centerName: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.center.modal.centerCode")}</label>
                  <input value={formData.centerCode} onChange={(e) => setFormData({ ...formData, centerCode: e.target.value })} placeholder="ex) English capital letters" className="border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.center.modal.de")}</label>
                  <input value={formData.alCode} onChange={(e) => setFormData({ ...formData, alCode: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.center.modal.city")}</label>
                  <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.center.modal.state")}</label>
                  <input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                <label className="text-sm font-medium text-right">{t("settings.center.modal.address1")}</label>
                <input value={formData.address1} onChange={(e) => setFormData({ ...formData, address1: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                <label className="text-sm font-medium text-right">{t("settings.center.modal.address2")}</label>
                <input value={formData.address2} onChange={(e) => setFormData({ ...formData, address2: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.center.modal.phoneNumber")}</label>
                  <input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">{t("settings.center.modal.weightUnit")}</label>
                  <select value={formData.weightUnit} onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                    <option value="">= Select</option>
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-start gap-2">
                <label className="text-sm font-medium text-right pt-2">{t("settings.center.modal.transportationMethod")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {transportOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs">
                      <input type="checkbox" checked={formData.transportationMethods.includes(opt)} onChange={() => toggleTransport(opt)} className="rounded" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                <label className="text-sm font-medium text-right">{t("settings.center.modal.image")}</label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 border rounded-md text-sm cursor-pointer hover:bg-gray-50">
                    {t("settings.center.modal.chooseFile")}
                    <input type="file" className="hidden" />
                  </label>
                  <span className="text-sm text-gray-500">No file chosen</span>
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                <label className="text-sm font-medium text-right">{t("settings.center.modal.whetherToUse")}</label>
                <select value={formData.whetherToUse} onChange={(e) => setFormData({ ...formData, whetherToUse: e.target.value })} className="border rounded-md px-3 py-2 text-sm w-48">
                  <option value="use">use</option>
                  <option value="notUse">not use</option>
                </select>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-start gap-2">
                <label className="text-sm font-medium text-right pt-2">{t("settings.center.modal.briefSummary")}</label>
                <textarea value={formData.briefSummary} onChange={(e) => setFormData({ ...formData, briefSummary: e.target.value })} rows={6} placeholder="within 1000 characters" className="border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setRegisterModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("settings.center.close")}</button>
              <button onClick={() => { console.log("Form:", formData); setRegisterModalVisible(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("settings.center.save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Alignment Modal */}
      {alignmentModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("settings.center.alignmentModal.title")}</h2>
              <button onClick={() => setAlignmentModalVisible(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex gap-6">
              <div className="w-1/3">
                <div className="font-medium text-center mb-4">{t("settings.center.alignmentModal.centerManagement")}</div>
                <div className="font-medium mb-2">{t("settings.center.alignmentModal.order")}</div>
                <div className="text-xs text-gray-400 mt-2">{t("settings.center.alignmentModal.dragToReorder")}</div>
              </div>
              <div className="w-2/3 border rounded">
                {centerOrder.map((center, index) => (
                  <div key={center.id} className="flex items-center gap-2 p-3 border-b last:border-b-0 bg-gray-50 hover:bg-blue-50">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm">{center.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveCenter(index, index - 1)} disabled={index === 0} className="px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">&uarr;</button>
                      <button onClick={() => moveCenter(index, index + 1)} disabled={index === centerOrder.length - 1} className="px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">&darr;</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setAlignmentModalVisible(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">{t("settings.center.close")}</button>
              <button onClick={() => { console.log("Order:", centerOrder); setAlignmentModalVisible(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{t("settings.center.save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">{t("settings.center.deleteConfirm")}</h3>
            <p className="text-sm text-gray-600 mb-4">{t("settings.center.deleteConfirmContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-md text-sm">{t("settings.center.cancel")}</button>
              <button onClick={() => { console.log("Delete:", deleteConfirm.id); setDeleteConfirm(null); }} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">{t("settings.center.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterManagement;
