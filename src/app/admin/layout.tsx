"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import HorizontalMenu from "@/components/HorizontalMenu";

/** 주문문의·구매비용 견적 팝업 — 상단 관리 헤더·가로 메뉴 없이 본문만 */
function isToolWindowPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin/orders/business/purchase-cost") ||
    pathname.startsWith("/admin/orders/business/order-inquiry")
  );
}

/** 입고 스캔 팝업 — 가로 메뉴(navigation)만 숨김, Header는 유지 */
function isInboundScanToolPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/admin/orders/business/inbound-scan");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const hideChrome = isToolWindowPath(pathname);
  const hideHorizontalMenu = isInboundScanToolPath(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {!hideChrome && (
        <>
          <Header onMenuToggle={() => setIsNavigationVisible((prev) => !prev)} />
          {isNavigationVisible && !hideHorizontalMenu && <HorizontalMenu />}
        </>
      )}
      <main
        className={
          hideChrome ? "min-h-screen flex-1 bg-gray-100 p-0" : "flex-1 bg-gray-100 p-5"
        }
      >
        {children}
      </main>
    </div>
  );
}
