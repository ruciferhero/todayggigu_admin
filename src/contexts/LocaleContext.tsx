"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/locales/en";
import ko from "@/locales/ko";
import zh from "@/locales/zh";

export type Locale = "en" | "ko" | "zh";

const messages: Record<Locale, Record<string, string>> = { en, ko, zh };

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  ko: "KO",
  zh: "ZH",
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("todayggigu_locale") as Locale | null;
    if (stored && messages[stored]) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("todayggigu_locale", l);
  };

  const t = (key: string): string => {
    return messages[locale][key] || messages["en"][key] || key;
  };

  if (!mounted) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
