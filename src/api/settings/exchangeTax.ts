import { ApiError, apiFetch } from "@/api/client";

function apiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const raw = (process.env.NEXT_PUBLIC_API_VERSION || "").trim();
  const v = raw.replace(/^\/+|\/+$/g, "");
  const p = (path.startsWith("/") ? path : `/${path}`).replace(/\/{2,}/g, "/");
  if (!v) return p;
  const norm = p.replace(/^\/+/, "");
  const lowerNorm = norm.toLowerCase();
  const lowerV = v.toLowerCase();
  if (lowerNorm === lowerV || lowerNorm.startsWith(`${lowerV}/`)) return `/${norm}`;
  return `/${v}/${norm}`;
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}

function candidatePaths(paths: string[]): string[] {
  return uniquePaths(paths.map((p) => apiPath(p)));
}

async function apiFetchWithFallback<T>(
  paths: string[],
  options: { method: "GET" | "PUT"; body?: unknown },
  fallbackStatuses: number[] = [404],
): Promise<T> {
  let lastError: unknown;
  for (const path of uniquePaths(paths)) {
    try {
      return await apiFetch<T>(path, options);
    } catch (e) {
      lastError = e;
      if (
        !(e instanceof ApiError) ||
        !fallbackStatuses.includes(e.status)
      ) {
        throw e;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed");
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

export type DutySettings = Pick<ExchangeTaxSettings, "basicDuty" | "vatDuty" | "specialDuty">;

function normalizeDutySettings(raw: unknown): DutySettings {
  const env = asRecord(raw) ?? {};
  const data = asRecord(env.data) ?? env;
  const duty = asRecord(data.duty) ?? asRecord(data.customs) ?? data;
  const rates = Array.isArray(data.rates)
    ? data.rates
    : Array.isArray(data.customsRates)
      ? data.customsRates
      : [];
  const dutyKeyAliases: Record<string, string[]> = {
    basicDuty: ["basicduty", "basic_duty", "basicdutyrate", "customsduty", "dutyrate", "duty"],
    vatDuty: ["vatduty", "vat_duty", "vat", "vatrate"],
    specialDuty: ["specialduty", "special_duty", "specialtaxrate", "luxurydutyrate", "luxuryduty"],
  };
  const fromRates = (name: string): string | undefined => {
    const aliases = dutyKeyAliases[name] ?? [name.toLowerCase()];
    for (const row of rates) {
      const rec = asRecord(row);
      if (!rec) continue;
      const key = String(rec.type ?? rec.key ?? rec.name ?? rec.code ?? rec.currency ?? "").trim().toLowerCase();
      if (!key) continue;
      if (aliases.includes(key)) {
        const v = readStringNumber(rec.rate ?? rec.value ?? rec.percent);
        if (v != null) return v;
      }
    }
    return undefined;
  };
  return {
    basicDuty:
      fromRates("basicDuty") ??
      pickFirst(duty, ["basicDuty", "basicDutyRate", "customsDuty", "dutyRate"], "0"),
    vatDuty:
      fromRates("vatDuty") ??
      pickFirst(duty, ["vatDuty", "vat", "vatRate"], "0"),
    specialDuty:
      fromRates("specialDuty") ??
      pickFirst(duty, ["specialDuty", "luxuryDutyRate", "specialTaxRate"], ""),
  };
}

export type ExchangeRateSettings = Pick<ExchangeTaxSettings, "cnyRate" | "usdRate">;
export type AdditionalFxSettings = {
  cnyAdditionalFxMargin: string;
  usdAdditionalFxMargin: string;
};

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
const EXCHANGE_RATES_PATH = "/admin/exchange-rates";
const EXCHANGE_RATES_BULK_PATH = "/admin/exchange-rates/bulk";
const EXCHANGE_RATES_HISTORY_PATH = "/admin/exchange-rates/history";
const CUSTOMS_RATES_PATH = EXCHANGE_RATES_PATH;
const CUSTOMS_RATES_BULK_PATH = EXCHANGE_RATES_BULK_PATH;

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
  if (Array.isArray(raw)) {
    return raw.map(normalizeExchangeRateItem).filter((item): item is ExchangeRateItem => !!item);
  }
  const env = asRecord(raw) ?? {};
  const data = asRecord(env.data) ?? env;
  const rates =
    (Array.isArray(data.exchangeRates) && data.exchangeRates) ||
    (Array.isArray(data.rates) && data.rates) ||
    (Array.isArray(env.exchangeRates) && env.exchangeRates) ||
    [];
  return rates.map(normalizeExchangeRateItem).filter((item): item is ExchangeRateItem => !!item);
}

/** `GET/PUT …/exchange-rates` 응답 `data.exchangeRates[]` — 추가환율은 `ADDCNY`, `ADDUSD` 통화 코드로 내려온다. */
function normalizeAdditionalFxSettings(raw: unknown): AdditionalFxSettings {
  const list = readExchangeRateList(raw);
  const byCurrency = new Map(list.map((it) => [String(it.currency).toUpperCase(), it] as const));
  const addCny = byCurrency.get("ADDCNY");
  const addUsd = byCurrency.get("ADDUSD");
  return {
    cnyAdditionalFxMargin: (addCny?.rate ?? "").trim() || "0",
    usdAdditionalFxMargin: (addUsd?.rate ?? "").trim() || "0",
  };
}

export async function fetchExchangeRates(): Promise<ExchangeRateItem[]> {
  const raw = await apiFetch<unknown>(apiPath(EXCHANGE_RATES_PATH), { method: "GET" });
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

export async function fetchAdditionalFxSettings(): Promise<AdditionalFxSettings> {
  const raw = await apiFetch<unknown>(apiPath(EXCHANGE_RATES_PATH), { method: "GET" });
  return normalizeAdditionalFxSettings(raw);
}

type ExchangeRateUpdatePayload = {
  currency: ExchangeRateCurrency;
  baseCurrency?: ExchangeRateCurrency;
  rate: string;
};

export async function updateSingleExchangeRate(payload: ExchangeRateUpdatePayload): Promise<void> {
  await updateMultipleExchangeRates([payload]);
}

function coerceBulkRate(raw: string): number | string {
  const n = Number(String(raw).trim());
  return Number.isFinite(n) ? n : String(raw).trim();
}

/** `PUT /admin/exchange-rates/bulk` — 백엔드별로 본문 키·행 스키마가 달라질 수 있어 순차 시도한다. */
async function putExchangeRatesBulkRows(rows: Record<string, unknown>[]): Promise<void> {
  const minimal = rows.map((r) => {
    const out: Record<string, unknown> = {
      currency: String(r.currency ?? ""),
      rate: r.rate,
    };
    if (r._id) out._id = r._id;
    return out;
  });
  const bodies: Record<string, unknown>[] = [
    { rates: rows },
    { exchangeRates: rows },
    { rates: minimal },
    {
      rates: rows.map((r) => ({
        currency: String(r.currency ?? ""),
        rate: r.rate,
      })),
    },
  ];

  let lastErr: unknown = null;
  for (const body of bodies) {
    try {
      await apiFetch<unknown>(apiPath(EXCHANGE_RATES_BULK_PATH), {
        method: "PUT",
        body,
      });
      return;
    } catch (e) {
      lastErr = e;
      if (e instanceof ApiError && (e.status === 400 || e.status === 422)) continue;
      throw e;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error("PUT exchange-rates/bulk failed");
}

function buildBulkRowsFromLatest(
  latest: ExchangeRateItem[],
  updateByCurrency: Map<string, ExchangeRateUpdatePayload>,
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = latest.map((row) => {
    const cur = String(row.currency).toUpperCase();
    const wanted = updateByCurrency.get(cur);
    const rawRate = wanted?.rate ?? row.rate;
    const rate = coerceBulkRate(String(rawRate));
    const base = String(wanted?.baseCurrency ?? row.baseCurrency ?? "KRW").toUpperCase() || "KRW";
    const out: Record<string, unknown> = {
      currency: cur,
      baseCurrency: base,
      rate,
    };
    if (row.id) out._id = row.id;
    return out;
  });

  for (const [currency, payload] of updateByCurrency.entries()) {
    if (rows.some((r) => String(r.currency) === currency)) continue;
    rows.push({
      currency,
      baseCurrency: String(payload.baseCurrency ?? "KRW").toUpperCase(),
      rate: coerceBulkRate(String(payload.rate)),
    });
  }
  return rows;
}

export async function updateMultipleExchangeRates(payloads: ExchangeRateUpdatePayload[]): Promise<void> {
  const latest = await fetchExchangeRates();
  const updateByCurrency = new Map(payloads.map((p) => [String(p.currency).toUpperCase(), p] as const));
  const rows = buildBulkRowsFromLatest(latest, updateByCurrency);
  await putExchangeRatesBulkRows(rows);
}

export async function updateExchangeRatesSettings(settings: ExchangeRateSettings): Promise<void> {
  const updates: ExchangeRateUpdatePayload[] = [
    { currency: "CNY", rate: settings.cnyRate },
    { currency: "USD", rate: settings.usdRate },
  ];
  await updateMultipleExchangeRates(updates);
}

export async function updateAdditionalFxSettings(settings: AdditionalFxSettings): Promise<void> {
  const cny = settings.cnyAdditionalFxMargin.trim();
  const usd = settings.usdAdditionalFxMargin.trim();
  if (!cny || !usd) {
    throw new Error("ADDCNY / ADDUSD 추가환율 값을 모두 입력하세요.");
  }
  await updateMultipleExchangeRates([
    { currency: "ADDCNY", baseCurrency: "KRW", rate: cny },
    { currency: "ADDUSD", baseCurrency: "KRW", rate: usd },
  ]);
}

export async function fetchExchangeRateHistory(): Promise<ExchangeRateHistoryItem[]> {
  const raw = await apiFetch<unknown>(apiPath(EXCHANGE_RATES_HISTORY_PATH), { method: "GET" });
  const env = asRecord(raw) ?? {};
  const data = asRecord(env.data) ?? env;
  const items =
    (Array.isArray(data.history) && data.history) ||
    (Array.isArray(data.exchangeRateHistory) && data.exchangeRateHistory) ||
    (Array.isArray(data.exchangeRates) && data.exchangeRates) ||
    [];
  return items.map(normalizeExchangeRateItem).filter((item): item is ExchangeRateHistoryItem => !!item);
}

export async function fetchDutySettings(): Promise<DutySettings> {
  const raw = await apiFetch<unknown>(apiPath(CUSTOMS_RATES_PATH), { method: "GET" });
  return normalizeDutySettings(raw);
}

export async function updateDutySettings(settings: DutySettings): Promise<void> {
  const basic = Number(settings.basicDuty);
  const vat = Number(settings.vatDuty);
  const special = settings.specialDuty === "" ? 0 : Number(settings.specialDuty);
  const rates = [
    { type: "basicDuty", rate: Number.isFinite(basic) ? basic : 0 },
    { type: "vatDuty", rate: Number.isFinite(vat) ? vat : 0 },
    { type: "specialDuty", rate: Number.isFinite(special) ? special : 0 },
  ];
  const objectBody = {
    basicDuty: Number.isFinite(basic) ? basic : 0,
    vatDuty: Number.isFinite(vat) ? vat : 0,
    specialDuty: Number.isFinite(special) ? special : 0,
  };
  await apiFetch<unknown>(apiPath(CUSTOMS_RATES_BULK_PATH), {
    method: "PUT",
    body: { rates },
  }).catch(async () => {
    await apiFetch<unknown>(apiPath(CUSTOMS_RATES_BULK_PATH), {
      method: "PUT",
      body: objectBody,
    });
  });
}

export async function fetchExchangeTaxSettings(): Promise<ExchangeTaxSettings> {
  const [exchange, duty] = await Promise.all([fetchExchangeRatesSettings(), fetchDutySettings()]);
  return { ...exchange, ...duty };
}

export async function updateExchangeTaxSettings(settings: ExchangeTaxSettings): Promise<void> {
  await Promise.all([
    updateExchangeRatesSettings(settings),
    updateDutySettings(settings),
  ]);
}

