import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  OnChangeFn,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"

export type EditableDataTableProps<TRow extends Record<string, unknown>> = {
  data: TRow[]
  columns: ColumnDef<TRow, unknown>[]
  getRowId: (row: TRow) => string
  /** Accessor keys included in global search (stringified). */
  globalSearchKeys: (keyof TRow & string)[]
  globalFilterFn?: FilterFn<TRow>
  isLoading?: boolean
  /** Default page size when `pagination` is not controlled. */
  pageSize?: number
  onEdit?: (payload: {
    row: TRow
    mode: "row" | "cell"
    columnId?: string
  }) => void
  onSave?: (row: TRow) => void
  onDelete?: (row: TRow) => void
  /** Delay before applying global search to the table (ms). 0 = immediate. */
  globalFilterDebounceMs?: number
  /** Applied global filter string passed to TanStack Table (e.g. debounced value from the parent). */
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  /**
   * Optional immediate search box value when `globalFilter` is a debounced/applied value.
   * If set, the input is controlled by these props instead of `globalFilter` alone.
   */
  globalFilterInputValue?: string
  onGlobalFilterInputChange?: (value: string) => void
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  /** Merged into initial column visibility for uncontrolled mode. */
  initialColumnVisibility?: VisibilityState
  /** Full-row Zod validation after column normalize. */
  zodRowSchema?: z.ZodType<TRow>
  /** React Hook Form instance for row edit mode (dual-synced with drafts). */
  rowForm?: UseFormReturn<TRow>
  /** Simulated server request in progress (non-blocking overlay). */
  isFetching?: boolean
  /** Error banner (e.g. simulated fetch failure). */
  error?: string | null
}
