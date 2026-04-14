"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface CategoryName {
  ko: string;
  en: string;
  zh: string;
}

interface Category {
  _id: string;
  name: CategoryName;
  level: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  parentCategoryId?: string;
  children: Category[];
}

// Empty data - ready for API integration
const mockCategories: Category[] = [];

export default function CategoryManagement() {
  const { t } = useLocale();
  const [categoryTree, setCategoryTree] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form fields
  const [nameKo, setNameKo] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [parentName, setParentName] = useState("");

  // Order modal
  const [orderItems, setOrderItems] = useState<{ id: string; name: string }[]>([]);

  const getCategoryDisplayName = (cat: Category): string => {
    return cat.name?.ko || cat.name?.en || cat.name?.zh || "";
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  // Handlers
  const handleAddLevel1 = () => {
    setParentCategory(null);
    setEditingCategory(null);
    setNameKo("");
    setIsActive(true);
    setParentName("");
    setModalVisible(true);
  };

  const handleAddSubcategory = (parent: Category) => {
    setParentCategory(parent);
    setEditingCategory(null);
    setNameKo("");
    setIsActive(true);
    setParentName(getCategoryDisplayName(parent));
    setModalVisible(true);
  };

  const handleEdit = (category: Category, parent?: Category) => {
    setEditingCategory(category);
    setParentCategory(parent || null);
    setNameKo(category.name?.ko || "");
    setIsActive(category.isActive);
    setParentName(parent ? getCategoryDisplayName(parent) : "");
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // TODO: API call
    setCategoryTree(categoryTree.filter((c) => c._id !== id));
    setDeleteConfirmId(null);
  };

  const handleSubmit = () => {
    // TODO: API integration for create/update
    setModalVisible(false);
  };

  const handleOpenOrderModal = (parent: Category) => {
    const subcategories = parent.children || [];
    setParentCategory(parent);
    setOrderItems(
      subcategories.map((cat) => ({
        id: cat._id,
        name: getCategoryDisplayName(cat),
      }))
    );
    setOrderModalVisible(true);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...orderItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setOrderItems(newItems);
  };

  const handleOrderSubmit = () => {
    // TODO: API call to update category order
    setOrderModalVisible(false);
  };

  const getModalTitle = () => {
    if (parentCategory) {
      return t("products.level2Title");
    }
    return t("products.level1Title");
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ko-KR");
  };

  const level1Categories = categoryTree.filter((cat) => cat.level === 1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {t("products.categoryManagement")}
        </h2>
        <button
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          onClick={handleAddLevel1}
        >
          <Plus size={14} />
          {t("products.addLevel1")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="app-table">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 text-gray-600 font-medium w-12"></th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium w-16">{t("products.no")}</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">{t("products.categoryName")}</th>
              <th className="text-center py-3 px-4 text-gray-600 font-medium w-28">{t("products.usageStatus")}</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium w-44">{t("products.registeredAt")}</th>
              <th className="text-center py-3 px-4 text-gray-600 font-medium w-52">{t("products.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {level1Categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  {t("products.noCategories")}
                </td>
              </tr>
            ) : (
              level1Categories.map((cat, idx) => (
                <React.Fragment key={cat._id}>
                  {/* Level 1 row */}
                  <tr>
                    <td className="py-3 px-4">
                      <button
                        className="p-0.5 text-gray-400 hover:text-gray-600"
                        onClick={() => toggleExpand(cat._id)}
                      >
                        {expandedRows.has(cat._id) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className="text-yellow-500 mr-1">{"\u2605"}</span>
                      {getCategoryDisplayName(cat)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          cat.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cat.isActive ? t("products.use") : t("products.notUse")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(cat.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
                          onClick={() => handleAddSubcategory(cat)}
                        >
                          {t("products.registerSub")}
                        </button>
                        <button
                          className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
                          onClick={() => handleEdit(cat)}
                        >
                          {t("products.edit")}
                        </button>
                        <button
                          className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
                          onClick={() => handleOpenOrderModal(cat)}
                        >
                          {t("products.order")}
                        </button>
                        {deleteConfirmId === cat._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                              onClick={() => handleDelete(cat._id)}
                            >
                              {t("products.confirm")}
                            </button>
                            <button
                              className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              {t("products.cancel")}
                            </button>
                          </div>
                        ) : (
                          <button
                            className="px-2 py-1 border border-red-300 text-red-600 rounded text-xs hover:bg-red-50"
                            onClick={() => setDeleteConfirmId(cat._id)}
                          >
                            {t("products.delete")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Level 2 children */}
                  {expandedRows.has(cat._id) && (
                    <>
                      {(!cat.children || cat.children.length === 0) ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-8 text-gray-400 text-sm">
                            {t("products.noSubcategories")}
                          </td>
                        </tr>
                      ) : (
                        cat.children.map((child, childIdx) => (
                          <tr
                            key={child._id}
                            className="border-b border-gray-50 bg-gray-50 hover:bg-gray-100"
                          >
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4 text-gray-500">{childIdx + 1}</td>
                            <td className="py-2 px-4 pl-10 text-gray-700">
                              <span className="text-gray-400 mr-1">{"\u25B7"}</span>
                              {getCategoryDisplayName(child)}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                  child.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {child.isActive ? t("products.use") : t("products.notUse")}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-gray-500">{formatDate(child.createdAt)}</td>
                            <td className="py-2 px-4">
                              <div className="flex items-center gap-1 justify-center">
                                <button
                                  className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100"
                                  onClick={() => handleEdit(child, cat)}
                                >
                                  {t("products.edit")}
                                </button>
                                {deleteConfirmId === child._id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                                      onClick={() => handleDelete(child._id)}
                                    >
                                      {t("products.confirm")}
                                    </button>
                                    <button
                                      className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded"
                                      onClick={() => setDeleteConfirmId(null)}
                                    >
                                      {t("products.cancel")}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="px-2 py-1 border border-red-300 text-red-600 rounded text-xs hover:bg-red-50"
                                    onClick={() => setDeleteConfirmId(child._id)}
                                  >
                                    {t("products.delete")}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Category Register/Edit Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
              <span className="font-medium">{getModalTitle()}</span>
              <button onClick={() => setModalVisible(false)} className="hover:opacity-75">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {parentCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.parentCategory")}
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("products.categoryNameLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameKo}
                  onChange={(e) => setNameKo(e.target.value)}
                  placeholder={t("products.categoryNamePlaceholder")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("products.usage")}
                </label>
                <select
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">{t("products.use")}</option>
                  <option value="false">{t("products.notUse")}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                onClick={handleSubmit}
              >
                {t("products.save")}
              </button>
              <button
                className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                onClick={() => setModalVisible(false)}
              >
                {t("products.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Change Modal */}
      {orderModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-auto shadow-xl">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
              <span className="font-medium">
                {t("products.orderTitle")}
                {parentCategory && ` - ${getCategoryDisplayName(parentCategory)}`}
              </span>
              <button onClick={() => setOrderModalVisible(false)} className="hover:opacity-75">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-4">{t("products.dragToReorder")}</p>
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {t("products.noSubcategories")}
                </div>
              ) : (
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-400" />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                          disabled={index === 0}
                          onClick={() => moveItem(index, "up")}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                          disabled={index === orderItems.length - 1}
                          onClick={() => moveItem(index, "down")}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                onClick={handleOrderSubmit}
              >
                {t("products.save")}
              </button>
              <button
                className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                onClick={() => setOrderModalVisible(false)}
              >
                {t("products.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
