"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSearchResults, useSearchStatus } from "@/lib/stores/search-store"
import { useMedicalTTS } from "@/lib/stores/tts-store"
import { MEDICAL_SOURCE_CONFIG } from "@/lib/constants/medical"
import { cn } from "@/lib/utils"
import { 
  FileText,
  ExternalLink,
  Volume2,
  Clock,
  Award,
  Brain,
  Database,
  Globe,
  Upload,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  Copy,
  Download,
  Share
} from "lucide-react"
import type { ContentSource, QueryResult } from "@/types"

interface SearchResultsProps {
  className?: string
}

/**
 * Search Results Component
 * Displays unified search results with medical formatting and TTS integration
 */
export function SearchResults({ className }: SearchResultsProps) {
  const results = useSearchResults()
  const { hasResults, isSearching } = useSearchStatus()
  const { speakMedicalContent, speakSearchResult, speakCitation } = useMedicalTTS()

  // Memoized results processing
  const processedResults = useMemo(() => {
    if (!results?.results) return []

    return results.results.map((result, index) => ({
      ...result,
      displayIndex: index + 1,
      confidenceLevel: getConfidenceLevel(result.confidence_score || 0),
      sourceIcon: getSourceIcon(results.source),
      sourceName: MEDICAL_SOURCE_CONFIG[results.source]?.label || results.source
    }))
  }, [results])

  // Helper functions
  const getConfidenceLevel = (score: number) => {
    if (score >= 0.8) return { level: 'high', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 0.6) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'low', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const getSourceIcon = (source: ContentSource) => {
    switch (source) {
      case 'medverus_ai': return <Brain className="h-4 w-4" />
      case 'pubmed': return <Database className="h-4 w-4" />
      case 'web_search': return <Globe className="h-4 w-4" />
      case 'file_upload': return <Upload className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const handleSpeakResult = (result: QueryResult) => {
    speakSearchResult(result.title, result.content)
  }

  const handleSpeakCitation = (citation: string) => {
    speakCitation(citation)
  }

  const handleCopyResult = async (result: QueryResult) => {
    try {
      const text = `${result.title}\n\n${result.content}\n\nSource: ${result.url || 'N/A'}`
      await navigator.clipboard.writeText(text)
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Loading state
  if (isSearching) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-medical-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Searching medical literature...</p>
        </div>
      </div>
    )
  }

  // No results state
  if (!hasResults) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Search</h3>
            <p className="text-muted-foreground mb-6">
              Enter a medical query above to search across multiple sources
            </p>
            
            {/* Quick Start Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
              <Button variant="outline" size="sm" className="text-left justify-start">
                <Lightbulb className="h-4 w-4 mr-2" />
                Latest Guidelines
              </Button>
              <Button variant="outline" size="sm" className="text-left justify-start">
                <Database className="h-4 w-4 mr-2" />
                Research Papers
              </Button>
              <Button variant="outline" size="sm" className="text-left justify-start">
                <Brain className="h-4 w-4 mr-2" />
                AI Analysis
              </Button>
              <Button variant="outline" size="sm" className="text-left justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)} id="search-results">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {results && getSourceIcon(results.source)}
            <h2 className="text-lg font-semibold">Search Results</h2>
          </div>
          
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {results?.processing_time_ms}ms
          </Badge>
          
          <Badge variant="outline">
            {processedResults.length} results
          </Badge>
        </div>

        {/* Result Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => results && speakMedicalContent(`Found ${processedResults.length} results for your medical query`)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Read results summary</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* AI Summary (if available) */}
      {results?.ai_summary && (
        <Card className="border-medical-primary/20 bg-medical-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <Brain className="h-5 w-5" />
              AI Medical Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed mb-3">
              {results.ai_summary}
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speakMedicalContent(results.ai_summary)}
              >
                <Volume2 className="h-4 w-4 mr-1" />
                Listen
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(results.ai_summary)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Results */}
      <div className="space-y-4">
        {processedResults.map((result) => (
          <Card key={result.displayIndex} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base leading-relaxed mb-2">
                    {result.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {result.sourceIcon}
                    <span>{result.sourceName}</span>
                    
                    {result.confidence_score && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          result.confidenceLevel.bg,
                          result.confidenceLevel.color
                        )}
                      >
                        {Math.round(result.confidence_score * 100)}% confidence
                      </Badge>
                    )}
                    
                    {result.url && (
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-medical-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Source
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSpeakResult(result)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Read aloud</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyResult(result)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy result</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-relaxed mb-4">
                {result.content}
              </p>

              {/* Citations */}
              {result.citations && result.citations.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <div className="pt-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Vancouver Citations
                    </h4>
                    <div className="space-y-1">
                      {result.citations.map((citation, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          <span className="flex-1">{citation}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleSpeakCitation(citation)}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Classification Tags */}
              {result.medical_tags && result.medical_tags.length > 0 && (
                <div className="pt-3">
                  <div className="flex flex-wrap gap-1">
                    {result.medical_tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Medical Disclaimer */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Medical Disclaimer</p>
              <p className="text-amber-700 leading-relaxed">
                This information is for educational purposes only and should not replace professional medical advice. 
                Always consult with a qualified healthcare provider for medical decisions, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

SearchResults.displayName = "SearchResults"

export default SearchResults