"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Plus, X, Upload } from "lucide-react";

interface ProductItem {
  id: string;
  productName: string;
  imageUrl: string;
  price: number;
  category: string;
  country: string;
  productUrl: string;
  recommendationType: string;
  order: number;
  isActive: boolean;
}

export default function RecommendedProducts() {
  const { t } = useLocale();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    recommendationType: "", productName: "", productUrl: "", country: "",
    price: 0, category: "", imageFile: null as File | null,
  });

  const resetForm = () => {
    setFormData({ recommendationType: "", productName: "", productUrl: "", country: "", price: 0, category: "", imageFile: null });
  };

  const handleAdd = () => {
    if (!formData.productName || !formData.recommendationType || !formData.country) return;
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      productName: formData.productName,
      imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : "",
      price: formData.price,
      category: formData.category,
      country: formData.country,
      productUrl: formData.productUrl,
      recommendationType: formData.recommendationType,
      order: products.length + 1,
      isActive: true,
    };
    setProducts([...products, newProduct]);
    setAddModalVisible(false);
    resetForm();
  };

  const handleEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setFormData({
      recommendationType: product.recommendationType,
      productName: product.productName,
      productUrl: product.productUrl,
      country: product.country,
      price: product.price,
      category: product.category,
      imageFile: null,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = () => {
    if (!editingProduct) return;
    setProducts(products.map((p) => p.id === editingProduct.id ? {
      ...p, ...formData,
      imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : p.imageUrl,
    } : p));
    setEditModalVisible(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleDelete = (id: string) => { setProducts(products.filter((p) => p.id !== id)); setDeleteConfirm(null); };

  const renderFormModal = (visible: boolean, onClose: () => void, onSubmit: () => void, title: string) => {
    if (!visible) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.product.form.recommendationType")}<span className="text-red-500">*</span></label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={formData.recommendationType} onChange={(e) => setFormData({ ...formData, recommendationType: e.target.value })}>
                <option value="">{t("homepage.product.form.recommendationTypePlaceholder")}</option>
                <option value="Hot Deal">{t("homepage.product.type.hotDeal")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.product.form.productName")}<span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.product.form.productUrl")}</label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.productUrl} onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.product.form.country")}<span className="text-red-500">*</span></label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}>
                <option value="">{t("homepage.product.form.countryPlaceholder")}</option>
                <option value="China">{t("homepage.product.country.china")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.product.form.price")}<span className="text-red-500">*</span></label>
              <input type="number" min={0} step="0.01" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.product.form.category")}</label>
              <input type="text" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("homepage.product.form.image")}</label>
              <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })} />
                <div className="flex flex-col items-center"><Upload className="w-5 h-5 text-gray-400" /><span className="text-xs text-gray-400 mt-1">{t("homepage.product.form.imageUpload")}</span></div>
              </label>
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
        <h3 className="text-sm font-medium text-gray-500">Total {products.length}</h3>
        <button onClick={() => { resetForm(); setAddModalVisible(true); }} className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4" />{t("homepage.product.add")}
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="app-table">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 font-medium w-16">{t("homepage.product.order")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.product.image")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.product.recommendationType")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.product.name")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.product.country")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("homepage.product.price")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("homepage.product.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">{t("homepage.common.noData")}</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">{product.order}</td>
                  <td className="px-4 py-3">{product.imageUrl ? <img src={product.imageUrl} alt="" className="w-14 h-14 object-cover rounded" /> : <div className="w-14 h-14 bg-gray-200 rounded" />}</td>
                  <td className="px-4 py-3">{product.recommendationType}</td>
                  <td className="px-4 py-3">{product.productName}</td>
                  <td className="px-4 py-3">{product.country}</td>
                  <td className="px-4 py-3">&yen;{product.price}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(product)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">{t("homepage.product.edit")}</button>
                      <button onClick={() => setDeleteConfirm(product.id)} className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">{t("homepage.product.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderFormModal(addModalVisible, () => { setAddModalVisible(false); resetForm(); }, handleAdd, t("homepage.product.addModal"))}
      {renderFormModal(editModalVisible, () => { setEditModalVisible(false); setEditingProduct(null); resetForm(); }, handleUpdate, t("homepage.product.editModal"))}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">{t("homepage.product.confirm.deleteTitle")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("homepage.product.confirm.deleteContent")}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{t("homepage.common.close")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t("homepage.product.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
