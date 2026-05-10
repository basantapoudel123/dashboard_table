import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"

const COLVIS_KEY = "inventory-table:columnVisibility:v1"

export type InventoryUrlState = {
  q: string
  pageIndex: number
  pageSize: number
  sorting: SortingState
  columnFilters: ColumnFiltersState
}

export function readColumnVisibilityFromStorage(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(COLVIS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

export function writeColumnVisibilityToStorage(vis: Record<string, boolean>) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(COLVIS_KEY, JSON.stringify(vis))
  } catch {
    /* ignore quota */
  }
}

export function parseInventorySearchParams(
  searchParams: URLSearchParams
): Partial<InventoryUrlState> {
  const q = searchParams.get("q") ?? ""
  const pageRaw = searchParams.get("page")
  const psRaw = searchParams.get("ps")
  const sortRaw = searchParams.get("sort")
  const body = searchParams.get("body") ?? undefined

  const pageIndex = Math.max(0, (pageRaw ? Number.parseInt(pageRaw, 10) : 1) - 1)
  const pageSize = psRaw ? Math.min(50, Math.max(3, Number.parseInt(psRaw, 10))) : undefined

  let sorting: SortingState = []
  if (sortRaw) {
    const [id, dir] = sortRaw.split(":")
    if (id && (dir === "asc" || dir === "desc")) {
      sorting = [{ id, desc: dir === "desc" }]
    }
  }

  const columnFilters: ColumnFiltersState = []
  if (body && body !== "all") {
    columnFilters.push({ id: "bodyStyle", value: body })
  }

  return {
    q,
    pageIndex: Number.isFinite(pageIndex) ? pageIndex : 0,
    pageSize: pageSize ?? undefined,
    sorting,
    columnFilters,
  }
}

export function buildInventorySearchParams(args: {
  q: string
  pageIndex: number
  pageSize: number
  sorting: SortingState
  bodyFilter: string | undefined
}): string {
  const p = new URLSearchParams()
  if (args.q.trim()) p.set("q", args.q.trim())
  if (args.pageIndex > 0) p.set("page", String(args.pageIndex + 1))
  if (args.pageSize && args.pageSize !== 5) p.set("ps", String(args.pageSize))
  if (args.sorting[0]) {
    p.set("sort", `${args.sorting[0].id}:${args.sorting[0].desc ? "desc" : "asc"}`)
  }
  if (args.bodyFilter && args.bodyFilter !== "all") {
    p.set("body", args.bodyFilter)
  }
  return p.toString()
}
