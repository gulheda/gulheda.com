import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { content, shared, LOCALES, DEFAULT_LOCALE } from "./data/content.js";

/* Tiny locale layer: Turkish by default, English on request.
   The choice is remembered, and <html lang> is kept in sync so
   screen readers and search engines read the page correctly. */

const LocaleContext = createContext(null);
const STORAGE_KEY = "gulheda.locale";

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LOCALES.includes(saved)) return saved;
    } catch {
      /* private mode — fall through to the default */
    }
    return DEFAULT_LOCALE;
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* nothing to persist to; the in-memory choice still works */
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: content[locale],
      shared,
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
