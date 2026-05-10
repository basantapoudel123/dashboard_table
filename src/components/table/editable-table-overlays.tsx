"use client"

import { Loader2Icon } from "lucide-react"

type OverlaysProps = {
  isFetching?: boolean
  isLoading?: boolean
}

export function EditableTableOverlays(props: OverlaysProps) {
  const { isFetching, isLoading } = props

  if (isLoading) {
    return (
      <div
        className="from-primary/18 via-primary/8 to-background/55 absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-primary/25 backdrop-blur-md backdrop-saturate-50"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2Icon
          className="text-primary size-8 animate-spin drop-shadow-sm"
          aria-hidden
        />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (isFetching) {
    return (
      <div
        className="bg-background/60 absolute inset-0 z-[5] flex items-center justify-center rounded-2xl backdrop-blur-[1px]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  return null
}
