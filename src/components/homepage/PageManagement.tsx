"use client";

import React, { useState, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ImageIcon } from "lucide-react";

interface PageItem {
  id: string;
  pageTitle: string;
  displayType: string;
  content: string;
  isActive: boolean;
}

export default function PageManagement() {
  const { t } = useLocale();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const editDescriptionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({ pageTitle: "", displayType: "" });

  const resetForm = () => {
    setFormData({ pageTitle: "", displayType: "" });
    if (descriptionRef.current) descriptionRef.current.innerHTML = "";
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertImage = (ref: React.RefObject<HTMLDivElement | null>) => {
    const url = prompt("Enter image URL:");
    if (url) { ref.current?.focus(); document.execCommand("insertImage", false, url); }
  };

  const handleAdd = () => {
    if (!formData.pageTitle || !formData.displayType) return;
    const newPage: PageItem = {
      id: Date.now().toString(),
      pageTitle: formData.pageTitle,
      displayType: formData.displayType,
      content: descriptionRef.current?.innerHTML || "",
      isActive: formData.displayType === "use",
    };
    setPages([...pages, newPage]);
    setAddModalVisible(false);
    resetForm();
  };

  const handleEditPage = (page: PageItem) => {
    setEditingPage(page);
    setFormData({ pageTitle: page.pageTitle, displayType: page.displayType });
    setEditModalVisible(true);
    setTimeout(() => { if (editDescriptionRef.current) editDescriptionRef.current.innerHTML = page.content; }, 100);
  };

  const handleUpdate = () => {
    if (!editingPage) return;
    setPages(pages.map((p) => p.id === editingPage.id ? { ...p, pageTitle: formData.pageTitle, displayType: formData.displayType, content: editDescriptionRef.current?.innerHTML || "", isActive: formData.displayType === "use" } : p));
    setEditModalVisible(false);
    setEditingPage(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setPages(pages.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

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
              <label className="block text-sm font-medium mb-1">{t("homepage.page.form.pageTitle")}<span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.pageTitle} onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.page.form.displayType")}<span className="text-red-500">*</span></label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={formData.displayType} onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}>
                <option value="">{t("homepage.page.form.displayTypePlaceholder")}</option>
                <option value="use">{t("homepage.page.displayType.active")}</option>
                <option value="notUse">{t("homepage.page.displayType.inactive")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.page.form.content")}<span className="text-red-500">*</span></label>
              {renderEditorToolbar(editorRef)}
              <div ref={editorRef} contentEditable suppressContentEditableWarning className="min-h-[200px] p-3 border border-t-0 border-gray-300 rounded-b text-sm leading-relaxed outline-none focus:ring-1 focus:ring-blue-300" />
              <p className="text-xs text-gray-400 mt-1">{t("homepage.page.form.contentHint")}</p>
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
        <h3 className="text-sm font-medium text-gray-500">Total {pages.length}</h3>
        <button onClick={() => { resetForm(); setAddModalVisible(true); }} className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4" />{t("homepage.page.add")}
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="app-table">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.page.pageTitle")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.page.displayType")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.page.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">{t("homepage.common.noData")}</td></tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id}>
                  <td className="px-4 py-3">{page.pageTitle}</td>
                  <td className="px-4 py-3">{page.displayType}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEditPage(page)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">{t("homepage.page.edit")}</button>
                      <button onClick={() => setDeleteConfirm(page.id)} className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">{t("homepage.page.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderFormModal(addModalVisible, () => { setAddModalVisible(false); resetForm(); }, handleAdd, t("homepage.page.addModal"), descriptionRef)}
      {renderFormModal(editModalVisible, () => { setEditModalVisible(false); setEditingPage(null); resetForm(); }, handleUpdate, t("homepage.page.editModal"), editDescriptionRef)}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">{t("homepage.page.confirm.deleteTitle")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("homepage.page.confirm.deleteContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{t("homepage.common.close")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t("homepage.page.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
