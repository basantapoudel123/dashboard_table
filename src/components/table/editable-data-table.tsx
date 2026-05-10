"use client"

import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as React from "react"

import { Table } from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

import { EditableDataTableBody } from "./editable-data-table-body"
import { EditableDataTableHeader } from "./editable-data-table-header"
import { defaultGlobalFilter } from "./editable-data-table-helpers"
import type { EditableDataTableProps } from "./editable-data-table-props"
import { EditableTableOverlays } from "./editable-table-overlays"
import { EditableTablePagination } from "./editable-table-pagination"
import { EditableTableToolbar } from "./editable-table-toolbar"
import type { EditableTableMeta } from "./table-meta"
import { useEditableTableDrafts } from "./use-editable-table-drafts"

export type { EditableDataTableProps } from "./editable-data-table-props"

export function EditableDataTable<TRow extends Record<string, unknown>>(
  props: EditableDataTableProps<TRow>
) {
  const {
    data,
    columns,
    getRowId,
    globalSearchKeys,
    globalFilterFn,
    isLoading,
    pageSize = 8,
    onEdit,
    onSave,
    onDelete,
    globalFilterDebounceMs = 0,
    globalFilter: controlledGlobalFilter,
    onGlobalFilterChange,
    globalFilterInputValue,
    onGlobalFilterInputChange,
    sorting: controlledSorting,
    onSortingChange,
    columnFilters: controlledColumnFilters,
    onColumnFiltersChange,
    pagination: controlledPagination,
    onPaginationChange,
    columnVisibility: controlledColumnVisibility,
    onColumnVisibilityChange,
    initialColumnVisibility,
    zodRowSchema,
    rowForm,
    isFetching,
    error,
  } = props

  const [sorting, setSortingInternal] = React.useState<SortingState>([])
  const sortingState = controlledSorting ?? sorting
  const setSorting = onSortingChange ?? setSortingInternal

  const [columnFilters, setColumnFiltersInternal] =
    React.useState<ColumnFiltersState>([])
  const columnFiltersState = controlledColumnFilters ?? columnFilters
  const setColumnFilters = onColumnFiltersChange ?? setColumnFiltersInternal

  const [pagination, setPaginationInternal] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const paginationState = controlledPagination ?? pagination
  const setPagination = onPaginationChange ?? setPaginationInternal

  const [columnVisibility, setColumnVisibilityInternal] =
    React.useState<VisibilityState>(() => ({
      ...(initialColumnVisibility ?? {}),
    }))
  const columnVisibilityState = controlledColumnVisibility ?? columnVisibility
  const setColumnVisibility = onColumnVisibilityChange ?? setColumnVisibilityInternal

  const [globalFilterLocal, setGlobalFilterLocal] = React.useState("")
  const globalControlled = controlledGlobalFilter !== undefined
  const filterInputSplit =
    globalFilterInputValue !== undefined && onGlobalFilterInputChange != null

  const debouncedLocal = useDebouncedValue(
    globalFilterLocal,
    globalFilterDebounceMs > 0 ? globalFilterDebounceMs : 0
  )
  const tableGlobalFilter = globalControlled
    ? String(controlledGlobalFilter ?? "")
    : globalFilterDebounceMs > 0
      ? debouncedLocal
      : globalFilterLocal

  const setGlobalFilterInput = React.useCallback(
    (v: string) => {
      if (filterInputSplit) {
        onGlobalFilterInputChange(v)
        return
      }
      if (globalControlled) {
        onGlobalFilterChange?.(v)
      } else {
        setGlobalFilterLocal(v)
      }
    },
    [
      filterInputSplit,
      onGlobalFilterInputChange,
      globalControlled,
      onGlobalFilterChange,
    ]
  )

  const searchInputValue = filterInputSplit
    ? globalFilterInputValue
    : globalControlled
      ? String(controlledGlobalFilter ?? "")
      : globalFilterLocal

  React.useEffect(() => {
    if (controlledPagination != null) return
    setPaginationInternal((p) => ({ ...p, pageSize }))
  }, [pageSize, controlledPagination])

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const {
    editTarget,
    fieldErrors,
    mergedRow,
    beginRowEdit,
    beginCellEdit,
    cancelEdit,
    updateDraft,
    validateAndSave,
    activeCellEditorRef,
    isRowEditing,
    shouldShowEditor,
  } = useEditableTableDrafts({
    data,
    columns,
    getRowId,
    zodRowSchema,
    rowForm,
    onSave,
    onEdit,
  })

  // TanStack Table returns unstable function references; memoization is handled internally.
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sortingState,
      columnFilters: columnFiltersState,
      globalFilter: tableGlobalFilter,
      columnVisibility: columnVisibilityState,
      pagination: paginationState,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: globalFilterFn ?? defaultGlobalFilter(globalSearchKeys),
    getRowId,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    defaultColumn: {
      minSize: 64,
      maxSize: 640,
      size: 180,
      enableResizing: true,
    },
    meta: {
      getRowId,
      editTarget,
      beginRowEdit,
      cancelEdit,
      saveRow: (id) => {
        void validateAndSave(id)
      },
      isRowEditing,
      onDelete,
    } satisfies EditableTableMeta<TRow>,
  })

  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex

  return (
    <div className="flex flex-col gap-4">
      <EditableTableToolbar
        error={error}
        table={table}
        searchInputId="global-table-search"
        searchInputValue={searchInputValue}
        onSearchChange={setGlobalFilterInput}
      />

      <div className="border-border/80 relative rounded-2xl border bg-card/60 shadow-md shadow-primary/[0.04] ring-1 ring-primary/[0.06] backdrop-blur-sm dark:bg-card/40 dark:ring-primary/10">
        <EditableTableOverlays isFetching={isFetching} isLoading={isLoading} />
        <div className="min-w-0 overflow-x-auto rounded-2xl">
          <Table
            className={cn(
              "w-full table-fixed",
              table.getState().columnSizingInfo.isResizingColumn && "select-none"
            )}
            style={
              mounted
                ? { width: `max(100%, ${table.getTotalSize()}px)` }
                : undefined}
          >
            <EditableDataTableHeader table={table} />
            <EditableDataTableBody
              table={table}
              editTarget={editTarget}
              fieldErrors={fieldErrors}
              mergedRow={mergedRow}
              isRowEditing={isRowEditing}
              shouldShowEditor={shouldShowEditor}
              beginCellEdit={beginCellEdit}
              updateDraft={updateDraft}
              activeCellEditorRef={activeCellEditorRef}
            />
          </Table>
        </div>
      </div>

      <EditableTablePagination
        table={table}
        pageIndex={pageIndex}
        pageCount={pageCount}
      />
    </div>
  )
}
