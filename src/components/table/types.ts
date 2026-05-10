export type EditableFieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "switch"
  | "date"
  | "phone"
  | "currency"
  | "percentage"

export type EditableColumnMeta<TRow> = {
  fieldType: EditableFieldType
  /** When false, cell stays read-only. */
  editable?: boolean
  selectOptions?: { label: string; value: string }[]
  validate?: (value: unknown, row: TRow) => string | undefined
  /** Applied on successful save before `onSave`. */
  normalize?: (value: unknown) => unknown
}

export type EditTarget =
  | { kind: "row"; rowId: string }
  | { kind: "cell"; rowId: string; columnId: string }
