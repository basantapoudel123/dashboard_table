"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { EditableDataTable } from "@/components/table/editable-data-table"
import { INITIAL_CARS, type Car } from "@/lib/mock-cars"
import { carRowSchema } from "@/lib/schemas/car-row"

import { createCarColumns } from "./car-columns"
import { useInventoryTableUrlState } from "./use-inventory-table-url-state"

const DEBUG_FORCE_SAVE_FAIL_KEY = "inventory:debug-force-save-fail"

export function CarsTableSection() {
  const columns = React.useMemo(() => createCarColumns(), [])

  const inventoryUrl = useInventoryTableUrlState({
    globalFilterDebounceMs: 280,
    defaultPageSize: 5,
  })

  const form = useForm<Car>({
    resolver: zodResolver(carRowSchema),
    defaultValues: INITIAL_CARS[0],
    mode: "onChange",
  })

  const [rows, setRows] = React.useState<Car[]>(INITIAL_CARS)
  const [loading, setLoading] = React.useState(true)
  const [isFetching, setIsFetching] = React.useState(false)
  const [fetchError, setFetchError] = React.useState<string | null>(null)

  const rollbackRef = React.useRef<Car[] | null>(null)
  const skipInitialFetchOverlay = React.useRef(true)

  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 420)
    return () => window.clearTimeout(t)
  }, [])

  const rowFingerprint = React.useMemo(() => rows.map((r) => r.id).join(","), [rows])

  React.useEffect(() => {
    if (loading) return
    if (skipInitialFetchOverlay.current) {
      skipInitialFetchOverlay.current = false
      return
    }
    queueMicrotask(() => setIsFetching(true))
    const t = window.setTimeout(() => {
      setIsFetching(false)
      if (Math.random() < 0.05) {
        setFetchError("Simulated server hiccup — adjust filters or retry.")
        window.setTimeout(() => setFetchError(null), 4000)
      }
    }, 380)
    return () => window.clearTimeout(t)
  }, [loading, rowFingerprint])

  const handleSave = React.useCallback(
    (row: Car) => {
      rollbackRef.current = rows
      setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)))
      toast.loading("Saving vehicle…", { id: "save-vehicle" })
      window.setTimeout(() => {
        let forceFail = false
        try {
          if (window.sessionStorage.getItem(DEBUG_FORCE_SAVE_FAIL_KEY) === "1") {
            forceFail = true
            window.sessionStorage.removeItem(DEBUG_FORCE_SAVE_FAIL_KEY)
          }
        } catch {
          /* storage unavailable */
        }
        if (forceFail || Math.random() < 0.1) {
          if (rollbackRef.current) setRows(rollbackRef.current)
          toast.error("Failed to update vehicle. Changes were rolled back.", {
            id: "save-vehicle",
          })
          return
        }
        toast.success("Vehicle saved.", { id: "save-vehicle" })
        form.reset(row)
      }, 520)
    },
    [rows, form]
  )

  return (
    <EditableDataTable<Car>
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      globalSearchKeys={[
        "model",
        "bodyStyle",
        "notes",
        "dealerPhone",
        "modelYear",
        "msrp",
      ]}
      isLoading={loading}
      pageSize={5}
      globalFilterDebounceMs={280}
      globalFilter={inventoryUrl.globalFilter}
      globalFilterInputValue={inventoryUrl.globalFilterInputValue}
      onGlobalFilterInputChange={inventoryUrl.onGlobalFilterInputChange}
      sorting={inventoryUrl.sorting}
      onSortingChange={inventoryUrl.setSorting}
      columnFilters={inventoryUrl.columnFilters}
      onColumnFiltersChange={inventoryUrl.setColumnFilters}
      pagination={inventoryUrl.pagination}
      onPaginationChange={inventoryUrl.setPagination}
      columnVisibility={inventoryUrl.columnVisibility}
      onColumnVisibilityChange={inventoryUrl.setColumnVisibility}
      zodRowSchema={carRowSchema}
      rowForm={form}
      isFetching={isFetching}
      error={fetchError}
      onEdit={({ row, mode }) => {
        if (mode === "row") form.reset(row)
      }}
      onSave={handleSave}
      onDelete={(row) => {
        setRows((prev) => prev.filter((r) => r.id !== row.id))
        toast.info(`${row.model} removed from inventory.`)
      }}
    />
  )
}
