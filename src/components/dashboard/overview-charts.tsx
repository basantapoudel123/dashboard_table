"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { BodyStyleDatum } from "@/lib/dashboard-stats"

const BRAND = "#2387d8"
const BRAND_SOFT = "rgba(35, 135, 216, 0.12)"

type Props = {
  cumulative: { label: string; fullDate: string; cumulative: number }[]
  bodyStyles: BodyStyleDatum[]
}

export function OverviewCharts({ cumulative, bodyStyles }: Props) {
  const fillId = React.useId().replace(/:/g, "")
  const denseAcquisition = cumulative.length > 10

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="border-border/70 flex flex-col gap-3 rounded-2xl border bg-card/60 p-4 shadow-inner ring-1 ring-primary/[0.06] backdrop-blur-sm lg:col-span-3 dark:bg-card/40">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Acquisition curve
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Cumulative vehicles on the lot by <code className="text-foreground/80">inStockSince</code>{" "}
            order — driven by your mock inventory.{" "}
            <span className="text-muted-foreground/90">Hover the chart for each exact date.</span>
          </p>
        </div>
        <div className="text-muted-foreground h-[280px] w-full text-xs">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={cumulative}
              margin={{ top: 8, right: 8, left: -12, bottom: 8 }}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                  <stop offset="55%" stopColor={BRAND} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 8"
                vertical={false}
                className="stroke-border/80"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 10 }}
                minTickGap={denseAcquisition ? 40 : 20}
                angle={denseAcquisition ? 0 : -12}
                textAnchor={denseAcquisition ? "middle" : "end"}
                height={denseAcquisition ? 32 : 44}
                dy={denseAcquisition ? 6 : 4}
              />
              <YAxis
                width={28}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid color-mix(in srgb, var(--border) 80%, transparent)",
                  background: "color-mix(in srgb, var(--card) 92%, transparent)",
                  backdropFilter: "blur(8px)",
                  fontSize: "12px",
                }}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as
                    | { fullDate?: string }
                    | undefined
                  return row?.fullDate ?? ""
                }}
                formatter={(value) => [`${value ?? ""} units`, "On lot"]}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={BRAND}
                strokeWidth={2.5}
                fill={`url(#${fillId})`}
                dot={denseAcquisition ? false : { r: 3, fill: BRAND, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: BRAND, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-border/70 flex flex-col gap-3 rounded-2xl border bg-card/60 p-4 shadow-inner ring-1 ring-primary/[0.06] backdrop-blur-sm lg:col-span-2 dark:bg-card/40">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Mix by body
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Counts from the same static dataset powering the table.
          </p>
        </div>
        <div className="text-muted-foreground h-[260px] w-full text-xs">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={bodyStyles}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="4 8"
                horizontal={false}
                className="stroke-border/80"
              />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={52}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: BRAND_SOFT }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid color-mix(in srgb, var(--border) 80%, transparent)",
                  background: "color-mix(in srgb, var(--card) 92%, transparent)",
                  backdropFilter: "blur(8px)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value ?? ""}`, "Vehicles"]}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={22}>
                {["#2387d8", "#3d9fdf", "#5cb3e8", "#7ec8f0"].map((fill, i) => (
                  <Cell key={i} fill={fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
