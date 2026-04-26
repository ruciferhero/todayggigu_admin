import { ApiError, getToken } from "@/api/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

export type AddServiceResponse = {
  status: string;
  statusCode: number;
  message?: string;
  data?: {
    addService?: {
      _id?: string;
      serviceType?: string;
      name?: string;
      nameZh?: string;
      nameEn?: string;
      feeCurrency?: string;
      quantity?: number;
      price?: number;
      note?: string;
      description?: string;
      imageUrl?: string;
      logo?: string;
      icon?: string;
    };
  };
};

export type AddServiceItem = {
  _id: string;
  serviceType?: string;
  name?: string;
  quantity?: number;
  nameZh?: string;
  nameEn?: string;
  feeCurrency?: string;
  price?: number;
  note?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AddServicesGetResponse = {
  status: string;
  statusCode: number;
  message?: string;
  data?: {
    addServices?: AddServiceItem[];
  };
};

export type CreateAddServicePayload = {
  serviceType: string;
  name: string;
  nameZh: string;
  nameEn: string;
  feeCurrency: string;
  quantity: string;
  price: string;
  note: string;
  description: string;
  image: File;
  logo: File;
};

export type UpdateAddServicePayload = {
  serviceType: string;
  name: string;
  nameZh: string;
  nameEn: string;
  feeCurrency: string;
  quantity: string;
  price: string;
  note: string;
  description: string;
  image?: File;
  logo?: File;
};

export async function createAdminCartService(payload: CreateAddServicePayload): Promise<AddServiceResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const token = getToken();
  const form = new FormData();
  form.append("serviceType", payload.serviceType);
  form.append("name", payload.name);
  form.append("nameZh", payload.nameZh);
  form.append("nameEn", payload.nameEn);
  form.append("feeCurrency", payload.feeCurrency);
  form.append("quantity", payload.quantity);
  form.append("price", payload.price);
  form.append("note", payload.note);
  form.append("description", payload.description);
  form.append("image", payload.image);
  form.append("logo", payload.logo);

  const res = await fetch(`${BASE_URL}${apiPath("/admin/carts/services")}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

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

  return parsed as AddServiceResponse;
}

export async function fetchAdminCartServices(): Promise<AddServiceItem[]> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const token = getToken();
  const res = await fetch(`${BASE_URL}${apiPath("/admin/carts/services")}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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

  const body = parsed as AddServicesGetResponse;
  return Array.isArray(body.data?.addServices) ? body.data.addServices : [];
}

export async function updateAdminCartService(
  serviceId: string,
  payload: UpdateAddServicePayload,
): Promise<AddServiceResponse> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  const token = getToken();
  const form = new FormData();
  form.append("serviceType", payload.serviceType);
  form.append("name", payload.name);
  form.append("nameZh", payload.nameZh);
  form.append("nameEn", payload.nameEn);
  form.append("feeCurrency", payload.feeCurrency);
  form.append("quantity", payload.quantity);
  form.append("price", payload.price);
  form.append("note", payload.note);
  form.append("description", payload.description);
  if (payload.image) form.append("image", payload.image);
  if (payload.logo) form.append("logo", payload.logo);

  const res = await fetch(`${BASE_URL}${apiPath(`/admin/carts/services/${encodeURIComponent(serviceId)}`)}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

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
  return parsed as AddServiceResponse;
}

export async function deleteAdminCartService(serviceId: string): Promise<void> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  const token = getToken();
  const res = await fetch(`${BASE_URL}${apiPath(`/admin/carts/services/${encodeURIComponent(serviceId)}`)}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
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
