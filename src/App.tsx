import { useEffect, useReducer } from "react"
import {
  type Action,
  type Operator,
  initialState,
  isOperator,
  reducer,
} from "./calculator"
import { useT } from "./i18n/context"
import { displayLabel, formatDisplay } from "./i18n/format"
import type { Messages } from "./i18n/messages"
import { LanguageAnnouncer, LanguageSwitcher } from "./i18n/LanguageSwitcher"
import "./App.css"

interface KeyDef {
  label: string
  /** Picks the appropriate aria-label out of the active translation bundle. */
  getAriaLabel: (t: Messages) => string
  variant?: "fn" | "op" | "eq" | "zero"
  action: Action
  /** When set, marks this key as a toggle whose pressed state reflects the pending operator. */
  op?: Operator
}

const KEYS: readonly KeyDef[] = [
  {
    label: "C",
    getAriaLabel: (t) => t.keys.clear,
    variant: "fn",
    action: { type: "clear" },
  },
  {
    label: "+/−",
    getAriaLabel: (t) => t.keys.toggleSign,
    variant: "fn",
    action: { type: "toggleSign" },
  },
  {
    label: "⌫",
    getAriaLabel: (t) => t.keys.backspace,
    variant: "fn",
    action: { type: "backspace" },
  },
  {
    label: "÷",
    getAriaLabel: (t) => t.keys.divide,
    variant: "op",
    action: { type: "operator", op: "/" },
    op: "/",
  },

  {
    label: "7",
    getAriaLabel: (t) => t.keys.digits["7"],
    action: { type: "digit", digit: "7" },
  },
  {
    label: "8",
    getAriaLabel: (t) => t.keys.digits["8"],
    action: { type: "digit", digit: "8" },
  },
  {
    label: "9",
    getAriaLabel: (t) => t.keys.digits["9"],
    action: { type: "digit", digit: "9" },
  },
  {
    label: "×",
    getAriaLabel: (t) => t.keys.multiply,
    variant: "op",
    action: { type: "operator", op: "*" },
    op: "*",
  },

  {
    label: "4",
    getAriaLabel: (t) => t.keys.digits["4"],
    action: { type: "digit", digit: "4" },
  },
  {
    label: "5",
    getAriaLabel: (t) => t.keys.digits["5"],
    action: { type: "digit", digit: "5" },
  },
  {
    label: "6",
    getAriaLabel: (t) => t.keys.digits["6"],
    action: { type: "digit", digit: "6" },
  },
  {
    label: "−",
    getAriaLabel: (t) => t.keys.subtract,
    variant: "op",
    action: { type: "operator", op: "-" },
    op: "-",
  },

  {
    label: "1",
    getAriaLabel: (t) => t.keys.digits["1"],
    action: { type: "digit", digit: "1" },
  },
  {
    label: "2",
    getAriaLabel: (t) => t.keys.digits["2"],
    action: { type: "digit", digit: "2" },
  },
  {
    label: "3",
    getAriaLabel: (t) => t.keys.digits["3"],
    action: { type: "digit", digit: "3" },
  },
  {
    label: "+",
    getAriaLabel: (t) => t.keys.add,
    variant: "op",
    action: { type: "operator", op: "+" },
    op: "+",
  },

  {
    label: "0",
    getAriaLabel: (t) => t.keys.digits["0"],
    variant: "zero",
    action: { type: "digit", digit: "0" },
  },
  {
    label: ",",
    getAriaLabel: (t) => t.keys.dot,
    action: { type: "dot" },
  },
  {
    label: "=",
    getAriaLabel: (t) => t.keys.equals,
    variant: "eq",
    action: { type: "equals" },
  },
]

/** Maps a raw keyboard event to a calculator action, or null if the key is not handled. */
const keyEventToAction = (e: KeyboardEvent): Action | null => {
  if (e.ctrlKey || e.altKey || e.metaKey) return null
  const { key } = e
  if (/^[0-9]$/.test(key)) return { type: "digit", digit: key }
  if (key === "." || key === ",") return { type: "dot" }
  if (isOperator(key)) return { type: "operator", op: key }
  if (key === "Enter" || key === "=") return { type: "equals" }
  if (key === "Backspace") return { type: "backspace" }
  if (key === "Escape" || key === "c" || key === "C") return { type: "clear" }
  return null
}

/** Keys whose default browser behavior must be suppressed when handled by the calculator. */
const PREVENT_DEFAULT_KEYS = new Set(["+", "-", "*", "/", "=", "Enter"])

/** Root component holding the calculator state and rendered keypad. */
function App() {
  const { t, locale } = useT()
  const [state, dispatch] = useReducer(reducer, initialState)

  /** Binds global keyboard shortcuts once — dispatch is stable so deps stay empty. */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const action = keyEventToAction(e)
      if (!action) return
      if (PREVENT_DEFAULT_KEYS.has(e.key)) e.preventDefault()
      dispatch(action)
    }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [])

  const displayText = state.error
    ? t.error
    : formatDisplay(state.display, locale)

  return (
    <main className="calculator-wrapper">
      <LanguageSwitcher />
      <LanguageAnnouncer />
      <h1 className="visually-hidden">{t.appName}</h1>
      <section className="calculator" aria-labelledby="calc-title">
        <h2 id="calc-title" className="visually-hidden">
          {t.appName}
        </h2>

        <output
          className="display"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${t.result}: ${displayLabel(state, t, locale)}`}
        >
          <span aria-hidden="true">{displayText}</span>
        </output>

        <div className="keys" role="group" aria-label={t.keypad}>
          {KEYS.map((key) => {
            const isActive =
              key.op !== undefined &&
              state.op === key.op &&
              state.awaitingOperand
            const className = [
              "key",
              key.variant && `key--${key.variant}`,
              isActive && "is-active",
            ]
              .filter(Boolean)
              .join(" ")
            return (
              <button
                key={key.label}
                type="button"
                className={className}
                onClick={() => dispatch(key.action)}
                aria-label={key.getAriaLabel(t)}
                aria-pressed={key.op !== undefined ? isActive : undefined}
              >
                <span aria-hidden="true">{key.label}</span>
              </button>
            )
          })}
        </div>

        <p className="hint" aria-hidden="true">
          {t.hint}
        </p>
      </section>
    </main>
  )
}

export default App
