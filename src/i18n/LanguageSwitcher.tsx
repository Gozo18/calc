import { useEffect, useRef, useState } from "react"
import { useT } from "./context"
import { LOCALES, type Locale, messages } from "./messages"

/** Accessible locale picker — native <select> for guaranteed keyboard and screen-reader support. */
export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useT()
  return (
    <div className="language-switcher">
      <label htmlFor="lang-select" className="visually-hidden">
        {t.languageLabel}
      </label>
      <select
        id="lang-select"
        className="language-switcher__select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {messages[l].localeName}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Visually-hidden live region that announces locale changes to screen readers in the new language. */
export const LanguageAnnouncer = () => {
  const { locale, t } = useT()
  const [message, setMessage] = useState("")
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setMessage(t.languageChanged)
    const id = window.setTimeout(() => setMessage(""), 2000)
    return () => window.clearTimeout(id)
  }, [locale, t.languageChanged])

  return (
    <div role="status" aria-live="polite" className="visually-hidden">
      {message}
    </div>
  )
}
