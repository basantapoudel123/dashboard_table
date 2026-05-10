"use client"

import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Columns3Icon } from "lucide-react"

type ToolbarProps<TRow> = {
  error: string | null | undefined
  table: Table<TRow>
  searchInputId: string
  searchInputValue: string
  onSearchChange: (value: string) => void
}

export function EditableTableToolbar<TRow>(props: ToolbarProps<TRow>) {
  const {
    error,
    table,
    searchInputId,
    searchInputValue,
    onSearchChange,
  } = props

  return (
    <>
      {error ? (
        <div
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md flex-1 space-y-1.5">
          <Label htmlFor={searchInputId}>Search</Label>
          <Input
            id={searchInputId}
            placeholder="Search models, body, notes, dealer line…"
            value={searchInputValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <Columns3Icon className="size-4" aria-hidden />
                Columns
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-medium">
                Visible columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((c) => c.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="text-sm capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(Boolean(v))}
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
