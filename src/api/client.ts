const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const TOKEN_KEY = "todayggigu_admin_token";
const REFRESH_TOKEN_KEY = "todayggigu_admin_refresh_token";
const REFRESH_PATH = "/admin/auth/refresh";
let refreshInFlight: Promise<string | null> | null = null;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  { body, headers, auth = true, ...init }: ApiFetchOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const firstToken = auth ? getToken() : null;
  let res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(headers, body, firstToken),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (auth && (res.status === 401 || res.status === 403)) {
    const refreshed = await refreshAccessTokenWithLock();
    if (refreshed) {
      res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(headers, body, refreshed),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    }
  }

  const text = await res.text();
  const parsed = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (isRecord(parsed) && typeof parsed.message === "string" && parsed.message) ||
      (isRecord(parsed) && typeof parsed.error === "string" && parsed.error) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

function buildHeaders(
  headers: HeadersInit | undefined,
  body: unknown,
  token: string | null,
): HeadersInit {
  return {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

async function refreshAccessTokenWithLock(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken(rt).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (!BASE_URL) return null;
  try {
    const res = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    const text = await res.text();
    const parsed = text ? safeJson(text) : null;
    if (!res.ok || !isRecord(parsed)) return null;
    const src = isRecord(parsed.data) ? parsed.data : parsed;
    const nextAccess = pickString(src, ["token", "accessToken"]);
    if (!nextAccess) return null;
    const nextRefresh = pickString(src, ["refreshToken"]);
    setToken(nextAccess);
    if (nextRefresh) setRefreshToken(nextRefresh);
    return nextAccess;
  } catch {
    return null;
  }
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}
