import { Metadata } from "next"

import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UsageOverview } from "@/components/dashboard/usage-overview"

export const metadata: Metadata = {
  title: "Dashboard | Medverus AI",
  description: "Your medical AI research dashboard with quick access to content sources and usage analytics.",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your medical AI research platform. Access curated content sources and track your usage.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Overview Cards */}
        <div className="lg:col-span-2">
          <DashboardOverview />
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          <UsageOverview />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        
        {/* Additional Info Panel */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Medical AI Sources</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Medverus AI - Curated medical content</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">PubMed - Biomedical literature</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Web Search - Trusted medical sites</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Your Documents - Private files</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Security & Compliance</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🛡️ HIPAA-compliant infrastructure</p>
              <p>🔒 End-to-end encryption</p>
              <p>📚 Evidence-based content</p>
              <p>⚕️ Medical professional focus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}