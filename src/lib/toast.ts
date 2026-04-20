"use client";

export type AppToastVariant = "success" | "error" | "info" | "warning";

export interface AppToastPayload {
  message: string;
  variant?: AppToastVariant;
  durationMs?: number;
}

export const APP_TOAST_EVENT = "todayggigu:toast";

export function showToast(payload: AppToastPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AppToastPayload>(APP_TOAST_EVENT, { detail: payload }));
}
