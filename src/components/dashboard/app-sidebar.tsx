"use client"

import { CarFrontIcon, LayoutDashboardIcon, Table2Icon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/dashboard/table", label: "Inventory table", icon: Table2Icon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile, isMobile } = useSidebar()


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border/80 from-sidebar-primary/12 border-b bg-gradient-to-br to-transparent px-1 py-1 group-data-[collapsible=icon]:border-sidebar-border/60">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
          <div
            className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-sidebar-primary/25"
            aria-hidden
          >
            <CarFrontIcon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-sidebar-primary truncate text-sm font-semibold">
              Lot inventory
            </span>
            <span className="text-sidebar-foreground/65 truncate text-xs font-medium tracking-wide uppercase">
              Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      onClick={() => {
                        router.push(item.href)
                        if (isMobile) {
                          setTimeout(() => setOpenMobile(false), 50)
                        }
                      }}
                      isActive={active}
                      className={cn(active && "font-medium")}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
