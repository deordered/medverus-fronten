"use client"

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { debounce } from "lodash-es"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  useSourceAwareSuggestions, 
  type SourceAwareSuggestion,
  type SuggestionContext 
} from "@/lib/autocomplete/source-aware-suggestions"
import { listVariants, listItemVariants } from "@/lib/animations/motion-variants"
import { useAnimationSafeMotion } from "@/lib/animations/hooks"
import { useMobileResponsive } from "@/lib/hooks/use-mobile-responsive"
import { cn } from "@/lib/utils"
import { 
  Search, 
  ArrowRight, 
  Clock,
  TrendingUp,
  Sparkles,
  Zap,
  X,
  Brain,
  BookOpen,
  Globe,
  FileText,
  Star,
  History,
  Lightbulb
} from "lucide-react"
import type { ContentSource } from "@/types"

interface EnhancedAutocompleteProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  onSuggestionSelect?: (suggestion: SourceAwareSuggestion) => void
  sources: ContentSource[]
  userTier: string
  className?: string
  showSuggestions?: boolean
  autoFocus?: boolean
  recentQueries?: string[]
  disabled?: boolean
}

const typeIcons = {
  medical: <Sparkles className="h-3 w-3" />,
  recent: <Clock className="h-3 w-3" />,
  popular: <TrendingUp className="h-3 w-3" />,
  completion: <Lightbulb className="h-3 w-3" />,
  'source-specific': <Star className="h-3 w-3" />
}

const sourceIcons = {
  medverus_ai: <Brain className="h-3 w-3" />,
  pubmed: <BookOpen className="h-3 w-3" />,
  web_search: <Globe className="h-3 w-3" />,
  file_upload: <FileText className="h-3 w-3" />
}

const sourceColors = {
  medverus_ai: 'text-brand-primary border-brand-primary/20 bg-brand-primary/5',
  pubmed: 'text-brand-accent border-brand-accent/20 bg-brand-accent/5',
  web_search: 'text-brand-secondary border-brand-secondary/20 bg-brand-secondary/5',
  file_upload: 'text-orange-600 border-orange-200 bg-orange-50'
}

/**
 * Enhanced Autocomplete Component
 * Source-aware suggestions with intelligent medical terminology
 */
