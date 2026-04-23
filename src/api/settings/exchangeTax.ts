import { apiFetch } from "@/api/client";

function apiPath(path: string): string {
  const raw = (process.env.NEXT_PUBLIC_API_VERSION || "").trim();
  const v = raw.replace(/^\/+|\/+$/g, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!v) return p;
  return `/${v}${p}`;
}

function exchangeTaxSettingsPath(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_EXCHANGE_TAX_SETTINGS_PATH || "").trim();
  if (fromEnv) return apiPath(fromEnv);
  return apiPath("/admin/settings/exchange-tax");
}

/**
 * Postman collection default: `/admin/exchange_rate/getallexchangerate`
 */
function getAllExchangeRatePath(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_EXCHANGE_RATE_GET_ALL_PATH || "").trim();
  if (fromEnv) return apiPath(fromEnv);
  return apiPath("/admin/exchange_rate/getallexchangerate");
}

/**
 * Postman collection default: `/admin/exchange_rate/exchangesingle`
 */
function updateSingleExchangeRatePath(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_EXCHANGE_RATE_UPDATE_SINGLE_PATH || "").trim();
  if (fromEnv) return apiPath(fromEnv);
  return apiPath("/admin/exchange_rate/exchangesingle");
}

/**
 * Postman collection default: `/admin/exchange_rate/exchangemultiple`
 */
function updateMultipleExchangeRatesPath(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_EXCHANGE_RATE_UPDATE_MULTIPLE_PATH || "").trim();
  if (fromEnv) return apiPath(fromEnv);
  return apiPath("/admin/exchange_rate/exchangemultiple");
}

/**
 * Postman collection default: `/admin/exchange_rate/exchangehistory`
 */
function exchangeRateHistoryPath(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_EXCHANGE_RATE_HISTORY_PATH || "").trim();
  if (fromEnv) return apiPath(fromEnv);
  return apiPath("/admin/exchange_rate/exchangehistory");
}

export type ExchangeTaxSettings = {
  cnyRate: string;
  usdRate: string;
  basicDuty: string;
  vatDuty: string;
  specialDuty: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function readStringNumber(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return undefined;
}

function pickFirst(rec: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const k of keys) {
    const got = readStringNumber(rec[k]);
    if (got != null) return got;
  }
  return fallback;
}

function normalizeDutySettings(raw: unknown): Omit<ExchangeTaxSettings, "cnyRate" | "usdRate"> {
  const env = asRecord(raw) ?? {};
  const data = asRecord(env.data) ?? env;
  const duty = asRecord(data.duty) ?? asRecord(data.customs) ?? data;
  return {
    basicDuty: pickFirst(duty, ["basicDuty", "basicDutyRate", "customsDuty", "dutyRate"], "0"),
    vatDuty: pickFirst(duty, ["vatDuty", "vat", "vatRate"], "0"),
    specialDuty: pickFirst(duty, ["specialDuty", "luxuryDutyRate", "specialTaxRate"], ""),
  };
}

type ExchangeRateSettings = Pick<ExchangeTaxSettings, "cnyRate" | "usdRate">;

export type ExchangeRateCurrency = "CNY" | "USD" | "KRW" | string;

export type ExchangeRateItem = {
  id: string;
  currency: ExchangeRateCurrency;
  baseCurrency: ExchangeRateCurrency;
  rate: string;
  updatedAt: string;
  createdAt: string;
  updatedBy: string;
  updatedByEmail: string;
};

export type ExchangeRateHistoryItem = ExchangeRateItem;

function toNumberOrString(value: string): number | string {
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}

function normalizeExchangeRateItem(raw: unknown): ExchangeRateItem | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const updatedByRec = asRecord(rec.lastUpdatedBy);
  const currency = String(rec.currency ?? rec.code ?? "").trim().toUpperCase();
  if (!currency) return null;
  return {
    id: String(rec._id ?? rec.id ?? ""),
    currency,
    baseCurrency: String(rec.baseCurrency ?? rec.base ?? "KRW").trim().toUpperCase() || "KRW",
    rate: pickFirst(rec, ["rate", "exchangeRate", "value"], ""),
    updatedAt: String(rec.updatedAt ?? rec.lastUpdatedAt ?? rec.date ?? ""),
    createdAt: String(rec.createdAt ?? ""),
    updatedBy:
      pickFirst(rec, ["lastUpdatedByName", "updatedByName"], "") ||
      pickFirst(updatedByRec ?? {}, ["name"], ""),
    updatedByEmail: pickFirst(updatedByRec ?? {}, ["email"], ""),
  };
}

