"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          "border-border bg-background text-muted-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] border opacity-60 dark:border-input dark:bg-input/30",
          className
        )}
        aria-hidden
      >
        <SunIcon className="size-4" aria-hidden />
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"
  const label = isDark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn("shrink-0", className)}
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <MoonIcon className="size-4" aria-hidden />
      ) : (
        <SunIcon className="size-4" aria-hidden />
      )}
    </Button>
  )
}
