"use client"

import { PerformanceDashboard } from "@/components/performance/performance-dashboard"

// Force dynamic rendering for client-side performance monitoring
export const dynamic = 'force-dynamic'

export default function PerformancePage() {
  return (
    <div className="container mx-auto p-6">
      <PerformanceDashboard />
    </div>
  )
}