"use client"

import * as React from "react"
import type { ColumnDef, Table } from "@tanstack/react-table"
import { flexRender } from "@tanstack/react-table"

import type { CurrencyDraftHints } from "@/components/currency-input"
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { getAccessorKey } from "./editable-data-table-helpers"
import { EditableControl, ReadValue } from "./editable-table-cell-editors"
import type { EditTarget } from "./types"

type BodyProps<TRow extends Record<string, unknown>> = {
  table: Table<TRow>
  editTarget: EditTarget | null
  fieldErrors: Record<string, Record<string, string | undefined>>
  mergedRow: (rowId: string) => TRow | undefined
  isRowEditing: (rowId: string) => boolean
  shouldShowEditor: (rowId: string, columnId: string, accessorKey?: string) => boolean
  beginCellEdit: (row: TRow, columnId: string) => void
  updateDraft: (
    rowId: string,
    key: keyof TRow & string,
    value: unknown,
    hints?: CurrencyDraftHints
  ) => void
  activeCellEditorRef: React.MutableRefObject<HTMLDivElement | null>
}

export function EditableDataTableBody<TRow extends Record<string, unknown>>(
  props: BodyProps<TRow>
) {
  const {
    table,
    editTarget,
    fieldErrors,
    mergedRow,
    isRowEditing,
    shouldShowEditor,
    beginCellEdit,
    updateDraft,
    activeCellEditorRef,
  } = props

  return (
    <TableBody>
      {table.getRowModel().rows.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={Math.max(1, table.getVisibleLeafColumns().length)}
            className="text-muted-foreground h-24 text-center"
          >
            No rows match the current filters.
          </TableCell>
        </TableRow>
      ) : (
        table.getRowModel().rows.map((row) => {
          const rid = row.id
          const editing = isRowEditing(rid) || editTarget?.rowId === rid
          return (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              className={cn(editing && "bg-muted/40")}
            >
              {row.getVisibleCells().map((cell) => {
                const col = cell.column
                const colId = col.id
                const def = col.columnDef
                const accessorKey = getAccessorKey(def as ColumnDef<TRow, unknown>)
                const meta = def.meta?.editable
                const err =
                  (fieldErrors[rid] &&
                    (fieldErrors[rid][String(accessorKey ?? colId)] ??
                      fieldErrors[rid][colId])) ||
                  undefined

                const committed = row.original
                const displayRow = mergedRow(rid) ?? committed
                const showEditor =
                  meta &&
                  meta.editable !== false &&
                  shouldShowEditor(rid, colId, accessorKey)

                const startCell = () => {
                  if (!meta || meta.editable === false) return
                  if (editTarget?.rowId === rid && editTarget.kind === "row") return
                  beginCellEdit(committed, colId)
                }

                const isActiveCellEdit =
                  editTarget?.kind === "cell" &&
                  editTarget.rowId === rid &&
                  (editTarget.columnId === colId ||
                    editTarget.columnId === String(accessorKey))

                return (
                  <TableCell
                    key={cell.id}
                    className="min-w-0 overflow-hidden text-ellipsis"
                    style={{
                      width: col.getSize(),
                      minWidth: col.getCanResize() ? col.getSize() : undefined,
                    }}
                  >
                    {def.id === "actions" ? (
                      flexRender(def.cell, cell.getContext())
                    ) : showEditor && meta && accessorKey ? (
                      <div
                        className="min-w-0"
                        ref={
                          isActiveCellEdit
                            ? (el) => {
                                activeCellEditorRef.current = el
                              }
                            : undefined
                        }
                      >
                        <EditableControl
                          rowId={rid}
                          accessorKey={accessorKey}
                          meta={meta}
                          row={displayRow}
                          error={err}
                          updateDraft={updateDraft}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={cn(
                          "hover:bg-muted/60 w-full rounded-md px-1 py-0.5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          meta &&
                            meta.editable !== false &&
                            "cursor-text underline-offset-2 hover:underline"
                        )}
                        onClick={() => startCell()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            startCell()
                          }
                        }}
                        tabIndex={meta && meta.editable !== false ? 0 : undefined}
                        aria-label={
                          meta && meta.editable !== false
                            ? `Edit ${String(accessorKey)}`
                            : undefined
                        }
                      >
                        <ReadValue
                          fieldType={meta?.fieldType ?? "text"}
                          value={
                            (accessorKey
                              ? displayRow[accessorKey]
                              : cell.getValue()) as never
                          }
                          options={meta?.selectOptions}
                        />
                      </button>
                    )}
                    {err ? (
                      <p className="text-destructive mt-1 text-xs" role="alert">
                        {err}
                      </p>
                    ) : null}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })
      )}
    </TableBody>
  )
}
