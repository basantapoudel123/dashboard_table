/** Digits only for storage / validation. */
export function normalizePhoneDigits(input: string): string {
  return input.replace(/\D/g, "").slice(0, 10)
}

/** US-style display; accepts digits or formatted strings. */
export function formatPhoneDisplay(digits: string): string {
  const d = normalizePhoneDigits(digits)
  if (d.length <= 3) return d
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export function isValidUsPhone(digits: string): boolean {
  return normalizePhoneDigits(digits).length === 10
}

export function parseCurrencyInput(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.-]/g, "")
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

/** Plain amount for editing (no $ or grouping). */
export function formatPlainUsdAmount(amount: number): string {
  if (!Number.isFinite(amount)) return ""
  return amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    useGrouping: false,
  })
}

/**
 * Parses a plain USD amount string (digits and at most one `.` only).
 * Empty or lone `.` is incomplete → null.
 */
export function parsePlainUsdAmount(raw: string): number | null {
  const t = raw.trim()
  if (t === "" || t === ".") return null
  if (!/^\d*\.?\d*$/.test(t)) return null
  const n = Number.parseFloat(t)
  return Number.isFinite(n) ? n : null
}

/**
 * Keeps only digits and a single decimal point (MSRP-style typing).
 * `hadInvalidChars` is true when input contained other characters or extra dots.
 */
export function sanitizeUsdAmountTyping(raw: string): {
  text: string
  hadInvalidChars: boolean
} {
  let hadInvalidChars = false
  let out = ""
  let dotSeen = false
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      out += ch
      continue
    }
    if (ch === ".") {
      if (!dotSeen) {
        out += ch
        dotSeen = true
        continue
      }
      hadInvalidChars = true
      continue
    }
    hadInvalidChars = true
  }
  return { text: out, hadInvalidChars }
}

export function formatCurrencyUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Parses "12", "12%", "12.5 %" into 0–100 number. */
export function parsePercentageInput(raw: string): number | null {
  const cleaned = raw.replace(/%/g, "").trim()
  if (cleaned === "") return null
  const n = Number.parseFloat(cleaned)
  if (!Number.isFinite(n)) return null
  return n
}

export function formatPercentage(value: number): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`
}
