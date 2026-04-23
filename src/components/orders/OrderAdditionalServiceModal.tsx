"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Check, Package, X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { ApiError } from "@/api/client";
import {
  fetchManualOrder,
  patchManualOrderAdditionalServices,
  resolveManualOrderPatchIdentifier,
} from "@/api/orders/manualSearch";
import { fetchAdminCartServices, type AddServiceItem } from "@/api/settings/addServices";
import { showToast } from "@/lib/toast";
import type { OrderBoardOrder } from "@/components/orders/OrderBoard";

type ModalGroup = "origin" | "package" | "carton" | "inspection";

const SERVICE_GROUPS: { group: ModalGroup; titleKey: string }[] = [
  { group: "origin", titleKey: "orders.product.addServiceCategoryOriginRequired" },
  { group: "package", titleKey: "orders.product.addServiceCategoryPackageWork" },
  { group: "carton", titleKey: "orders.product.addServiceCategoryCarton" },
  { group: "inspection", titleKey: "orders.product.addServiceCategoryInspectionMethod" },
];

function inferModalGroup(s: AddServiceItem): ModalGroup {
  const raw = `${s.serviceType ?? ""} ${s.name ?? ""} ${s.nameEn ?? ""}`.toLowerCase();
  if (raw.includes("검수") || raw.includes("inspection") || raw.includes("验货")) return "inspection";
  if (raw.includes("원산지") || raw.includes("origin") || raw.includes("原产")) return "origin";
  if (
    raw.includes("카톤") ||
    raw.includes("carton") ||
    raw.includes("纸箱") ||
    raw.includes("파렛트") ||
    raw.includes("pallet") ||
    raw.includes("托盘") ||
    raw.includes("마대") ||
    raw.includes("麻袋")
  ) {
    return "carton";
  }
  return "package";
}

function serviceDisplayName(s: AddServiceItem, locale: string, t: (k: string) => string): string {
  if (locale === "ko" && s.name?.trim()) return s.name.trim();
  if (locale === "en" && s.nameEn?.trim()) return s.nameEn.trim();
  if (locale === "zh" && s.nameZh?.trim()) return s.nameZh.trim();
  return s.name?.trim() || s.nameEn?.trim() || s.nameZh?.trim() || t("centerSettings.additionalService.unnamedCustom");
}

function currencySymbol(code: string | undefined): string {
  const c = (code ?? "").toUpperCase();
  if (c === "CNY" || c === "RMB") return "¥";
  if (c === "USD") return "$";
  if (c === "KRW") return "₩";
  return c ? `${c} ` : "";
}

function formatApiFee(s: AddServiceItem, t: (k: string) => string): string {
  const sym = currencySymbol(s.feeCurrency);
  const price = s.price;
  if (price == null || !Number.isFinite(Number(price))) return t("orders.product.addServicePresetFee");
  const unit = t("orders.product.addServiceFeeUnitPcs");
  return `${sym}${price}/${unit}`;
}

