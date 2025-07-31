// Search store unit tests for medical AI platform
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearchStore } from '../search-store'
import type { QueryResponse, ContentSource } from '@/types'

// Mock API client
vi.mock('@/lib/api/client', () => ({
  queryApi: {
    process: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock crypto.randomUUID using vi.stubGlobal
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'mock-uuid-123')
})

describe('Search Store', () => {
  beforeEach(() => {
    // Reset store state completely
    useSearchStore.getState().clearCurrentSearch()
    useSearchStore.getState().clearHistory()
    useSearchStore.getState().setSelectedSources(['medverus_ai']) // Reset to default
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const state = useSearchStore.getState()
    
    expect(state.currentQuery).toBe('')
    expect(state.selectedSources).toEqual(['medverus_ai'])
    expect(state.activeResults).toBeNull()
    expect(state.isSearching).toBe(false)
    expect(state.searchHistory).toEqual([])
    expect(state.files).toEqual([])
  })

  it('should set current query correctly', () => {
    const { setCurrentQuery } = useSearchStore.getState()
    
    setCurrentQuery('diabetes treatment')
    expect(useSearchStore.getState().currentQuery).toBe('diabetes treatment')
  })

  it('should set selected sources correctly', () => {
    const { setSelectedSources } = useSearchStore.getState()
    const sources: ContentSource[] = ['medverus_ai', 'pubmed']
    
    setSelectedSources(sources)
    expect(useSearchStore.getState().selectedSources).toEqual(sources)
  })

  it('should toggle sources correctly', () => {
    const { toggleSource } = useSearchStore.getState()
    
    // Start with default medverus_ai
    expect(useSearchStore.getState().selectedSources).toEqual(['medverus_ai'])
    
    // Add pubmed
    toggleSource('pubmed')
    expect(useSearchStore.getState().selectedSources).toEqual(['medverus_ai', 'pubmed'])
    
    // Remove medverus_ai
    toggleSource('medverus_ai')
    expect(useSearchStore.getState().selectedSources).toEqual(['pubmed'])
    
    // Should not allow removing all sources
    toggleSource('pubmed')
    expect(useSearchStore.getState().selectedSources).toEqual(['pubmed'])
  })

  it('should handle search execution successfully', async () => {
    const mockResponse: QueryResponse = {
      id: 'response-123',
      query: 'hypertension treatment',
      source: 'medverus_ai',
      results: [
        {
          id: 'result-1',
          title: 'Hypertension Treatment Guidelines',
          content: 'Treatment approaches for hypertension...',
          source: 'medverus_ai',
          confidence: 0.95,
          url: 'https://medverus.ai/hypertension',
          relevance_score: 0.92
        }
      ],
      processing_time_ms: 1250,
      total_results: 1,
      timestamp: '2024-01-01T00:00:00.000Z'
    }

    const { queryApi } = await import('@/lib/api/client')
    vi.mocked(queryApi.process).mockResolvedValue(mockResponse)

    const { executeSearch } = useSearchStore.getState()
    
    const result = await executeSearch('hypertension treatment')
    
    expect(result).toEqual(mockResponse)
    expect(useSearchStore.getState().activeResults).toEqual(mockResponse)
    expect(useSearchStore.getState().isSearching).toBe(false)
    expect(useSearchStore.getState().currentQuery).toBe('hypertension treatment')
    
    // Should add to history
    const history = useSearchStore.getState().searchHistory
    expect(history).toHaveLength(1)
    expect(history[0].query).toBe('hypertension treatment')
    expect(history[0].results).toEqual(mockResponse)
  })

  it('should handle search execution failure', async () => {
    const { queryApi } = await import('@/lib/api/client')
    vi.mocked(queryApi.process).mockRejectedValue(new Error('API Error'))

    const { executeSearch } = useSearchStore.getState()
    
    await expect(executeSearch('invalid query')).rejects.toThrow('API Error')
    
    expect(useSearchStore.getState().isSearching).toBe(false)
    expect(useSearchStore.getState().activeResults).toBeNull()
  })

  it('should rerun search from history', async () => {
    const mockResponse: QueryResponse = {
      id: 'response-123',
      query: 'diabetes symptoms',
      source: 'medverus_ai',
      results: [],
      processing_time_ms: 800,
      total_results: 0,
      timestamp: '2024-01-01T00:00:00.000Z'
    }

    // Add a search to history first
    const session = {
      id: 'session-123',
      query: 'diabetes symptoms',
      sources: ['medverus_ai'] as ContentSource[],
      results: mockResponse,
      timestamp: '2024-01-01T00:00:00.000Z',
      processing_time: 800
    }

    useSearchStore.getState().addToHistory(session)
    
    const { queryApi } = await import('@/lib/api/client')
    vi.mocked(queryApi.process).mockResolvedValue(mockResponse)

    const { rerunSearch } = useSearchStore.getState()
    
    const result = await rerunSearch('session-123')
    
    expect(result).toEqual(mockResponse)
    expect(queryApi.process).toHaveBeenCalledWith({
      query: 'diabetes symptoms',
      source: 'medverus_ai',
      user_prompt: undefined,
      max_results: 5
    })
  })

  it('should handle rerun search with invalid session', async () => {
    const { rerunSearch } = useSearchStore.getState()
    
    await expect(rerunSearch('invalid-session-id')).rejects.toThrow('Search session not found')
  })

  it('should generate medical term suggestions', () => {
    const { getSuggestions } = useSearchStore.getState()
    
    const suggestions = getSuggestions('hyper')
    
    expect(suggestions.length).toBeGreaterThan(0)
    const hypertensionSuggestion = suggestions.find(s => s.text.includes('hypertension'))
    expect(hypertensionSuggestion).toBeDefined()
    expect(hypertensionSuggestion?.type).toBe('medical_term')
    expect(hypertensionSuggestion?.confidence).toBe(0.9)
  })

  it('should generate history-based suggestions', () => {
    // Add search history
    const session = {
      id: 'session-1',
      query: 'hypertension medication',
      sources: ['medverus_ai'] as ContentSource[],
      results: {} as QueryResponse,
      timestamp: '2024-01-01T00:00:00.000Z',
      processing_time: 1000
    }

    useSearchStore.getState().addToHistory(session)

    const { getSuggestions } = useSearchStore.getState()
    
    const suggestions = getSuggestions('hyper')
    
    const historySuggestion = suggestions.find(s => s.type === 'history')
    expect(historySuggestion).toBeDefined()
    expect(historySuggestion?.text).toBe('hypertension medication')
    expect(historySuggestion?.confidence).toBe(0.8)
  })

  it('should limit suggestions to 8 items', () => {
    // Add multiple history items
    for (let i = 0; i < 10; i++) {
      const session = {
        id: `session-${i}`,
        query: `hypertension query ${i}`,
        sources: ['medverus_ai'] as ContentSource[],
        results: {} as QueryResponse,
        timestamp: '2024-01-01T00:00:00.000Z',
        processing_time: 1000
      }
      useSearchStore.getState().addToHistory(session)
    }

    const { getSuggestions } = useSearchStore.getState()
    
    const suggestions = getSuggestions('hyper')
    
    expect(suggestions.length).toBeLessThanOrEqual(8)
  })

  it('should handle file operations correctly', () => {
    const { addFiles, removeFile, clearFiles } = useSearchStore.getState()
    
    const mockFile1 = new File(['content1'], 'medical-report-1.pdf', { type: 'application/pdf' })
    const mockFile2 = new File(['content2'], 'lab-results.pdf', { type: 'application/pdf' })
    
    // Add files
    addFiles([mockFile1, mockFile2])
    expect(useSearchStore.getState().files).toHaveLength(2)
    
    // Remove first file
    removeFile(0)
    expect(useSearchStore.getState().files).toHaveLength(1)
    expect(useSearchStore.getState().files[0].name).toBe('lab-results.pdf')
    
    // Clear all files
    clearFiles()
    expect(useSearchStore.getState().files).toHaveLength(0)
  })

  it('should clear current search correctly', () => {
    const { setCurrentQuery, setResults, addFiles, clearCurrentSearch } = useSearchStore.getState()
    
    // Set up search state
    setCurrentQuery('test query')
    setResults({ id: 'test' } as QueryResponse)
    addFiles([new File(['content'], 'test.pdf')])
    
    clearCurrentSearch()
    
    const state = useSearchStore.getState()
    expect(state.currentQuery).toBe('')
    expect(state.activeResults).toBeNull()
    expect(state.files).toHaveLength(0)
  })

  it('should limit search history to 50 items', () => {
    const { addToHistory } = useSearchStore.getState()
    
    // Add 55 items to history
    for (let i = 0; i < 55; i++) {
      const session = {
        id: `session-${i}`,
        query: `query ${i}`,
        sources: ['medverus_ai'] as ContentSource[],
        results: {} as QueryResponse,
        timestamp: '2024-01-01T00:00:00.000Z',
        processing_time: 1000
      }
      addToHistory(session)
    }
    
    const history = useSearchStore.getState().searchHistory
    expect(history).toHaveLength(50)
    
    // Should keep most recent items
    expect(history[0].query).toBe('query 54')
    expect(history[49].query).toBe('query 5')
  })

  it('should handle search with custom sources and prompt', async () => {
    const mockResponse: QueryResponse = {
      id: 'response-123',
      query: 'cardiac assessment',
      source: 'pubmed',
      results: [],
      processing_time_ms: 1500,
      total_results: 0,
      timestamp: '2024-01-01T00:00:00.000Z'
    }

    const { queryApi } = await import('@/lib/api/client')
    vi.mocked(queryApi.process).mockResolvedValue(mockResponse)

    const { executeSearch } = useSearchStore.getState()
    
    await executeSearch('cardiac assessment', ['pubmed'], 'Focus on recent studies')
    
    expect(queryApi.process).toHaveBeenCalledWith({
      query: 'cardiac assessment',
      source: 'pubmed',
      user_prompt: 'Focus on recent studies',
      max_results: 5
    })
    
    expect(useSearchStore.getState().selectedSources).toEqual(['pubmed'])
  })
})