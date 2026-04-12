"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Upload, Plus, Trash2, X } from "lucide-react";

interface Attribute {
  nameKo: string;
  nameEn: string;
  nameCn: string;
  value: string;
}

interface ImageItem {
  uid: string;
  name: string;
  url: string;
}

export default function ProductRegistration() {
  const { t } = useLocale();

  // Form state
  const [titleKo, setTitleKo] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryType, setCategoryType] = useState("retail");
  const [priceCny, setPriceCny] = useState<number | "">("");
  const [originalPriceKrw, setOriginalPriceKrw] = useState<number | "">("");
  const [salePriceKrw, setSalePriceKrw] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(0);
  const [salesStatus, setSalesStatus] = useState("draft");
  const [displayStatus, setDisplayStatus] = useState("hidden");
  const [salesStartDate, setSalesStartDate] = useState("");
  const [salesEndDate, setSalesEndDate] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [loading, setLoading] = useState(false);

  // Images
  const [imageList, setImageList] = useState<ImageItem[]>([]);

  // Attributes
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  // Category options - empty, ready for API
  const categoryOptions: { value: string; label: string }[] = [];

  const handleAddAttribute = () => {
    setAttributes([...attributes, { nameKo: "", nameEn: "", nameCn: "", value: "" }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index: number, field: keyof Attribute, value: string) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], [field]: value };
    setAttributes(updated);
  };

  const handleRemoveImage = (uid: string) => {
    setImageList(imageList.filter((img) => img.uid !== uid));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // In real implementation, upload to Cloudinary and get URL
    Array.from(files).forEach((file) => {
      const newImage: ImageItem = {
        uid: Date.now().toString() + Math.random(),
        name: file.name,
        url: URL.createObjectURL(file),
      };
      setImageList((prev) => [...prev, newImage]);
    });
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: API integration
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {t("products.productRegistration")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => window.history.back()}
            >
              {t("products.cancel")}
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? t("products.saving") : t("products.register")}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h3 className="text-sm font-semibold text-gray-700">{t("products.basicInfo")}</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.titleKo")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={titleKo}
                      onChange={(e) => setTitleKo(e.target.value)}
                      placeholder={t("products.titleKoPlaceholder")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.titleEn")}
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="Product name in English"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.titleZh")}
                    </label>
                    <input
                      type="text"
                      value={titleZh}
                      onChange={(e) => setTitleZh(e.target.value)}
                      placeholder={t("products.titleZhPlaceholder")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.brand")}
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder={t("products.brandPlaceholder")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.category")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t("products.selectCategory")}</option>
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.categoryType")}
                    </label>
                    <select
                      value={categoryType}
                      onChange={(e) => setCategoryType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="retail">{t("products.retail")}</option>
                      <option value="wholesale">{t("products.wholesale")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h3 className="text-sm font-semibold text-gray-700">{t("products.priceInfo")}</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("products.priceCny")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{"\u00A5"}</span>
                        <input
                          type="number"
                          value={priceCny}
                          onChange={(e) => setPriceCny(e.target.value ? Number(e.target.value) : "")}
                          placeholder="0"
                          min={0}
                          className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("products.originalPriceKrw")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{"\u20A9"}</span>
                        <input
                          type="number"
                          value={originalPriceKrw}
                          onChange={(e) =>
                            setOriginalPriceKrw(e.target.value ? Number(e.target.value) : "")
                          }
                          placeholder="0"
                          min={0}
                          className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.salePriceKrw")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{"\u20A9"}</span>
                      <input
                        type="number"
                        value={salePriceKrw}
                        onChange={(e) =>
                          setSalePriceKrw(e.target.value ? Number(e.target.value) : "")
                        }
                        placeholder="0"
                        min={0}
                        className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.quantity")}
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      placeholder="0"
                      min={0}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Attributes */}
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h3 className="text-sm font-semibold text-gray-700">{t("products.attributes")}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {attributes.map((attr, index) => (
                    <div key={index} className="bg-gray-50 rounded-md p-3">
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={attr.nameKo}
                          onChange={(e) => handleAttributeChange(index, "nameKo", e.target.value)}
                          placeholder={t("products.attrNameKo")}
                          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={attr.nameEn}
                          onChange={(e) => handleAttributeChange(index, "nameEn", e.target.value)}
                          placeholder={t("products.attrNameEn")}
                          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={attr.nameCn}
                          onChange={(e) => handleAttributeChange(index, "nameCn", e.target.value)}
                          placeholder={t("products.attrNameCn")}
                          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                            placeholder={t("products.attrValue")}
                            className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            className="p-1 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveAttribute(index)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-1"
                    onClick={handleAddAttribute}
                  >
                    <Plus size={14} />
                    {t("products.addAttribute")}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Product Images */}
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h3 className="text-sm font-semibold text-gray-700">{t("products.productImages")}</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {imageList.map((img) => (
                      <div key={img.uid} className="relative group">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full aspect-square rounded-md object-cover border border-gray-200"
                        />
                        <button
                          className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(img.uid)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {imageList.length < 10 && (
                      <label className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:text-blue-600 text-gray-400">
                        <Upload size={20} />
                        <span className="text-xs mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    {t("products.imageHint1")}
                    <br />
                    {t("products.imageHint2")}
                  </p>
                </div>
              </div>

              {/* Sales Settings */}
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h3 className="text-sm font-semibold text-gray-700">{t("products.salesSettings")}</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.salesStatus")}
                    </label>
                    <select
                      value={salesStatus}
                      onChange={(e) => setSalesStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="on_sale">{t("products.onSale")}</option>
                      <option value="off_sale">{t("products.offSale")}</option>
                      <option value="draft">{t("products.draft")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.displayStatus")}
                    </label>
                    <select
                      value={displayStatus}
                      onChange={(e) => setDisplayStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="visible">{t("products.visible")}</option>
                      <option value="hidden">{t("products.hidden")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.salesPeriod")}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={salesStartDate}
                        onChange={(e) => setSalesStartDate(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">~</span>
                      <input
                        type="date"
                        value={salesEndDate}
                        onChange={(e) => setSalesEndDate(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{t("products.isFeatured")}</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isFeatured ? "bg-blue-600" : "bg-gray-200"
                        }`}
                        onClick={() => setIsFeatured(!isFeatured)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isFeatured ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{t("products.isNewArrival")}</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isNewArrival ? "bg-blue-600" : "bg-gray-200"
                        }`}
                        onClick={() => setIsNewArrival(!isNewArrival)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isNewArrival ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{t("products.isBestSeller")}</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isBestSeller ? "bg-blue-600" : "bg-gray-200"
                        }`}
                        onClick={() => setIsBestSeller(!isBestSeller)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isBestSeller ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