export function EnhancedAutocomplete({
  placeholder = "Search medical information...",
  value: controlledValue,
  onChange,
  onSearch,
  onSuggestionSelect,
  sources,
  userTier,
  className,
  showSuggestions = true,
  autoFocus = false,
  recentQueries = [],
  disabled = false
}: EnhancedAutocompleteProps) {
  const [inputValue, setInputValue] = useState(controlledValue || "")
  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<SourceAwareSuggestion[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { shouldAnimate } = useAnimationSafeMotion()
  const { generateSuggestions, recordSearch } = useSourceAwareSuggestions()
  const { isMobile, touchDevice, utils } = useMobileResponsive()

  // Handle controlled vs uncontrolled state
  const actualValue = controlledValue !== undefined ? controlledValue : inputValue
  const setActualValue = useCallback((newValue: string) => {
    if (controlledValue !== undefined) {
      onChange?.(newValue)
    } else {
      setInputValue(newValue)
    }
  }, [controlledValue, onChange])

  // PERFORMANCE OPTIMIZATION: Debounced suggestion generation with memoization
  const debouncedUpdateSuggestions = useMemo(
    () => {
      const generateSuggestionsDebounced = (query: string) => {
        if (!showSuggestions || query.length < 2) {
          setSuggestions([])
          return
        }

        const context: SuggestionContext = {
          query,
          sources,
          userTier,
          recentQueries,
          searchHistory: [] // Would be populated from storage
        }

        const newSuggestions = generateSuggestions(context)
        setSuggestions(newSuggestions)
      }

      // Debounce with 200ms delay to reduce API calls
      return debounce(generateSuggestionsDebounced, 200)
    },
    [generateSuggestions, sources, userTier, recentQueries, showSuggestions]
  )

  const updateSuggestions = useCallback((query: string) => {
    debouncedUpdateSuggestions(query)
  }, [debouncedUpdateSuggestions])

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setActualValue(newValue)
    setSelectedIndex(-1)
    
    if (newValue.trim() || isFocused) {
      updateSuggestions(newValue)
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [setActualValue, updateSuggestions, isFocused])

  // Handle search execution
  const handleSearch = useCallback((query?: string) => {
    const searchQuery = query || actualValue.trim()
    if (!searchQuery) return

    onSearch?.(searchQuery)
    setShowDropdown(false)
    setSelectedIndex(-1)
    
    // Record search for future suggestions
    sources.forEach(source => {
      recordSearch(searchQuery, source, true)
    })
  }, [actualValue, onSearch, sources, recordSearch])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SourceAwareSuggestion) => {
    setActualValue(suggestion.text)
    onSuggestionSelect?.(suggestion)
    setShowDropdown(false)
    setSelectedIndex(-1)
    
    // Record successful suggestion usage
    if (suggestion.source) {
      recordSearch(suggestion.text, suggestion.source, true)
    }
  }, [setActualValue, onSuggestionSelect, recordSearch])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
      case 'Tab':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault()
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
    }
  }, [showDropdown, suggestions, selectedIndex, handleSearch, handleSuggestionSelect])

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    updateSuggestions(actualValue)
    if (actualValue.trim() || suggestions.length > 0) {
      setShowDropdown(true)
    }
  }, [actualValue, suggestions.length, updateSuggestions])

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't hide dropdown if clicking on a suggestion
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return
    }
    setIsFocused(false)
    setTimeout(() => setShowDropdown(false), 150)
    setSelectedIndex(-1)
  }, [])

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Group suggestions by type for better organization
  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, SourceAwareSuggestion[]> = {}
    
    suggestions.forEach(suggestion => {
      const key = suggestion.source ? `${suggestion.source}-${suggestion.type}` : suggestion.type
      if (!groups[key]) groups[key] = []
      groups[key].push(suggestion)
    })
    
    return groups
  }, [suggestions])

  // Get suggestion display text with highlighting
  const getHighlightedText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text
    
    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()
    const index = textLower.indexOf(queryLower)
    
    if (index === -1) return text
    
    return (
      <>
        {text.slice(0, index)}
        <span className="bg-brand-primary/20 text-brand-secondary font-medium">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    )
  }, [])

  return (
    <TooltipProvider>
      <div className={cn("relative w-full", className)}>
        {/* Main Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={actualValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              "text-base transition-all duration-200 ease-out",
              "border-2 hover:border-brand-primary/30",
              "placeholder:text-muted-foreground",
              isFocused && "border-brand-primary shadow-lg ring-2 ring-brand-primary/20",
              isMobile ? (
                "pl-10 pr-16 h-14 text-lg" // Larger touch targets and text for mobile
              ) : (
                "pl-10 pr-20 h-12"
              )
            )}
            autoComplete="off"
            spellCheck="false"
            inputMode={isMobile ? "search" : undefined}
            enterKeyHint={isMobile ? "search" : undefined}
          />
          
          {/* Right side actions */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {/* Clear button */}
            <AnimatePresence>
              {actualValue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "p-0 hover:bg-muted",
                          utils.getTouchButtonSize("h-6 w-6"),
                          isMobile && "h-8 w-8"
                        )}
                        onClick={() => {
                          setActualValue("")
                          setShowDropdown(false)
                          inputRef.current?.focus()
                        }}
                      >
                        <X className={cn(
                          isMobile ? "h-4 w-4" : "h-3 w-3"
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear search</TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Search button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className={cn(
                    "px-2 bg-brand-primary hover:bg-brand-primary/90",
                    utils.getTouchButtonSize("h-6"),
                    isMobile && "h-8 px-3"
                  )}
                  onClick={() => handleSearch()}
                  disabled={!actualValue.trim() || disabled}
                >
                  <ArrowRight className={cn(
                    isMobile ? "h-4 w-4" : "h-3 w-3"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Enhanced Suggestions Dropdown */}
        <AnimatePresence>
          {showDropdown && suggestions.length > 0 && (
            <motion.div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 z-50 mt-2"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className={cn(
                "shadow-xl border-2 border-brand-primary/10",
                isMobile && "shadow-2xl rounded-t-lg rounded-b-none fixed bottom-0 left-0 right-0 max-h-[60vh]"
              )}>
                <CardContent className="p-0">
                  <ScrollArea className={cn(
                    isMobile ? "max-h-[55vh]" : "max-h-80"
                  )}>
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="p-2 space-y-1"
                    >
                      {Object.entries(groupedSuggestions).map(([groupKey, groupSuggestions], groupIndex) => (
                        <div key={groupKey}>
                          {groupIndex > 0 && <Separator className="my-2" />}
                          
                          {groupSuggestions.map((suggestion, index) => {
                            const globalIndex = suggestions.indexOf(suggestion)
                            const isSelected = selectedIndex === globalIndex
                            
                            return (
                              <motion.div
                                key={`${suggestion.text}-${suggestion.type}`}
                                variants={listItemVariants}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                              >
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start h-auto text-left transition-colors",
                                    "hover:bg-brand-primary/5",
                                    isSelected && "bg-brand-primary/10 text-brand-secondary",
                                    isMobile ? (
                                      "p-4 min-h-[60px]" // Larger touch targets for mobile
                                    ) : (
                                      "p-3"
                                    )
                                  )}
                                  onClick={() => handleSuggestionSelect(suggestion)}
                                >
                                  <div className="flex items-start gap-3 w-full">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-0.5">
                                      {suggestion.source ? 
                                        sourceIcons[suggestion.source] : 
                                        typeIcons[suggestion.type]
                                      }
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium truncate">
                                        {getHighlightedText(suggestion.text, actualValue)}
                                      </div>
                                      
                                      {suggestion.description && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {suggestion.description}
                                        </div>
                                      )}
                                      
                                      {/* Badges */}
                                      <div className="flex items-center gap-2 mt-2">
                                        {suggestion.source && (
                                          <Badge 
                                            variant="outline" 
                                            className={cn(
                                              "text-xs h-5",
                                              sourceColors[suggestion.source]
                                            )}
                                          >
                                            {suggestion.source.replace('_', ' ')}
                                          </Badge>
                                        )}
                                        
                                        {suggestion.category && (
                                          <Badge variant="secondary" className="text-xs h-5">
                                            {suggestion.category}
                                          </Badge>
                                        )}
                                        
                                        {suggestion.confidence >= 0.8 && (
                                          <div className="flex items-center gap-1">
                                            <Zap className="h-3 w-3 text-brand-primary" />
                                            <span className="text-xs text-brand-primary font-medium">
                                              {Math.round(suggestion.confidence * 100)}%
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Action indicator */}
                                    <div className="flex-shrink-0">
                                      <ArrowRight className={cn(
                                        "h-3 w-3 transition-opacity",
                                        isSelected ? "opacity-100" : "opacity-0"
                                      )} />
                                    </div>
                                  </div>
                                </Button>
                              </motion.div>
                            )
                          })}
                        </div>
                      ))}
                    </motion.div>
                  </ScrollArea>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between p-3 border-t bg-muted/30">
                    <div className="text-xs text-muted-foreground">
                      {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} 
                      {sources.length > 1 && ` across ${sources.length} sources`}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span>AI-powered</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}

EnhancedAutocomplete.displayName = "EnhancedAutocomplete"
export default EnhancedAutocomplete