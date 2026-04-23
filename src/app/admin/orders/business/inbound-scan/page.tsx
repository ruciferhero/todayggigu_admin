"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InboundScanToolWindow, {
  InboundScanMissingPayload,
} from "@/components/orders/InboundScanToolWindow";
import type { OrderBoardOrder } from "@/components/orders/OrderBoard";
import { takeInboundScanWindowPayload, type InboundScanWindowPayload } from "@/lib/orderBoardWindowPayload";

function InboundScanBody() {
  const searchParams = useSearchParams();
  const k = searchParams.get("k");
  const [payload, setPayload] = useState<InboundScanWindowPayload | null | undefined>(undefined);

  useEffect(() => {
    setPayload(takeInboundScanWindowPayload(k));
  }, [k]);

  if (payload === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
        …
      </div>
    );
  }

  if (!payload || !Array.isArray(payload.orders)) {
    return (
      <InboundScanMissingPayload backHref="/admin/orders/business" />
    );
  }

  const orders = payload.orders as OrderBoardOrder[];
  const defaultWarehouse = typeof payload.defaultWarehouse === "string" ? payload.defaultWarehouse : "";

  return <InboundScanToolWindow orders={orders} defaultWarehouse={defaultWarehouse} />;
}

export default function InboundScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
          …
        </div>
      }
    >
      <InboundScanBody />
    </Suspense>
  );
}
