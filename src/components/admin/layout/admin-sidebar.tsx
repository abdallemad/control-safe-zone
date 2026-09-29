"use client"

import { ChevronLeft, ShieldCheck, Store } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ADMIN_NAV,
  findAdminSection,
  type AdminFolder,
  type AdminSection,
} from "@/constants/admin-navigation"
import { ADMIN_ROUTES, ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"

const t = ar.admin.shell

/**
 * The admin sidebar — on the **right** (the start side in RTL). Collapses to
 * icons on desktop (state kept in the `sidebar_state` cookie, read by the
 * layout) and becomes a sheet from the right below `md`.
 */
export function AdminSidebar() {
  const pathname = usePathname()
  const activeKey = findAdminSection(pathname)?.key
  const { isMobile, setOpenMobile } = useSidebar()

  // On mobile the sidebar is a sheet: close it once a link is followed.
  const onNavigate = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar side="right" collapsible="icon" aria-label={t.sidebarLabel}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={ADMIN_ROUTES.dashboard} onClick={onNavigate} />}
              tooltip={{ children: ar.brand.name, side: "left" }}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" />
              </span>
              <span className="grid flex-1 text-start leading-tight">
                <span className="truncate font-bold">{ar.brand.name}</span>
                <span className="truncate text-xs text-muted-foreground">{t.title}</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {ADMIN_NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) =>
                  item.kind === "folder" ? (
                    <NavFolder
                      key={item.key}
                      folder={item}
                      activeKey={activeKey}
                      onNavigate={onNavigate}
                    />
                  ) : (
                    <NavSection
                      key={item.key}
                      section={item}
                      isActive={activeKey === item.key}
                      onNavigate={onNavigate}
                    />
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href={ROUTES.home} />}
              tooltip={{ children: t.backToStore, side: "left" }}
            >
              <Store />
              <span>{t.backToStore}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function NavSection({
  section,
  isActive,
  onNavigate,
}: {
  section: AdminSection
  isActive: boolean
  onNavigate: () => void
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={
          <Link
            href={section.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
          />
        }
        // Collapsed-mode tooltip: the sidebar is on the right, so the tooltip
        // opens towards the content (left).
        tooltip={{ children: section.title, side: "left" }}
      >
        <section.icon />
        <span>{section.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/**
 * A parent with children (الهاردوير). Expanded sidebar / mobile: a
 * collapsible sub-menu, open by default. Icon-collapsed desktop sidebar: the
 * sub-menu can't show, so the icon opens a dropdown of the children instead.
 */
function NavFolder({
  folder,
  activeKey,
  onNavigate,
}: {
  folder: AdminFolder
  activeKey: string | undefined
  onNavigate: () => void
}) {
  const { state, isMobile } = useSidebar()
  const containsActive = folder.items.some((s) => s.key === activeKey)

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton isActive={containsActive} aria-label={folder.title} />}
          >
            <folder.icon />
            <span>{folder.title}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="start" className="min-w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{folder.title}</DropdownMenuLabel>
              {folder.items.map((section) => (
                <DropdownMenuItem
                  key={section.key}
                  render={<Link href={section.href} />}
                  className={activeKey === section.key ? "bg-accent text-accent-foreground" : undefined}
                >
                  <section.icon />
                  {section.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible defaultOpen render={<SidebarMenuItem />}>
      <CollapsibleTrigger render={<SidebarMenuButton />}>
        <folder.icon />
        <span>{folder.title}</span>
        {/* Points "inwards" (left, in RTL) when closed; down when open.
            Keyed on the trigger's own aria-expanded — the reliable signal. */}
        <ChevronLeft className="ms-auto transition-[rotate] duration-200 [[aria-expanded=true]_&]:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {folder.items.map((section) => {
            const isActive = activeKey === section.key
            return (
              <SidebarMenuSubItem key={section.key}>
                <SidebarMenuSubButton
                  isActive={isActive}
                  render={
                    <Link
                      href={section.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                    />
                  }
                >
                  <section.icon />
                  <span>{section.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
