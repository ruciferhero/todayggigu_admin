"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { ApiError } from "@/api/client";
import {
  createAdminCartService,
  deleteAdminCartService,
  fetchAdminCartServices,
  type AddServiceItem,
  updateAdminCartService,
} from "@/api/settings/addServices";
import { showToast } from "@/lib/toast";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { ClipboardCheck, ImagePlus, Package, Plus, ScanSearch, Stamp } from "lucide-react";

type ServiceCategory = "inspection" | "origin" | "packaging";
type ServiceTileIcon = "scan" | "check" | "tag" | "package" | "stamp";

const SERVICE_CATALOG: Record<ServiceCategory, { labelKey: string }> = {
  inspection: { labelKey: "centerSettings.additionalService.category.inspection" },
  origin: { labelKey: "centerSettings.additionalService.category.origin" },
  packaging: { labelKey: "centerSettings.additionalService.category.packaging" },
};

function tileKey(category: ServiceCategory, tileId: string) {
  return `${category}:${tileId}`;
}

function parseTileKey(key: string): { category: ServiceCategory; tileId: string } | null {
  const i = key.indexOf(":");
  if (i <= 0) return null;
  const category = key.slice(0, i) as ServiceCategory;
  const tileId = key.slice(i + 1);
  if (!tileId || tileId === "__add__") return null;
  if (!SERVICE_CATALOG[category]) return null;
  return { category, tileId };
}

type ServiceDraft = {
  serviceType: string;
  feeCurrency: string;
  feeAmount: string;
  note: string;
  description: string;
  nameKo: string;
  nameEn: string;
  nameZh: string;
  serviceImageDataUrl: string | null;
  logoDataUrl: string | null;
  /** Shown in the logo area when no custom logo is uploaded (matches the tile button icon). */
  tileIconKind: ServiceTileIcon;
  /** Backend `_id` from POST `/admin/carts/services` */
  backendServiceId?: string;
};

const EMPTY_DRAFT: ServiceDraft = {
  serviceType: "",
  feeCurrency: "KRW",
  feeAmount: "",
  note: "",
  description: "",
  nameKo: "",
  nameEn: "",
  nameZh: "",
  serviceImageDataUrl: null,
  logoDataUrl: null,
  tileIconKind: "package",
};

function buildDefaultDraft(key: string): ServiceDraft {
  const parsed = parseTileKey(key);
  if (!parsed) return { ...EMPTY_DRAFT };
  const { category, tileId } = parsed;
  if (tileId.startsWith("custom-")) return { ...EMPTY_DRAFT, tileIconKind: "package" };
  return { ...EMPTY_DRAFT, serviceType: serviceTypeByCategory(category) };
}

function isCustomTileId(tileId: string) {
  return tileId.startsWith("custom-");
}

function TileIcon({ kind, className }: { kind?: ServiceTileIcon; className?: string }) {
  const cls = className ?? "h-5 w-5 text-gray-500";
  if (kind === "scan") return <ScanSearch className={cls} />;
  if (kind === "check") return <ClipboardCheck className={cls} />;
  if (kind === "stamp") return <Stamp className={cls} />;
  return <Package className={cls} />;
}

function dataUrlToFile(dataUrl: string, filenameBase: string): File | null {
  const m = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!m) return null;
  const mime = m[1];
  const b64 = m[2];
  try {
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i += 1) arr[i] = bytes.charCodeAt(i);
    const ext = mime.includes("png")
      ? "png"
      : mime.includes("jpeg") || mime.includes("jpg")
        ? "jpg"
        : mime.includes("webp")
          ? "webp"
          : "bin";
    return new File([arr], `${filenameBase}.${ext}`, { type: mime });
  } catch {
    return null;
  }
}

async function imageSourceToFile(src: string, filenameBase: string): Promise<File | null> {
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return dataUrlToFile(trimmed, filenameBase);
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const res = await fetch(trimmed);
    if (!res.ok) return null;
    const blob = await res.blob();
    const mime = blob.type || "application/octet-stream";
    const ext = mime.includes("png")
      ? "png"
      : mime.includes("jpeg") || mime.includes("jpg")
        ? "jpg"
        : mime.includes("webp")
          ? "webp"
          : "bin";
    return new File([blob], `${filenameBase}.${ext}`, { type: mime });
  } catch {
    return null;
  }
}

