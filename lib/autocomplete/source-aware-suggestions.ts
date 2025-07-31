/**
 * Source-Aware Autocomplete System
 * Intelligent suggestions based on selected content sources and medical context
 */

import { debounce } from "lodash-es"
import type { ContentSource } from "@/types"

export interface SourceAwareSuggestion {
  text: string
  type: 'medical' | 'recent' | 'popular' | 'completion' | 'source-specific'
  source?: ContentSource
  confidence: number
  category?: string
  description?: string
  icon?: string
  priority: number
  metadata?: {
    specialty?: string
    frequency?: number
    lastUsed?: string
    similarity?: number
  }
}

export interface SuggestionContext {
  query: string
  sources: ContentSource[]
  userTier: string
  recentQueries: string[]
  userSpecialty?: string
  searchHistory: SearchHistoryEntry[]
}

export interface SearchHistoryEntry {
  query: string
  source: ContentSource
  timestamp: string
  resultCount: number
  successful: boolean
}

/**
 * Medical terminology database by specialty and source
 */
const MEDICAL_TERMINOLOGY = {
  // Medverus AI - Curated clinical guidelines and protocols
  medverus_ai: {
    cardiology: [
      'acute coronary syndrome', 'myocardial infarction', 'heart failure', 'arrhythmia',
      'hypertension management', 'cardiac catheterization', 'echocardiography',
      'electrocardiogram', 'beta blockers', 'ACE inhibitors', 'stent placement'
    ],
    neurology: [
      'stroke protocol', 'seizure management', 'multiple sclerosis', 'alzheimer disease',
      'parkinson disease', 'migraine treatment', 'brain tumor', 'epilepsy',
      'dementia care', 'neurological assessment', 'cognitive impairment'
    ],
    emergency: [
      'trauma assessment', 'sepsis protocol', 'respiratory failure', 'shock management',
      'cardiac arrest', 'poisoning treatment', 'anaphylaxis', 'burns treatment',
      'fracture management', 'emergency surgery', 'critical care'
    ],
    internal_medicine: [
      'diabetes management', 'chronic kidney disease', 'liver disease', 'infectious disease',
      'endocrine disorders', 'gastrointestinal bleeding', 'pneumonia treatment',
      'medication reconciliation', 'preventive care', 'geriatric care'
    ]
  },

  // PubMed - Research and clinical studies
  pubmed: {
    research: [
      'clinical trial', 'randomized controlled trial', 'systematic review', 'meta-analysis',
      'case study', 'cohort study', 'observational study', 'biomarker research',
      'drug efficacy', 'treatment outcomes', 'evidence-based medicine'
    ],
    specialties: [
      'oncology research', 'cardiology studies', 'neurology trials', 'pediatric research',
      'surgical outcomes', 'pharmacology', 'immunology', 'genetics research',
      'radiology imaging', 'pathology findings', 'laboratory medicine'
    ]
  },

  // Web Search - General medical information
  web_search: {
    patient_education: [
      'patient information', 'health education', 'disease prevention', 'lifestyle medicine',
      'nutrition guidelines', 'exercise recommendations', 'smoking cessation',
      'medication adherence', 'self-care', 'health screening'
    ],
    guidelines: [
      'clinical practice guidelines', 'treatment protocols', 'best practices',
      'medical standards', 'healthcare quality', 'patient safety', 'infection control',
      'medical ethics', 'healthcare policy', 'professional development'
    ]
  },

  // File Upload - Personal documents
  file_upload: {
    personal: [
      'my medical records', 'patient history', 'lab results', 'imaging reports',
      'discharge summary', 'medication list', 'treatment plan', 'consultation notes',
      'surgical reports', 'diagnostic tests', 'personal health information'
    ]
  }
}

/**
 * Popular medical search patterns by source
 */
