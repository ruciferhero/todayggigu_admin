"use client";

import React, { useState, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ImageIcon, Upload } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  briefDescription: string;
  thumbnail: string;
  externalLink: string;
  period: string;
  startDate: string;
  endDate: string;
  exposurePeriod: string;
  exposureStartDate: string;
  exposureEndDate: string;
  displayType: string;
  content: string;
  isActive: boolean;
}

export default function EventManagement() {
  const { t } = useLocale();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const editDescriptionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "", briefDescription: "", externalLink: "",
    startDate: "", endDate: "", exposureStartDate: "", exposureEndDate: "",
    displayType: "", thumbnailFile: null as File | null,
  });

  const resetForm = () => {
    setFormData({ title: "", briefDescription: "", externalLink: "", startDate: "", endDate: "", exposureStartDate: "", exposureEndDate: "", displayType: "", thumbnailFile: null });
    if (descriptionRef.current) descriptionRef.current.innerHTML = "";
  };

  const execCommand = (command: string, value?: string) => { document.execCommand(command, false, value); };

  const insertImage = (ref: React.RefObject<HTMLDivElement | null>) => {
    const url = prompt("Enter image URL:");
    if (url) { ref.current?.focus(); document.execCommand("insertImage", false, url); }
  };

  const handleAdd = () => {
    if (!formData.title || !formData.displayType || !formData.startDate || !formData.endDate) return;
    const newEvent: EventItem = {
      id: Date.now().toString(),
      title: formData.title,
      briefDescription: formData.briefDescription,
      thumbnail: formData.thumbnailFile ? URL.createObjectURL(formData.thumbnailFile) : "",
      externalLink: formData.externalLink,
      period: `${formData.startDate} ~ ${formData.endDate}`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      exposurePeriod: `${formData.exposureStartDate} ~ ${formData.exposureEndDate}`,
      exposureStartDate: formData.exposureStartDate,
      exposureEndDate: formData.exposureEndDate,
      displayType: formData.displayType,
      content: descriptionRef.current?.innerHTML || "",
      isActive: formData.displayType === "use",
    };
    setEvents([...events, newEvent]);
    setAddModalVisible(false);
    resetForm();
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEvent(event);
    setFormData({
      title: event.title, briefDescription: event.briefDescription, externalLink: event.externalLink,
      startDate: event.startDate, endDate: event.endDate,
      exposureStartDate: event.exposureStartDate, exposureEndDate: event.exposureEndDate,
      displayType: event.displayType, thumbnailFile: null,
    });
    setEditModalVisible(true);
    setTimeout(() => { if (editDescriptionRef.current) editDescriptionRef.current.innerHTML = event.content; }, 100);
  };

  const handleUpdate = () => {
    if (!editingEvent) return;
    setEvents(events.map((e) => e.id === editingEvent.id ? {
      ...e, ...formData,
      thumbnail: formData.thumbnailFile ? URL.createObjectURL(formData.thumbnailFile) : e.thumbnail,
      period: `${formData.startDate} ~ ${formData.endDate}`,
      exposurePeriod: `${formData.exposureStartDate} ~ ${formData.exposureEndDate}`,
      content: editDescriptionRef.current?.innerHTML || "",
      isActive: formData.displayType === "use",
    } : e));
    setEditModalVisible(false);
    setEditingEvent(null);
    resetForm();
  };

  const handleDelete = (id: string) => { setEvents(events.filter((e) => e.id !== id)); setDeleteConfirm(null); };

  const renderEditorToolbar = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t">
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("bold"); }} className="p-1.5 hover:bg-gray-200 rounded"><Bold className="w-4 h-4" /></button>
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("italic"); }} className="p-1.5 hover:bg-gray-200 rounded"><Italic className="w-4 h-4" /></button>
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("underline"); }} className="p-1.5 hover:bg-gray-200 rounded"><Underline className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("justifyLeft"); }} className="p-1.5 hover:bg-gray-200 rounded"><AlignLeft className="w-4 h-4" /></button>
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("justifyCenter"); }} className="p-1.5 hover:bg-gray-200 rounded"><AlignCenter className="w-4 h-4" /></button>
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("justifyRight"); }} className="p-1.5 hover:bg-gray-200 rounded"><AlignRight className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <select className="text-xs border rounded px-1 py-1" defaultValue="3" onChange={(e) => { ref.current?.focus(); execCommand("fontSize", e.target.value); }}>
        <option value="1">Small</option><option value="3">Normal</option><option value="5">Large</option><option value="7">Huge</option>
      </select>
      <button type="button" onClick={() => insertImage(ref)} className="p-1.5 hover:bg-gray-200 rounded"><ImageIcon className="w-4 h-4" /></button>
    </div>
  );

  const renderFormModal = (visible: boolean, onClose: () => void, onSubmit: () => void, title: string, editorRef: React.RefObject<HTMLDivElement | null>) => {
    if (!visible) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.event.form.title")}<span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.event.form.briefDescription")}<span className="text-red-500">*</span></label>
              <textarea rows={3} className="w-full border rounded-md px-3 py-2 text-sm" value={formData.briefDescription} onChange={(e) => setFormData({ ...formData, briefDescription: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.event.form.thumbnail")}</label>
              <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFormData({ ...formData, thumbnailFile: e.target.files?.[0] || null })} />
                <div className="flex flex-col items-center"><Upload className="w-5 h-5 text-gray-400" /><span className="text-xs text-gray-400 mt-1">{t("homepage.event.form.thumbnailUpload")}</span></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.event.form.externalLink")}</label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.externalLink} onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">{t("homepage.event.form.period")} - Start<span className="text-red-500">*</span></label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">{t("homepage.event.form.period")} - End<span className="text-red-500">*</span></label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">{t("homepage.event.form.exposurePeriod")} - Start<span className="text-red-500">*</span></label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.exposureStartDate} onChange={(e) => setFormData({ ...formData, exposureStartDate: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">{t("homepage.event.form.exposurePeriod")} - End<span className="text-red-500">*</span></label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.exposureEndDate} onChange={(e) => setFormData({ ...formData, exposureEndDate: e.target.value })} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.event.form.displayType")}<span className="text-red-500">*</span></label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={formData.displayType} onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}>
                <option value="">{t("homepage.event.form.displayTypePlaceholder")}</option>
                <option value="use">{t("homepage.event.displayType.active")}</option>
                <option value="notUse">{t("homepage.event.displayType.inactive")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.event.form.content")}<span className="text-red-500">*</span></label>
              {renderEditorToolbar(editorRef)}
              <div ref={editorRef} contentEditable suppressContentEditableWarning className="min-h-[200px] p-3 border border-t-0 border-gray-300 rounded-b text-sm leading-relaxed outline-none focus:ring-1 focus:ring-blue-300" />
              <p className="text-xs text-gray-400 mt-1">{t("homepage.event.form.contentHint")}</p>
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
        <h3 className="text-sm font-medium text-gray-500">Total {events.length}</h3>
        <button onClick={() => { resetForm(); setAddModalVisible(true); }} className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4" />{t("homepage.event.add")}
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.event.thumbnail")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.event.title")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.event.period")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.event.displayType")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.event.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">{t("homepage.common.noData")}</td></tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{event.thumbnail ? <img src={event.thumbnail} alt="" className="w-14 h-14 object-cover rounded" /> : <div className="w-14 h-14 bg-gray-200 rounded" />}</td>
                  <td className="px-4 py-3">{event.title}</td>
                  <td className="px-4 py-3">{event.period}</td>
                  <td className="px-4 py-3">{event.displayType}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEditEvent(event)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">{t("homepage.event.edit")}</button>
                      <button onClick={() => setDeleteConfirm(event.id)} className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">{t("homepage.event.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderFormModal(addModalVisible, () => { setAddModalVisible(false); resetForm(); }, handleAdd, t("homepage.event.addModal"), descriptionRef)}
      {renderFormModal(editModalVisible, () => { setEditModalVisible(false); setEditingEvent(null); resetForm(); }, handleUpdate, t("homepage.event.editModal"), editDescriptionRef)}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">{t("homepage.event.confirm.deleteTitle")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("homepage.event.confirm.deleteContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{t("homepage.common.close")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t("homepage.event.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
