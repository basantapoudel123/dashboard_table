import type { Metadata } from "next"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Vehicle inventory workspace",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="border-border/70 bg-background/90 supports-backdrop-filter:bg-background/75 relative sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b px-4 shadow-sm shadow-black/[0.03] backdrop-blur-md dark:border-border/50 dark:shadow-black/30">
          <div
            className="from-primary/50 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r via-primary/20 to-transparent"
            aria-hidden
          />
          <SidebarTrigger aria-label="Open navigation menu" />
          <Separator orientation="vertical" className="h-6 opacity-70" />
          <span className="text-muted-foreground text-sm font-medium tracking-wide">
            Workspace
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
