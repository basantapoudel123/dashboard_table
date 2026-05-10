import Link from "next/link"

import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  buildBodyStyleBreakdown,
  buildCumulativeAcquisitionSeries,
  buildOverviewStats,
} from "@/lib/dashboard-stats"
import { INITIAL_CARS } from "@/lib/mock-cars"

export default function DashboardHomePage() {
  const stats = buildOverviewStats(INITIAL_CARS)
  const cumulative = buildCumulativeAcquisitionSeries(INITIAL_CARS)
  const bodyStyles = buildBodyStyleBreakdown(INITIAL_CARS)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <div className="space-y-2">
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          Welcome
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Overview
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Snapshot of the mock lot, plus charts derived from the same vehicle list used
          in the inventory table.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border-border/70 rounded-2xl border bg-card/70 px-4 py-4 shadow-sm ring-1 ring-primary/[0.06] backdrop-blur-sm dark:bg-card/45"
          >
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {s.label}
            </p>
            <p className="font-heading text-primary mt-1 text-2xl font-semibold tabular-nums">
              {s.value}
            </p>
            <p className="text-muted-foreground mt-2 text-xs leading-snug">{s.hint}</p>
          </div>
        ))}
      </div>

      <OverviewCharts cumulative={cumulative} bodyStyles={bodyStyles} />

      <Card className="border-border/80 overflow-hidden rounded-2xl border bg-card/80 shadow-lg shadow-primary/[0.06] ring-1 ring-primary/10 backdrop-blur-sm dark:bg-card/50 dark:shadow-primary/[0.04] dark:ring-primary/15">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl">Vehicle inventory table</CardTitle>
          <CardDescription className="text-pretty leading-relaxed">
            Built on TanStack Table v8, so we get inline edits, filters, sorting,
            resizable columns, and pagination. The rows are just a static list of cars
            just for the demo, but the table is reusable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button nativeButton={false} render={<Link href="/dashboard/table" />}>
            Open table
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
