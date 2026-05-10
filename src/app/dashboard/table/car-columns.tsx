"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { PencilIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { EditableTableMeta } from "@/components/table/table-meta"
import type { Car } from "@/lib/mock-cars"
import {
  isValidUsPhone,
  normalizePhoneDigits,
  parsePlainUsdAmount,
} from "@/lib/formatters"
import { cn } from "@/lib/utils"

const BODY_OPTIONS = [
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Truck", value: "truck" },
  { label: "Coupe", value: "coupe" },
] as const

const MIN_MODEL_YEAR = 1980
const MAX_MODEL_YEAR = new Date().getFullYear() + 1

export function createCarColumns(): ColumnDef<Car, unknown>[] {
  return [
    {
      accessorKey: "model",
      header: "Model",
      size: 220,
      minSize: 120,
      maxSize: 480,
      meta: {
        editable: {
          fieldType: "text",
          validate: (value) => {
            const s = String(value ?? "").trim()
            if (s.length < 2) return "Model must be at least 2 characters."
            return undefined
          },
        },
        filterVariant: "text",
      },
      filterFn: (row, columnId, filterValue) => {
        const v = String(filterValue ?? "").toLowerCase()
        if (!v) return true
        return String(row.getValue(columnId)).toLowerCase().includes(v)
      },
    },
    {
      accessorKey: "bodyStyle",
      header: "Body",
      size: 120,
      minSize: 88,
      maxSize: 220,
      meta: {
        editable: {
          fieldType: "select",
          selectOptions: [...BODY_OPTIONS],
        },
        filterVariant: "select",
        filterOptions: [...BODY_OPTIONS],
      },
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return row.getValue(columnId) === filterValue
      },
    },
    {
      accessorKey: "modelYear",
      header: "Year",
      size: 96,
      minSize: 72,
      maxSize: 140,
      meta: {
        editable: {
          fieldType: "number",
          normalize: (v) => {
            const n = typeof v === "number" ? v : Number(v)
            return Number.isFinite(n) ? Math.round(n) : MIN_MODEL_YEAR
          },
          validate: (value) => {
            const n = typeof value === "number" ? value : Number(value)
            if (!Number.isFinite(n))
              return "Enter a valid model year."
            if (n < MIN_MODEL_YEAR || n > MAX_MODEL_YEAR)
              return `Year must be between ${MIN_MODEL_YEAR} and ${MAX_MODEL_YEAR}.`
            return undefined
          },
        },
      },
    },
    {
      accessorKey: "isElectric",
      header: "EV",
      size: 72,
      minSize: 56,
      maxSize: 120,
      meta: {
        editable: { fieldType: "switch" },
      },
    },
    {
      accessorKey: "inStockSince",
      header: "In stock",
      size: 140,
      minSize: 120,
      maxSize: 220,
      meta: {
        editable: { fieldType: "date" },
      },
    },
    {
      accessorKey: "dealerPhone",
      header: "Dealer line",
      size: 160,
      minSize: 128,
      maxSize: 240,
      meta: {
        editable: {
          fieldType: "phone",
          normalize: (v) => normalizePhoneDigits(String(v ?? "")),
          validate: (value) =>
            isValidUsPhone(String(value ?? ""))
              ? undefined
              : "Enter a valid 10-digit US phone number.",
        },
      },
    },
    {
      accessorKey: "msrp",
      header: "MSRP",
      size: 128,
      minSize: 88,
      maxSize: 200,
      meta: {
        editable: {
          fieldType: "currency",
          normalize: (v) => {
            if (typeof v === "number" && Number.isFinite(v)) {
              return Math.round(v * 100) / 100
            }
            const s = typeof v === "string" ? v.trim() : String(v ?? "")
            const n = parsePlainUsdAmount(s)
            return n != null && Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
          },
          validate: (value) => {
            if (typeof value === "number") {
              if (!Number.isFinite(value) || value <= 0) {
                return "MSRP must be a positive number."
              }
              return undefined
            }
            const s = typeof value === "string" ? value.trim() : String(value ?? "")
            if (s === "" || s === ".") {
              return "Enter a dollar amount."
            }
            const n = parsePlainUsdAmount(s)
            if (n == null || !Number.isFinite(n)) {
              return "Enter a valid amount using digits and one decimal point only."
            }
            if (n <= 0) {
              return "MSRP must be a positive number."
            }
            return undefined
          },
        },
      },
    },
    {
      accessorKey: "promoRatePct",
      header: "Promo %",
      size: 110,
      minSize: 88,
      maxSize: 160,
      meta: {
        editable: {
          fieldType: "percentage",
          normalize: (v) => {
            const n = typeof v === "number" ? v : Number(v)
            if (!Number.isFinite(n)) return 0
            return Math.min(100, Math.max(0, Math.round(n * 100) / 100))
          },
          validate: (value) => {
            const n = typeof value === "number" ? value : Number(value)
            if (!Number.isFinite(n) || n < 0 || n > 100)
              return "Enter a percentage between 0 and 100."
            return undefined
          },
        },
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      size: 200,
      minSize: 120,
      maxSize: 560,
      meta: {
        editable: { fieldType: "text" },
      },
    },
    {
      accessorKey: "certifiedPreOwned",
      header: "CPO",
      size: 80,
      minSize: 64,
      maxSize: 120,
      meta: {
        editable: { fieldType: "checkbox" },
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 168,
      minSize: 168,
      enableSorting: false,
      enableResizing: false,
      enableHiding: false,
      enableColumnFilter: false,
      cell: ({ row, table }) => {
        const meta = table.options.meta as EditableTableMeta<Car> | undefined
        if (!meta) return null
        const rid = meta.getRowId(row.original)
        const rowMode = meta.isRowEditing(rid)
        const cellMode =
          meta.editTarget?.kind === "cell" && meta.editTarget.rowId === rid
        const editing = rowMode || cellMode
        const label = row.original.model
        return (
          <div className="flex flex-wrap items-center gap-1">
            {!editing ? (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => meta.beginRowEdit(row.original)}
                aria-label={`Edit row ${label}`}
              >
                <PencilIcon className="size-3.5" />
                Edit
              </Button>
            ) : rowMode ? (
              <>
                <Button
                  type="button"
                  size="xs"
                  onClick={() => meta.saveRow(rid)}
                  aria-label={`Save edits for ${label}`}
                >
                  <SaveIcon className="size-3.5" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => meta.cancelEdit()}
                  aria-label={`Cancel edits for ${label}`}
                >
                  <XIcon className="size-3.5" />
                  Cancel
                </Button>
              </>
            ) : null}
            {!rowMode ? (
              <DeleteRowButton row={row.original} onDelete={meta.onDelete} />
            ) : null}
          </div>
        )
      },
    },
  ]
}

function DeleteRowButton(props: {
  row: Car
  onDelete?: (row: Car) => void
}) {
  const { row, onDelete } = props
  const [open, setOpen] = React.useState(false)

  if (!onDelete) {
    return (
      <Button type="button" variant="ghost" size="xs" disabled className="opacity-50">
        <Trash2Icon className="size-3.5" />
      </Button>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div className="contents">
        <Button
          type="button"
          variant="destructive"
          size="xs"
          className="gap-1"
          aria-label={`Delete ${row.model}`}
          onClick={() => setOpen(true)}
        >
          <Trash2Icon className="size-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <strong>{row.model}</strong> from the in-memory inventory. The
              demo does not persist deletes to a server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              onClick={() => {
                onDelete(row)
                setOpen(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  )
}
