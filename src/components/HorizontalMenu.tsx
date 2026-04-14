"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { menuItems, MenuItem } from "@/config/menuConfig";
import { useLocale } from "@/contexts/LocaleContext";

export default function HorizontalMenu() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  /** Preview second row while pointer is over a top-level item (no click yet). */
  const [hoveredTopKey, setHoveredTopKey] = useState<string | null>(null);

  const isActive = (item: MenuItem): boolean => {
    if (item.path && pathname === item.path) return true;
    if (item.children) return item.children.some(isActive);
    return false;
  };

  useEffect(() => {
    for (const item of menuItems) {
      if (isActive(item)) {
        setActiveMenu(item.key);
        if (item.children) {
          for (const child of item.children) {
            if (child.children && isActive(child)) {
              setActiveSubmenu(child.key);
              break;
            }
          }
        }
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const activeMenuData = menuItems.find((m) => m.key === activeMenu);
  const activeSubmenuData = activeMenuData?.children?.find(
    (c) => c.key === activeSubmenu && c.children
  );

  const menuForSecondRow =
    (hoveredTopKey ? menuItems.find((m) => m.key === hoveredTopKey) : undefined) ??
    activeMenuData;
  const secondRowChildren = menuForSecondRow?.children;
  const isSecondRowFromHover = Boolean(hoveredTopKey);
  const showThirdRow =
    Boolean(activeSubmenuData?.children) &&
    (!hoveredTopKey || hoveredTopKey === activeMenu);

  return (
    <div
      className="bg-white border-b border-gray-200 shrink-0"
      onMouseLeave={() => setHoveredTopKey(null)}
    >
      {/* Level 1: Main menu items - horizontal line */}
      <nav className="flex items-center px-4 overflow-x-auto">
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onMouseEnter={() => setHoveredTopKey(item.key)}
            onClick={() => {
              setActiveMenu(activeMenu === item.key ? null : item.key);
              setActiveSubmenu(null);
              setHoveredTopKey(null);
            }}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeMenu === item.key
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </nav>

      {/* Level 2: Sub-menu — preview on hover; locked to clicked top item when pointer leaves */}
      {secondRowChildren && (
        <div
          className={`border-t border-gray-200 transition-colors ${
            isSecondRowFromHover ? "bg-slate-50/90 ring-1 ring-inset ring-blue-100" : "bg-gray-50"
          }`}
        >
          <nav className="flex items-center px-4 overflow-x-auto min-h-[44px]">
            {secondRowChildren.map((child) =>
              child.path ? (
                <Link
                  key={child.key}
                  href={child.path}
                  className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    pathname === child.path
                      ? "text-blue-600 border-blue-600 font-medium"
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {t(child.labelKey)}
                </Link>
              ) : (
                <button
                  key={child.key}
                  type="button"
                  onClick={() => {
                    if (menuForSecondRow?.key && menuForSecondRow.key !== activeMenu) {
                      setActiveMenu(menuForSecondRow.key);
                    }
                    setHoveredTopKey(null);
                    setActiveSubmenu(activeSubmenu === child.key ? null : child.key);
                  }}
                  className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    (!hoveredTopKey || hoveredTopKey === activeMenu) &&
                    (activeSubmenu === child.key || isActive(child))
                      ? "text-blue-600 border-blue-600 font-medium"
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {t(child.labelKey)}
                </button>
              )
            )}
          </nav>
        </div>
      )}

      {/* Level 3: Nested sub-menu — only when not previewing a different top section */}
      {showThirdRow && activeSubmenuData?.children && (
        <div className="bg-gray-100 border-t border-gray-200">
          <nav className="flex items-center px-4 overflow-x-auto">
            {activeSubmenuData.children.map((sub) => (
              <Link
                key={sub.key}
                href={sub.path || "#"}
                className={`px-4 py-2 text-sm whitespace-nowrap transition-colors border-b-2 ${
                  pathname === sub.path
                    ? "text-blue-600 border-blue-600 font-medium"
                    : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {t(sub.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
