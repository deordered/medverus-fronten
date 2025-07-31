"use client"

import { useState } from "react"
import { QueryForm } from "./query-form"
import { QueryResults } from "./query-results"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  Search, 
  History, 
  BookOpen,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle2 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, useMedicalTier } from "@/hooks/use-auth"
import type { QueryRequest, QueryResponse } from "@/types"

interface MedicalQueryPageProps {
  className?: string
}

// Mock data for development - Replace with real API calls
const mockQueryResponse: QueryResponse = {
  id: "query_123",
  query: "What are the symptoms and treatment options for hypertension?",
  source: "medverus_ai",
  timestamp: new Date().toISOString(),
  processing_time: 2.5,
  sources: [
    {
      id: "source_1",
      source: "medverus_ai",
      title: "Hypertension: Clinical Guidelines and Management",
      summary: "Hypertension (high blood pressure) is a common condition where blood pressure in arteries is persistently elevated. Primary symptoms include headaches, shortness of breath, and nosebleeds, though many patients are asymptomatic. Treatment includes lifestyle modifications (diet, exercise, weight management) and medications such as ACE inhibitors, diuretics, and calcium channel blockers. Regular monitoring and patient education are essential for effective management.",
      url: "https://medverus.ai/guidelines/hypertension",
      confidence_score: 0.95,
      published_date: "2024-01-15",
      last_updated: "2024-01-15",
      authors: ["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Emily Rodriguez"],
      journal: "Medverus Clinical Guidelines",
      citations: [
        {
          title: "2023 ACC/AHA Hypertension Guidelines",
          authors: ["Whelton PK", "Carey RM", "Aronow WS"],
          journal: "Journal of the American College of Cardiology",
          year: "2023",
          pmid: "29146535"
        },
        {
          title: "Lifestyle interventions for hypertension management",
          authors: ["Williams B", "Mancia G", "Spiering W"],
          journal: "European Heart Journal",
          year: "2023",
          pmid: "30165516"
        }
      ]
    },
    {
      id: "source_2",
      source: "pubmed",
      title: "Recent Advances in Hypertension Treatment: A Systematic Review",
      summary: "This systematic review examines recent developments in hypertension treatment protocols. Evidence shows that combination therapy with ACE inhibitors and diuretics provides superior outcomes compared to monotherapy. Emerging treatments include novel drug combinations and digital health interventions for monitoring. Patient adherence remains a significant challenge requiring multifaceted approaches.",
      url: "https://pubmed.ncbi.nlm.nih.gov/example",
      confidence_score: 0.88,
      published_date: "2023-12-20",
      last_updated: "2023-12-20",
      authors: ["Thompson A", "Garcia-Lopez M", "Kumar S"],
      journal: "Hypertension Research",
      citations: [
        {
          title: "Combination therapy in hypertension: evidence and guidelines",
          authors: ["MacDonald TM", "Williams B", "Webb DJ"],
          journal: "The Lancet",
          year: "2023",
          pmid: "33581780"
        }
      ]
    }
  ]
}

export function MedicalQueryPage({ className }: MedicalQueryPageProps) {
  const [currentResults, setCurrentResults] = useState<QueryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("query")
  const [queryHistory, setQueryHistory] = useState<QueryResponse[]>([])
  
  const { user } = useAuth()
  const { tier, limits, usage } = useMedicalTier()

  const handleSubmitQuery = async (queryRequest: QueryRequest) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      console.log("Submitting query:", queryRequest)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock response - replace with actual API integration
      const mockResponse: QueryResponse = {
        ...mockQueryResponse,
        query: queryRequest.query,
        source: queryRequest.source,
        timestamp: new Date().toISOString(),
        id: `query_${Date.now()}`
      }
      
      setCurrentResults(mockResponse)
      setQueryHistory(prev => [mockResponse, ...prev.slice(0, 4)]) // Keep last 5 queries
      setActiveTab("results")
      
    } catch (error) {
      console.error("Query failed:", error)
      // Error handling is done by the QueryForm component
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryQuery = () => {
    if (currentResults) {
      handleSubmitQuery({
        query: currentResults.query,
        source: currentResults.source as any,
        max_results: 5
      })
    }
  }

  const handleNewQuery = () => {
    setActiveTab("query")
    setCurrentResults(null)
  }

  const loadHistoryQuery = (query: QueryResponse) => {
    setCurrentResults(query)
    setActiveTab("results")
  }

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-medical-primary/10 rounded-full">
            <Search className="h-8 w-8 text-medical-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medical AI Research</h1>
            <p className="text-muted-foreground">
              Access trusted medical knowledge with AI-powered search
            </p>
          </div>
        </div>

        {/* User Status */}
        <div className="flex items-center justify-center gap-4">
          <Badge variant={`tier-${tier}` as any}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
          </Badge>
          <div className="text-sm text-muted-foreground">
            Welcome back, {user?.email}
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="query" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            New Query
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Results
            {currentResults && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {currentResults.sources?.length || 0}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
            {queryHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {queryHistory.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Queries</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(usage).reduce((sum, val) => sum + val, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {Object.values(limits).reduce((sum, limit) => 
                    sum + (typeof limit === 'number' ? limit : limit.count), 0
                  )} daily limit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medverus AI</CardTitle>
                <TrendingUp className="h-4 w-4 text-medical-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usage.medverus_ai}</div>
                <p className="text-xs text-muted-foreground">
                  of {limits.medverus_ai} queries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PubMed</CardTitle>
                <BookOpen className="h-4 w-4 text-medical-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usage.pubmed}</div>
                <p className="text-xs text-muted-foreground">
                  of {limits.pubmed} searches
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <Users className="h-4 w-4 text-source-files" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usage.file_upload}</div>
                <p className="text-xs text-muted-foreground">
                  uploaded files
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Query Form */}
          <QueryForm 
            onSubmit={handleSubmitQuery}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <QueryResults 
            results={currentResults}
            isLoading={isLoading}
            onRetry={handleRetryQuery}
            onNewQuery={handleNewQuery}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Recent Queries</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQueryHistory([])}
                disabled={queryHistory.length === 0}
              >
                Clear History
              </Button>
            </div>

            {queryHistory.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-muted rounded-full">
                      <History className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Query History</h3>
                  <p className="text-muted-foreground">
                    Your previous medical queries will appear here for easy access.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {queryHistory.map((query) => (
                  <Card 
                    key={query.id} 
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => loadHistoryQuery(query)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <p className="font-medium line-clamp-2">{query.query}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(query.timestamp).toLocaleDateString()}
                            <Badge variant="outline" className="text-xs">
                              {query.sources?.length || 0} results
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            loadHistoryQuery(query)
                          }}
                        >
                          View Results
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Usage Warning */}
      {Object.values(usage).some((used, index) => {
        const limitsArray = Object.values(limits)
        const limit = typeof limitsArray[index] === 'number' 
          ? limitsArray[index] as number 
          : (limitsArray[index] as any).count
        return used / limit >= 0.8
      }) && (
        <Alert variant="medical-warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're approaching your daily usage limits. Consider upgrading your tier 
            for higher limits and additional features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}