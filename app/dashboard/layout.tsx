import { Metadata } from "next"

import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export const metadata: Metadata = {
  title: "Dashboard | Medverus AI",
  description: "Access your medical AI research dashboard with curated content sources, PubMed integration, and document analysis.",
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-primary/2 via-background to-primary/8">
        <DashboardHeader />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}