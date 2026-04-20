"use client";

import { useEffect, useMemo, useState } from "react";
import { APP_TOAST_EVENT, type AppToastPayload, type AppToastVariant } from "@/lib/toast";

interface ToastItem {
  id: number;
  message: string;
  variant: AppToastVariant;
  durationMs: number;
}

const DEFAULT_DURATION_MS = 2600;

function variantClasses(variant: AppToastVariant): string {
  switch (variant) {
    case "success":
      return "border-emerald-300 bg-emerald-50 text-emerald-900";
    case "error":
      return "border-rose-300 bg-rose-50 text-rose-900";
    case "warning":
      return "border-amber-300 bg-amber-50 text-amber-900";
    case "info":
    default:
      return "border-slate-300 bg-white text-slate-900";
  }
}

export default function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onToast = (ev: Event) => {
      const detail = (ev as CustomEvent<AppToastPayload>).detail;
      if (!detail?.message) return;
      const id = Date.now() + Math.floor(Math.random() * 10000);
      const durationMs =
        typeof detail.durationMs === "number" && detail.durationMs > 0
          ? detail.durationMs
          : DEFAULT_DURATION_MS;
      setItems((prev) => [
        ...prev,
        {
          id,
          message: detail.message,
          variant: detail.variant ?? "info",
          durationMs,
        },
      ]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, durationMs);
    };
    window.addEventListener(APP_TOAST_EVENT, onToast as EventListener);
    return () => window.removeEventListener(APP_TOAST_EVENT, onToast as EventListener);
  }, []);

  const visibleItems = useMemo(() => items.slice(-5), [items]);

  if (visibleItems.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-full max-w-sm flex-col gap-2"
    >
      {visibleItems.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto rounded-md border px-3 py-2 text-sm shadow-md transition ${variantClasses(item.variant)}`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
