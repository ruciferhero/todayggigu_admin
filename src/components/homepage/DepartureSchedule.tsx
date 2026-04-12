"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, X } from "lucide-react";

interface ScheduleItem {
  id: string;
  center: string;
  transportMethod: string;
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  notes: string;
  status: string;
}

const WEIHAI_METHODS = [
  { value: "sea_incheon_cj", label: "Sea Incheon (CJ)" },
  { value: "sea_pyeongtaek_hanjin", label: "Sea Pyeongtaek (Hanjin)" },
  { value: "lcl_mwf", label: "LCL (Mon/Wed/Fri)" },
  { value: "lcl_tts", label: "LCL (Tue/Thu/Sun)" },
  { value: "air", label: "Air" },
  { value: "air_express", label: "Air Express" },
];

const GUANGZHOU_METHODS = [
  { value: "topit_lcl_tt", label: "Topit LCL (Tue/Thu)" },
  { value: "topit_lcl", label: "Topit LCL" },
];

export default function DepartureSchedule() {
  const { t } = useLocale();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    center: "weihai", transportMethod: "", departureDate: "", arrivalDate: "", departureTime: "", notes: "",
  });

  const resetForm = () => {
    setFormData({ center: "weihai", transportMethod: "", departureDate: "", arrivalDate: "", departureTime: "", notes: "" });
  };

  const getTransportMethods = (center: string) =>
    center === "weihai" ? WEIHAI_METHODS : GUANGZHOU_METHODS;

  const handleAdd = () => {
    if (!formData.transportMethod || !formData.departureDate || !formData.departureTime) return;
    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      center: formData.center,
      transportMethod: formData.transportMethod,
      departureDate: formData.departureDate,
      arrivalDate: formData.arrivalDate,
      departureTime: formData.departureTime,
      notes: formData.notes,
      status: "scheduled",
    };
    setSchedules([...schedules, newSchedule]);
    setAddModalVisible(false);
    resetForm();
  };

  const handleEdit = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setFormData({
      center: schedule.center,
      transportMethod: schedule.transportMethod,
      departureDate: schedule.departureDate,
      arrivalDate: schedule.arrivalDate,
      departureTime: schedule.departureTime,
      notes: schedule.notes,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = () => {
    if (!editingSchedule) return;
    setSchedules(schedules.map((s) => s.id === editingSchedule.id ? { ...s, ...formData } : s));
    setEditModalVisible(false);
    setEditingSchedule(null);
    resetForm();
  };

  const handleDelete = (id: string) => { setSchedules(schedules.filter((s) => s.id !== id)); setDeleteConfirm(null); };

  const renderFormModal = (visible: boolean, onClose: () => void, onSubmit: () => void, title: string) => {
    if (!visible) return null;
    const methods = getTransportMethods(formData.center);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t("homepage.schedule.form.center")}<span className="text-red-500">*</span></label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="center" value="weihai" checked={formData.center === "weihai"} onChange={(e) => setFormData({ ...formData, center: e.target.value, transportMethod: "" })} />
                  <span className="text-sm">{t("homepage.schedule.center.weihai")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="center" value="guangzhou" checked={formData.center === "guangzhou"} onChange={(e) => setFormData({ ...formData, center: e.target.value, transportMethod: "" })} />
                  <span className="text-sm">{t("homepage.schedule.center.guangzhou")}</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t("homepage.schedule.form.transportMethod")}<span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-3">
                {methods.map((m) => (
                  <label key={m.value} className="flex items-center gap-2">
                    <input type="radio" name="transportMethod" value={m.value} checked={formData.transportMethod === m.value} onChange={(e) => setFormData({ ...formData, transportMethod: e.target.value })} />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">{t("homepage.schedule.form.departureDate")} - Start<span className="text-red-500">*</span></label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.departureDate} onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">{t("homepage.schedule.form.departureDate")} - End</label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.arrivalDate} onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.schedule.form.departureTime")}<span className="text-red-500">*</span></label>
              <input type="time" className="w-48 border rounded-md px-3 py-2 text-sm" value={formData.departureTime} onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.schedule.form.notes")}</label>
              <textarea rows={4} className="w-full border rounded-md px-3 py-2 text-sm" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder={t("homepage.schedule.form.notesPlaceholder")} />
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{t("homepage.common.close")}</button>
            <button onClick={onSubmit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{t("homepage.common.save")}</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500">Total {schedules.length}</h3>
        <button onClick={() => { resetForm(); setAddModalVisible(true); }} className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4" />{t("homepage.schedule.add")}
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.schedule.center")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.schedule.transportMethod")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.schedule.departureDate")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.schedule.departureTime")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.schedule.notes")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.schedule.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">{t("homepage.common.noData")}</td></tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{schedule.center}</td>
                  <td className="px-4 py-3">{schedule.transportMethod}</td>
                  <td className="px-4 py-3">{schedule.departureDate}</td>
                  <td className="px-4 py-3">{schedule.departureTime}</td>
                  <td className="px-4 py-3 truncate max-w-[200px]">{schedule.notes}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(schedule)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">{t("homepage.schedule.edit")}</button>
                      <button onClick={() => setDeleteConfirm(schedule.id)} className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">{t("homepage.schedule.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderFormModal(addModalVisible, () => { setAddModalVisible(false); resetForm(); }, handleAdd, t("homepage.schedule.addModal"))}
      {renderFormModal(editModalVisible, () => { setEditModalVisible(false); setEditingSchedule(null); resetForm(); }, handleUpdate, t("homepage.schedule.editModal"))}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">{t("homepage.schedule.confirm.deleteTitle")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("homepage.schedule.confirm.deleteContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{t("homepage.common.close")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t("homepage.schedule.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
