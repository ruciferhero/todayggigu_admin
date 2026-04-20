"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PurchaseCostQuoteWindow from "@/components/orders/PurchaseCostQuoteWindow";
import type { OrderBoardOrder } from "@/components/orders/OrderBoard";
import { takeOrderBoardWindowPayload } from "@/lib/orderBoardWindowPayload";
import { useLocale } from "@/contexts/LocaleContext";

function PurchaseCostBody() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const k = searchParams.get("k");
  const [order, setOrder] = useState<OrderBoardOrder | null | undefined>(undefined);

  useEffect(() => {
    setOrder(takeOrderBoardWindowPayload(k));
  }, [k]);

  if (order === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
        …
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md rounded border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
        <p className="mb-4">{t("orders.tool.missingPayload")}</p>
        <Link href="/admin/orders/business" className="text-blue-600 underline hover:text-blue-800">
          {t("orders.tool.backToBoard")}
        </Link>
      </div>
    );
  }

  return <PurchaseCostQuoteWindow order={order} />;
}

export default function PurchaseCostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
          …
        </div>
      }
    >
      <PurchaseCostBody />
    </Suspense>
  );
}
