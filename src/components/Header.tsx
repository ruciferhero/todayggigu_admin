"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale, Locale, localeLabels } from "@/contexts/LocaleContext";
import { notificationItems } from "@/config/menuConfig";
import {
  CircleHelp,
  LogOut,
  Menu,
  MessageSquareText,
  ReceiptText,
  UserCog,
  Globe,
  ChevronDown,
  Eye,
  EyeOff,
  Landmark,
  X,
  type LucideIcon,
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

const notificationIconByKey: Record<string, LucideIcon> = {
  deposit: Landmark,
  bank: ReceiptText,
  "inquiry-1on1": MessageSquareText,
  "order-inquiry": CircleHelp,
};

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberInfo, setMemberInfo] = useState({
    id: "admin",
    level: "Administrator",
    name: "Admin",
    password: "",
  });
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMemberInfo((prev) => ({
      ...prev,
      id: user?.email ?? prev.id,
      name: user?.name ?? prev.name,
    }));
  }, [user]);

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
    <>
      <header className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 shadow-lg shrink-0 z-50 text-white">
        <div className="flex items-center px-4 h-14 gap-3">
        {/* Menu toggle (mobile) */}
        <button
          onClick={onMenuToggle}
          className="p-2 cursor-pointer hover:bg-white/20 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-white cursor-pointer" />
        </button>

        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center border border-white/40">
            <span className="text-white font-bold text-base">T</span>
          </div>
          <span className="text-lg font-black tracking-wide italic hidden sm:inline bg-gradient-to-r from-white to-violet-100 bg-clip-text text-transparent drop-shadow-sm">
            {t("header.title")}
          </span>
          <button
            onClick={() => {
              setShowNavigation((prev) => !prev);
              onMenuToggle();
            }}
            className="hidden sm:inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/40 bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
          >
            {showNavigation ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                {t("header.navigationHide")}
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                {t("header.navigationShow")}
              </>
            )}
          </button>
          <span className="text-sm font-black tracking-wide italic hidden sm:inline bg-gradient-to-r from-white to-violet-100 bg-clip-text text-transparent drop-shadow-sm">
            {t("header.brandTitle")}
          </span>
        </div>

        <div className="flex-1" />

        {/* Notification buttons - each shown individually in header */}
        <div className="hidden lg:flex items-center gap-1">
          {notificationItems.map((item) => {
            const Icon = notificationIconByKey[item.key] ?? CircleHelp;
            return (
              <button
                key={item.key}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{t(item.labelKey)}</span>
                <span className="bg-white/25 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-white/30" />

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white cursor-pointer rounded-lg transition-colors whitespace-nowrap"
          >
            <Globe className="w-4 h-4" />
            <span>{localeLabels[locale]}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-10 w-36 bg-white rounded-lg shadow-lg border cursor-pointer py-1 z-50">
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
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white cursor-pointer rounded-lg transition-colors whitespace-nowrap"
        >
          <UserCog className="w-4 h-4" />
          <span className="hidden sm:inline">{t("header.editInfo")}</span>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white hover:bg-red-500/30 rounded-lg transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t("header.logout")}</span>
        </button>
        </div>

      </header>

      {showEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{t("header.editMemberInformation")}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="app-table-wrap">
              <table className="app-table">
                <tbody>
                  <tr>
                    <th className="w-36">{t("header.memberId")}</th>
                    <td>
                      <input
                        type="text"
                        value={memberInfo.id}
                        onChange={(e) => setMemberInfo((prev) => ({ ...prev, id: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-800 outline-none focus:border-blue-500"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="w-36">{t("header.memberLevel")}</th>
                    <td>
                      <input
                        type="text"
                        value={memberInfo.level}
                        onChange={(e) => setMemberInfo((prev) => ({ ...prev, level: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-800 outline-none focus:border-blue-500"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="w-36">{t("header.memberName")}</th>
                    <td>
                      <input
                        type="text"
                        value={memberInfo.name}
                        onChange={(e) => setMemberInfo((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-800 outline-none focus:border-blue-500"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="w-36">{t("header.memberPassword")}</th>
                    <td>
                      <input
                        type="password"
                        value={memberInfo.password}
                        onChange={(e) => setMemberInfo((prev) => ({ ...prev, password: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-800 outline-none focus:border-blue-500"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => {
                  console.log("Saved member info:", memberInfo);
                  setShowEditModal(false);
                }}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {t("header.save")}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                {t("header.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
