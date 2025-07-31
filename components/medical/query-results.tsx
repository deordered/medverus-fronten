"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  ExternalLink, 
  Calendar,
  BookOpen,
  Globe,
  FileText,
  Brain,
  Star,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Filter,
  SortAsc,
  ChevronDown,
  ChevronUp
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn, formatMedicalDate, truncateText } from "@/lib/utils"
import type { QueryResponse, MedicalSource, Citation, ContentSource } from "@/types"

interface QueryResultsProps {
  results: QueryResponse | null
  isLoading?: boolean
  onRetry?: () => void
  onNewQuery?: () => void
  className?: string
}

type SortOption = "relevance" | "date" | "source" | "citations"
type FilterOption = "all" | "high_confidence" | "recent" | "cited"

export function QueryResults({ 
  results, 
  isLoading = false, 
  onRetry, 
  onNewQuery,
  className 
}: QueryResultsProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>("relevance")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Get source configuration
  const getSourceConfig = (source: ContentSource) => {
    const configs = {
      medverus_ai: {
        name: "Medverus AI",
        icon: Brain,
        color: "bg-medical-primary",
        textColor: "text-medical-primary",
        badge: "AI"
      },
      pubmed: {
        name: "PubMed",
        icon: BookOpen,
        color: "bg-medical-success",
        textColor: "text-medical-success",
        badge: "Research"
      },
      web_search: {
        name: "Medical Web",
        icon: Globe,
        color: "bg-source-web",
        textColor: "text-source-web",
        badge: "Web"
      },
      file_upload: {
        name: "Your Documents",
        icon: FileText,
        color: "bg-source-files",
        textColor: "text-source-files",
        badge: "Private"
      }
    }
    return configs[source] || configs.medverus_ai
  }

  // Filter and sort results
  const processedResults = results?.sources?.filter(source => {
    if (filterBy === "all") return true
    if (filterBy === "high_confidence") return source.confidence_score >= 0.8
    if (filterBy === "recent") return new Date(source.published_date || source.last_updated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    if (filterBy === "cited") return (source.citations?.length || 0) > 0
    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case "relevance":
        return (b.confidence_score || 0) - (a.confidence_score || 0)
      case "date":
        return new Date(b.published_date || b.last_updated).getTime() - new Date(a.published_date || a.last_updated).getTime()
      case "source":
        return a.source.localeCompare(b.source)
      case "citations":
        return (b.citations?.length || 0) - (a.citations?.length || 0)
      default:
        return 0
    }
  }) || []

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedResults(newExpanded)
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIds(prev => new Set(prev).add(id))
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
      })
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive"
      })
    }
  }

  const downloadResults = () => {
    if (!results) return
    
    const content = `Medical AI Query Results
Query: ${results.query}
Source: ${results.source}
Generated: ${formatMedicalDate(results.timestamp)}
Total Results: ${results.sources?.length || 0}

${results.sources?.map((source, index) => `
${index + 1}. ${source.title}
Source: ${getSourceConfig(source.source as ContentSource).name}
Confidence: ${Math.round((source.confidence_score || 0) * 100)}%
Summary: ${source.summary}
URL: ${source.url || 'N/A'}
${source.citations?.length ? `Citations: ${source.citations.length}` : ''}
---
`).join('\n')}

Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice.`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medverus-query-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Results downloaded",
      description: "Query results have been saved to your device.",
    })
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-medical-primary/10 rounded-full">
              <RefreshCw className="h-8 w-8 text-medical-primary animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium">Searching Medical Knowledge</h3>
            <p className="text-muted-foreground">
              AI is analyzing trusted medical sources for your query...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-muted rounded-full">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium">No results yet</h3>
            <p className="text-muted-foreground">
              Submit a medical query to see AI-powered results from trusted sources.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (results.sources?.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <Alert variant="medical-warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No results found for your query. Try rephrasing your question or 
            using more general medical terms.
          </AlertDescription>
        </Alert>
        
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Search
              </Button>
            )}
            {onNewQuery && (
              <Button variant="medical" onClick={onNewQuery}>
                <Search className="mr-2 h-4 w-4" />
                New Query
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const sourceConfig = getSourceConfig(results.source as ContentSource)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Results Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", sourceConfig.color)}>
                <sourceConfig.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Query Results</h2>
                <p className="text-sm text-muted-foreground">
                  Found {processedResults.length} results from {sourceConfig.name}
                </p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">Your Query:</p>
              <p className="text-sm">{results.query}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadResults}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            {onNewQuery && (
              <Button variant="medical" size="sm" onClick={onNewQuery}>
                <Search className="mr-2 h-4 w-4" />
                New Query
              </Button>
            )}
          </div>
        </div>

        {/* Query Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatMedicalDate(results.timestamp)}
          </div>
          <Badge variant={sourceConfig.badge as any} className="text-xs">
            {sourceConfig.badge}
          </Badge>
          {results.processing_time && (
            <span>Response time: {Math.round(results.processing_time * 1000)}ms</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterBy("all")}>
                All Results
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("high_confidence")}>
                High Confidence (≥80%)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("recent")}>
                Recent (Last 30 days)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("cited")}>
                With Citations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("relevance")}>
                By Relevance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date")}>
                By Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("source")}>
                By Source
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("citations")}>
                By Citations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {processedResults.length} of {results.sources?.length || 0} results
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {processedResults.map((source, index) => {
          const isExpanded = expandedResults.has(source.id || `${index}`)
          const sourceInfo = getSourceConfig(source.source as ContentSource)
          
          return (
            <Card key={source.id || index} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded", sourceInfo.color)}>
                        <sourceInfo.icon className="h-3 w-3 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {sourceInfo.badge}
                      </Badge>
                      {source.confidence_score && (
                        <Badge 
                          variant={source.confidence_score >= 0.8 ? "medical-success" : 
                                 source.confidence_score >= 0.6 ? "medical-warning" : "medical-neutral"}
                          className="text-xs"
                        >
                          {Math.round(source.confidence_score * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg leading-tight">
                      {source.title}
                    </CardTitle>
                    
                    {source.authors && (
                      <p className="text-sm text-muted-foreground">
                        {source.authors.slice(0, 3).join(", ")}
                        {source.authors.length > 3 && ` +${source.authors.length - 3} more`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(source.summary, source.id || `${index}`)}
                    >
                      {copiedIds.has(source.id || `${index}`) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {source.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Summary */}
                <div>
                  <p className="text-sm leading-relaxed">
                    {isExpanded ? source.summary : truncateText(source.summary, 300)}
                  </p>
                  
                  {source.summary.length > 300 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(source.id || `${index}`)}
                      className="mt-2 h-auto p-0 text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="mr-1 h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-3 w-3" />
                          Show more
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {source.published_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatMedicalDate(source.published_date)}
                    </div>
                  )}
                  {source.citations && source.citations.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {source.citations.length} citations
                    </div>
                  )}
                  {source.journal && (
                    <span>{source.journal}</span>
                  )}
                </div>

                {/* Citations */}
                {isExpanded && source.citations && source.citations.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Citations</h4>
                      <div className="space-y-2">
                        {source.citations.map((citation, citIndex) => (
                          <div key={citIndex} className="text-xs bg-muted/50 p-2 rounded">
                            <p className="font-medium">{citation.title}</p>
                            <p className="text-muted-foreground">{citation.authors?.join(", ")}</p>
                            {citation.journal && citation.year && (
                              <p className="text-muted-foreground">
                                {citation.journal}, {citation.year}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Medical Disclaimer */}
      <Alert variant="medical">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Medical Disclaimer:</strong> These results are for educational 
          purposes only and should not replace professional medical advice. Always 
          consult with qualified healthcare providers for medical decisions.
        </AlertDescription>
      </Alert>
    </div>
  )
}