function inferCategoryFromService(s: AddServiceItem): ServiceCategory {
  const raw = `${s.serviceType ?? ""} ${s.name ?? ""} ${s.nameEn ?? ""}`.toLowerCase();
  if (raw.includes("검수") || raw.includes("inspection")) return "inspection";
  if (raw.includes("원산지") || raw.includes("origin")) return "origin";
  return "packaging";
}

function serviceTypeByCategory(category: ServiceCategory): string {
  return category;
}

function serviceToDraft(s: AddServiceItem): ServiceDraft {
  return {
    ...EMPTY_DRAFT,
    backendServiceId: s._id,
    nameKo: s.name ?? "",
    nameEn: s.nameEn ?? "",
    nameZh: s.nameZh ?? "",
    serviceType: s.serviceType ?? "checkoption",
    feeCurrency: s.feeCurrency ?? "KRW",
    feeAmount: s.price != null ? String(s.price) : "",
    note: s.note ?? "",
    description: s.description ?? "",
    serviceImageDataUrl: s.imageUrl ?? null,
    logoDataUrl: s.logo ?? s.icon ?? null,
    tileIconKind: "package",
  };
}

function AdditionalServiceSettings() {
  const { t, locale } = useLocale();
  const serviceImageInputId = useId();
  const logoInputId = useId();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [pendingNewCategory, setPendingNewCategory] = useState<ServiceCategory | null>(null);
  const [composerDraft, setComposerDraft] = useState<ServiceDraft>(() => ({ ...EMPTY_DRAFT }));
  const [customSlots, setCustomSlots] = useState<{ id: string; category: ServiceCategory }[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ServiceDraft>>({});

  const showForms = selectedKey !== null || pendingNewCategory !== null;

  const patchDraftKey = useCallback((key: string, patch: Partial<ServiceDraft>) => {
    setDrafts((prev) => {
      const base = prev[key] ?? buildDefaultDraft(key);
      return { ...prev, [key]: { ...base, ...patch } };
    });
  }, []);

  const updateCurrentDraft = useCallback(
    (patch: Partial<ServiceDraft>) => {
      if (pendingNewCategory !== null) {
        setComposerDraft((prev) => ({ ...prev, ...patch }));
        return;
      }
      if (selectedKey) patchDraftKey(selectedKey, patch);
    },
    [pendingNewCategory, selectedKey, patchDraftKey],
  );

  const readDataUrl = useCallback((file: File | null, onDone: (dataUrl: string | null) => void) => {
    if (!file) {
      onDone(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onDone(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }, []);

  const loadServicesFromBackend = useCallback(async () => {
    const list = await fetchAdminCartServices();
    const nextSlots: { id: string; category: ServiceCategory }[] = [];
    const nextDrafts: Record<string, ServiceDraft> = {};

    for (const s of list) {
      if (!s._id) continue;
      const category = inferCategoryFromService(s);
      const slotId = `custom-${s._id}`;
      const key = tileKey(category, slotId);
      nextSlots.push({ id: slotId, category });
      nextDrafts[key] = serviceToDraft(s);
    }

    setCustomSlots(nextSlots);
    setDrafts(nextDrafts);
    if (nextSlots.length > 0) {
      const first = nextSlots[0];
      setSelectedKey(tileKey(first.category, first.id));
    } else {
      setSelectedKey(null);
    }
  }, []);

  useEffect(() => {
    void loadServicesFromBackend().catch((e) => {
      showToast({
        message: e instanceof ApiError ? e.message : t("centerSettings.additionalService.saveError"),
        variant: "error",
      });
    });
  }, [loadServicesFromBackend, t]);

  const currentDraft = useMemo((): ServiceDraft => {
    if (pendingNewCategory !== null) return composerDraft;
    if (selectedKey) return drafts[selectedKey] ?? buildDefaultDraft(selectedKey);
    return { ...EMPTY_DRAFT };
  }, [pendingNewCategory, composerDraft, selectedKey, drafts]);

  const customTileLabel = useCallback(
    (d: ServiceDraft | undefined) => {
      if (!d) return t("centerSettings.additionalService.unnamedCustom");
      const ko = d.nameKo.trim();
      const en = d.nameEn.trim();
      const zh = d.nameZh.trim();
      if (locale === "ko" && ko) return ko;
      if (locale === "en" && en) return en;
      if (locale === "zh" && zh) return zh;
      return ko || en || zh || t("centerSettings.additionalService.unnamedCustom");
    },
    [locale, t],
  );

  const selectTile = useCallback((key: string) => {
    setPendingNewCategory(null);
    setComposerDraft({ ...EMPTY_DRAFT });
    setDrafts((prev) => (prev[key] ? prev : { ...prev, [key]: buildDefaultDraft(key) }));
    setSelectedKey(key);
  }, []);

  const startAddService = useCallback((category: ServiceCategory) => {
    setSelectedKey(null);
    setPendingNewCategory(category);
    setComposerDraft({
      ...EMPTY_DRAFT,
      tileIconKind: "package",
      serviceType: serviceTypeByCategory(category),
    });
  }, []);

  const isSelected = (key: string) => selectedKey === key;

  const createServiceOnServer = useCallback(
    async (draft: ServiceDraft, category: ServiceCategory) => {
      const imageSrc = draft.serviceImageDataUrl?.trim() ?? "";
      const logoSrc = draft.logoDataUrl?.trim() ?? "";
      const imageFile = await imageSourceToFile(imageSrc, "add-service-image");
      const logoFile = await imageSourceToFile(logoSrc, "add-service-logo");
      if (!imageFile || !logoFile) {
        throw new Error("Missing image/logo file");
      }
      const priceRaw = draft.feeAmount.replace(/[^\d.]/g, "");
      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Invalid price");
      }
      return createAdminCartService({
        serviceType: serviceTypeByCategory(category),
        name: draft.nameKo.trim() || draft.nameEn.trim() || draft.nameZh.trim(),
        nameZh: draft.nameZh.trim(),
        nameEn: draft.nameEn.trim(),
        feeCurrency: draft.feeCurrency.trim() || "KRW",
        quantity: "1",
        price: String(Math.round(price)),
        note: draft.note.trim() || draft.description.trim(),
        description: draft.description.trim(),
        image: imageFile ?? undefined,
        logo: logoFile ?? undefined,
      });
    },
    [],
  );

  const updateServiceOnServer = useCallback(
    async (serviceId: string, draft: ServiceDraft, category: ServiceCategory) => {
      const nameOk = draft.nameKo.trim() || draft.nameEn.trim() || draft.nameZh.trim();
      if (!nameOk) throw new Error("Missing name");
      const priceRaw = draft.feeAmount.replace(/[^\d.]/g, "");
      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Invalid price");
      }

      const imageSrc = draft.serviceImageDataUrl?.trim() ?? "";
      const logoSrc = draft.logoDataUrl?.trim() ?? "";
      const imageFile = imageSrc.startsWith("data:")
        ? await imageSourceToFile(imageSrc, "add-service-image")
        : undefined;
      const logoFile = logoSrc.startsWith("data:")
        ? await imageSourceToFile(logoSrc, "add-service-logo")
        : undefined;
      if (imageSrc.startsWith("data:") && !imageFile) throw new Error("Missing image/logo file");
      if (logoSrc.startsWith("data:") && !logoFile) throw new Error("Missing image/logo file");

      return updateAdminCartService(serviceId, {
        serviceType: serviceTypeByCategory(category),
        name: draft.nameKo.trim() || draft.nameEn.trim() || draft.nameZh.trim(),
        nameZh: draft.nameZh.trim(),
        nameEn: draft.nameEn.trim(),
        feeCurrency: draft.feeCurrency.trim() || "KRW",
        quantity: "1",
        price: String(Math.round(price)),
        note: draft.note.trim() || draft.description.trim(),
        description: draft.description.trim(),
        image: imageFile ?? undefined,
        logo: logoFile ?? undefined,
      });
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (pendingNewCategory !== null) {
      const nameOk =
        composerDraft.nameKo.trim() ||
        composerDraft.nameEn.trim() ||
        composerDraft.nameZh.trim();
      if (!nameOk || !composerDraft.logoDataUrl || !composerDraft.serviceImageDataUrl) {
        showToast({
          message: t("centerSettings.additionalService.saveNewRequiresFields"),
          variant: "warning",
        });
        return;
      }
      try {
        const res = await createServiceOnServer(composerDraft, pendingNewCategory);
        const addService = res.data?.addService;
        await loadServicesFromBackend();
        setPendingNewCategory(null);
        setComposerDraft({ ...EMPTY_DRAFT });
        if (addService?._id) {
          const category = inferCategoryFromService({
            _id: addService._id,
            serviceType: addService.serviceType,
            name: addService.name,
            nameEn: addService.nameEn,
          });
          setSelectedKey(tileKey(category, `custom-${addService._id}`));
        }
        showToast({ message: t("centerSettings.additionalService.saveSuccess"), variant: "success" });
      } catch (e) {
        if (e instanceof Error && e.message === "Invalid price") {
          showToast({ message: t("centerSettings.additionalService.invalidPrice"), variant: "warning" });
        } else if (e instanceof Error && e.message === "Missing image/logo file") {
          showToast({ message: t("centerSettings.additionalService.saveError"), variant: "error" });
        } else {
          showToast({
            message: e instanceof ApiError ? e.message : t("centerSettings.additionalService.saveError"),
            variant: "error",
          });
        }
      }
      return;
    }
    if (!selectedKey) return;
    const parsed = parseTileKey(selectedKey);
    const isCustomSelected = !!parsed && isCustomTileId(parsed.tileId);
    const serviceCategory = parsed?.category ?? "packaging";
    const selectedDraft = drafts[selectedKey] ?? buildDefaultDraft(selectedKey);
    if (isCustomSelected && !selectedDraft.backendServiceId) {
      const nameOk =
        selectedDraft.nameKo.trim() ||
        selectedDraft.nameEn.trim() ||
        selectedDraft.nameZh.trim();
      if (!nameOk || !selectedDraft.logoDataUrl || !selectedDraft.serviceImageDataUrl) {
        showToast({
          message: t("centerSettings.additionalService.saveNewRequiresFields"),
          variant: "warning",
        });
        return;
      }
      const priceRaw = selectedDraft.feeAmount.replace(/[^\d.]/g, "");
      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price <= 0) {
        showToast({
          message: t("centerSettings.additionalService.invalidPrice"),
          variant: "warning",
        });
        return;
      }
      try {
        await createServiceOnServer(selectedDraft, serviceCategory);
        await loadServicesFromBackend();
        showToast({ message: t("centerSettings.additionalService.saveSuccess"), variant: "success" });
      } catch (e) {
        if (e instanceof Error && e.message === "Invalid price") {
          showToast({ message: t("centerSettings.additionalService.invalidPrice"), variant: "warning" });
        } else if (e instanceof Error && e.message === "Missing image/logo file") {
          showToast({ message: t("centerSettings.additionalService.saveError"), variant: "error" });
        } else {
          showToast({
            message: e instanceof ApiError ? e.message : t("centerSettings.additionalService.saveError"),
            variant: "error",
          });
        }
      }
      return;
    }
    if (isCustomSelected && selectedDraft.backendServiceId) {
      try {
        await updateServiceOnServer(selectedDraft.backendServiceId, selectedDraft, serviceCategory);
        await loadServicesFromBackend();
        showToast({ message: t("centerSettings.additionalService.saveSuccess"), variant: "success" });
      } catch (e) {
        if (e instanceof Error && e.message === "Invalid price") {
          showToast({ message: t("centerSettings.additionalService.invalidPrice"), variant: "warning" });
        } else if (e instanceof Error && e.message === "Missing image/logo file") {
          showToast({ message: t("centerSettings.additionalService.saveError"), variant: "error" });
        } else if (e instanceof Error && e.message === "Missing name") {
          showToast({ message: t("centerSettings.additionalService.saveNewRequiresFields"), variant: "warning" });
        } else {
          showToast({
            message: e instanceof ApiError ? e.message : t("centerSettings.additionalService.saveError"),
            variant: "error",
          });
        }
      }
      return;
    }
    showToast({ message: t("centerSettings.additionalService.saveSuccess"), variant: "success" });
  }, [pendingNewCategory, composerDraft, drafts, selectedKey, t, createServiceOnServer, updateServiceOnServer, loadServicesFromBackend]);

  const handleDelete = useCallback(async () => {
    if (pendingNewCategory !== null) {
      showToast({
        message: t("centerSettings.additionalService.deleteOnlyCustom"),
        variant: "warning",
      });
      return;
    }
    if (!selectedKey) return;
    const parsed = parseTileKey(selectedKey);
    if (!parsed) return;
    const { category, tileId } = parsed;

    if (isCustomTileId(tileId)) {
      if (!window.confirm(t("centerSettings.additionalService.deleteConfirmCustom"))) return;
      const selectedDraft = drafts[selectedKey];
      try {
        if (selectedDraft?.backendServiceId) {
          await deleteAdminCartService(selectedDraft.backendServiceId);
          await loadServicesFromBackend();
        } else {
          const nextSlots = customSlots.filter((s) => s.id !== tileId);
          const nextDrafts = { ...drafts };
          delete nextDrafts[selectedKey];
          const fallbackCustom = nextSlots.find((s) => s.category === category) ?? nextSlots[0];
          const nextSelectedKey = fallbackCustom ? tileKey(fallbackCustom.category, fallbackCustom.id) : null;
          setCustomSlots(nextSlots);
          setDrafts(nextDrafts);
          setSelectedKey(nextSelectedKey);
        }
        showToast({ message: t("centerSettings.additionalService.deleteSuccess"), variant: "success" });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t("centerSettings.additionalService.saveError"),
          variant: "error",
        });
      }
      return;
    }

    showToast({
      message: t("centerSettings.additionalService.deleteOnlyCustom"),
      variant: "warning",
    });
  }, [pendingNewCategory, selectedKey, t, drafts, customSlots, loadServicesFromBackend]);

  const handleReset = useCallback(() => {
    if (pendingNewCategory !== null) {
      if (!window.confirm(t("centerSettings.additionalService.cancelAddConfirm"))) return;
      setPendingNewCategory(null);
      setComposerDraft({ ...EMPTY_DRAFT });
      return;
    }
    if (!selectedKey) return;
    if (!window.confirm(t("centerSettings.additionalService.deleteConfirmReset"))) return;
    const nextDrafts = { ...drafts, [selectedKey]: buildDefaultDraft(selectedKey) };
    setDrafts(nextDrafts);
    showToast({ message: t("orders.action.reset"), variant: "success" });
  }, [pendingNewCategory, selectedKey, t, drafts, customSlots]);

  const catalogTileBaseClass =
    "flex min-h-[8px] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-colors";

  const renderAddTile = (category: ServiceCategory) => (
    <button
      type="button"
      key={`${category}:__add__`}
      onClick={() => startAddService(category)}
      className={`${catalogTileBaseClass} border-dashed border-blue-500 bg-white text-blue-600 hover:bg-blue-50 ${
        pendingNewCategory === category ? "ring-2 ring-blue-400 ring-offset-1" : ""
      }`}
    >
      <Plus className="h-5 w-5" />
      <span>{t("centerSettings.additionalService.add")}</span>
    </button>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div
        className={`grid min-h-[520px] grid-cols-1 divide-y divide-gray-200 lg:grid-cols-12 lg:divide-x lg:divide-y-0`}
      >
        {/* Left: 부가서비스선택 */}
        <aside className={"lg:col-span-4" }>
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-800">{t("centerSettings.additionalService.selectTitle")}</h2>
          </div>
          <div className="max-h-[min(70vh,640px)] space-y-5 overflow-y-auto p-4">
            {(Object.keys(SERVICE_CATALOG) as ServiceCategory[]).map((category) => {
              const { labelKey } = SERVICE_CATALOG[category];
              const extras = customSlots.filter((s) => s.category === category);
              return (
                <section key={category}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t(labelKey)}
                  </h3>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {extras.map((slot) => {
                      const key = tileKey(category, slot.id);
                      const d = drafts[key];
                      const label = customTileLabel(d);
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => selectTile(key)}
                          className={`${catalogTileBaseClass} border-gray-200 bg-gray-50/80 text-gray-800 hover:border-gray-300 hover:bg-white ${
                            isSelected(key) ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-200" : ""
                          }`}
                        >
                          {d?.logoDataUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={d.logoDataUrl}
                              alt=""
                              className="h-5 w-5 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <TileIcon kind={d?.tileIconKind ?? "package"} />
                          )}
                          <span className="line-clamp-2 leading-tight">{label}</span>
                        </button>
                      );
                    })}
                    {renderAddTile(category)}
                  </div>
                </section>
              );
            })}
          </div>
        </aside>

        { (
          <>
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
              {currentDraft.serviceImageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentDraft.serviceImageDataUrl}
                  alt=""
                  className="h-full w-full mx-auto rounded-md object-contain p-2"
                />
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
                onChange={(e) =>
                  readDataUrl(e.target.files?.[0] ?? null, (url) =>
                    updateCurrentDraft({ serviceImageDataUrl: url }),
                  )
                }
              />
            </label>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                {t("centerSettings.additionalService.feeBasis")}
              </label>
              <div className="flex gap-2">
                <select
                  value={currentDraft.feeCurrency}
                  onChange={(e) => updateCurrentDraft({ feeCurrency: e.target.value })}
                  className="h-10 w-24 shrink-0 rounded-md border border-gray-300 bg-white px-2 text-sm"
                >
                  <option value="KRW">₩ KRW</option>
                  <option value="CNY">¥ CNY</option>
                  <option value="USD">$ USD</option>
                </select>
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentDraft.feeAmount}
                  onChange={(e) => updateCurrentDraft({ feeAmount: e.target.value })}
                  placeholder={t("centerSettings.additionalService.feePlaceholder")}
                  className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                {t("centerSettings.additionalService.detailDescription")}
              </label>
              {/* <input
                type="text"
                value={currentDraft.note}
                onChange={(e) => updateCurrentDraft({ note: e.target.value })}
                placeholder={t("orders.common.memo")}
                className="mb-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              /> */}
              <textarea
                value={currentDraft.description}
                onChange={(e) => updateCurrentDraft({ description: e.target.value })}
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
                value={currentDraft.nameKo}
                onChange={(e) => updateCurrentDraft({ nameKo: e.target.value })}
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
                value={currentDraft.nameEn}
                onChange={(e) => updateCurrentDraft({ nameEn: e.target.value })}
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
                value={currentDraft.nameZh}
                onChange={(e) => updateCurrentDraft({ nameZh: e.target.value })}
                placeholder={t("centerSettings.additionalService.namePlaceholder")}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                <span className="text-red-500">{t("centerSettings.additionalService.requiredMark")}</span>
                {t("centerSettings.additionalService.logo")}
              </label>
              <div className="flex flex-wrap items-start gap-2">
                <label
                  htmlFor={logoInputId}
                  className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400"
                >
                  {currentDraft.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentDraft.logoDataUrl} alt="" className="h-full w-full rounded-md object-contain p-1" />
                  ) : (
                    <TileIcon kind={currentDraft.tileIconKind} className="h-14 w-14 text-gray-500" />
                  )}
                  <input
                    id={logoInputId}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      readDataUrl(e.target.files?.[0] ?? null, (url) =>
                        updateCurrentDraft({ logoDataUrl: url }),
                      )
                    }
                  />
                </label>
                {currentDraft.logoDataUrl && pendingNewCategory === null ? (
                  <button
                    type="button"
                    onClick={() => updateCurrentDraft({ logoDataUrl: null })}
                    className="mt-1 rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100"
                  >
                    {t("centerSettings.additionalService.logoUseTileIcon")}
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {pendingNewCategory !== null
                  ? t("centerSettings.additionalService.logoHintComposer")
                  : t("centerSettings.additionalService.logoHint")}
              </p>
            </div>
            <div className="mt-auto flex gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="h-10 flex-1 rounded-md bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                {t("centerSettings.action.delete")}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 flex-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {t("orders.action.reset")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="h-10 flex-1 rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                {t("centerSettings.action.save")}
              </button>
            </div>
          </div>
        </aside>
          </>
        ) }
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
    <div className="space-y-4 bg-white p-6">
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

      {activeTab === t("centerSettings.tab.additionalService") && <AdditionalServiceSettings />}

      {activeTab === t("centerSettings.tab.shippingCost") && (
        <div className="rounded-lg border bg-white p-6">{t("centerSettings.tab.shippingCost")}</div>
      )}
    </div>
  );
}
