/** Supported UI locales. Tuple kept narrow so the union type below can be derived. */
export const LOCALES = ["cs", "en"] as const
export type Locale = (typeof LOCALES)[number]

const cs = {
  title: "Kalkulačka",
  description: "Responzivní kalkulačka pro základní matematické operace.",
  appName: "Kalkulačka",
  keypad: "Klávesnice kalkulačky",
  result: "Výsledek",
  error: "Chyba",
  minus: "mínus",
  hint: "Klávesnice: 0–9, + − * /, Enter, Backspace, Esc",
  languageLabel: "Jazyk",
  languageChanged: "Jazyk změněn na češtinu",
  localeName: "Čeština",
  keys: {
    clear: "Vymazat vše",
    toggleSign: "Změnit znaménko",
    backspace: "Smazat poslední znak",
    divide: "Dělit",
    multiply: "Násobit",
    subtract: "Odečíst",
    add: "Přičíst",
    equals: "Rovná se",
    dot: "Desetinná čárka",
    digits: {
      "0": "Nula",
      "1": "Jedna",
      "2": "Dva",
      "3": "Tři",
      "4": "Čtyři",
      "5": "Pět",
      "6": "Šest",
      "7": "Sedm",
      "8": "Osm",
      "9": "Devět",
    },
  },
}

/** Inferred shape of a full message bundle — every locale must match this contract. */
export type Messages = typeof cs

const en: Messages = {
  title: "Calculator",
  description: "Responsive calculator for basic arithmetic.",
  appName: "Calculator",
  keypad: "Calculator keypad",
  result: "Result",
  error: "Error",
  minus: "minus",
  hint: "Keyboard: 0–9, + − * /, Enter, Backspace, Esc",
  languageLabel: "Language",
  languageChanged: "Language changed to English",
  localeName: "English",
  keys: {
    clear: "Clear all",
    toggleSign: "Toggle sign",
    backspace: "Delete last character",
    divide: "Divide",
    multiply: "Multiply",
    subtract: "Subtract",
    add: "Add",
    equals: "Equals",
    dot: "Decimal point",
    digits: {
      "0": "Zero",
      "1": "One",
      "2": "Two",
      "3": "Three",
      "4": "Four",
      "5": "Five",
      "6": "Six",
      "7": "Seven",
      "8": "Eight",
      "9": "Nine",
    },
  },
}

/** Lookup table keyed by locale; addressing missing locales is a compile-time error. */
export const messages: Record<Locale, Messages> = { cs, en }
