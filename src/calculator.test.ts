import { describe, expect, it } from "vitest"
import {
  type Action,
  type Operator,
  type State,
  MAX_INPUT_LENGTH,
  initialState,
  reducer,
} from "./calculator"

/** Folds a sequence of actions through the reducer starting from the initial state. */
const run = (actions: Action[], from: State = initialState): State =>
  actions.reduce(reducer, from)

/** Builds a digit action for terser test sequences. */
const digit = (d: string): Action => ({ type: "digit", digit: d })
const op = (o: Operator): Action => ({ type: "operator", op: o })
const dot: Action = { type: "dot" }
const eq: Action = { type: "equals" }
const clear: Action = { type: "clear" }
const back: Action = { type: "backspace" }
const sign: Action = { type: "toggleSign" }

/** Types a multi-digit string into the reducer. */
const type = (s: string): Action[] => [...s].map(digit)

describe("initial state", () => {
  it("displays 0", () => {
    expect(initialState.display).toBe("0")
    expect(initialState.error).toBe(false)
  })
})

describe("digit input", () => {
  it("replaces the leading zero", () => {
    expect(run([digit("5")]).display).toBe("5")
  })

  it("appends subsequent digits", () => {
    expect(run(type("123")).display).toBe("123")
  })

  it("does not append past the input length cap", () => {
    const long = "1".repeat(MAX_INPUT_LENGTH + 5)
    expect(run(type(long)).display).toBe("1".repeat(MAX_INPUT_LENGTH))
  })

  it("counts the input cap on the digits, not the sign", () => {
    const fifteen = "1".repeat(MAX_INPUT_LENGTH - 1)
    const state = run([...type(fifteen), sign, digit("2")])
    expect(state.display).toBe("-" + fifteen + "2")
  })
})

describe("decimal point", () => {
  it("appends a dot", () => {
    expect(run([digit("3"), dot, digit("5")]).display).toBe("3.5")
  })

  it("ignores a second dot", () => {
    expect(run([digit("3"), dot, digit("5"), dot]).display).toBe("3.5")
  })

  it("starts a fresh operand with 0.", () => {
    expect(run([digit("3"), op("+"), dot]).display).toBe("0.")
  })
})

describe("backspace", () => {
  it("removes the last digit", () => {
    expect(run([...type("123"), back]).display).toBe("12")
  })

  it("falls back to 0 when only one digit remains", () => {
    expect(run([digit("5"), back]).display).toBe("0")
  })

  it("falls back to 0 from a single negative digit", () => {
    expect(run([digit("5"), sign, back]).display).toBe("0")
  })

  it("is a no-op while awaiting operand", () => {
    const state = run([digit("5"), op("+"), back])
    expect(state.display).toBe("5")
    expect(state.awaitingOperand).toBe(true)
  })
})

describe("clear", () => {
  it("resets every field", () => {
    expect(run([digit("5"), op("+"), digit("3"), eq, clear])).toEqual(
      initialState,
    )
  })
})

describe("toggle sign", () => {
  it("negates the displayed value", () => {
    expect(run([digit("5"), sign]).display).toBe("-5")
  })

  it("toggles back to positive", () => {
    expect(run([digit("5"), sign, sign]).display).toBe("5")
  })

  it("is a no-op on 0", () => {
    expect(run([sign]).display).toBe("0")
  })

  it("starts a multi-digit negative literal when toggled right after an operator", () => {
    // 5 + (toggle) 3 → display "-53" (sign cleared awaitingOperand, so 3 appends)
    // → 5 + -53 = -48
    const state = run([digit("5"), op("+"), sign, digit("3"), eq])
    expect(state.display).toBe("-48")
  })

  it("negates an already-typed operand", () => {
    // 5 + 3 (toggle) = → display "-3", so 5 + -3 = 2
    const state = run([digit("5"), op("+"), digit("3"), sign, eq])
    expect(state.display).toBe("2")
  })
})

describe("basic operations", () => {
  it("adds", () => {
    expect(run([digit("5"), op("+"), digit("3"), eq]).display).toBe("8")
  })

  it("subtracts", () => {
    expect(run([digit("9"), op("-"), digit("4"), eq]).display).toBe("5")
  })

  it("multiplies", () => {
    expect(run([digit("6"), op("*"), digit("7"), eq]).display).toBe("42")
  })

  it("divides", () => {
    expect(run([digit("8"), op("/"), digit("2"), eq]).display).toBe("4")
  })

  it("evaluates 0.1 + 0.2 without float noise", () => {
    const state = run([
      digit("0"),
      dot,
      digit("1"),
      op("+"),
      digit("0"),
      dot,
      digit("2"),
      eq,
    ])
    expect(state.display).toBe("0.3")
  })
})

describe("chained operations", () => {
  it("folds left-to-right", () => {
    // 5 + 3 * 2 → (5 + 3) * 2 = 16  (left-to-right, no operator precedence)
    const state = run([
      digit("5"),
      op("+"),
      digit("3"),
      op("*"),
      digit("2"),
      eq,
    ])
    expect(state.display).toBe("16")
  })

  it("swaps consecutive operators without computing", () => {
    // 5 + - 3 = → 2  (the + is replaced by -)
    const state = run([digit("5"), op("+"), op("-"), digit("3"), eq])
    expect(state.display).toBe("2")
  })

  it("uses acc as rhs when equals is pressed after an operator", () => {
    // 5 + =  →  5 + 5 = 10
    expect(run([digit("5"), op("+"), eq]).display).toBe("10")
  })
})

describe("division by zero", () => {
  it("enters the error state", () => {
    const state = run([digit("5"), op("/"), digit("0"), eq])
    expect(state.error).toBe(true)
    expect(state.display).toBe("Error")
  })

  it("errors mid-chain too", () => {
    // 5 / 0 + 3 should error on the + (folds 5/0)
    const state = run([digit("5"), op("/"), digit("0"), op("+")])
    expect(state.error).toBe(true)
  })
})

describe("error recovery", () => {
  const erroredState = run([digit("5"), op("/"), digit("0"), eq])

  it("digit clears the error and starts fresh", () => {
    const state = reducer(erroredState, digit("7"))
    expect(state.error).toBe(false)
    expect(state.display).toBe("7")
  })

  it("dot clears the error and starts at 0.", () => {
    const state = reducer(erroredState, dot)
    expect(state.error).toBe(false)
    expect(state.display).toBe("0.")
  })

  it("operator clears the error and applies the operator", () => {
    const state = reducer(erroredState, op("+"))
    expect(state.error).toBe(false)
    expect(state.op).toBe("+")
    expect(state.acc).toBe(0)
    expect(state.awaitingOperand).toBe(true)
  })

  it("backspace is ignored in error state", () => {
    expect(reducer(erroredState, back)).toBe(erroredState)
  })
})

describe("repeat equals", () => {
  it("re-applies the last operator and operand", () => {
    // 5 + 3 = → 8; = → 11; = → 14
    const after1 = run([digit("5"), op("+"), digit("3"), eq])
    expect(after1.display).toBe("8")
    const after2 = reducer(after1, eq)
    expect(after2.display).toBe("11")
    const after3 = reducer(after2, eq)
    expect(after3.display).toBe("14")
  })

  it("re-applies against a freshly typed operand after equals", () => {
    // 5 + 3 = → 8; then user types 10 and presses =  →  10 + 3 = 13
    const state = run([digit("5"), op("+"), digit("3"), eq, ...type("10"), eq])
    expect(state.display).toBe("13")
  })

  it("is a no-op when no prior operation exists", () => {
    expect(run([eq]).display).toBe("0")
  })
})
