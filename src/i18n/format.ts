import type { State } from "../calculator"
import type { Locale, Messages } from "./messages"

/** Locale → decimal separator used for visible display strings. */
const decimalSeparator: Record<Locale, string> = {
  cs: ",",
  en: ".",
}

/** Locale-aware visual representation of the canonical display string ("12.5" → "12,5" in cs). */
export const formatDisplay = (canonical: string, locale: Locale): string =>
  canonical.replace(".", decimalSeparator[locale])

/** Screen-reader label: localizes the decimal separator and replaces the minus glyph with the locale's word. */
export const displayLabel = (
  state: State,
  t: Messages,
  locale: Locale,
): string => {
  if (state.error) return t.error
  const formatted = formatDisplay(state.display, locale)
  return formatted.startsWith("-")
    ? `${t.minus} ${formatted.slice(1)}`
    : formatted
}
