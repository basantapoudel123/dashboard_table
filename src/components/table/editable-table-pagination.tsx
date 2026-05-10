"use client"

import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

type PaginationProps<TRow> = {
  table: Table<TRow>
  pageIndex: number
  pageCount: number
}

export function EditableTablePagination<TRow>(props: PaginationProps<TRow>) {
  const { table, pageIndex, pageCount } = props
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-muted-foreground text-sm">
        Page {pageIndex + 1} of {Math.max(pageCount, 1)} —{" "}
        {table.getFilteredRowModel().rows.length} row(s)
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
