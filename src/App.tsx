import { useEffect, useReducer } from "react"
import {
  type Action,
  type Operator,
  displayLabel,
  initialState,
  isOperator,
  reducer,
} from "./calculator"
import "./App.css"

interface KeyDef {
  label: string
  ariaLabel: string
  variant?: "fn" | "op" | "eq" | "zero"
  action: Action
  /** When set, marks this key as a toggle whose pressed state reflects the pending operator. */
  op?: Operator
}

const KEYS: readonly KeyDef[] = [
  {
    label: "C",
    ariaLabel: "Vymazat vše",
    variant: "fn",
    action: { type: "clear" },
  },
  {
    label: "+/−",
    ariaLabel: "Změnit znaménko",
    variant: "fn",
    action: { type: "toggleSign" },
  },
  {
    label: "⌫",
    ariaLabel: "Smazat poslední znak",
    variant: "fn",
    action: { type: "backspace" },
  },
  {
    label: "÷",
    ariaLabel: "Dělit",
    variant: "op",
    action: { type: "operator", op: "/" },
    op: "/",
  },

  { label: "7", ariaLabel: "Sedm", action: { type: "digit", digit: "7" } },
  { label: "8", ariaLabel: "Osm", action: { type: "digit", digit: "8" } },
  { label: "9", ariaLabel: "Devět", action: { type: "digit", digit: "9" } },
  {
    label: "×",
    ariaLabel: "Násobit",
    variant: "op",
    action: { type: "operator", op: "*" },
    op: "*",
  },

  { label: "4", ariaLabel: "Čtyři", action: { type: "digit", digit: "4" } },
  { label: "5", ariaLabel: "Pět", action: { type: "digit", digit: "5" } },
  { label: "6", ariaLabel: "Šest", action: { type: "digit", digit: "6" } },
  {
    label: "−",
    ariaLabel: "Odečíst",
    variant: "op",
    action: { type: "operator", op: "-" },
    op: "-",
  },

  { label: "1", ariaLabel: "Jedna", action: { type: "digit", digit: "1" } },
  { label: "2", ariaLabel: "Dva", action: { type: "digit", digit: "2" } },
  { label: "3", ariaLabel: "Tři", action: { type: "digit", digit: "3" } },
  {
    label: "+",
    ariaLabel: "Přičíst",
    variant: "op",
    action: { type: "operator", op: "+" },
    op: "+",
  },

  {
    label: "0",
    ariaLabel: "Nula",
    variant: "zero",
    action: { type: "digit", digit: "0" },
  },
  { label: ",", ariaLabel: "Desetinná čárka", action: { type: "dot" } },
  {
    label: "=",
    ariaLabel: "Rovná se",
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

  const displayText = state.display.replace(".", ",")

  return (
    <main className="calculator-wrapper">
      <h1 className="visually-hidden">Kalkulačka</h1>
      <section className="calculator" aria-labelledby="calc-title">
        <h2 id="calc-title" className="visually-hidden">
          Kalkulačka
        </h2>

        <output
          className="display"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Výsledek: ${displayLabel(state)}`}
        >
          <span aria-hidden="true">{state.error ? "Chyba" : displayText}</span>
        </output>

        <div className="keys" role="group" aria-label="Klávesnice kalkulačky">
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
                aria-label={key.ariaLabel}
                aria-pressed={key.op !== undefined ? isActive : undefined}
              >
                <span aria-hidden="true">{key.label}</span>
              </button>
            )
          })}
        </div>

        <p className="hint" aria-hidden="true">
          Klávesnice: 0–9, + − * /, Enter, Backspace, Esc
        </p>
      </section>
    </main>
  )
}

export default App
