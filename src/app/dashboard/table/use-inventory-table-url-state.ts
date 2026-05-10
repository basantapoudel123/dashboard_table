"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"

import { useDebouncedValue } from "@/hooks/use-debounced-value"

import {
  buildInventorySearchParams,
  parseInventorySearchParams,
  readColumnVisibilityFromStorage,
  writeColumnVisibilityToStorage,
} from "./inventory-url"

export type UseInventoryTableUrlStateOptions = {
  /** Debounce applied to the value passed as `globalFilter` to the table (ms). */
  globalFilterDebounceMs: number
  defaultPageSize: number
}

/**
 * Inventory-route URL + localStorage sync for {@link EditableDataTable}.
 * Keeps demo-specific query keys out of the reusable table component.
 */
export function useInventoryTableUrlState(options: UseInventoryTableUrlStateOptions) {
  const { globalFilterDebounceMs, defaultPageSize } = options
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [globalFilterDraft, setGlobalFilterDraft] = React.useState("")
  const debouncedGlobalFilter = useDebouncedValue(
    globalFilterDraft,
    globalFilterDebounceMs > 0 ? globalFilterDebounceMs : 0
  )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    readColumnVisibilityFromStorage()
  )

  const inventoryHydrated = React.useRef(false)
  React.useEffect(() => {
    if (inventoryHydrated.current) return
    inventoryHydrated.current = true
    const p = parseInventorySearchParams(
      new URLSearchParams(searchParams.toString())
    )
    queueMicrotask(() => {
      if (p.q != null) setGlobalFilterDraft(p.q)
      if (p.sorting?.length) setSorting(p.sorting)
      if (p.pageIndex != null) {
        setPagination((prev) => ({ ...prev, pageIndex: p.pageIndex! }))
      }
      if (p.pageSize != null) {
        setPagination((prev) => ({ ...prev, pageSize: p.pageSize! }))
      }
      if (p.columnFilters?.length) setColumnFilters(p.columnFilters)
    })
  }, [searchParams])

  const urlWritePrimed = React.useRef(false)
  React.useEffect(() => {
    if (!urlWritePrimed.current) {
      urlWritePrimed.current = true
      return
    }
    const bodyFilter = columnFilters.find((f) => f.id === "bodyStyle")?.value as
      | string
      | undefined
    const qs = buildInventorySearchParams({
      q: debouncedGlobalFilter,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      bodyFilter: bodyFilter ? String(bodyFilter) : undefined,
    })
    const nextUrl = qs ? `${pathname}?${qs}` : pathname
    const cur = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    if (nextUrl === cur) return
    router.replace(nextUrl, { scroll: false })
  }, [
    pathname,
    router,
    searchParams,
    sorting,
    columnFilters,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedGlobalFilter,
  ])

  React.useEffect(() => {
    writeColumnVisibilityToStorage(columnVisibility as Record<string, boolean>)
  }, [columnVisibility])

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    columnVisibility,
    setColumnVisibility,
    globalFilter: debouncedGlobalFilter,
    globalFilterInputValue: globalFilterDraft,
    onGlobalFilterInputChange: setGlobalFilterDraft,
  }
}
