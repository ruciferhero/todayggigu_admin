"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

interface ProductRow {
  id: string;
  uniqueNo: number;
  title: string;
  brand: string;
  thumbnail: string;
  category: string;
  categoryType: string;
  priceCny: number;
  salePriceKrw: number;
  displayStatus: string;
  salesStatus: string;
  salesStartDate: string;
  salesEndDate: string;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  createdAt: string;
}

interface StoreCategory {
  _id: string;
  name: string;
  isActive: boolean;
  imageUrl: string;
  children: { _id: string; name: string; isActive: boolean }[];
}

// Empty data arrays - ready for API integration
const mockProducts: ProductRow[] = [];
const mockStores: StoreCategory[] = [];

export default function ProductList() {
  const { t } = useLocale();
  const [searchText, setSearchText] = useState("");
  const [displayStatusFilter, setDisplayStatusFilter] = useState("all");
  const [salesStatusFilter, setSalesStatusFilter] = useState("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((p) => {
      if (searchText && !p.title.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (displayStatusFilter !== "all" && p.displayStatus !== displayStatusFilter) return false;
      if (salesStatusFilter !== "all" && p.salesStatus !== salesStatusFilter) return false;
      return true;
    });
  }, [searchText, displayStatusFilter, salesStatusFilter]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ko-KR");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Store Selection Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {t("products.stores")}
          </h3>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
            <Plus size={14} />
            {t("products.addStore")}
          </button>
        </div>
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium w-12">No</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium w-14">{t("products.image")}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t("products.storeName")}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium w-20">{t("products.status")}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium w-24">{t("products.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {mockStores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    {t("products.noStores")}
                  </td>
                </tr>
              ) : (
                mockStores.map((store, idx) => (
                  <tr
                    key={store._id}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${
                      selectedStoreId === store._id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedStoreId(store._id)}
                  >
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3">
                      {store.imageUrl ? (
                        <img
                          src={store.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageIcon size={14} />
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 font-semibold">{store.name}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          store.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {store.isActive ? t("products.active") : t("products.inactive")}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Plus size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("products.searchProductName")}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <select
              value={displayStatusFilter}
              onChange={(e) => setDisplayStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t("products.allDisplayStatus")}</option>
              <option value="visible">{t("products.visible")}</option>
              <option value="hidden">{t("products.hidden")}</option>
            </select>
            <select
              value={salesStatusFilter}
              onChange={(e) => setSalesStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t("products.allSalesStatus")}</option>
              <option value="on_sale">{t("products.onSale")}</option>
              <option value="off_sale">{t("products.offSale")}</option>
              <option value="draft">{t("products.draft")}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              <Download size={14} />
              {t("products.export")}
            </button>
            <a
              href="/admin/products/add"
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Plus size={14} />
              {t("products.addProduct")}
            </a>
          </div>
        </div>

        {/* Table */}
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedRows.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-16">No</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-28">{t("products.category")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-20">{t("products.thumbnail")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium">{t("products.productName")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-24">{t("products.brand")}</th>
                <th className="text-right py-3 px-3 text-gray-600 font-medium w-24">{t("products.priceCny")}</th>
                <th className="text-right py-3 px-3 text-gray-600 font-medium w-28">{t("products.salePrice")}</th>
                <th className="text-center py-3 px-3 text-gray-600 font-medium w-24">{t("products.displayStatus")}</th>
                <th className="text-center py-3 px-3 text-gray-600 font-medium w-24">{t("products.salesStatus")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-40">{t("products.salesPeriod")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-24">{t("products.categoryType")}</th>
                <th className="text-center py-3 px-3 text-gray-600 font-medium w-28">{t("products.event")}</th>
                <th className="text-left py-3 px-3 text-gray-600 font-medium w-24">{t("products.createdAt")}</th>
                <th className="text-center py-3 px-3 text-gray-600 font-medium w-28">{t("products.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-12 text-gray-400">
                    {t("products.noProducts")}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedRows.includes(product.id)}
                        onChange={(e) => handleSelectRow(product.id, e.target.checked)}
                      />
                    </td>
                    <td className="py-3 px-3 text-blue-600 font-semibold">{product.uniqueNo || "-"}</td>
                    <td className="py-3 px-3 text-gray-600">{product.category || "-"}</td>
                    <td className="py-3 px-3">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt=""
                          className="w-14 h-14 rounded object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          -
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <a href="#" className="text-blue-600 hover:underline font-medium">
                        {product.title}
                      </a>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{product.brand || "-"}</td>
                    <td className="py-3 px-3 text-right">{"\u00A5"}{product.priceCny.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-semibold text-blue-600">
                      {"\u20A9"}{product.salePriceKrw.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          product.displayStatus === "visible"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.displayStatus === "visible"
                          ? t("products.visible")
                          : t("products.hidden")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          product.salesStatus === "on_sale"
                            ? "bg-green-100 text-green-700"
                            : product.salesStatus === "off_sale"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {product.salesStatus === "on_sale"
                          ? t("products.onSale")
                          : product.salesStatus === "off_sale"
                          ? t("products.offSale")
                          : t("products.draft")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-xs">
                      {product.salesStartDate && product.salesEndDate
                        ? `${formatDate(product.salesStartDate)} ~ ${formatDate(product.salesEndDate)}`
                        : "-"}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{product.categoryType || "-"}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 justify-center">
                        {product.featured && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                            {t("products.featured")}
                          </span>
                        )}
                        {product.newArrival && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            {t("products.newArrival")}
                          </span>
                        )}
                        {product.bestSeller && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                            {t("products.bestSeller")}
                          </span>
                        )}
                        {!product.featured && !product.newArrival && !product.bestSeller && "-"}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{formatDate(product.createdAt)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 justify-center">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Copy size={14} />
                        </button>
                        {deleteConfirmId === product.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              className="px-2 py-0.5 bg-red-600 text-white text-xs rounded"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              {t("products.confirm")}
                            </button>
                            <button
                              className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              {t("products.cancel")}
                            </button>
                          </div>
                        ) : (
                          <button
                            className="p-1 text-gray-400 hover:text-red-600"
                            onClick={() => setDeleteConfirmId(product.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {t("products.showing")} {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredProducts.length)} {t("products.of")}{" "}
              {filteredProducts.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
