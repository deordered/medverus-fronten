// Search store for unified search-first interface
// Manages search state, history, and results

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { 
  SearchState, 
  SearchSession, 
  QueryResponse, 
  ContentSource,
  SearchSuggestion
} from '@/types'
import { queryApi } from '@/lib/api/client'

interface SearchStore extends SearchState {
  // Actions
  setCurrentQuery: (query: string) => void
  setSelectedSources: (sources: ContentSource[]) => void
  toggleSource: (source: ContentSource) => void
  setSearching: (isSearching: boolean) => void
  setResults: (results: QueryResponse | null) => void
  addToHistory: (session: SearchSession) => void
  clearHistory: () => void
  clearCurrentSearch: () => void
  
  // Search operations
  executeSearch: (query: string, sources?: ContentSource[], userPrompt?: string) => Promise<QueryResponse>
  rerunSearch: (sessionId: string) => Promise<QueryResponse>
  
  // Suggestions
  getSuggestions: (query: string) => SearchSuggestion[]
  
  // File handling
  addFiles: (files: File[]) => void
  removeFile: (index: number) => void
  clearFiles: () => void
}

/**
 * Search store using Zustand
 * Manages unified search state with persistence
 */
export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentQuery: '',
      selectedSources: ['medverus_ai'], // Default to Medverus AI
      activeResults: null,
      isSearching: false,
      searchHistory: [],
      files: [],

      // Basic state setters
      setCurrentQuery: (query: string) => {
        set({ currentQuery: query })
      },

      setSelectedSources: (sources: ContentSource[]) => {
        set({ selectedSources: sources })
      },

      toggleSource: (source: ContentSource) => {
        const { selectedSources } = get()
        const newSources = selectedSources.includes(source)
          ? selectedSources.filter(s => s !== source)
          : [...selectedSources, source]
        
        // Ensure at least one source is selected
        if (newSources.length === 0) {
          return
        }
        
        set({ selectedSources: newSources })
      },

      setSearching: (isSearching: boolean) => {
        set({ isSearching })
      },

      setResults: (results: QueryResponse | null) => {
        set({ activeResults: results })
      },

      addToHistory: (session: SearchSession) => {
        const { searchHistory } = get()
        const newHistory = [session, ...searchHistory.slice(0, 49)] // Keep last 50 searches
        set({ searchHistory: newHistory })
      },

      clearHistory: () => {
        set({ searchHistory: [] })
      },

      clearCurrentSearch: () => {
        set({ 
          currentQuery: '',
          activeResults: null,
          files: []
        })
      },

      // Execute search across selected sources with parallel processing
      executeSearch: async (query: string, sources?: ContentSource[], userPrompt?: string): Promise<QueryResponse> => {
        const state = get()
        const searchSources = sources || state.selectedSources
        const startTime = performance.now()
        
        set({ 
          isSearching: true,
          currentQuery: query,
          selectedSources: searchSources
        })

        try {
          // PERFORMANCE OPTIMIZATION: Parallel search execution
          const searchPromises = searchSources.map(async (source) => {
            try {
              return await queryApi.process({
                query,
                source,
                ...(userPrompt && { user_prompt: userPrompt }),
                max_results: 5
              })
            } catch (error) {
              console.warn(`Search failed for source ${source}:`, error)
              return null
            }
          })

          // Execute all searches in parallel with timeout
          const responses = await Promise.allSettled(
            searchPromises.map(promise => 
              Promise.race([
                promise,
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Search timeout')), 5000)
                )
              ])
            )
          )

          // Process successful responses
          const successfulResponses = responses
            .filter((result): result is PromiseFulfilledResult<any> => 
              result.status === 'fulfilled' && result.value !== null
            )
            .map(result => result.value)

          if (successfulResponses.length === 0) {
            throw new Error('All search sources failed')
          }

          // Take the first successful response and merge results from others
          const primaryResponse = successfulResponses[0]
          const allResults = successfulResponses.flatMap(response => response.results || [])
            .sort((a: any, b: any) => (b.confidence || 0) - (a.confidence || 0))
            .slice(0, 10) // Top 10 results across all sources

          const combinedResponse: QueryResponse = {
            query_id: primaryResponse.query_id || crypto.randomUUID(),
            query,
            source: searchSources[0] || 'medverus_ai', // Use first source as primary with fallback
            user_prompt: userPrompt,
            response: primaryResponse.response || 'Combined search results',
            results: allResults,
            citations: successfulResponses.flatMap(response => response.citations || []),
            processing_time_ms: performance.now() - startTime,
            timestamp: new Date().toISOString(),
            safety_applied: successfulResponses.some(response => response.safety_applied),
            content_filtered: successfulResponses.some(response => response.content_filtered)
          }

          // Create search session
          const session: SearchSession = {
            id: crypto.randomUUID(),
            query,
            sources: searchSources,
            results: combinedResponse,
            timestamp: combinedResponse.timestamp,
            processing_time: combinedResponse.processing_time_ms
          }

          // Update state
          set({ 
            activeResults: combinedResponse,
            isSearching: false
          })

          // Add to history
          get().addToHistory(session)

          return combinedResponse
        } catch (error) {
          set({ isSearching: false })
          throw error
        }
      },

      // Re-run a search from history
      rerunSearch: async (sessionId: string) => {
        const { searchHistory } = get()
        const session = searchHistory.find(s => s.id === sessionId)
        
        if (!session) {
          throw new Error('Search session not found')
        }

        return get().executeSearch(session.query, session.sources)
      },

      // Get search suggestions based on query
      getSuggestions: (query: string): SearchSuggestion[] => {
        const { searchHistory } = get()
        const suggestions: SearchSuggestion[] = []
        
        // Add suggestions from search history
        const historySuggestions = searchHistory
          .filter(session => 
            session.query.toLowerCase().includes(query.toLowerCase()) &&
            session.query !== query
          )
          .slice(0, 5)
          .map(session => ({
            id: session.id,
            text: session.query,
            type: 'history' as const,
            confidence: 0.8
          }))

        suggestions.push(...historySuggestions)

        // Add medical term suggestions (hardcoded for now, can be enhanced)
        const medicalTerms = [
          'hypertension symptoms',
          'diabetes treatment',
          'cardiovascular disease',
          'medication interactions',
          'diagnostic criteria',
          'patient assessment',
          'clinical guidelines',
          'side effects'
        ]

        const medicalSuggestions = medicalTerms
          .filter(term => 
            term.toLowerCase().includes(query.toLowerCase()) &&
            term !== query
          )
          .slice(0, 3)
          .map(term => ({
            id: crypto.randomUUID(),
            text: term,
            type: 'medical_term' as const,
            confidence: 0.9
          }))

        suggestions.push(...medicalSuggestions)

        return suggestions.slice(0, 8) // Limit to 8 suggestions
      },

      // File handling methods
      addFiles: (files: File[]) => {
        const { files: currentFiles } = get()
        set({ files: [...currentFiles, ...files] })
      },

      removeFile: (index: number) => {
        const { files } = get()
        const newFiles = files.filter((_, i) => i !== index)
        set({ files: newFiles })
      },

      clearFiles: () => {
        set({ files: [] })
      },
    }),
    {
      name: 'medverus-search-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist search history and preferences, not active state
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        selectedSources: state.selectedSources,
      }),
    }
  )
)

