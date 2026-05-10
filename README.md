# Lot inventory dashboard (take-home)

Next.js **16** app with a reusable **TanStack Table v8** grid, **ShadCN** (Base UI primitives + **Tailwind v4**), inline editing, client-side filtering/sorting/pagination, column resizing, **Zod** + **React Hook Form** for row validation, **Sonner** toasts (bottom-left), and **next-themes** (header toggle). Mock vehicle data lives in the repo; nothing hits a real API.

## Quick start

```bash
npm install
npm run dev
```

- [http://localhost:3000](http://localhost:3000) redirects to **`/dashboard`** (overview + charts).
- **`/dashboard/table`** — editable inventory grid with URL-backed view state and local column visibility.

```bash
npm run build   # production build + TypeScript
npm run lint    # ESLint
```

## Features

| Area | What you get |
|------|----------------|
| **Table** | Global search (debounced on the demo page), per-column filters (`meta.filterVariant`), sorting, pagination, resizable columns, column visibility menu |
| **Editing** | Cell edit (click field → blur or **Enter** commits) and row edit (**Actions → Edit** → **Save** / **Cancel**). One draft row at a time |
| **Validation** | Per-column `validate` / `normalize` in column meta; optional full-row **`zodRowSchema`**; row mode dual-syncs with **React Hook Form** |
| **Demo save** | **Optimistic** row update, ~520ms fake latency, **`Math.random() < 0.1`** simulated failure with rollback + toast. See [Forcing a failed save](#forcing-a-failed-save) |
| **Demo fetch** | After row data changes, a short **spinner** overlay can appear; rarely a banner “simulated server hiccup” |
| **Initial load** | Short **loading** overlay (blurred primary-tint panel + spinner), then the grid |
| **Persistence (inventory route only)** | Sort, filters, pagination, and debounced search sync to the **URL**. Column visibility syncs to **`localStorage`** |
| **Theme** | Light / dark / system from the dashboard header (`ThemeToggle` defers the real button until after mount to avoid hydration mismatches) |

## Routes

| Path | Purpose |
|------|---------|
| `/` | Redirect to `/dashboard` |
| `/dashboard` | KPI cards, charts, link card to the table |
| `/dashboard/table` | `CarsTableSection` + `EditableDataTable` |

## Data

Static **`Car[]`** in **`src/lib/mock-cars.ts`**. Swap in `fetch` later by keeping the same row shape and optionally moving sort/filter/page to the server.

## URL and storage (inventory table)

Implemented in **`src/app/dashboard/table/inventory-url.ts`** and wired through **`useInventoryTableUrlState`** in **`cars-table-section.tsx`**. The reusable **`EditableDataTable`** has **no** inventory-specific imports; the parent owns controlled state and URL writes.

### Query string (written when values differ from defaults)

| Param | Meaning |
|-------|---------|
| `q` | Global search string (debounced value) |
| `page` | 1-based page index (omitted when page 1) |
| `ps` | Page size (omitted when **5**, the demo default; clamped 3–50 when present) |
| `sort` | `${columnId}:asc` or `:desc` (first sort only) |
| `body` | Body style filter when not `all` (maps to column filter `bodyStyle`) |

### `localStorage`

| Key | Value |
|-----|--------|
| `inventory-table:columnVisibility:v1` | JSON map of column id → visible |

## Architecture

### Table package (`src/components/table/`)

| File | Role |
|------|------|
| **`editable-data-table.tsx`** | Composes TanStack table, toolbar, header/body, pagination, overlays; optional **split global filter** (`globalFilter` + `globalFilterInputValue` / `onGlobalFilterInputChange`) when the parent debounces search |
| **`editable-data-table-props.ts`** | Public props type |
| **`editable-data-table-helpers.ts`** | Default global filter, accessor helpers, RHF error map |
| **`editable-data-table-header.tsx`** | Sort UI, resize handles, filter row |
| **`editable-data-table-body.tsx`** | Cells, read vs edit, actions column render |
| **`editable-table-cell-editors.tsx`** | `EditableControl`, `ReadValue`, percentage input |
| **`editable-table-toolbar.tsx`** | Search, column picker, error banner |
| **`editable-table-pagination.tsx`** | Page summary + prev/next |
| **`editable-table-overlays.tsx`** | Loading (primary blur + spinner) vs fetching (lighter overlay); **loading wins** if both were ever true |
| **`use-editable-table-drafts.ts`** | Draft state, validation/save, cell pointer/keyboard commit |
| **`types.ts`**, **`table-meta.ts`** | Column meta and `table.options.meta` typing |
| **`src/types/tanstack-table.d.ts`** | Augments TanStack `ColumnMeta` / `TableMeta` |

### Inventory app (`src/app/dashboard/table/`)

| File | Role |
|------|------|
| **`cars-table-section.tsx`** | Mock loading, fetch overlay, optimistic `onSave` + rollback, `useInventoryTableUrlState`, Zod + RHF wiring |
| **`use-inventory-table-url-state.ts`** | Hydrate from URL, `router.replace` on changes, debounced `q`, column visibility persistence |
| **`inventory-url.ts`** | Parse/build query string, read/write column visibility storage |
| **`car-columns.tsx`** | `ColumnDef<Car>[]`, filters, actions (**Save** only in **row** edit mode) |

### Elsewhere

- **`src/lib/formatters.ts`** — phone, currency, percentage parse/format for display + edit
- **`src/lib/schemas/car-row.ts`** — Zod row schema
- **`src/components/dashboard/`** — sidebar shell, overview charts
- **`src/components/providers.tsx`** — `ThemeProvider`, `Toaster` position **bottom-left**
- **`src/components/theme-toggle.tsx`** — Inert placeholder until mounted, then real toggle (avoids hydration issues with `disabled`)

## Editing model (accurate)

1. **View** — Read-only cells use **`ReadValue`** (and actions stay available).
2. **Cell edit** — Click an editable cell; **blur** or **Enter** (not Shift+Enter) runs save for that row. The actions column does **not** show Save/Cancel while only a cell is active.
3. **Row edit** — **Actions → Edit** opens a row draft; **Save** / **Cancel** appear. Save runs validators + optional Zod, then **`onSave`**.

## Forcing a failed save

Saves fail randomly **~10%** of the time. To demo rollback every time, in the browser console on **`/dashboard/table`**:

```js
sessionStorage.setItem("inventory:debug-force-save-fail", "1")
```

Then complete **one** save (row **Save** or cell blur/Enter). The next save consumes the flag and always fails with rollback. Set it again to repeat.

Implementation: **`DEBUG_FORCE_SAVE_FAIL_KEY`** in **`src/app/dashboard/table/cars-table-section.tsx`**.

## Tradeoffs

- **All client-side** — Pagination and filters run in memory. A large catalog would move these to the server.
- **Editable field switch** — Fast to extend; a registry of field components would scale further.
- **Inventory URL shape** — Demo-specific (`body`, default page size **5**). Other pages would use their own hook or controlled props, not `inventory-url.ts`.

## With more time (ideas)

- E2E tests (Playwright) for edit + URL round-trip
- Virtualized rows for big datasets
- Column resize persistence and CSV export
