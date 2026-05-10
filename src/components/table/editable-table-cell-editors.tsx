"use client"

import * as React from "react"

import {
  CurrencyInput,
  type CurrencyDraftHints,
} from "@/components/currency-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  formatCurrencyUsd,
  formatPercentage,
  formatPhoneDisplay,
  normalizePhoneDigits,
  parsePercentageInput,
  parsePlainUsdAmount,
} from "@/lib/formatters"

import type { EditableColumnMeta } from "./types"

export function PercentageEditableInput(props: {
  value: unknown
  hasError: boolean
  onChange: (parsedOrRaw: unknown) => void
  onCommit: (parsed: number) => void
}) {
  const { value, hasError, onChange, onCommit } = props
  const pct = typeof value === "number" ? value : Number(value)
  const [text, setText] = React.useState(() =>
    Number.isFinite(pct) ? String(pct) : ""
  )

  const commit = React.useCallback(() => {
    const parsed = parsePercentageInput(text)
    if (parsed != null) {
      onCommit(parsed)
      setText(String(parsed))
    }
  }, [onCommit, text])

  return (
    <div className="flex items-center gap-1">
      <Input
        inputMode="decimal"
        aria-invalid={hasError}
        value={text}
        onChange={(e) => {
          const raw = e.target.value
          setText(raw)
          const parsed = parsePercentageInput(raw)
          onChange(parsed ?? raw)
        }}
        onBlur={commit}
        className="flex-1"
      />
      <span className="text-muted-foreground text-xs">%</span>
    </div>
  )
}

export function ReadValue<TRow>(props: {
  fieldType: EditableColumnMeta<TRow>["fieldType"]
  value: unknown
  options?: { label: string; value: string }[]
}) {
  const { fieldType, value, options } = props
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>
  }
  switch (fieldType) {
    case "currency": {
      if (typeof value === "string") {
        const n = parsePlainUsdAmount(value)
        if (n == null || !Number.isFinite(n)) {
          return <span className="text-muted-foreground">—</span>
        }
        return <span>{formatCurrencyUsd(n)}</span>
      }
      const n = Number(value)
      if (!Number.isFinite(n)) {
        return <span className="text-muted-foreground">—</span>
      }
      return <span>{formatCurrencyUsd(n)}</span>
    }
    case "percentage":
      return <span>{formatPercentage(Number(value))}</span>
    case "phone":
      return <span>{formatPhoneDisplay(String(value))}</span>
    case "checkbox":
      return <span>{value ? "Yes" : "No"}</span>
    case "switch":
      return <span>{value ? "On" : "Off"}</span>
    case "select": {
      const v = String(value)
      const label = options?.find((o) => o.value === v)?.label ?? v
      return <span>{label}</span>
    }
    default:
      return <span>{String(value)}</span>
  }
}

export function EditableControl<TRow extends Record<string, unknown>>(props: {
  rowId: string
  accessorKey: keyof TRow & string
  meta: EditableColumnMeta<TRow>
  row: TRow
  error?: string
  updateDraft: (
    rowId: string,
    key: keyof TRow & string,
    value: unknown,
    hints?: CurrencyDraftHints
  ) => void
}) {
  const { rowId, accessorKey, meta, row, error, updateDraft } = props
  const value = row[accessorKey] as unknown

  switch (meta.fieldType) {
    case "number": {
      const n = typeof value === "number" ? value : Number(value)
      return (
        <Input
          type="number"
          aria-invalid={Boolean(error)}
          value={Number.isFinite(n) ? n : ""}
          onChange={(e) => {
            const v = e.target.value
            updateDraft(rowId, accessorKey, v === "" ? "" : Number(v))
          }}
        />
      )
    }
    case "select": {
      const v = String(value ?? "")
      return (
        <Select
          value={v}
          onValueChange={(next) => updateDraft(rowId, accessorKey, next)}
        >
          <SelectTrigger aria-invalid={Boolean(error)} className="w-full min-w-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(meta.selectOptions ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    case "checkbox":
      return (
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) =>
            updateDraft(rowId, accessorKey, Boolean(checked))
          }
          aria-invalid={Boolean(error)}
        />
      )
    case "switch":
      return (
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) =>
            updateDraft(rowId, accessorKey, Boolean(checked))
          }
          aria-invalid={Boolean(error)}
        />
      )
    case "date":
      return (
        <Input
          type="date"
          aria-invalid={Boolean(error)}
          value={String(value ?? "").slice(0, 10)}
          onChange={(e) => updateDraft(rowId, accessorKey, e.target.value)}
        />
      )
    case "phone": {
      const display = formatPhoneDisplay(String(value ?? ""))
      return (
        <Input
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={Boolean(error)}
          value={display}
          onChange={(e) =>
            updateDraft(rowId, accessorKey, normalizePhoneDigits(e.target.value))
          }
        />
      )
    }
    case "currency":
      return (
        <CurrencyInput
          key={`${rowId}-${accessorKey}`}
          value={value}
          aria-invalid={Boolean(error)}
          onDraftChange={(next, hints) =>
            updateDraft(rowId, accessorKey, next, hints)
          }
          onCommit={(parsed) => updateDraft(rowId, accessorKey, parsed)}
        />
      )
    case "percentage":
      return (
        <PercentageEditableInput
          key={`${rowId}-${accessorKey}`}
          value={value}
          hasError={Boolean(error)}
          onChange={(next) => updateDraft(rowId, accessorKey, next)}
          onCommit={(parsed) => updateDraft(rowId, accessorKey, parsed)}
        />
      )
    case "text":
    default:
      return (
        <Input
          aria-invalid={Boolean(error)}
          value={String(value ?? "")}
          onChange={(e) => updateDraft(rowId, accessorKey, e.target.value)}
        />
      )
  }
}
