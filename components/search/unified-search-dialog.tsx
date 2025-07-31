"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EnhancedAutocomplete } from "@/components/search/enhanced-autocomplete"
import { VirtualResultsList } from "@/components/search/virtual-results-list"
import { SearchPerformanceMonitor } from "@/components/search/search-performance-monitor"
import { useSearch } from "@/lib/stores/search-store"
import { useUI } from "@/lib/stores/ui-store"
import { useMedicalTTS } from "@/lib/stores/tts-store"
import { useMobileResponsive } from "@/lib/hooks/use-mobile-responsive"
import { MEDICAL_SOURCE_CONFIG } from "@/lib/constants/medical"
import { cn } from "@/lib/utils"
import { 
  Upload, 
  X, 
  FileText,
  Globe,
  Database,
  Brain,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Search
} from "lucide-react"
import type { ContentSource } from "@/types"

interface UnifiedSearchDialogProps {
  className?: string
  autoFocus?: boolean
}

/**
 * Unified Search Dialog Component
 * Central search interface supporting 4 content sources with drag & drop
 * Inspired by Perplexity.ai with medical-focused enhancements
 */
export function UnifiedSearchDialog({ className, autoFocus = true }: UnifiedSearchDialogProps) {
  const {
    currentQuery,
    selectedSources,
    isSearching,
    results,
    files,
    setCurrentQuery,
    toggleSource,
    executeSearch,
    addFiles,
    removeFile,
    clearFiles
  } = useSearch()
  
  const { searchDialogExpanded, setSearchDialogExpanded } = useUI()
  const { speakMedicalContent } = useMedicalTTS()
  const { isMobile, isTablet, touchDevice, utils } = useMobileResponsive()
  
  // Local state
  const [isDragOver, setIsDragOver] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recentQueries, setRecentQueries] = useState<string[]>([])
  
  // Refs
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // PERFORMANCE OPTIMIZATION: Memoized callbacks to prevent child re-renders
  const handleInputChange = useCallback((value: string) => {
    setCurrentQuery(value)
  }, [setCurrentQuery])

  // PERFORMANCE OPTIMIZATION: Batch state updates to reduce re-renders
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    
    try {
      // Batch state updates to prevent multiple re-renders
      const searchPromise = executeSearch(query)
      const updatedRecentQueries = [query, ...recentQueries.filter(q => q !== query)].slice(0, 10)
      
      // Update all states together
      setCurrentQuery(query)
      setRecentQueries(updatedRecentQueries)
      setShowResults(true)
      
      // Execute search and speak after state updates
      await searchPromise
      speakMedicalContent(`Search completed for ${query}`)
    } catch (error) {
      console.error('Search error:', error)
      // Reset loading state on error
      setShowResults(false)
    }
  }, [executeSearch, speakMedicalContent, setCurrentQuery, recentQueries])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    handleSearch(suggestion.text)
  }, [handleSearch])

  // Handle result click
  const handleResultClick = useCallback((result: any) => {
    // Navigate to result or show details
    console.log('Result clicked:', result)
    // You can implement result navigation logic here
  }, [])

  // File drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
      // Auto-select file upload source
      if (!selectedSources.includes('file_upload')) {
        toggleSource('file_upload')
      }
    }
  }, [addFiles, selectedSources, toggleSource])

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles)
      if (!selectedSources.includes('file_upload')) {
        toggleSource('file_upload')
      }
    }
    // Reset input
    e.target.value = ''
  }, [addFiles, selectedSources, toggleSource])

  // Load recent queries from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('medverus-recent-queries')
      if (stored) {
        setRecentQueries(JSON.parse(stored))
      }
    } catch (error) {
      console.warn('Failed to load recent queries:', error)
    }
  }, [])

  // Save recent queries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medverus-recent-queries', JSON.stringify(recentQueries))
    } catch (error) {
      console.warn('Failed to save recent queries:', error)
    }
  }, [recentQueries])

  // Source icons
  const getSourceIcon = (source: ContentSource) => {
    switch (source) {
      case 'medverus_ai': return <Brain className="h-4 w-4" />
      case 'pubmed': return <Database className="h-4 w-4" />
      case 'web_search': return <Globe className="h-4 w-4" />
      case 'file_upload': return <FileText className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  return (
    <div className={cn(
      "w-full mx-auto",
      isMobile ? "max-w-none" : "max-w-4xl",
      utils.getContainerPadding()
    )}>
      <Card className={cn(
        "border-2 transition-all duration-200",
        isDragOver && "border-brand-primary bg-brand-primary/5",
        searchDialogExpanded && "shadow-lg",
        !touchDevice && "hover:shadow-md",
        isMobile && "border-0 shadow-none bg-transparent"
      )}>
        <CardContent className={cn(
          utils.getSpacing("p-6", "p-4"),
          isMobile && "pb-2"
        )}>
          {/* Search Input Section */}
          <div className="space-y-4">
            {/* Source Selection */}
            <div className={cn(
              "flex gap-2",
              isMobile ? "flex-wrap" : "flex-wrap",
              isMobile && "justify-center"
            )}>
              <TooltipProvider>
                {Object.entries(MEDICAL_SOURCE_CONFIG).map(([key, config]) => {
                  const source = key as ContentSource
                  const isSelected = selectedSources.includes(source)
                  const canUse = files.length > 0 || source !== 'file_upload'
                  
                  return (
                    <Tooltip key={source}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size={isMobile ? "sm" : "sm"}
                          className={cn(
                            "flex items-center gap-2 transition-all",
                            utils.getTouchButtonSize("h-9"),
                            isSelected && "bg-brand-primary hover:bg-brand-primary/90",
                            !canUse && "opacity-50 cursor-not-allowed",
                            isMobile && "text-xs px-3"
                          )}
                          onClick={() => canUse && toggleSource(source)}
                          disabled={!canUse}
                        >
                          {getSourceIcon(source)}
                          <span className={cn(
                            isMobile ? "inline" : "hidden sm:inline",
                            isMobile && "truncate max-w-[80px]"
                          )}>
                            {isMobile ? config.name.split(' ')[0] : config.name}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-medium">{config.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {config.description}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>

            {/* High-Performance Search Input */}
            <div 
              ref={dropZoneRef}
              className={cn(
                "relative",
                isDragOver && "ring-2 ring-brand-primary ring-offset-2"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <EnhancedAutocomplete
                value={currentQuery}
                onChange={handleInputChange}
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                sources={selectedSources}
                userTier="pro" // TODO: Get from user profile
                placeholder="Ask anything medical... or drag & drop files"
                autoFocus={autoFocus}
                showSuggestions={true}
                recentQueries={recentQueries}
                disabled={isSearching}
                className="w-full"
              />
              
              {/* File Upload Integration */}
              <div className={cn(
                "absolute top-1/2 transform -translate-y-1/2 flex items-center gap-2",
                isMobile ? "right-12" : "right-16"
              )}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          utils.getTouchButtonSize("h-6 w-6"),
                          "p-0",
                          isMobile && "h-8 w-8"
                        )}
                        onClick={() => document.getElementById('file-input')?.click()}
                        disabled={isSearching}
                      >
                        <Upload className={cn(
                          isMobile ? "h-4 w-4" : "h-3 w-3"
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload medical documents</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Drag Over Overlay */}
              {isDragOver && (
                <div className="absolute inset-0 bg-brand-primary/10 border-2 border-dashed border-brand-primary rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-brand-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-brand-primary">
                      Drop files here to search
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* File Upload Input (Hidden) */}
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.docx,.pptx"
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Uploaded Files Display */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Ready for search
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-2 max-w-xs"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {files.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFiles}
                      className="text-xs text-muted-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* High-Performance Search Results with Enhanced Loading States */}
            {showResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand-primary" />
                    Search Results
                    {isSearching && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="ml-2"
                      >
                        <Zap className="h-4 w-4 text-brand-primary" />
                      </motion.div>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {isSearching ? 'Searching...' : 'Optimized rendering'}
                    </Badge>
                    {results && results.metadata && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(results.processing_time_ms)}ms
                      </Badge>
                    )}
                  </div>
                </div>
                
                <VirtualResultsList
                  results={results || []}
                  isLoading={isSearching}
                  onResultClick={handleResultClick}
                  showMetadata={true}
                  className="border rounded-lg"
                />
                
                {/* Performance Indicator */}
                {results && results.metadata && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    Searched {results.metadata.sources_searched || 1} source(s) • 
                    Found {results.results?.length || 0} results • 
                    Response time: {Math.round(results.processing_time_ms)}ms
                  </div>
                )}
              </div>
            )}

            {/* Expand/Collapse Toggle */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchDialogExpanded(!searchDialogExpanded)}
                className="text-muted-foreground"
              >
                {searchDialogExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Less options
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    More options
                  </>
                )}
              </Button>
            </div>

            {/* Expanded Options */}
            {searchDialogExpanded && (
              <div className="space-y-4 pt-4 border-t">
                {/* Performance Monitor */}
                <SearchPerformanceMonitor 
                  showDetails={false}
                  className="mb-4"
                />

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className={cn(
                    "font-medium",
                    utils.getTextSize("text-sm")
                  )}>Quick Medical Searches</h4>
                  <div className={cn(
                    "grid gap-2",
                    isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                  )}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        utils.getTouchButtonSize(),
                        isMobile && "text-xs px-2 py-2"
                      )}
                      onClick={() => handleSearch("latest medical guidelines")}
                      disabled={isSearching}
                    >
                      📋 {isMobile ? "Guidelines" : "Guidelines"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        utils.getTouchButtonSize(),
                        isMobile && "text-xs px-2 py-2"
                      )}
                      onClick={() => handleSearch("drug interactions")}
                      disabled={isSearching}
                    >
                      💊 {isMobile ? "Drugs" : "Drug Info"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        utils.getTouchButtonSize(),
                        isMobile && "text-xs px-2 py-2"
                      )}
                      onClick={() => handleSearch("diagnostic criteria")}
                      disabled={isSearching}
                    >
                      🔍 {isMobile ? "Diagnosis" : "Diagnosis"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        utils.getTouchButtonSize(),
                        isMobile && "text-xs px-2 py-2"
                      )}
                      onClick={() => handleSearch("patient assessment")}
                      disabled={isSearching}
                    >
                      👥 {isMobile ? "Assessment" : "Assessment"}
                    </Button>
                  </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                  <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

UnifiedSearchDialog.displayName = "UnifiedSearchDialog"

export default UnifiedSearchDialog