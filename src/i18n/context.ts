import { createContext, useContext } from "react"
import type { Locale, Messages } from "./messages"

export interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Messages
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

/** Access the active locale, messages, and a setter. Throws if used outside LanguageProvider. */
export const useT = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useT must be used within a <LanguageProvider>")
  }
  return ctx
}
