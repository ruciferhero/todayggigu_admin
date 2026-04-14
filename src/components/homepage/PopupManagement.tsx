"use client";

import React, { useState, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Plus, X, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, ImageIcon,
} from "lucide-react";

interface PopupItem {
  id: string;
  title: string;
  coordinates: string;
  isCentered: boolean;
  size: string;
  isOpen: boolean;
  period: string;
  startDate: string;
  endDate: string;
  displayType: string;
  content: string;
  isActive: boolean;
}

export default function PopupManagement() {
  const { t } = useLocale();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupItem | null>(null);
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const editDescriptionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    coordinates: "",
    isCentered: false,
    size: "",
    isOpen: true,
    startDate: "",
    endDate: "",
    displayType: "",
  });

  const resetForm = () => {
    setFormData({ title: "", coordinates: "", isCentered: false, size: "", isOpen: true, startDate: "", endDate: "", displayType: "" });
    if (descriptionRef.current) descriptionRef.current.innerHTML = "";
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertImage = (ref: React.RefObject<HTMLDivElement | null>) => {
    const url = prompt("Enter image URL:");
    if (url) {
      ref.current?.focus();
      document.execCommand("insertImage", false, url);
    }
  };

  const handleAdd = () => {
    if (!formData.title || !formData.displayType || !formData.startDate || !formData.endDate) return;
    const newPopup: PopupItem = {
      id: Date.now().toString(),
      title: formData.title,
      coordinates: formData.coordinates || "0, 0",
      isCentered: formData.isCentered,
      size: formData.size || "800x600",
      isOpen: formData.isOpen,
      period: `${formData.startDate} ~ ${formData.endDate}`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      displayType: formData.displayType,
      content: descriptionRef.current?.innerHTML || "",
      isActive: formData.displayType === "use",
    };
    setPopups([...popups, newPopup]);
    setAddModalVisible(false);
    resetForm();
  };

  const handleEditPopup = (popup: PopupItem) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title,
      coordinates: popup.coordinates,
      isCentered: popup.isCentered,
      size: popup.size,
      isOpen: popup.isOpen,
      startDate: popup.startDate,
      endDate: popup.endDate,
      displayType: popup.displayType,
    });
    setEditModalVisible(true);
    setTimeout(() => {
      if (editDescriptionRef.current) editDescriptionRef.current.innerHTML = popup.content;
    }, 100);
  };

  const handleUpdate = () => {
    if (!editingPopup) return;
    setPopups(
      popups.map((p) =>
        p.id === editingPopup.id
          ? {
              ...p,
              ...formData,
              period: `${formData.startDate} ~ ${formData.endDate}`,
              content: editDescriptionRef.current?.innerHTML || "",
              isActive: formData.displayType === "use",
            }
          : p
      )
    );
    setEditModalVisible(false);
    setEditingPopup(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setPopups(popups.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const renderEditorToolbar = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t">
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("bold"); }} className="p-1.5 hover:bg-gray-200 rounded" title="Bold"><Bold className="w-4 h-4" /></button>
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("italic"); }} className="p-1.5 hover:bg-gray-200 rounded" title="Italic"><Italic className="w-4 h-4" /></button>
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("underline"); }} className="p-1.5 hover:bg-gray-200 rounded" title="Underline"><Underline className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("justifyLeft"); }} className="p-1.5 hover:bg-gray-200 rounded"><AlignLeft className="w-4 h-4" /></button>
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("justifyCenter"); }} className="p-1.5 hover:bg-gray-200 rounded"><AlignCenter className="w-4 h-4" /></button>
      <button type="button" onClick={() => { ref.current?.focus(); execCommand("justifyRight"); }} className="p-1.5 hover:bg-gray-200 rounded"><AlignRight className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <select className="text-xs border rounded px-1 py-1" defaultValue="3" onChange={(e) => { ref.current?.focus(); execCommand("fontSize", e.target.value); }}>
        <option value="1">Small</option>
        <option value="3">Normal</option>
        <option value="5">Large</option>
        <option value="7">Huge</option>
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
              <label className="block text-sm font-medium mb-1">{t("homepage.popup.form.title")}<span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.popup.form.coordinates")}</label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" placeholder="100, 100" value={formData.coordinates} onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isCentered" checked={formData.isCentered} onChange={(e) => setFormData({ ...formData, isCentered: e.target.checked })} />
              <label htmlFor="isCentered" className="text-sm">{t("homepage.popup.form.isCenteredLabel")}</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.popup.form.size")}</label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" placeholder="800x600" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isOpen" checked={formData.isOpen} onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })} />
              <label htmlFor="isOpen" className="text-sm">{t("homepage.popup.form.isOpenLabel")}</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("homepage.popup.form.period")} - Start<span className="text-red-500">*</span></label>
                <input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("homepage.popup.form.period")} - End<span className="text-red-500">*</span></label>
                <input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.popup.form.displayType")}<span className="text-red-500">*</span></label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={formData.displayType} onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}>
                <option value="">{t("homepage.popup.form.displayTypePlaceholder")}</option>
                <option value="use">{t("homepage.popup.displayType.active")}</option>
                <option value="notUse">{t("homepage.popup.displayType.inactive")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.popup.form.content")}<span className="text-red-500">*</span></label>
              {renderEditorToolbar(editorRef)}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[200px] p-3 border border-t-0 border-gray-300 rounded-b text-sm leading-relaxed outline-none focus:ring-1 focus:ring-blue-300"
              />
              <p className="text-xs text-gray-400 mt-1">{t("homepage.popup.form.contentHint")}</p>
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
        <h3 className="text-sm font-medium text-gray-500">Total {popups.length}</h3>
        <button onClick={() => { resetForm(); setAddModalVisible(true); }} className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4" />{t("homepage.popup.add")}
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="app-table">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 font-medium w-16">No</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.popup.title")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.popup.coordinates")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.popup.isCentered")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.popup.size")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.popup.isOpen")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.popup.displayType")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.popup.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {popups.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">{t("homepage.common.noData")}</td></tr>
            ) : (
              popups.map((popup, index) => (
                <tr key={popup.id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{popup.title}</td>
                  <td className="px-4 py-3">{popup.coordinates}</td>
                  <td className="px-4 py-3 text-center">{popup.isCentered ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{popup.size}</td>
                  <td className="px-4 py-3 text-center">{popup.isOpen ? "Open" : "Closed"}</td>
                  <td className="px-4 py-3">{popup.displayType}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEditPopup(popup)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">{t("homepage.popup.edit")}</button>
                      <button onClick={() => setDeleteConfirm(popup.id)} className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">{t("homepage.popup.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderFormModal(addModalVisible, () => { setAddModalVisible(false); resetForm(); }, handleAdd, t("homepage.popup.addModal"), descriptionRef)}
      {renderFormModal(editModalVisible, () => { setEditModalVisible(false); setEditingPopup(null); resetForm(); }, handleUpdate, t("homepage.popup.editModal"), editDescriptionRef)}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">{t("homepage.popup.confirm.deleteTitle")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("homepage.popup.confirm.deleteContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{t("homepage.common.close")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t("homepage.popup.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
