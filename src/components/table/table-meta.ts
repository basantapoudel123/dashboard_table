import type { EditTarget } from "./types"

/** Passed through `table.options.meta` for action cells and extensions. */
export type EditableTableMeta<TRow extends Record<string, unknown>> = {
  getRowId: (row: TRow) => string
  editTarget: EditTarget | null
  beginRowEdit: (row: TRow) => void
  cancelEdit: () => void
  saveRow: (rowId: string) => void
  isRowEditing: (rowId: string) => boolean
  onDelete?: (row: TRow) => void
}
