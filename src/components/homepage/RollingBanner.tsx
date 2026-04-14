"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, X, Upload, Pencil, Trash2 } from "lucide-react";

interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  displayType: string;
  targetType: string;
  startDate: string;
  endDate: string;
}

export default function RollingBanner() {
  const { t } = useLocale();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    linkUrl: "",
    displayType: "",
    targetType: "",
    usageStatus: "",
    imageFile: null as File | null,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      linkUrl: "",
      displayType: "",
      targetType: "",
      usageStatus: "",
      imageFile: null,
    });
  };

  const handleAdd = () => {
    if (!formData.title || !formData.displayType || !formData.targetType) return;
    const newBanner: BannerItem = {
      id: Date.now().toString(),
      title: formData.title,
      imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : "",
      linkUrl: formData.linkUrl,
      order: banners.length + 1,
      displayType: formData.displayType,
      targetType: formData.targetType,
      startDate: "",
      endDate: "",
    };
    setBanners([...banners, newBanner]);
    setAddModalVisible(false);
    resetForm();
  };

  const handleEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      linkUrl: banner.linkUrl,
      displayType: banner.displayType,
      targetType: banner.targetType,
      usageStatus: "",
      imageFile: null,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = () => {
    if (!editingBanner) return;
    setBanners(
      banners.map((b) =>
        b.id === editingBanner.id
          ? {
              ...b,
              title: formData.title,
              linkUrl: formData.linkUrl,
              displayType: formData.displayType,
              targetType: formData.targetType,
              imageUrl: formData.imageFile
                ? URL.createObjectURL(formData.imageFile)
                : b.imageUrl,
            }
          : b
      )
    );
    setEditModalVisible(false);
    setEditingBanner(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setBanners(banners.filter((b) => b.id !== id));
    setDeleteConfirm(null);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const items = [...banners];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setBanners(items.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const renderFormModal = (
    visible: boolean,
    onClose: () => void,
    onSubmit: () => void,
    title: string
  ) => {
    if (!visible) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("homepage.banner.form.displayType")}<span className="text-red-500">*</span>
              </label>
              <select
                className="w-48 border rounded-md px-3 py-2 text-sm"
                value={formData.displayType}
                onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
              >
                <option value="">{t("homepage.banner.form.displayTypePlaceholder")}</option>
                <option value="main_rolling">{t("homepage.rollingBanner.type")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("homepage.banner.form.title")}<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("homepage.banner.form.image")}
              </label>
              <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFormData({ ...formData, imageFile: e.target.files?.[0] || null })
                  }
                />
                <div className="flex flex-col items-center">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">{t("homepage.banner.form.imageUpload")}</span>
                </div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.banner.form.url")}</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("homepage.banner.form.usageStatus")}<span className="text-red-500">*</span>
              </label>
              <select
                className="w-48 border rounded-md px-3 py-2 text-sm"
                value={formData.usageStatus}
                onChange={(e) => setFormData({ ...formData, usageStatus: e.target.value })}
              >
                <option value="">{t("homepage.banner.form.usageStatusPlaceholder")}</option>
                <option value="use">{t("homepage.banner.form.usageStatus.use")}</option>
                <option value="notUse">{t("homepage.banner.form.usageStatus.notUse")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("homepage.banner.form.target")}<span className="text-red-500">*</span>
              </label>
              <select
                className="w-48 border rounded-md px-3 py-2 text-sm"
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
              >
                <option value="">{t("homepage.banner.form.targetPlaceholder")}</option>
                <option value="self">{t("homepage.banner.form.target.oneself")}</option>
                <option value="new">{t("homepage.banner.form.target.newWindow")}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
              {t("homepage.common.close")}
            </button>
            <button onClick={onSubmit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {t("homepage.common.save")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500">
          {t("homepage.rollingBanner.list")} - Total {banners.length}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => { resetForm(); setAddModalVisible(true); }}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {t("homepage.banner.add")}
          </button>
          <button
            onClick={() => setOrderModalVisible(true)}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            {t("homepage.banner.order")}
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="app-table">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.banner.image")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.banner.title")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.banner.url")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.banner.displayType")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.banner.targetType")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.banner.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  {t("homepage.common.noData")}
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="px-4 py-3">
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} className="w-20 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-20 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                    )}
                  </td>
                  <td className="px-4 py-3">{banner.title}</td>
                  <td className="px-4 py-3 truncate max-w-[200px]">{banner.linkUrl}</td>
                  <td className="px-4 py-3">{banner.displayType}</td>
                  <td className="px-4 py-3 text-center">{banner.targetType}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(banner)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">
                        {t("homepage.banner.edit")}
                      </button>
                      <button onClick={() => setDeleteConfirm(banner.id)} className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">
                        {t("homepage.banner.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderFormModal(addModalVisible, () => { setAddModalVisible(false); resetForm(); }, handleAdd, t("homepage.banner.addModal"))}
      {renderFormModal(editModalVisible, () => { setEditModalVisible(false); resetForm(); }, handleUpdate, t("homepage.banner.editModal"))}

      {/* Order Modal */}
      {orderModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{t("homepage.banner.orderModal")}</h3>
              <button onClick={() => setOrderModalVisible(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">{t("homepage.banner.orderModal.instruction")}</p>
              <div className="border rounded">
                {banners.map((banner, index) => (
                  <div key={banner.id} className="flex items-center gap-3 px-4 py-3 border-b text-sm">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveItem(index, "up")} disabled={index === 0} className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30">▲</button>
                      <button onClick={() => moveItem(index, "down")} disabled={index === banners.length - 1} className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30">▼</button>
                    </div>
                    <div className="flex-1">{banner.title}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setOrderModalVisible(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{t("homepage.common.close")}</button>
              <button onClick={() => setOrderModalVisible(false)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{t("homepage.common.save")}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">{t("homepage.banner.confirm.deleteTitle")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("homepage.banner.confirm.deleteContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{t("homepage.common.close")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t("homepage.banner.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
