"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import IssuePhotoToolWindow, { IssuePhotoMissingPayload } from "@/components/orders/IssuePhotoToolWindow";
import type { OrderBoardOrder } from "@/components/orders/OrderBoard";
import { takeIssuePhotoWindowPayload, type IssuePhotoWindowPayload } from "@/lib/orderBoardWindowPayload";

function IssuePhotoBody() {
  const searchParams = useSearchParams();
  const k = searchParams.get("k");
  const [payload, setPayload] = useState<IssuePhotoWindowPayload | null | undefined>(undefined);

  useEffect(() => {
    setPayload(takeIssuePhotoWindowPayload(k));
  }, [k]);

  if (payload === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
        …
      </div>
    );
  }

  if (!payload || !Array.isArray(payload.orders)) {
    return <IssuePhotoMissingPayload backHref="/admin/orders/business" />;
  }

  const orders = payload.orders as OrderBoardOrder[];
  const defaultWarehouse = typeof payload.defaultWarehouse === "string" ? payload.defaultWarehouse : "";
  const focusedOrderNo = typeof payload.focusedOrderNo === "string" ? payload.focusedOrderNo : "";
  const focusedProductId = typeof payload.focusedProductId === "string" ? payload.focusedProductId : "";

  return (
    <IssuePhotoToolWindow
      orders={orders}
      defaultWarehouse={defaultWarehouse}
      focusedOrderNo={focusedOrderNo}
      focusedProductId={focusedProductId}
    />
  );
}

export default function IssuePhotoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
          …
        </div>
      }
    >
      <IssuePhotoBody />
    </Suspense>
  );
}
