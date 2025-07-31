"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Search, 
  BarChart3, 
  FileText, 
  Settings, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Home,
  Upload,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_ROUTES } from "@/lib/constants/medical"

const navigationItems = [
  {
    title: "Overview",
    href: MEDICAL_ROUTES.protected.dashboard,
    icon: Home,
    description: "Dashboard overview and quick access"
  },
  {
    title: "Medical Query",
    href: MEDICAL_ROUTES.protected.query,
    icon: Search,
    description: "AI-powered medical research queries"
  },
  {
    title: "Usage & Analytics", 
    href: MEDICAL_ROUTES.protected.usage,
    icon: BarChart3,
    description: "Track your usage and analytics"
  },
  {
    title: "My Documents",
    href: MEDICAL_ROUTES.protected.files,
    icon: FileText,
    description: "Manage uploaded medical documents"
  },
  {
    title: "File Upload",
    href: "/dashboard/upload",
    icon: Upload,
    description: "Upload medical documents for analysis"
  },
  {
    title: "Settings",
    href: MEDICAL_ROUTES.protected.settings,
    icon: Settings,
    description: "Account and application settings"
  },
]

const adminNavigationItems = [
  {
    title: "Admin Dashboard",
    href: MEDICAL_ROUTES.admin.dashboard,
    icon: Shield,
    description: "Administrative overview and controls"
  },
  {
    title: "User Management",
    href: MEDICAL_ROUTES.admin.users,
    icon: Activity,
    description: "Manage users and permissions"
  },
  {
    title: "Voucher Management",
    href: MEDICAL_ROUTES.admin.vouchers,
    icon: FileText,
    description: "Create and manage tier vouchers"
  },
  {
    title: "System Analytics",
    href: MEDICAL_ROUTES.admin.analytics,
    icon: BarChart3,
    description: "System-wide usage and performance analytics"
  },
]

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.is_admin || false

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 z-10 rounded-full border bg-background p-1.5 shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 pt-8">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Medical Platform
            </p>
          )}
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-medical-blue text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="space-y-1 pt-6">
            {!isCollapsed && (
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Administration
              </p>
            )}
            {adminNavigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* Medical Disclaimer Footer */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <Shield className="inline h-3 w-3 mr-1" />
              For educational purposes only. Not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}