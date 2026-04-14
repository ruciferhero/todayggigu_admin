"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { useCallback, useId, useState } from "react";
import { ClipboardCheck, ImagePlus, Package, Plus, ScanSearch, Stamp } from "lucide-react";

type ServiceCategory = "inspection" | "origin" | "packaging";

type ServiceTileDef = { id: string; labelKey: string; icon?: "scan" | "check" | "tag" | "package" | "stamp" };

const SERVICE_CATALOG: Record<ServiceCategory, { labelKey: string; tiles: ServiceTileDef[] }> = {
  inspection: {
    labelKey: "centerSettings.additionalService.category.inspection",
    tiles: [
      { id: "detailed", labelKey: "centerSettings.additionalService.tile.detailedInspection", icon: "scan" },
      { id: "quantity", labelKey: "centerSettings.additionalService.tile.quantityCheck", icon: "check" },
    ],
  },
  origin: {
    labelKey: "centerSettings.additionalService.category.origin",
    tiles: [
      { id: "sewing", labelKey: "centerSettings.additionalService.tile.sewing", icon: "tag" },
      { id: "hangtag", labelKey: "centerSettings.additionalService.tile.hangtag", icon: "tag" },
      { id: "sticker", labelKey: "centerSettings.additionalService.tile.sticker", icon: "tag" },
      { id: "stamp", labelKey: "centerSettings.additionalService.tile.stamp", icon: "stamp" },
    ],
  },
  packaging: {
    labelKey: "centerSettings.additionalService.category.packaging",
    tiles: [
      { id: "opp", labelKey: "centerSettings.additionalService.tile.oppPack", icon: "package" },
      { id: "bubble", labelKey: "centerSettings.additionalService.tile.bubblePack", icon: "package" },
      { id: "mid", labelKey: "centerSettings.additionalService.tile.midPack", icon: "package" },
      { id: "bundle", labelKey: "centerSettings.additionalService.tile.bundlePack", icon: "package" },
      { id: "pkgProd", labelKey: "centerSettings.additionalService.tile.packageProduce", icon: "package" },
      { id: "cartonRep", labelKey: "centerSettings.additionalService.tile.cartonReplace", icon: "package" },
      { id: "pallet", labelKey: "centerSettings.additionalService.tile.palletWork", icon: "package" },
      { id: "sack", labelKey: "centerSettings.additionalService.tile.sackPack", icon: "package" },
      { id: "cartonProd", labelKey: "centerSettings.additionalService.tile.cartonProduce", icon: "package" },
    ],
  },
};

function tileKey(category: ServiceCategory, tileId: string) {
  return `${category}:${tileId}`;
}

function TileIcon({ kind }: { kind?: ServiceTileDef["icon"] }) {
  const cls = "h-5 w-5 text-gray-500";
  if (kind === "scan") return <ScanSearch className={cls} />;
  if (kind === "check") return <ClipboardCheck className={cls} />;
  if (kind === "stamp") return <Stamp className={cls} />;
  return <Package className={cls} />;
}

