"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import {
  formatPlainUsdAmount,
  parsePlainUsdAmount,
  sanitizeUsdAmountTyping,
} from "@/lib/formatters"
import { cn } from "@/lib/utils"

export type CurrencyDraftHints = {
  /** User tried to type or paste characters other than digits / one decimal point. */
  invalidCharset?: boolean
}

export type CurrencyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type" | "inputMode" | "onBlur"
> & {
  /** Numeric amount or draft string while editing. */
  value: unknown
  onDraftChange: (text: string, hints?: CurrencyDraftHints) => void
  /** Called on blur when the field parses to a finite number. */
  onCommit: (parsed: number) => void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

function textFromPropValue(value: unknown): string {
  if (typeof value === "string") {
    return sanitizeUsdAmountTyping(value).text
  }
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? formatPlainUsdAmount(n) : ""
}

/**
 * USD amount field for editing: digits and one decimal point only; optional
 * charset validation hint for the parent to surface as a field error.
 */
export function CurrencyInput({
  value,
  onDraftChange,
  onCommit,
  className,
  onBlur,
  ...inputProps
}: CurrencyInputProps) {
  const [text, setText] = React.useState(() => textFromPropValue(value))

  const commit = React.useCallback(() => {
    const parsed = parsePlainUsdAmount(text)
    if (parsed != null) {
      onCommit(parsed)
      setText(formatPlainUsdAmount(parsed))
    } else {
      setText(textFromPropValue(value))
    }
  }, [onCommit, text, value])

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    commit()
    onBlur?.(e)
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      autoComplete="transaction-amount"
      value={text}
      onChange={(e) => {
        const raw = e.target.value
        const { text: next, hadInvalidChars } = sanitizeUsdAmountTyping(raw)
        setText(next)
        onDraftChange(next, { invalidCharset: hadInvalidChars })
      }}
      onBlur={handleBlur}
      className={cn(className)}
      {...inputProps}
    />
  )
}
