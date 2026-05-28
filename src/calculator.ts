export type Operator = "+" | "-" | "*" | "/"

/** Type guard that narrows a string to one of the supported arithmetic operators. */
export const isOperator = (value: string): value is Operator =>
  value === "+" || value === "-" || value === "*" || value === "/"

/** Applies the given arithmetic operator to two operands. Returns NaN when dividing by zero. */
export const operate = (a: number, b: number, op: Operator): number => {
  switch (op) {
    case "+":
      return a + b
    case "-":
      return a - b
    case "*":
      return a * b
    case "/":
      return b === 0 ? NaN : a / b
  }
}

/** Formats a numeric result for the display, trimming floating-point noise. */
export const formatNumber = (n: number): string =>
  String(Number.parseFloat(n.toPrecision(12)))

export interface State {
  /** Visible display string — also the source of truth for the operand being entered. */
  display: string
  /** Accumulated left-hand value of the pending operation. */
  acc: number | null
  /** Pending operator waiting for its right-hand operand. */
  op: Operator | null
  /** True when the next digit/dot should start a fresh operand instead of appending. */
  awaitingOperand: boolean
  /** Last evaluated operator — used for repeat-equals. */
  lastOp: Operator | null
  /** Last right-hand operand — used for repeat-equals. */
  lastOperand: number | null
  /** True when the previous computation errored (e.g. division by zero). */
  error: boolean
}

export type Action =
  | { type: "digit"; digit: string }
  | { type: "dot" }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "toggleSign" }
  | { type: "operator"; op: Operator }
  | { type: "equals" }

/** Maximum operand length (excluding sign) — keeps the displayed value within IEEE-754 precision. */
export const MAX_INPUT_LENGTH = 16

/** Returns the length of an operand string ignoring its sign. */
const operandLength = (s: string): number =>
  s.startsWith("-") ? s.length - 1 : s.length

export const initialState: State = {
  display: "0",
  acc: null,
  op: null,
  awaitingOperand: false,
  lastOp: null,
  lastOperand: null,
  error: false,
}

/** Returns the error state with the display sentinel. */
const errored = (state: State): State => ({
  ...state,
  display: "Error",
  acc: null,
  op: null,
  awaitingOperand: false,
  error: true,
})

/** Wraps a result: error state on non-finite, otherwise applies a normal display update. */
const withResult = (
  state: State,
  result: number,
  patch: Partial<State>,
): State =>
  Number.isFinite(result)
    ? { ...state, ...patch, display: formatNumber(result) }
    : errored(state)

/** Reducer for the full calculator state machine — explicit transitions, no implicit invariants. */
export function reducer(state: State, action: Action): State {
  if (state.error) {
    switch (action.type) {
      case "digit":
        return { ...initialState, display: action.digit }
      case "dot":
        return { ...initialState, display: "0." }
      case "operator":
        return { ...initialState, acc: 0, op: action.op, awaitingOperand: true }
      case "clear":
        return initialState
      default:
        return state
    }
  }

  switch (action.type) {
    case "digit": {
      if (state.awaitingOperand) {
        return { ...state, display: action.digit, awaitingOperand: false }
      }
      if (operandLength(state.display) >= MAX_INPUT_LENGTH) return state
      return {
        ...state,
        display:
          state.display === "0" ? action.digit : state.display + action.digit,
      }
    }
    case "dot": {
      if (state.awaitingOperand) {
        return { ...state, display: "0.", awaitingOperand: false }
      }
      if (state.display.includes(".")) return state
      if (operandLength(state.display) >= MAX_INPUT_LENGTH) return state
      return { ...state, display: state.display + "." }
    }
    case "backspace": {
      if (state.awaitingOperand) return state
      const cur = state.display
      if (cur.length <= 1 || (cur.length === 2 && cur.startsWith("-"))) {
        return { ...state, display: "0" }
      }
      return { ...state, display: cur.slice(0, -1) }
    }
    case "clear":
      return initialState
    case "toggleSign": {
      if (state.display === "0") return state
      const next = state.display.startsWith("-")
        ? state.display.slice(1)
        : "-" + state.display
      return { ...state, display: next, awaitingOperand: false }
    }
    case "operator": {
      const inputValue = Number.parseFloat(state.display)
      if (Number.isNaN(inputValue)) return initialState
      if (state.acc === null) {
        return {
          ...state,
          acc: inputValue,
          op: action.op,
          awaitingOperand: true,
        }
      }
      if (state.op !== null && !state.awaitingOperand) {
        const result = operate(state.acc, inputValue, state.op)
        return withResult(state, result, {
          acc: result,
          op: action.op,
          awaitingOperand: true,
        })
      }
      return { ...state, op: action.op, awaitingOperand: true }
    }
    case "equals": {
      const current = Number.parseFloat(state.display)
      if (Number.isNaN(current)) return state

      if (state.op !== null && state.acc !== null) {
        const rhs = state.awaitingOperand ? state.acc : current
        const result = operate(state.acc, rhs, state.op)
        return withResult(state, result, {
          acc: null,
          op: null,
          awaitingOperand: true,
          lastOp: state.op,
          lastOperand: rhs,
        })
      }

      if (state.lastOp !== null && state.lastOperand !== null) {
        const result = operate(current, state.lastOperand, state.lastOp)
        return withResult(state, result, { awaitingOperand: true })
      }

      return state
    }
  }
}
