"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import type { CurrencyDraftHints } from "@/components/currency-input"
import { zodIssuesToFieldMap } from "@/lib/zod-field-errors"

import {
  collectEditableMeta,
  getAccessorKey,
  mapReactHookFormErrors,
} from "./editable-data-table-helpers"
import type { EditTarget } from "./types"

export function useEditableTableDrafts<TRow extends Record<string, unknown>>(params: {
  data: TRow[]
  columns: ColumnDef<TRow, unknown>[]
  getRowId: (row: TRow) => string
  zodRowSchema?: z.ZodType<TRow>
  rowForm?: UseFormReturn<TRow>
  onSave?: (row: TRow) => void
  onEdit?: (payload: {
    row: TRow
    mode: "row" | "cell"
    columnId?: string
  }) => void
}) {
  const { data, columns, getRowId, zodRowSchema, rowForm, onSave, onEdit } = params

  const editTargetRef = React.useRef<EditTarget | null>(null)
  const rowFormRef = React.useRef(rowForm)

  const [editTarget, setEditTarget] = React.useState<EditTarget | null>(null)
  const [drafts, setDrafts] = React.useState<Record<string, Partial<TRow>>>({})
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, Record<string, string | undefined>>
  >({})

  const committedById = React.useMemo(() => {
    const m = new Map<string, TRow>()
    for (const row of data) m.set(getRowId(row), row)
    return m
  }, [data, getRowId])

  const draftsRef = React.useRef(drafts)

  const committedRef = React.useRef(committedById)

  const activeCellEditorRef = React.useRef<HTMLDivElement | null>(null)

  /* eslint-disable react-hooks/refs -- keep latest values for callbacks without stale closures */
  rowFormRef.current = rowForm
  editTargetRef.current = editTarget
  draftsRef.current = drafts
  committedRef.current = committedById
  /* eslint-enable react-hooks/refs */

  const mergedRow = React.useCallback(
    (rowId: string): TRow | undefined => {
      const base = committedById.get(rowId)
      if (!base) return undefined
      const d = drafts[rowId]
      if (!d) return base
      return { ...base, ...d }
    },
    [committedById, drafts]
  )

  const beginRowEdit = React.useCallback(
    (row: TRow) => {
      const id = getRowId(row)
      setEditTarget({ kind: "row", rowId: id })
      setDrafts({ [id]: { ...row } })
      setFieldErrors({ [id]: {} })
      rowFormRef.current?.reset(row as never)
      onEdit?.({ row, mode: "row" })
    },
    [getRowId, onEdit]
  )

  const beginCellEdit = React.useCallback(
    (row: TRow, columnId: string) => {
      const id = getRowId(row)
      setEditTarget({ kind: "cell", rowId: id, columnId })
      setDrafts({ [id]: { ...row } })
      setFieldErrors({ [id]: {} })
      onEdit?.({ row, mode: "cell", columnId })
    },
    [getRowId, onEdit]
  )

  const cancelEdit = React.useCallback(() => {
    if (!editTarget) return
    const id = editTarget.rowId
    setEditTarget(null)
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [editTarget])

  const updateDraft = React.useCallback(
    (
      rowId: string,
      key: keyof TRow & string,
      value: unknown,
      hints?: CurrencyDraftHints
    ) => {
      const prev = draftsRef.current
      const nextRowDraft = { ...(prev[rowId] ?? {}), [key]: value } as Partial<TRow>
      const nextDrafts = { ...prev, [rowId]: nextRowDraft }
      draftsRef.current = nextDrafts
      setDrafts(nextDrafts)

      const et = editTargetRef.current
      if (rowFormRef.current && et?.kind === "row" && et.rowId === rowId) {
        rowFormRef.current.setValue(key as never, value as never, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }

      const base = committedRef.current.get(rowId)
      if (!base) return

      const merged = { ...base, ...nextRowDraft } as TRow
      const col = columns.find((c) => {
        const ak = getAccessorKey(c)
        return ak === key || c.id === key
      })
      const meta = col?.meta?.editable
      const validatedMsg = meta?.validate?.(value, merged)
      const finalMsg = hints?.invalidCharset
        ? "Only digits and one decimal point are allowed."
        : (validatedMsg ?? undefined)

      setFieldErrors((prevErr) => ({
        ...prevErr,
        [rowId]: {
          ...(prevErr[rowId] ?? {}),
          [String(key)]: finalMsg,
        },
      }))
    },
    [columns]
  )

  const validateAndSave = React.useCallback(
    async (rowId: string) => {
      const row = mergedRow(rowId)
      if (!row) return
      const defs = collectEditableMeta(columns)

      if (
        rowFormRef.current &&
        editTargetRef.current?.kind === "row" &&
        editTargetRef.current.rowId === rowId
      ) {
        const ok = await rowFormRef.current.trigger()
        if (!ok) {
          const mapped = mapReactHookFormErrors(rowFormRef.current.formState.errors)
          setFieldErrors((prev) => ({ ...prev, [rowId]: mapped }))
          toast.error("Fix validation errors before saving.")
          return
        }
      }

      const errs: Record<string, string | undefined> = {}
      let nextRow = { ...row } as TRow

      for (const { key, meta } of defs) {
        const raw = (drafts[rowId]?.[key] ?? row[key]) as unknown
        if (meta.validate) {
          const msg = meta.validate(raw, row)
          if (msg) errs[String(key)] = msg
        }
        if (meta.normalize) {
          try {
            nextRow = {
              ...nextRow,
              [key]: meta.normalize(raw) as TRow[keyof TRow],
            }
          } catch {
            errs[String(key)] = errs[String(key)] ?? "Invalid value"
          }
        }
      }

      if (Object.values(errs).some(Boolean)) {
        setFieldErrors((prev) => ({ ...prev, [rowId]: errs }))
        toast.error("Fix validation errors before saving.")
        return
      }

      if (zodRowSchema) {
        const zr = zodRowSchema.safeParse(nextRow)
        if (!zr.success) {
          const zMap = zodIssuesToFieldMap(zr.error.issues)
          setFieldErrors((prev) => ({ ...prev, [rowId]: zMap }))
          toast.error("Fix validation errors before saving.")
          return
        }
        nextRow = zr.data as TRow
      }

      onSave?.(nextRow)
      rowFormRef.current?.reset(nextRow as never)
      setEditTarget(null)
      setDrafts((prev) => {
        const n = { ...prev }
        delete n[rowId]
        return n
      })
      setFieldErrors((prev) => {
        const n = { ...prev }
        delete n[rowId]
        return n
      })
    },
    [columns, drafts, mergedRow, onSave, zodRowSchema]
  )

  React.useEffect(() => {
    if (editTarget?.kind !== "cell") {
      activeCellEditorRef.current = null
      return
    }
    const rowId = editTarget.rowId

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target
      if (target instanceof Element && target.closest('[data-slot="select-content"]')) {
        return
      }
      const el = activeCellEditorRef.current
      if (!el || !(target instanceof Node)) return
      if (el.contains(target)) return
      void validateAndSave(rowId)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        cancelEdit()
        return
      }
      if (e.key !== "Enter" || e.shiftKey) return
      const ae = document.activeElement
      if (!(ae instanceof HTMLInputElement) && !(ae instanceof HTMLTextAreaElement)) {
        return
      }
      e.preventDefault()
      void validateAndSave(rowId)
    }

    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKeyDown, true)
    }
  }, [editTarget, validateAndSave, cancelEdit])

  const isRowEditing = React.useCallback(
    (rowId: string) => editTarget?.kind === "row" && editTarget.rowId === rowId,
    [editTarget]
  )

  const shouldShowEditor = React.useCallback(
    (rowId: string, columnId: string, accessorKey?: string) => {
      if (!editTarget || editTarget.rowId !== rowId) return false
      if (editTarget.kind === "row") return true
      return editTarget.columnId === columnId || editTarget.columnId === accessorKey
    },
    [editTarget]
  )

  return {
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
  }
}
