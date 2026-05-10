import type { EditableColumnMeta } from "@/components/table/types"

declare module "@tanstack/react-table" {
  // Second type parameter is required by TanStack; we only augment shared meta.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    editable?: EditableColumnMeta<TData>
    /** When set, this column appears in the filter toolbar row. */
    filterVariant?: "text" | "select"
    filterOptions?: { label: string; value: string }[]
    /** Include this accessor in global search (default: true for accessor columns). */
    includeInGlobalFilter?: boolean
  }
}

export {}
