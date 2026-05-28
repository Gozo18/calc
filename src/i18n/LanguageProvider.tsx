import { type ReactNode, useEffect, useState } from "react"
import { LanguageContext } from "./context"
import { LOCALES, type Locale, messages } from "./messages"

const STORAGE_KEY = "calc.locale"

const isLocale = (v: unknown): v is Locale =>
  typeof v === "string" && (LOCALES as readonly string[]).includes(v)

/** Resolves the initial locale: persisted preference > navigator language > fallback. */
const detectInitialLocale = (): Locale => {
  if (typeof window === "undefined") return "en"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (isLocale(stored)) return stored
  const browser = (navigator.language || "").toLowerCase()
  if (browser.startsWith("cs") || browser.startsWith("sk")) return "cs"
  return "en"
}

/** Provides the active locale and translation bundle to the tree, and keeps document.lang/title in sync. */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(detectInitialLocale)
  const t = messages[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute("content", t.description)
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale, t.title, t.description])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
