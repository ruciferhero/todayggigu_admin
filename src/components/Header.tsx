"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale, Locale, localeLabels } from "@/contexts/LocaleContext";
import { notificationItems } from "@/config/menuConfig";
import {
  LogOut,
  Menu,
  UserCog,
  Globe,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

const locales: Locale[] = ["en", "ko", "zh"];
const localeNames: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  zh: "中文",
};

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shrink-0 z-50">
      <div className="flex items-center px-4 h-14 gap-3">
        {/* Menu toggle (mobile) */}
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">T</span>
          </div>
          <span className="text-lg font-bold text-gray-900 hidden sm:inline">Todayggigu</span>
        </div>

        {/* Admin connected text */}
        <div className="hidden md:flex items-center ml-3 text-sm text-gray-500">
          <span className="font-medium text-gray-700">{user?.name || "Admin"}</span>
          <span className="ml-1">{t("header.connectedText")}</span>
        </div>

        <div className="flex-1" />

        {/* Notification buttons - each shown individually in header */}
        <div className="hidden lg:flex items-center gap-1">
          {notificationItems.map((item) => (
            <button
              key={item.key}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>{t(item.labelKey)}</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-gray-200" />

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <Globe className="w-4 h-4" />
            <span>{localeLabels[locale]}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-10 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLocale(l);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    locale === l
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {localeNames[l]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit Info */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap">
          <UserCog className="w-4 h-4" />
          <span className="hidden sm:inline">{t("header.editInfo")}</span>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t("header.logout")}</span>
        </button>
      </div>
    </header>
  );
}