const POPULAR_PATTERNS = {
  medverus_ai: [
    '{condition} treatment protocol',
    '{condition} clinical guidelines', 
    '{medication} dosing guidelines',
    '{procedure} best practices',
    'emergency {condition} management'
  ],
  pubmed: [
    '{condition} clinical trial',
    '{medication} efficacy study',
    '{condition} systematic review',
    '{procedure} outcomes research',
    '{condition} meta-analysis'
  ],
  web_search: [
    '{condition} patient education',
    '{condition} prevention',
    '{medication} side effects',
    '{condition} lifestyle management',
    '{condition} complications'
  ],
  file_upload: [
    'find {condition} in my records',
    'my {medication} history',
    '{test} results analysis',
    'previous {condition} treatments',
    'medication interactions check'
  ]
}

/**
 * Generate source-aware suggestions
 */
export class SourceAwareSuggestionEngine {
  private searchHistory: SearchHistoryEntry[] = []
  private popularQueries: Map<string, number> = new Map()
  private recentQueries: string[] = []

  constructor() {
    this.loadSearchHistory()
    this.loadPopularQueries()
  }

  /**
   * Generate intelligent suggestions based on context
   */
  generateSuggestions(context: SuggestionContext): SourceAwareSuggestion[] {
    const { query, sources, userTier, recentQueries } = context
    const suggestions: SourceAwareSuggestion[] = []

    if (!query.trim()) {
      return this.getDefaultSuggestions(sources, userTier)
    }

    // 1. Source-specific medical terminology
    suggestions.push(...this.getSourceSpecificSuggestions(query, sources))

    // 2. Recent query suggestions
    suggestions.push(...this.getRecentQuerySuggestions(query, recentQueries))

    // 3. Popular pattern suggestions
    suggestions.push(...this.getPopularPatternSuggestions(query, sources))

    // 4. Medical completion suggestions
    suggestions.push(...this.getMedicalCompletions(query, sources))

    // 5. Cross-source suggestions (for multi-source searches)
    if (sources.length > 1) {
      suggestions.push(...this.getCrossSourceSuggestions(query, sources))
    }

    // Sort by priority and confidence, then limit
    return suggestions
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority
        return b.confidence - a.confidence
      })
      .slice(0, 8)
      .map((suggestion, index) => ({
        ...suggestion,
        priority: suggestion.priority - (index * 0.1) // Slight priority decay
      }))
  }

  /**
   * Get default suggestions when no query is entered
   */
  private getDefaultSuggestions(sources: ContentSource[], userTier: string): SourceAwareSuggestion[] {
    const suggestions: SourceAwareSuggestion[] = []

    // Recent popular queries
    const popularQueries = Array.from(this.popularQueries.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([query, frequency]) => ({
        text: query,
        type: 'popular' as const,
        confidence: Math.min(0.9, frequency / 10),
        priority: 8,
        description: `Popular search (${frequency} times)`,
        icon: '🔥'
      }))

    suggestions.push(...popularQueries)

    // Source-specific defaults
    sources.forEach(source => {
      const defaults = this.getSourceDefaults(source)
      suggestions.push(...defaults.slice(0, 2))
    })

    return suggestions.slice(0, 6)
  }

  /**
   * Get source-specific suggestions
   */
  private getSourceSpecificSuggestions(query: string, sources: ContentSource[]): SourceAwareSuggestion[] {
    const suggestions: SourceAwareSuggestion[] = []

    sources.forEach(source => {
      const sourceTerms = MEDICAL_TERMINOLOGY[source]
      if (!sourceTerms) return

      Object.entries(sourceTerms).forEach(([category, terms]) => {
        const matchingTerms = terms
          .filter(term => term.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 2)
          .map(term => ({
            text: term,
            type: 'source-specific' as const,
            source,
            confidence: this.calculateConfidence(query, term, source),
            priority: this.getSourcePriority(source),
            category,
            description: `${this.getSourceDescription(source)} - ${category}`,
            icon: this.getSourceIcon(source),
            metadata: {
              specialty: category,
              similarity: this.calculateSimilarity(query, term)
            }
          }))

        suggestions.push(...matchingTerms)
      })
    })

    return suggestions
  }

  /**
   * Get recent query suggestions
   */
  private getRecentQuerySuggestions(query: string, recentQueries: string[]): SourceAwareSuggestion[] {
    return recentQueries
      .filter(recent => 
        recent.toLowerCase().includes(query.toLowerCase()) &&
        recent.toLowerCase() !== query.toLowerCase()
      )
      .slice(0, 2)
      .map(recent => ({
        text: recent,
        type: 'recent' as const,
        confidence: 0.8,
        priority: 7,
        description: 'Recent search',
        icon: '🕒',
        metadata: {
          lastUsed: 'recently'
        }
      }))
  }

  /**
   * Get popular pattern suggestions
   */
  private getPopularPatternSuggestions(query: string, sources: ContentSource[]): SourceAwareSuggestion[] {
    const suggestions: SourceAwareSuggestion[] = []

    sources.forEach(source => {
      const patterns = POPULAR_PATTERNS[source] || []
      
      patterns.forEach(pattern => {
        const suggestion = pattern.replace('{condition}', query)
          .replace('{medication}', query)
          .replace('{procedure}', query)
          .replace('{test}', query)

        if (suggestion !== pattern && suggestion.length > query.length + 3) {
          suggestions.push({
            text: suggestion,
            type: 'completion' as const,
            source,
            confidence: 0.75,
            priority: 6,
            description: `${this.getSourceDescription(source)} pattern`,
            icon: this.getSourceIcon(source),
            metadata: {
              similarity: this.calculateSimilarity(query, suggestion)
            }
          })
        }
      })
    })

    return suggestions.slice(0, 3)
  }

  /**
   * Get medical completion suggestions
   */
  private getMedicalCompletions(query: string, sources: ContentSource[]): SourceAwareSuggestion[] {
    const completions = [
      'treatment', 'symptoms', 'diagnosis', 'medication', 'guidelines',
      'management', 'therapy', 'prevention', 'complications', 'prognosis'
    ]

    return completions
      .filter(completion => !query.toLowerCase().includes(completion))
      .slice(0, 3)
      .map(completion => ({
        text: `${query} ${completion}`,
        type: 'completion' as const,
        confidence: 0.7,
        priority: 5,
        description: 'Medical completion',
        icon: '🏥',
        metadata: {
          specialty: 'general'
        }
      }))
  }

  /**
   * Get cross-source suggestions
   */
  private getCrossSourceSuggestions(query: string, sources: ContentSource[]): SourceAwareSuggestion[] {
    const suggestions: SourceAwareSuggestion[] = []

    if (sources.includes('medverus_ai') && sources.includes('pubmed')) {
      suggestions.push({
        text: `${query} evidence-based guidelines`,
        type: 'completion' as const,
        confidence: 0.85,
        priority: 8,
        description: 'Combine guidelines with research',
        icon: '🔬',
        metadata: {
          specialty: 'evidence-based'
        }
      })
    }

    if (sources.includes('file_upload') && sources.length > 1) {
      suggestions.push({
        text: `compare ${query} with my records`,
        type: 'completion' as const,
        confidence: 0.8,
        priority: 7,
        description: 'Compare with personal documents',
        icon: '📊',
        metadata: {
          specialty: 'personal'
        }
      })
    }

    return suggestions
  }

  /**
   * Calculate suggestion confidence
   */
  private calculateConfidence(query: string, suggestion: string, source?: ContentSource): number {
    const baseConfidence = 0.5
    const queryLower = query.toLowerCase()
    const suggestionLower = suggestion.toLowerCase()

    // Exact match bonus
    if (suggestionLower.includes(queryLower)) {
      const matchRatio = queryLower.length / suggestionLower.length
      const confidence = baseConfidence + (matchRatio * 0.4)
      
      // Source-specific bonuses
      if (source === 'medverus_ai') return Math.min(0.95, confidence + 0.1)
      if (source === 'pubmed') return Math.min(0.9, confidence + 0.05)
      
      return Math.min(0.9, confidence)
    }

    return baseConfidence
  }

  /**
   * Calculate text similarity
   */
  private calculateSimilarity(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const textWords = text.toLowerCase().split(/\s+/)
    
    const commonWords = queryWords.filter(word => 
      textWords.some(textWord => textWord.includes(word) || word.includes(textWord))
    )
    
    return commonWords.length / Math.max(queryWords.length, 1)
  }

  /**
   * Get source priority
   */
  private getSourcePriority(source: ContentSource): number {
    const priorities = {
      medverus_ai: 9,
      pubmed: 8,
      web_search: 7,
      file_upload: 8
    }
    return priorities[source] || 5
  }

  /**
   * Get source description
   */
  private getSourceDescription(source: ContentSource): string {
    const descriptions = {
      medverus_ai: 'Clinical Guidelines',
      pubmed: 'Research Literature',
      web_search: 'Medical Web',
      file_upload: 'Personal Documents'
    }
    return descriptions[source] || 'Medical'
  }

  /**
   * Get source icon
   */
  private getSourceIcon(source: ContentSource): string {
    const icons = {
      medverus_ai: '🧠',
      pubmed: '📚',
      web_search: '🌐',
      file_upload: '📄'
    }
    return icons[source] || '🏥'
  }

  /**
   * Get source-specific defaults
   */
  private getSourceDefaults(source: ContentSource): SourceAwareSuggestion[] {
    const defaults = {
      medverus_ai: [
        'emergency protocols', 'clinical guidelines', 'treatment algorithms'
      ],
      pubmed: [
        'latest research', 'clinical trials', 'systematic reviews'
      ],
      web_search: [
        'patient education', 'medical guidelines', 'health information'
      ],
      file_upload: [
        'my medical history', 'previous results', 'personal health records'
      ]
    }

    return (defaults[source] || []).map(text => ({
      text,
      type: 'source-specific' as const,
      source,
      confidence: 0.8,
      priority: this.getSourcePriority(source),
      description: this.getSourceDescription(source),
      icon: this.getSourceIcon(source)
    }))
  }

  /**
   * Load search history from storage
   */
  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem('medverus-search-history')
      if (stored) {
        this.searchHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load search history:', error)
    }
  }

  /**
   * Load popular queries from storage
   */
  private loadPopularQueries(): void {
    try {
      const stored = localStorage.getItem('medverus-popular-queries')
      if (stored) {
        const data = JSON.parse(stored)
        this.popularQueries = new Map(Object.entries(data))
      }
    } catch (error) {
      console.warn('Failed to load popular queries:', error)
    }
  }

  /**
   * Record a search for future suggestions
   */
  recordSearch(query: string, source: ContentSource, successful: boolean): void {
    // Update search history
    this.searchHistory.unshift({
      query,
      source,
      timestamp: new Date().toISOString(),
      resultCount: successful ? 1 : 0,
      successful
    })

    // Limit history size
    this.searchHistory = this.searchHistory.slice(0, 100)

    // Update popular queries
    const current = this.popularQueries.get(query) || 0
    this.popularQueries.set(query, current + 1)

    // Update recent queries
    this.recentQueries = [query, ...this.recentQueries.filter(q => q !== query)].slice(0, 10)

    // Persist to storage
    try {
      localStorage.setItem('medverus-search-history', JSON.stringify(this.searchHistory))
      localStorage.setItem('medverus-popular-queries', JSON.stringify(Object.fromEntries(this.popularQueries)))
    } catch (error) {
      console.warn('Failed to persist search data:', error)
    }
  }

  /**
   * Clear search history and suggestions
   */
  clearHistory(): void {
    this.searchHistory = []
    this.popularQueries.clear()
    this.recentQueries = []
    
    try {
      localStorage.removeItem('medverus-search-history')
      localStorage.removeItem('medverus-popular-queries')
    } catch (error) {
      console.warn('Failed to clear search data:', error)
    }
  }
}

// Global instance
export const suggestionEngine = new SourceAwareSuggestionEngine()

/**
 * Hook for using source-aware suggestions
 */
export function useSourceAwareSuggestions() {
  const generateSuggestions = debounce((context: SuggestionContext) => {
    return suggestionEngine.generateSuggestions(context)
  }, 100)

  const recordSearch = (query: string, source: ContentSource, successful: boolean) => {
    suggestionEngine.recordSearch(query, source, successful)
  }

  const clearHistory = () => {
    suggestionEngine.clearHistory()
  }

  return {
    generateSuggestions,
    recordSearch,
    clearHistory
  }
}