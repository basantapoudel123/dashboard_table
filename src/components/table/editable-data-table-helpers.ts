import type { ColumnDef, FilterFn } from "@tanstack/react-table"
import type { FieldErrors } from "react-hook-form"

import type { EditableColumnMeta } from "./types"

export function defaultGlobalFilter<TRow extends Record<string, unknown>>(
  keys: (keyof TRow & string)[]
): FilterFn<TRow> {
  return (row, _columnId, filterValue) => {
    const q = String(filterValue ?? "")
      .toLowerCase()
      .trim()
    if (!q) return true
    const hay = keys
      .map((k) => String(row.original[k] ?? "").toLowerCase())
      .join(" ")
    return hay.includes(q)
  }
}

export function getAccessorKey<TRow>(col: ColumnDef<TRow, unknown>): string | undefined {
  if ("accessorKey" in col && typeof col.accessorKey === "string") {
    return col.accessorKey
  }
  return col.id
}

export function collectEditableMeta<TRow>(
  columns: ColumnDef<TRow, unknown>[]
): { id: string; key: keyof TRow & string; meta: EditableColumnMeta<TRow> }[] {
  const out: { id: string; key: keyof TRow & string; meta: EditableColumnMeta<TRow> }[] =
    []
  for (const c of columns) {
    const key = getAccessorKey(c)
    const meta = c.meta?.editable
    if (!key || !meta || meta.editable === false) continue
    out.push({
      id: c.id ?? key,
      key: key as keyof TRow & string,
      meta,
    })
  }
  return out
}

export function mapReactHookFormErrors<TRow extends Record<string, unknown>>(
  errors: FieldErrors<TRow>
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const key of Object.keys(errors) as (keyof FieldErrors<TRow>)[]) {
    const e = errors[key]
    if (e && typeof e === "object" && "message" in e && e.message != null) {
      out[String(key)] = String(e.message)
    }
  }
  return out
}
