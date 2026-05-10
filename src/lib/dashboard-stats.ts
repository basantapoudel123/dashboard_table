import type { Car } from "@/lib/mock-cars"

export type OverviewStat = {
  label: string
  value: string
  hint: string
}

export function buildOverviewStats(cars: Car[]): OverviewStat[] {
  const n = cars.length
  const ev = cars.filter((c) => c.isElectric).length
  const avg =
    n === 0
      ? 0
      : Math.round(cars.reduce((s, c) => s + c.msrp, 0) / n)
  const cpo = cars.filter((c) => c.certifiedPreOwned).length

  return [
    {
      label: "On lot",
      value: String(n),
      hint: "Active rows in the demo table",
    },
    {
      label: "EV share",
      value: n ? `${Math.round((ev / n) * 100)}%` : "—",
      hint: `${ev} electric / hybrid-style row(s)`,
    },
    {
      label: "Avg MSRP",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(avg),
      hint: "Mean sticker across inventory",
    },
    {
      label: "CPO",
      value: String(cpo),
      hint: "Certified pre-owned count",
    },
  ]
}

export type BodyStyleDatum = { label: string; count: number }

export function buildBodyStyleBreakdown(cars: Car[]): BodyStyleDatum[] {
  const styles = ["sedan", "suv", "truck", "coupe"] as const
  return styles.map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    count: cars.filter((c) => c.bodyStyle === s).length,
  }))
}

/** Cumulative units as acquisitions stack over calendar order. */
export function buildCumulativeAcquisitionSeries(cars: Car[]) {
  const sorted = [...cars].sort((a, b) =>
    a.inStockSince.localeCompare(b.inStockSince)
  )
  return sorted.map((c, i) => ({
    label: formatShortDate(c.inStockSince),
    fullDate: c.inStockSince,
    // cumulative: i + 1,
    cumulative : c.promoRatePct
  }))
}

function formatShortDate(iso: string) {
  const d = new Date(iso + "T12:00:00")
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