function AdditionalServiceSettings({ t }: { t: (key: string) => string }) {
  const serviceImageInputId = useId();
  const logoInputId = useId();

  const [selectedKey, setSelectedKey] = useState<string | null>(tileKey("inspection", "detailed"));
  const [customSlots, setCustomSlots] = useState<{ id: string; category: ServiceCategory }[]>([]);

  const [serviceImagePreview, setServiceImagePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [feeCurrency, setFeeCurrency] = useState("KRW");
  const [feeAmount, setFeeAmount] = useState("");
  const [description, setDescription] = useState("");
  const [nameKo, setNameKo] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");

  const addCustomSlot = useCallback((category: ServiceCategory) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setCustomSlots((prev) => [...prev, { id, category }]);
    setSelectedKey(tileKey(category, id));
  }, []);

  const readPreview = (file: File | null, setter: (url: string | null) => void) => {
    if (!file) {
      setter(null);
      return;
    }
    setter(URL.createObjectURL(file));
  };

  const isSelected = (key: string) => selectedKey === key;

  const renderTileButton = (
    key: string,
    label: string,
    opts: { variant: "default" | "add" | "newSlot"; icon?: ServiceTileDef["icon"] },
  ) => {
    const base =
      "flex min-h-[8px] max-w-[100px] flex-col  items-center justify-center gap-1 rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-colors";
    if (opts.variant === "add") {
      return (
        <button
          type="button"
          key={key}
          onClick={() => addCustomSlot(key.split(":")[0] as ServiceCategory)}
          className={`${base} border-dashed border-blue-500 bg-white text-blue-600 hover:bg-blue-50`}
        >
          <Plus className="h-5 w-5" />
          <span>{t("centerSettings.additionalService.add")}</span>
        </button>
      );
    }
    if (opts.variant === "newSlot") {
      return (
        <button
          type="button"
          key={key}
          onClick={() => setSelectedKey(key)}
          className={`${base} border-orange-400 bg-orange-50/40 text-gray-700 hover:bg-orange-50 ${
            isSelected(key) ? "ring-2 ring-orange-400 ring-offset-1" : ""
          }`}
        >
          <span className="text-[11px] text-orange-700">{t("centerSettings.additionalService.newSlot")}</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        key={key}
        onClick={() => setSelectedKey(key)}
        className={`${base} border-gray-200 bg-gray-50/80 text-gray-800 hover:border-gray-300 hover:bg-white ${
          isSelected(key) ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-200" : ""
        }`}
      >
        <TileIcon kind={opts.icon} />
        <span className="leading-tight">{label}</span>
      </button>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="grid min-h-[520px] grid-cols-1 divide-y divide-gray-200 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
        {/* Left: 부가서비스선택 */}
        <aside className="lg:col-span-4">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-800">{t("centerSettings.additionalService.selectTitle")}</h2>
          </div>
          <div className="max-h-[min(70vh,640px)] space-y-5 overflow-y-auto p-4">
            {(Object.keys(SERVICE_CATALOG) as ServiceCategory[]).map((category) => {
              const { labelKey, tiles } = SERVICE_CATALOG[category];
              const extras = customSlots.filter((s) => s.category === category);
              return (
                <section key={category}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t(labelKey)}
                  </h3>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {tiles.map((tile) =>
                      renderTileButton(tileKey(category, tile.id), t(tile.labelKey), {
                        variant: "default",
                        icon: tile.icon,
                      }),
                    )}
                    {extras.map((slot) =>
                      renderTileButton(tileKey(category, slot.id), "", { variant: "newSlot" }),
                    )}
                    {renderTileButton(`${category}:__add__`, "", { variant: "add" })}
                  </div>
                </section>
              );
            })}
          </div>
        </aside>

        {/* Middle: 상세 */}
        <div className="lg:col-span-4">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-800">{t("centerSettings.additionalService.detailTitle")}</h2>
          </div>
          <div className="space-y-4 p-4">
            <label
              htmlFor={serviceImageInputId}
              className="flex aspect-[16/10] w-2/3 mx-auto cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30"
            >
              {serviceImagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={serviceImagePreview} alt="" className="h-full w-full mx-auto rounded-md object-contain p-2" />
              ) : (
                <>
                  <ImagePlus className="h-10 w-10 text-gray-400" />
                  <span className="text-sm text-gray-600">{t("centerSettings.additionalService.addImage")}</span>
                </>
              )}
              <input
                id={serviceImageInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => readPreview(e.target.files?.[0] ?? null, setServiceImagePreview)}
              />
            </label>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                {t("centerSettings.additionalService.feeBasis")}
              </label>
              <div className="flex gap-2">
                <select
                  value={feeCurrency}
                  onChange={(e) => setFeeCurrency(e.target.value)}
                  className="h-10 w-24 shrink-0 rounded-md border border-gray-300 bg-white px-2 text-sm"
                >
                  <option value="KRW">₩ KRW</option>
                  <option value="CNY">¥ CNY</option>
                  <option value="USD">$ USD</option>
                </select>
                <input
                  type="text"
                  inputMode="decimal"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  placeholder={t("centerSettings.additionalService.feePlaceholder")}
                  className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                {t("centerSettings.additionalService.detailDescription")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={10}
                placeholder={t("centerSettings.additionalService.descriptionPlaceholder")}
                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right: 서비스설정 */}
        <aside className="flex flex-col lg:col-span-4">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-800">{t("centerSettings.additionalService.settingsTitle")}</h2>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                <span className="text-red-500">{t("centerSettings.additionalService.requiredMark")}</span>
                {t("centerSettings.additionalService.nameKo")}
              </label>
              <input
                value={nameKo}
                onChange={(e) => setNameKo(e.target.value)}
                placeholder={t("centerSettings.additionalService.namePlaceholder")}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                <span className="text-red-500">{t("centerSettings.additionalService.requiredMark")}</span>
                {t("centerSettings.additionalService.nameEn")}
              </label>
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder={t("centerSettings.additionalService.namePlaceholder")}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                <span className="text-red-500">{t("centerSettings.additionalService.requiredMark")}</span>
                {t("centerSettings.additionalService.nameZh")}
              </label>
              <input
                value={nameZh}
                onChange={(e) => setNameZh(e.target.value)}
                placeholder={t("centerSettings.additionalService.namePlaceholder")}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                <span className="text-red-500">{t("centerSettings.additionalService.requiredMark")}</span>
                {t("centerSettings.additionalService.logo")}
              </label>
              <label
                htmlFor={logoInputId}
                className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400"
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="" className="h-full w-full rounded-md object-contain p-1" />
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500">{t("centerSettings.additionalService.logo")}</span>
                  </>
                )}
                <input
                  id={logoInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => readPreview(e.target.files?.[0] ?? null, setLogoPreview)}
                />
              </label>
            </div>
            <div className="mt-auto flex gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                className="h-10 flex-1 rounded-md bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                {t("centerSettings.action.delete")}
              </button>
              <button
                type="button"
                className="h-10 flex-1 rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                {t("centerSettings.action.save")}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CenterSettings() {
  const { t } = useLocale();
  const tabs = [
    t("centerSettings.tab.expectedArrival"),
    t("centerSettings.tab.warehouseRetention"),
    t("centerSettings.tab.additionalService"),
    t("centerSettings.tab.shippingCost"),
  ];

  const [activeTab, setActiveTab] = useState(t("centerSettings.tab.expectedArrival"));

  const centers = [
    t("centerSettings.center.weihai"),
    t("centerSettings.center.yiwu"),
    t("centerSettings.center.qingdao"),
    t("centerSettings.center.guangzhou"),
  ];

  return (
    <div className="min-h-screen space-y-4 bg-white p-6">
      <header className="px-2">
        <h1 className="text-xl font-semibold">{t("submenu.centerSettings")}</h1>
      </header>

      <nav className="border-b-2 border-gray-200 px-2">
        <div className="flex flex-wrap gap-6 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 py-3 transition ${
                activeTab === tab
                  ? "border-blue-500 font-medium text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === t("centerSettings.tab.warehouseRetention") && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {centers.map((name) => (
            <div
              key={name}
              className="rounded-lg border-2 border-gray-300 bg-white p-4 transition-all duration-300 hover:border-blue-500 hover:bg-gray-50 hover:shadow-md"
            >
              <div className="mb-3 font-medium">{name}</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between hover:text-blue-500">
                  <span>{t("centerSettings.field.freeStorageDays")}</span>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue={2} className="w-12 rounded border px-1 py-0.5 text-right" />
                    <span className="text-gray-500">{t("centerSettings.unit.day")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between hover:text-blue-500">
                  <span>{t("centerSettings.field.storageCostPerCbm")}</span>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue={300} className="w-16 rounded border px-1 py-0.5 text-right" />
                    <span className="text-gray-500">{t("centerSettings.unit.won")}</span>
                  </div>
                </div>
              </div>
              <hr className="my-4 border-gray-300" />
              <div className="text-right">
                <button
                  type="button"
                  className="rounded-md border px-4 py-1 text-sm text-blue-500 hover:bg-blue-500 hover:text-white"
                >
                  {t("centerSettings.action.save")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === t("centerSettings.tab.expectedArrival") && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {centers.map((name) => (
            <div
              key={name}
              className="rounded-lg border-2 border-gray-300 bg-white p-4 transition-all duration-300 hover:border-blue-500 hover:bg-gray-50 hover:shadow-md"
            >
              <div className="mb-3 font-medium">{name}</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between hover:text-blue-500">
                  <span>{t("centerSettings.tab.deliveryDemand")}</span>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue={2} className="w-12 rounded border px-1 py-0.5 text-right" />
                    <span className="text-gray-500">{t("centerSettings.unit.day")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between hover:text-blue-500">
                  <span>{t("centerSettings.tab.centerArrivalDemand")}</span>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue={2} className="w-12 rounded border px-1 py-0.5 text-right" />
                    <span className="text-gray-500">{t("centerSettings.unit.day")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between hover:text-blue-500">
                  <span>{t("centerSettings.tab.internationalDeliveryDemand")}</span>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue={2} className="w-12 rounded border px-1 py-0.5 text-right" />
                    <span className="text-gray-500">{t("centerSettings.unit.day")}</span>
                  </div>
                </div>
              </div>
              <hr className="my-4 border-gray-300" />
              <div className="text-right">
                <button
                  type="button"
                  className="rounded-md border px-4 py-1 text-sm text-blue-500 hover:bg-blue-500 hover:text-white"
                >
                  {t("centerSettings.action.save")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === t("centerSettings.tab.additionalService") && <AdditionalServiceSettings t={t} />}

      {activeTab === t("centerSettings.tab.shippingCost") && (
        <div className="rounded-lg border bg-white p-6">{t("centerSettings.tab.shippingCost")}</div>
      )}
    </div>
  );
}
