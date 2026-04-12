"use client";

import { ReactNode } from "react";
import { useLocale } from "@/contexts/LocaleContext";

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {children ? (
        children
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">{t("page.underConstruction")}</p>
        </div>
      )}
    </div>
  );
}
