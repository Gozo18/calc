import { describe, expect, it } from "vitest"
import { initialState } from "../calculator"
import { displayLabel, formatDisplay } from "./format"
import { messages } from "./messages"

describe("formatDisplay", () => {
  it("uses a comma as the decimal separator in cs", () => {
    expect(formatDisplay("1.5", "cs")).toBe("1,5")
  })

  it("keeps the dot in en", () => {
    expect(formatDisplay("1.5", "en")).toBe("1.5")
  })

  it("leaves integers untouched", () => {
    expect(formatDisplay("42", "cs")).toBe("42")
    expect(formatDisplay("42", "en")).toBe("42")
  })

  it("preserves the minus glyph", () => {
    expect(formatDisplay("-1.5", "cs")).toBe("-1,5")
    expect(formatDisplay("-1.5", "en")).toBe("-1.5")
  })
})

describe("displayLabel", () => {
  it("returns the error string of the active locale", () => {
    const errored = { ...initialState, display: "Error", error: true }
    expect(displayLabel(errored, messages.cs, "cs")).toBe("Chyba")
    expect(displayLabel(errored, messages.en, "en")).toBe("Error")
  })

  it("speaks the minus word for the active locale", () => {
    const negative = { ...initialState, display: "-5" }
    expect(displayLabel(negative, messages.cs, "cs")).toBe("mínus 5")
    expect(displayLabel(negative, messages.en, "en")).toBe("minus 5")
  })

  it("speaks decimals with the locale separator", () => {
    const decimal = { ...initialState, display: "1.5" }
    expect(displayLabel(decimal, messages.cs, "cs")).toBe("1,5")
    expect(displayLabel(decimal, messages.en, "en")).toBe("1.5")
  })
})