// Utility hooks for common search operations
export const useSearch = () => {
  const store = useSearchStore()
  return {
    currentQuery: store.currentQuery,
    selectedSources: store.selectedSources,
    activeResults: store.activeResults,
    isSearching: store.isSearching,
    searchHistory: store.searchHistory,
    files: store.files,
    
    setCurrentQuery: store.setCurrentQuery,
    setSelectedSources: store.setSelectedSources,
    toggleSource: store.toggleSource,
    executeSearch: store.executeSearch,
    rerunSearch: store.rerunSearch,
    clearCurrentSearch: store.clearCurrentSearch,
    getSuggestions: store.getSuggestions,
    
    addFiles: store.addFiles,
    removeFile: store.removeFile,
    clearFiles: store.clearFiles,
  }
}

// Selectors for specific data
export const useSearchResults = () => useSearchStore((state) => state.activeResults)
export const useSearchHistory = () => useSearchStore((state) => state.searchHistory)
export const useSearchStatus = () => useSearchStore((state) => ({
  isSearching: state.isSearching,
  hasResults: state.activeResults !== null,
  hasQuery: state.currentQuery.length > 0,
}))

// Search actions without state subscription  
export const useSearchActions = () => useSearchStore((state) => ({
  executeSearch: state.executeSearch,
  rerunSearch: state.rerunSearch,
  toggleSource: state.toggleSource,
  clearCurrentSearch: state.clearCurrentSearch,
  getSuggestions: state.getSuggestions,
}))