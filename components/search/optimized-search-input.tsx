"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useOptimizedSearch, useKeyboardNavigation } from "@/lib/performance/search-optimization"
import { searchVariants } from "@/lib/animations/motion-variants"
import { useAnimationSafeMotion } from "@/lib/animations/hooks"
import { cn } from "@/lib/utils"
import { 
  Search, 
  Loader2, 
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  X,
  Zap
} from "lucide-react"

interface OptimizedSearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string, source: string) => void
  source?: string
  className?: string
  showSuggestions?: boolean
  autoFocus?: boolean
}

/**
 * Optimized Search Input Component
 * High-performance search with instant feedback, caching, and smart suggestions
 */
export function OptimizedSearchInput({
  placeholder = "Search medical information...",
  value: controlledValue,
  onChange,
  onSearch,
  source = "medverus",
  className,
  showSuggestions = true,
  autoFocus = false
}: OptimizedSearchInputProps) {
  const [inputValue, setInputValue] = useState(controlledValue || "")
  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { shouldAnimate } = useAnimationSafeMotion()
  const { performSearch, isSearching, suggestions } = useOptimizedSearch()
  const { selectedIndex, handleKeyDown, resetSelection } = useKeyboardNavigation(suggestions)

  // Handle controlled vs uncontrolled state
  const actualValue = controlledValue !== undefined ? controlledValue : inputValue
  const setActualValue = useCallback((newValue: string) => {
    if (controlledValue !== undefined) {
      onChange?.(newValue)
    } else {
      setInputValue(newValue)
    }
  }, [controlledValue, onChange])

  // Handle input change with performance optimization
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setActualValue(newValue)
    
    // Show suggestions when typing
    if (newValue.trim() && showSuggestions) {
      setShowDropdown(true)
      performSearch(newValue, source, () => {
        // Results handled by the hook
      })
    } else {
      setShowDropdown(false)
      resetSelection()
    }
  }, [setActualValue, showSuggestions, performSearch, source, resetSelection])

  // Handle search submission
  const handleSearch = useCallback((query?: string) => {
    const searchQuery = query || actualValue.trim()
    if (searchQuery) {
      onSearch?.(searchQuery, source)
      setShowDropdown(false)
      resetSelection()
      inputRef.current?.blur()
    }
  }, [actualValue, onSearch, source, resetSelection])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    setActualValue(suggestion.text)
    handleSearch(suggestion.text)
    setShowDropdown(false)
    resetSelection()
  }, [setActualValue, handleSearch, resetSelection])

  // Handle keyboard navigation
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    const result = handleKeyDown(e.nativeEvent)
    if (result) {
      handleSuggestionSelect(result)
    } else if (e.key === 'Enter' && selectedIndex === -1) {
      e.preventDefault()
      handleSearch()
    }
  }, [handleKeyDown, handleSuggestionSelect, selectedIndex, handleSearch])

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (actualValue.trim() && showSuggestions && suggestions.length > 0) {
      setShowDropdown(true)
    }
  }, [actualValue, showSuggestions, suggestions.length])

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't hide dropdown if clicking on a suggestion
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return
    }
    setIsFocused(false)
    setShowDropdown(false)
    resetSelection()
  }, [resetSelection])

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case 'popular':
        return <TrendingUp className="h-3 w-3 text-muted-foreground" />
      case 'medical':
        return <Sparkles className="h-3 w-3 text-medical-primary" />
      case 'completion':
        return <Zap className="h-3 w-3 text-muted-foreground" />
      default:
        return <Search className="h-3 w-3 text-muted-foreground" />
    }
  }

  // Animation variants for search states
  const searchState = isSearching ? 'processing' : isFocused ? 'focused' : 'expanded'

  return (
    <TooltipProvider>
      <div className={cn("relative w-full", className)}>
        {/* Main Search Input */}
        <motion.div
          className="relative"
          variants={searchVariants}
          animate={searchState}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={actualValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                "pl-10 pr-20 h-12 text-base",
                "transition-all duration-200 ease-out",
                "border-2 hover:border-medical-primary/30",
                isFocused && "border-medical-primary shadow-lg",
                isSearching && "border-medical-primary/50"
              )}
              autoComplete="off"
              spellCheck="false"
            />
            
            {/* Right side actions */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {/* Loading indicator */}
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-medical-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Clear button */}
              <AnimatePresence>
                {actualValue && !isSearching && (
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
                          className="h-6 w-6 p-0 hover:bg-muted"
                          onClick={() => {
                            setActualValue("")
                            setShowDropdown(false)
                            inputRef.current?.focus()
                          }}
                        >
                          <X className="h-3 w-3" />
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
                    className="h-6 px-2"
                    onClick={() => handleSearch()}
                    disabled={!actualValue.trim() || isSearching}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </motion.div>

        {/* Suggestions Dropdown */}
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
              <Card className="shadow-lg border-2">
                <CardContent className="p-2">
                  <ScrollArea className="max-h-64">
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <motion.div
                          key={`${suggestion.text}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start h-auto p-3 text-left",
                              selectedIndex === index && "bg-medical-primary/10 text-medical-primary"
                            )}
                            onClick={() => handleSuggestionSelect(suggestion)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              {getSuggestionIcon(suggestion.type)}
                              
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {suggestion.text}
                                </div>
                                {suggestion.type && (
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {suggestion.type}
                                    {suggestion.confidence && (
                                      <span className="ml-2">
                                        {Math.round(suggestion.confidence * 100)}% match
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {/* Performance indicator */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t text-xs text-muted-foreground">
                    <span>
                      {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
                    </span>
                    {isSearching && (
                      <Badge variant="outline" className="text-xs">
                        <Loader2 className="h-2 w-2 mr-1 animate-spin" />
                        Searching...
                      </Badge>
                    )}
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

OptimizedSearchInput.displayName = "OptimizedSearchInput"
export default OptimizedSearchInput