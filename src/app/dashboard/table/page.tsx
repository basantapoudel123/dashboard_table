import type { Metadata } from "next"
import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import { CarsTableSection } from "./cars-table-section"

export const metadata: Metadata = {
  title: "Vehicle inventory",
  description:
    "A usable vehicle list: columns, sort, filter, search, and pagination. State in the URL, column prefs in the browser, Zod + RHF for edits, optimistic saves with demo rollback.",
}

export default function DashboardTablePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
      <div className="border-border/60 from-card/90 to-card/40 space-y-2 rounded-2xl border bg-gradient-to-br via-card/70 p-6 shadow-md shadow-primary/[0.05] ring-1 ring-primary/10 backdrop-blur-sm dark:from-card/40 dark:via-card/25 dark:to-card/15 dark:ring-primary/15">
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          Inventory
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Vehicle inventory
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          A vehicle list you can actually use. Hide columns, sort, filter, search, and
          paginate. Most of that saves to the URL, so refreshes and shared links keep your
          view. Your column preferences stick around in your browser. Edit a row? Zod and
          React Hook Form handle validation. Saves are optimistic with the occasional fake
          failure so you can see a rollback. Toggle light or dark mode from the header
          anytime.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-full max-w-md" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        <CarsTableSection />
      </Suspense>
    </div>
  )
}
