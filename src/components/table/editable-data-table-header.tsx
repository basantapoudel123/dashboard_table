"use client"

import type { Table as TanStackTable } from "@tanstack/react-table"
import { flexRender } from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type HeaderProps<TRow> = {
  table: TanStackTable<TRow>
}

export function EditableDataTableHeader<TRow>(props: HeaderProps<TRow>) {
  const { table } = props
  return (
    <TableHeader>
      {table.getHeaderGroups().map((hg) => (
        <TableRow key={hg.id}>
          {hg.headers.map((header) => {
            const canSort = header.column.getCanSort()
            const sorted = header.column.getIsSorted()
            return (
              <TableHead
                key={header.id}
                className="relative min-w-0 overflow-hidden text-ellipsis"
                style={{
                  width: header.getSize(),
                  minWidth: header.column.getCanResize()
                    ? header.getSize()
                    : undefined,
                }}
                aria-sort={
                  sorted === "asc"
                    ? "ascending"
                    : sorted === "desc"
                      ? "descending"
                      : canSort
                        ? "none"
                        : undefined
                }
              >
                {header.isPlaceholder ? null : (
                  <div
                    className={cn(
                      "flex min-w-0 items-center gap-1",
                      header.column.getCanResize() && "pr-3"
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-left font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {sorted === "asc" ? (
                          <ChevronUpIcon className="size-4" aria-hidden />
                        ) : sorted === "desc" ? (
                          <ChevronDownIcon className="size-4" aria-hidden />
                        ) : (
                          <ChevronsUpDownIcon
                            className="text-muted-foreground size-4"
                            aria-hidden
                          />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </div>
                )}
                {header.column.getCanResize() ? (
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onDoubleClick={() => header.column.resetSize()}
                    className={cn(
                      "absolute inset-y-0 right-0 z-30 w-2 cursor-col-resize touch-none select-none border-l border-border",
                      "hover:border-foreground/30",
                      header.column.getIsResizing() && "border-foreground/40"
                    )}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Resize ${String(header.column.id)} column`}
                  />
                ) : null}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
      <TableRow className="hover:bg-transparent">
        {table.getHeaderGroups()[0]?.headers.map((header) => {
          const col = header.column
          const variant = col.columnDef.meta?.filterVariant
          const filterHeadStyle = {
            width: header.getSize(),
            minWidth: col.getCanResize() ? header.getSize() : undefined,
          }
          if (!variant) {
            return (
              <TableHead
                key={`f-${col.id}`}
                className="min-w-0 p-2"
                style={filterHeadStyle}
              />
            )
          }
          const opts = col.columnDef.meta?.filterOptions
          return (
            <TableHead
              key={`filter-${col.id}`}
              className="min-w-0 p-2"
              style={filterHeadStyle}
            >
              {variant === "select" && opts ? (
                <Select
                  value={
                    col.getFilterValue() == null || col.getFilterValue() === ""
                      ? "all"
                      : String(col.getFilterValue())
                  }
                  onValueChange={(v) => col.setFilterValue(v === "all" ? undefined : v)}
                >
                  <SelectTrigger size="sm" className="w-full min-w-0">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {opts.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="h-8"
                  placeholder="Filter…"
                  value={String(col.getFilterValue() ?? "")}
                  onChange={(e) => col.setFilterValue(e.target.value || undefined)}
                  aria-label={`Filter ${col.id}`}
                />
              )}
            </TableHead>
          )
        })}
      </TableRow>
    </TableHeader>
  )
}
