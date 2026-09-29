"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ADMIN_SECTIONS, findAdminFolder, findAdminSection } from "@/constants/admin-navigation"
import { ar } from "@/messages/ar"

/** The sub-page tail after a section: "/new" → إضافة, "/<id>/edit" → تعديل. */
function subPageLabel(pathname: string, sectionHref: string): string | null {
  const rest = pathname.slice(sectionHref.length)
  if (rest === "/new") return ar.admin.crumbs.new
  if (/^\/[^/]+\/edit$/.test(rest)) return ar.admin.crumbs.edit
  return null
}

/**
 * لوحة التحكم › [folder ›] <section> [› إضافة|تعديل], from the ADMIN_SECTIONS
 * registry — e.g. لوحة التحكم › الماركات › تعديل. Folders are plain text
 * (not pages); the section becomes a link when a sub-page follows it. On
 * narrow screens only the last crumb shows.
 */
export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const section = findAdminSection(pathname)
  const home = ADMIN_SECTIONS.dashboard

  if (!section || section.key === "dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{home.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const folder = findAdminFolder(section.key)
  const subPage = subPageLabel(pathname, section.href)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink render={<Link href={home.href} />}>{home.title}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:inline-flex" />
        {folder && (
          <>
            <BreadcrumbItem className="hidden sm:inline-flex">{folder.title}</BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
          </>
        )}
        {subPage ? (
          <>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink render={<Link href={section.href} />}>{section.title}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem>
              <BreadcrumbPage>{subPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>{section.title}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
