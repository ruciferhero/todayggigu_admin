import { apiFetch } from "./client";

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

export async function fetchMe(): Promise<AuthUser> {
  const raw = await apiFetch<unknown>("/admin/auth/me");
  return extractAdmin(raw, "me");
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