function splitOfferIdParts(offerId: string): string[] {
  return offerId
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export type OrderAdditionalServiceModalProps = {
  open: boolean;
  order: OrderBoardOrder | null;
  /** 열 때 체크된 상품 라인 `product.id` — PATCH `items[].offerId` */
  selectedProductIds: string[];
  onClose: () => void;
  /** PATCH 성공 후 보드 새로고침 등 (`orderNo`는 방금 저장한 주문) */
  onApplied?: (orderNo: string) => void;
};

export default function OrderAdditionalServiceModal({
  open,
  order,
  selectedProductIds,
  onClose,
  onApplied,
}: OrderAdditionalServiceModalProps) {
  const { t, locale } = useLocale();
  const photoInputId = useId();
  const [apiServices, setApiServices] = useState<AddServiceItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Multi-select: cart service `_id`s */
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  /** Which service the middle column previews (last interacted tile) */
  const [previewServiceId, setPreviewServiceId] = useState<string | null>(null);
  const [otherMemo, setOtherMemo] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  /** 서버 GET 기준 현재 부가서비스 매핑 (`items[{offerId, addservices}]`) */
  const [serverServiceItems, setServerServiceItems] = useState<Array<{ offerId: string; addservices: string[] }>>([]);

  const resetForm = useCallback(() => {
    setSelectedServiceIds([]);
    setPreviewServiceId(null);
    setOtherMemo("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setLoadError(null);
    setSaving(false);
    setServerServiceItems([]);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }
    if (!order) {
      resetForm();
      return;
    }
    resetForm();
    setApiServices([]);
    const manualId = resolveManualOrderPatchIdentifier(order);
    void fetchAdminCartServices()
      .then(async (services) => {
        setApiServices(services);
        let fresh = order;
        try {
          /**
           * Some environments resolve `/admin/orders/manual/:id` by orderNo (P000...)
           * while Mongo `_id` can 404. Try orderNo first, then fallback to resolved id.
           */
          const primaryId = order.orderNo?.trim() || manualId;
          fresh = await fetchManualOrder(primaryId, t);
        } catch {
          if (manualId && manualId !== order.orderNo?.trim()) {
            try {
              fresh = await fetchManualOrder(manualId, t);
            } catch {
              /* 단건 GET 실패 시 목록 행의 부가서비스 필드만 사용 */
            }
          }
        }
        const selectedProductSet = new Set(selectedProductIds.map((x) => String(x).trim()).filter(Boolean));
        const fromServerItems = fresh.additionalServiceItems ?? order.additionalServiceItems ?? [];
        setServerServiceItems(fromServerItems);
        const fromLineAddservices = (fresh.products ?? [])
          .filter((p) => selectedProductSet.has(p.id))
          .flatMap((p) => p.additionalServices?.map((s) => s.addServiceId) ?? []);
        const fromItemSchema = (fresh.additionalServiceItems ?? order.additionalServiceItems ?? [])
          .filter((it) => splitOfferIdParts(it.offerId).some((id) => selectedProductSet.has(id)))
          .flatMap((it) => it.addservices ?? []);
        const fromLegacy = fresh.additionalServiceIds ?? order.additionalServiceIds ?? [];
        const fromApi = fromLineAddservices.length
          ? fromLineAddservices
          : fromItemSchema.length
            ? fromItemSchema
            : fromLegacy;
        const known = [...new Set(fromApi)].filter((sid) => services.some((s) => s._id === sid));
        setSelectedServiceIds(known);
        setPreviewServiceId(known[0] ?? null);
        setLoadError(null);
      })
      .catch((e) => {
        setApiServices([]);
        setServerServiceItems([]);
        setLoadError(e instanceof ApiError ? e.message : t("centerSettings.additionalService.saveError"));
      });
  }, [open, order, resetForm, selectedProductIds, t]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const apiByGroup = useMemo(() => {
    const m: Record<ModalGroup, AddServiceItem[]> = {
      origin: [],
      package: [],
      carton: [],
      inspection: [],
    };
    for (const s of apiServices) {
      if (!s._id) continue;
      m[inferModalGroup(s)].push(s);
    }
    return m;
  }, [apiServices]);

  const toggleService = useCallback((id: string) => {
    setSelectedServiceIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) {
        setPreviewServiceId(id);
        return [...prev, id];
      }
      const next = prev.filter((x) => x !== id);
      setPreviewServiceId((pv) => (pv === id ? next[0] ?? null : pv));
      return next;
    });
  }, []);

  const detailItem = useMemo(() => {
    const tryId = previewServiceId && selectedServiceIds.includes(previewServiceId) ? previewServiceId : null;
    const id = tryId ?? selectedServiceIds[0] ?? null;
    if (!id) return null;
    return apiServices.find((x) => x._id === id) ?? null;
  }, [previewServiceId, selectedServiceIds, apiServices]);

  const detailTitle = useMemo(() => {
    if (!detailItem) return "";
    return serviceDisplayName(detailItem, locale, t);
  }, [detailItem, locale, t]);

  const detailFeeLine = useMemo(() => {
    if (!detailItem) return "";
    return `${t("orders.product.addServiceFeeLabelPrefix")} ${formatApiFee(detailItem, t)}`;
  }, [detailItem, t]);

  const detailDescription = useMemo(() => {
    if (!detailItem) return "";
    const d = detailItem.description?.trim() || detailItem.note?.trim();
    return d || t("orders.product.addServicePresetDescription");
  }, [detailItem, t]);

  const detailImageSrc = useMemo(() => {
    if (!detailItem) return null;
    return detailItem.imageUrl?.trim() || null;
  }, [detailItem]);

  const handleConfirm = async () => {
    if (!order) return;
    if (selectedServiceIds.length === 0) {
      showToast({ message: t("orders.product.addServicePickServiceToast"), variant: "warning" });
      return;
    }
    if (selectedProductIds.length === 0) {
      showToast({ message: t("orders.product.addServiceNeedProductSelection"), variant: "warning" });
      return;
    }
    setSaving(true);
    try {
      const offerIds = [...new Set(selectedProductIds.map((id) => String(id).trim()).filter(Boolean))];
      const selectedOfferSet = new Set(offerIds);
      const offerToServiceIds = new Map<string, Set<string>>();

      // 1) Seed map with server's current DB state so we keep existing services.
      for (const row of serverServiceItems) {
        const ids = [...new Set((row.addservices ?? []).map((x) => String(x).trim()).filter(Boolean))];
        if (ids.length === 0) continue;
        const offers = splitOfferIdParts(row.offerId);
        for (const offer of offers) {
          const bucket = offerToServiceIds.get(offer) ?? new Set<string>();
          for (const id of ids) bucket.add(id);
          offerToServiceIds.set(offer, bucket);
        }
      }

      // 2) Add newly selected services to currently selected products (append/merge, not overwrite).
      for (const offer of selectedOfferSet) {
        const bucket = offerToServiceIds.get(offer) ?? new Set<string>();
        for (const sid of selectedServiceIds) bucket.add(sid);
        offerToServiceIds.set(offer, bucket);
      }

      const items = [...offerToServiceIds.entries()].map(([offerId, set]) => ({
        offerId,
        addservices: [...set],
      }));
      await patchManualOrderAdditionalServices(order, {
        items,
      });
      showToast({
        message: t("orders.product.addServiceConfirmedToast").replace("{{orderNo}}", order.orderNo),
        variant: "success",
      });
      onApplied?.(order.orderNo);
      onClose();
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : t("orders.product.addServiceSaveFailed");
      showToast({ message: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!open || !order) return null;

  const tileBase =
    "relative flex min-h-[72px] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 px-1.5 py-2 text-center text-[11px] font-medium leading-tight text-gray-800 transition-colors";

  const selectedCount = selectedServiceIds.length;
  const hasAnyServices = apiServices.some((s) => !!s._id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-add-service-title"
      onMouseDown={(e) => {
        if (saving) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[min(92vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 id="order-add-service-title" className="text-base font-semibold text-gray-900">
            {t("centerSettings.additionalService.selectTitle")}
          </h2>
          <button
            type="button"
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label={t("orders.common.close")}
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {loadError ? (
          <div className="px-4 py-3 text-sm text-red-600">{loadError}</div>
        ) : null}

        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-gray-200 overflow-hidden lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Left — API service tiles only, multi-select */}
          <aside className="flex min-h-0 flex-col overflow-hidden lg:col-span-4">
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-gray-700">
                  {t("centerSettings.additionalService.selectTitle")}
                </span>
                {selectedCount > 0 ? (
                  <span className="text-[11px] font-medium text-orange-600">
                    {t("orders.product.addServiceSelectedCount").replace("{{n}}", String(selectedCount))}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
              {!hasAnyServices && !loadError ? (
                <p className="text-center text-xs text-gray-500">{t("orders.product.addServiceNoCatalog")}</p>
              ) : null}
              {SERVICE_GROUPS.map((section) => {
                const items = apiByGroup[section.group];
                if (items.length === 0) return null;
                return (
                  <section key={section.group}>
                    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      {t(section.titleKey)}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {items.map((s) => {
                        const id = s._id;
                        const sel = selectedServiceIds.includes(id);
                        const logo = s.logo || s.icon;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleService(id)}
                            className={`${tileBase} border-gray-200 bg-gray-50/80 hover:border-gray-300 hover:bg-white ${
                              sel ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-200" : ""
                            }`}
                          >
                            {sel ? (
                              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-white">
                                <Check className="h-2.5 w-2.5" strokeWidth={3} />
                              </span>
                            ) : null}
                            {logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={logo} alt="" className="h-5 w-5 shrink-0 rounded object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-gray-600" />
                            )}
                            <span className="line-clamp-2">{serviceDisplayName(s, locale, t)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </aside>

          {/* Middle — detail (preview of one selected service) */}
          <div className="flex min-h-0 flex-col overflow-hidden border-gray-200 lg:col-span-4 lg:border-x">
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-xs font-semibold text-gray-700">
                {t("centerSettings.additionalService.detailTitle")}
              </span>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              {selectedCount > 1 ? (
                <p className="text-[11px] text-gray-500">{t("orders.product.addServiceMultiPreviewHint")}</p>
              ) : null}
              <div className="flex aspect-[16/10] max-h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-slate-50">
                {detailImageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={detailImageSrc} alt="" className="max-h-full max-w-full object-contain p-2" />
                ) : (
                  <span className="text-xs text-gray-400">{t("centerSettings.additionalService.addImage")}</span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900">{detailTitle || "—"}</div>
              <p className="text-sm font-medium text-orange-600">{detailFeeLine}</p>
              <div>
                <div className="mb-1 text-xs font-medium text-gray-600">
                  {t("centerSettings.additionalService.detailDescription")}
                </div>
                <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{detailDescription}</p>
              </div>
              <p className="text-[10px] leading-snug text-gray-500">{t("orders.product.addServiceDisclaimer")}</p>
            </div>
          </div>

          {/* Right — memo + photo */}
          <div className="flex min-h-0 flex-col overflow-hidden lg:col-span-4">
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-xs font-semibold text-gray-700">{t("orders.product.addServiceOtherRequests")}</span>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
              <div className="relative">
                <textarea
                  value={otherMemo}
                  onChange={(e) => setOtherMemo(e.target.value.slice(0, 200))}
                  rows={8}
                  placeholder={t("orders.product.addServiceOtherPlaceholder")}
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                />
                <span className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-gray-400">
                  {otherMemo.length}/200
                </span>
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-gray-700">{t("orders.product.addServicePhotoUpload")}</div>
                <label
                  htmlFor={photoInputId}
                  className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50/30"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="h-full w-full rounded-md object-cover p-1" />
                  ) : (
                    <>
                      <span className="text-2xl font-light text-gray-400">+</span>
                      <span className="text-[11px] text-gray-600">{t("orders.product.addServiceUpload")}</span>
                    </>
                  )}
                  <input
                    id={photoInputId}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-gray-200 bg-white px-4 py-3">
          <button
            type="button"
            disabled={saving}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            onClick={onClose}
          >
            {t("orders.action.cancel")}
          </button>
          <button
            type="button"
            disabled={saving}
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            onClick={() => void handleConfirm()}
          >
            {saving ? t("orders.product.addServiceSaving") : t("orders.action.confirm")}
          </button>
        </footer>
      </div>
    </div>
  );
}
