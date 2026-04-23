"use client";

import React, { useMemo, useState } from "react";
import { ScanLine } from "lucide-react";
import type { OrderBoardOrder } from "@/components/orders/OrderBoard";
import { enrichWarehouseScanMatchesFromApi } from "@/api/orders/manualSearch";
import { collectWarehouseScanMatches } from "@/lib/collectWarehouseScanMatches";
import {
  buildWarehouseScanResultsInnerHtml,
  warehouseScanLabelsFromTranslate,
  warehouseScanWindowCss,
} from "@/components/orders/warehouseScanWindowDocument";
import { useLocale } from "@/contexts/LocaleContext";
import Link from "next/link";

export default function InboundScanToolWindow({
  orders,
  defaultWarehouse,
}: {
  orders: OrderBoardOrder[];
  defaultWarehouse: string;
}) {
  const { t } = useLocale();
  const [warehouse, setWarehouse] = useState(defaultWarehouse || "");
  const [tracking, setTracking] = useState("");
  const [resultsHtml, setResultsHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scanLabels = useMemo(() => warehouseScanLabelsFromTranslate(t), [t]);

  const onScan = () => {
    void (async () => {
      const raw = tracking.trim();
      if (!raw) {
        window.alert(t("orders.inboundScan.trackingRequired"));
        return;
      }
      setLoading(true);
      try {
        let matches = collectWarehouseScanMatches(orders, warehouse, raw);
        matches = await enrichWarehouseScanMatchesFromApi(matches, t);
        setResultsHtml(buildWarehouseScanResultsInnerHtml(matches, raw, scanLabels));
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <style dangerouslySetInnerHTML={{ __html: warehouseScanWindowCss() }} />

      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mb-4">
          <label htmlFor="inbound-wh" className="mb-1.5 block text-xs font-medium text-gray-600">
            {t("orders.filter.center")}
          </label>
          <select
            id="inbound-wh"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="h-9 w-full max-w-xs rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            aria-label={t("orders.filter.center")}
          >
            <option value="">{t("orders.filter.centerAll")}</option>
            <option value="Weihai">{t("orders.filter.centerWeihai")}</option>
            <option value="Qingdao">{t("orders.filter.centerQingdao")}</option>
            <option value="Guangzhou">{t("orders.filter.centerGuangzhou")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="inbound-track" className="mb-2 block text-sm font-bold text-gray-900">
            {t("orders.inboundScan.trackingNumber")}
          </label>
          <div className="flex overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-sky-400/40">
            <input
              id="inbound-track"
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onScan();
                }
              }}
              placeholder={t("orders.inboundScan.trackingPlaceholder")}
              autoComplete="off"
              className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={onScan}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1.5 bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
            >
              <ScanLine className="h-4 w-4 shrink-0" aria-hidden />
              {t("orders.inboundScan.scanButton")}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-3 py-4">
        {loading ? (
          <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            {t("orders.inboundScan.scanLoading")}
          </p>
        ) : resultsHtml != null ? (
          <div dangerouslySetInnerHTML={{ __html: resultsHtml }} />
        ) : (
          <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            {t("orders.inboundScan.initialHint")}
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-end border-t border-gray-200 bg-gray-50 px-4 py-3">
        <button
          type="button"
          onClick={() => window.close()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          {t("orders.common.close")}
        </button>
      </div>
    </div>
  );
}

export function InboundScanMissingPayload({ backHref }: { backHref: string }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-md rounded border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
      <p className="mb-4">{t("orders.tool.missingPayload")}</p>
      <Link href={backHref} className="text-blue-600 underline hover:text-blue-800">
        {t("orders.tool.backToBoard")}
      </Link>
    </div>
  );
}