function readExchangeRateList(raw: unknown): ExchangeRateItem[] {
  const env = asRecord(raw) ?? {};
  const data = asRecord(env.data) ?? env;
  const rates =
    (Array.isArray(data.exchangeRates) && data.exchangeRates) ||
    (Array.isArray(data.rates) && data.rates) ||
    [];
  return rates.map(normalizeExchangeRateItem).filter((item): item is ExchangeRateItem => !!item);
}

export async function fetchExchangeRates(): Promise<ExchangeRateItem[]> {
  const raw = await apiFetch<unknown>(getAllExchangeRatePath(), { method: "GET" });
  return readExchangeRateList(raw);
}

export async function fetchExchangeRatesSettings(): Promise<ExchangeRateSettings> {
  const rates = await fetchExchangeRates();
  const found = rates.reduce<Partial<ExchangeRateSettings>>((acc, item) => {
    if (item.currency === "CNY" && item.rate) acc.cnyRate = item.rate;
    if (item.currency === "USD" && item.rate) acc.usdRate = item.rate;
    return acc;
  }, {});
  return {
    cnyRate: found.cnyRate ?? "255",
    usdRate: found.usdRate ?? "7",
  };
}

type ExchangeRateUpdatePayload = {
  currency: ExchangeRateCurrency;
  baseCurrency?: ExchangeRateCurrency;
  rate: string;
};

function buildExchangeRateUpdateBody(payload: ExchangeRateUpdatePayload): Record<string, unknown> {
  return {
    currency: payload.currency,
    baseCurrency: payload.baseCurrency ?? "KRW",
    rate: toNumberOrString(payload.rate),
  };
}

export async function updateSingleExchangeRate(payload: ExchangeRateUpdatePayload): Promise<void> {
  await apiFetch<unknown>(updateSingleExchangeRatePath(), {
    method: "PUT",
    body: buildExchangeRateUpdateBody(payload),
  });
}

export async function updateMultipleExchangeRates(payloads: ExchangeRateUpdatePayload[]): Promise<void> {
  const exchangeRates = payloads.map((item) => buildExchangeRateUpdateBody(item));
  await apiFetch<unknown>(updateMultipleExchangeRatesPath(), {
    method: "PUT",
    body: { exchangeRates },
  });
}

export async function updateExchangeRatesSettings(settings: ExchangeRateSettings): Promise<void> {
  const updates: ExchangeRateUpdatePayload[] = [
    { currency: "CNY", rate: settings.cnyRate },
    { currency: "USD", rate: settings.usdRate },
  ];
  await updateMultipleExchangeRates(updates);
}

export async function fetchExchangeRateHistory(): Promise<ExchangeRateHistoryItem[]> {
  const raw = await apiFetch<unknown>(exchangeRateHistoryPath(), { method: "GET" });
  const env = asRecord(raw) ?? {};
  const data = asRecord(env.data) ?? env;
  const items =
    (Array.isArray(data.history) && data.history) ||
    (Array.isArray(data.exchangeRateHistory) && data.exchangeRateHistory) ||
    (Array.isArray(data.exchangeRates) && data.exchangeRates) ||
    [];
  return items.map(normalizeExchangeRateItem).filter((item): item is ExchangeRateHistoryItem => !!item);
}

export async function fetchDutySettings(): Promise<Omit<ExchangeTaxSettings, "cnyRate" | "usdRate">> {
  const raw = await apiFetch<unknown>(exchangeTaxSettingsPath(), { method: "GET" });
  return normalizeDutySettings(raw);
}

export async function updateDutySettings(settings: Omit<ExchangeTaxSettings, "cnyRate" | "usdRate">): Promise<void> {
  const body = {
    basicDuty: settings.basicDuty,
    vatDuty: settings.vatDuty,
    specialDuty: settings.specialDuty,
  };
  await apiFetch<unknown>(exchangeTaxSettingsPath(), { method: "PUT", body });
}

export async function fetchExchangeTaxSettings(): Promise<ExchangeTaxSettings> {
  const [exchange, duty] = await Promise.all([
    fetchExchangeRatesSettings(),
    fetchDutySettings().catch(() => ({
      basicDuty: "0",
      vatDuty: "0",
      specialDuty: "",
    })),
  ]);
  return { ...exchange, ...duty };
}

export async function updateExchangeTaxSettings(settings: ExchangeTaxSettings): Promise<void> {
  await Promise.all([
    updateExchangeRatesSettings(settings),
    updateDutySettings(settings),
  ]);
}

