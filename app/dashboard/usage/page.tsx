import { Metadata } from "next"

import { UsageAnalytics } from "@/components/usage/usage-analytics"
import { TierManagement } from "@/components/usage/tier-management"
import { UsageHistory } from "@/components/usage/usage-history"
import { BillingInformation } from "@/components/usage/billing-information"

export const metadata: Metadata = {
  title: "Usage & Analytics | Medverus",
  description: "Track your medical AI usage, view analytics, and manage your tier subscription.",
}

export default function UsagePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Usage & Analytics</h1>
        <p className="text-muted-foreground">
          Monitor your medical AI usage across all content sources and track your tier limits.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <UsageAnalytics />
          <UsageHistory />
        </div>
        
        {/* Right Column - Management */}
        <div className="space-y-6">
          <TierManagement />
          <BillingInformation />
        </div>
      </div>
    </div>
  )
}