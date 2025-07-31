"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MedicalQueryForm } from "./medical-query-form"
import { QueryResults } from "./query-results"
import { SourceSelector } from "./source-selector"
import { QueryHistory } from "./query-history"
import { UsageLimitsAlert } from "./usage-limits-alert"
import type { ContentSource, QueryResponse } from "@/types"
import { useUsageLimitsCheck } from "@/lib/api/hooks"

export function MedicalQueryInterface() {
  const [selectedSource, setSelectedSource] = useState<ContentSource>('medverus_ai')
  const [currentQuery, setCurrentQuery] = useState("")
  const [queryResults, setQueryResults] = useState<QueryResponse | null>(null)
  const [isQuerying, setIsQuerying] = useState(false)
  const { hasExceededLimits, isApproachingLimits } = useUsageLimitsCheck()

  const handleQuerySubmit = async (query: string, source: ContentSource, userPrompt?: string, maxResults?: number) => {
    setIsQuerying(true)
    setCurrentQuery(query)
    
    try {
      // This will be implemented with the actual API call
      // For now, we'll simulate the query process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock response - in real implementation this would come from the API
      const mockResponse: QueryResponse = {
        query_id: `query_${Date.now()}`,
        query,
        source,
        user_prompt: userPrompt,
        response: "This is a simulated response that would contain the AI-generated medical information based on your query.",
        results: [
          {
            id: "1",
            title: "Example Medical Result 1",
            content: "This would contain relevant medical content from the selected source.",
            source: "Medical Journal Example",
            citation: "Example, A. et al. (2024). Medical Study Title. Journal Name, 123(4), 567-890.",
            relevance_score: 0.95,
            metadata: {}
          }
        ],
        citations: ["Example, A. et al. (2024). Medical Study Title. Journal Name, 123(4), 567-890."],
        processing_time_ms: 1250,
        timestamp: new Date().toISOString(),
        safety_applied: true,
        content_filtered: false
      }
      
      setQueryResults(mockResponse)
    } catch (error) {
      console.error('Query failed:', error)
    } finally {
      setIsQuerying(false)
    }
  }

  const handleNewQuery = () => {
    setQueryResults(null)
    setCurrentQuery("")
  }

  return (
    <div className="space-y-6">
      {/* Usage Limits Alert */}
      {(hasExceededLimits || isApproachingLimits) && (
        <UsageLimitsAlert 
          hasExceeded={hasExceededLimits}
          isApproaching={isApproachingLimits}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Query Interface */}
        <div className="lg:col-span-3 space-y-6">
          {/* Source Selection */}
          <Card>
            <CardContent className="p-6">
              <SourceSelector
                selectedSource={selectedSource}
                onSourceChange={setSelectedSource}
                disabled={isQuerying}
              />
            </CardContent>
          </Card>

          {/* Query Form */}
          <Card>
            <CardContent className="p-6">
              <MedicalQueryForm
                selectedSource={selectedSource}
                onQuerySubmit={handleQuerySubmit}
                isLoading={isQuerying}
                disabled={hasExceededLimits}
              />
            </CardContent>
          </Card>

          {/* Query Results */}
          {(queryResults || isQuerying) && (
            <QueryResults
              results={queryResults}
              isLoading={isQuerying}
              currentQuery={currentQuery}
              onNewQuery={handleNewQuery}
            />
          )}
        </div>

        {/* Right Column - History and Info */}
        <div className="space-y-6">
          <QueryHistory />
          
          {/* Medical Safety Notice */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Medical Safety Notice</h3>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>🏥 This platform is designed for healthcare professionals and medical students</p>
                  <p>📚 All content is for educational purposes only</p>
                  <p>⚕️ Always consult with qualified healthcare providers for clinical decisions</p>
                  <p>🔒 Your queries and data are protected with HIPAA-compliant security</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}