import { Metadata } from "next"

import { MedicalQueryInterface } from "@/components/query/medical-query-interface"

export const metadata: Metadata = {
  title: "Medical Query | Medverus",
  description: "AI-powered medical research queries across curated content sources, PubMed, web search, and your documents.",
}

export default function QueryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Medical Query</h1>
        <p className="text-muted-foreground">
          Search across multiple medical content sources using AI-powered natural language queries.
        </p>
      </div>

      {/* Medical Query Interface */}
      <MedicalQueryInterface />
    </div>
  )
}