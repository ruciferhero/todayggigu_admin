import { apiFetch, getRefreshToken } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export async function login(payload: LoginRequest): Promise<LoginResult> {
  const raw = await apiFetch<unknown>("/admin/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
  const user = extractAdmin(raw, "login");
  const tokens = extractTokens(raw);
  return { user, ...tokens };
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/admin/auth/logout", { method: "POST" });
  } catch {
    // even if the server call fails, the caller should still clear local state
  }
}

/**
 * Build `AuthUser` from the stored access token (JWT payload) — no `/admin/auth/me` call.
 * If the token is not a JWT, returns a minimal placeholder so the session is still treated as logged in.
 */
export function sessionUserFromAccessToken(accessToken: string): AuthUser {
  const payload = tryParseJwtPayload(accessToken);
  if (!payload || typeof payload !== "object") {
    return {
      id: "",
      email: "session",
      name: "Admin",
      role: "",
      permissions: [],
    };
  }
  const rec = payload as Record<string, unknown>;
  const email =
    pickString(rec, ["email"]) ??
    (typeof rec.sub === "string" ? rec.sub : null) ??
    "session";
  const name =
    pickString(rec, ["name", "userName", "nickname"]) ?? email.split("@")[0] ?? "Admin";
  return {
    id: pickString(rec, ["_id", "id", "sub"]) ?? "",
    email,
    name,
    role: pickString(rec, ["role"]) ?? "",
    permissions: Array.isArray(rec.permissions) ? (rec.permissions as string[]) : [],
  };
}

/** True if JWT `exp` is in the past (or within `skewSec`). Non-JWT tokens return false. */
export function accessTokenLooksExpired(accessToken: string, skewSec = 60): boolean {
  const payload = tryParseJwtPayload(accessToken);
  if (!payload || typeof payload !== "object") return false;
  const exp = (payload as Record<string, unknown>).exp;
  if (typeof exp !== "number") return false;
  return Date.now() / 1000 >= exp - skewSec;
}

function tryParseJwtPayload(token: string): unknown | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  try {
    if (typeof atob === "undefined") return null;
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/** POST `/admin/auth/refresh` — returns new access token when refresh token is valid. */
export async function refreshAccessToken(): Promise<{
  token: string;
  refreshToken: string;
} | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const raw = await apiFetch<unknown>("/admin/auth/refresh", {
      method: "POST",
      body: { refreshToken: rt },
      auth: false,
    });
    const tokens = extractTokens(raw);
    return { token: tokens.token, refreshToken: tokens.refreshToken };
  } catch {
    return null;
  }
}

function extractAdmin(raw: unknown, context: string): AuthUser {
  for (const c of gatherAdminCandidates(raw)) {
    if (!isRecord(c)) continue;
    const email = pickString(c, ["email"]);
    if (!email) continue;
    return {
      id: pickString(c, ["_id", "id"]) ?? "",
      email,
      name: pickString(c, ["name", "userName", "nickname"]) ?? email.split("@")[0],
      role: pickString(c, ["role"]) ?? "",
      permissions: Array.isArray(c.permissions)
        ? (c.permissions as string[])
        : [],
    };
  }
  // eslint-disable-next-line no-console
  console.warn(`[auth:${context}] cannot find admin in response`, raw);
  throw new Error(`Invalid ${context} response shape`);
}

function gatherAdminCandidates(raw: unknown): unknown[] {
  if (!isRecord(raw)) return [];
  const out: unknown[] = [raw.admin, raw.user, raw];
  if (isRecord(raw.data)) {
    out.unshift(raw.data.admin, raw.data.user, raw.data);
  }
  return out;
}

function extractTokens(raw: unknown): {
  token: string;
  refreshToken: string;
  expiresAt: string;
} {
  const src = isRecord(raw) && isRecord(raw.data) ? raw.data : isRecord(raw) ? raw : null;
  if (!src) throw new Error("Missing login token payload");
  const token = pickString(src, ["token", "accessToken"]);
  if (!token) throw new Error("Missing access token in login response");
  return {
    token,
    refreshToken: pickString(src, ["refreshToken"]) ?? "",
    expiresAt: pickString(src, ["expiresAt"]) ?? "",
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

function pickString(
  obj: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}
