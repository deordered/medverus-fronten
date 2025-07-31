// Prompt management store for custom user prompts
// Manages prompt templates, custom prompts, and categories

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  category: 'medical' | 'general' | 'research' | 'custom'
  isDefault: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  usageCount: number
}

export interface PromptState {
  prompts: PromptTemplate[]
  selectedPrompt: PromptTemplate | null
  searchQuery: string
  selectedCategory: string | null
  isEditing: boolean
  editingPrompt: PromptTemplate | null
}

interface PromptStore extends PromptState {
  // Actions
  addPrompt: (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void
  updatePrompt: (id: string, updates: Partial<PromptTemplate>) => void
  deletePrompt: (id: string) => void
  duplicatePrompt: (id: string) => void
  
  // Selection and editing
  setSelectedPrompt: (prompt: PromptTemplate | null) => void
  setEditingPrompt: (prompt: PromptTemplate | null) => void
  setIsEditing: (editing: boolean) => void
  
  // Search and filtering
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  getFilteredPrompts: () => PromptTemplate[]
  
  // Usage tracking
  incrementUsage: (id: string) => void
  
  // Import/Export
  exportPrompts: () => string
  importPrompts: (data: string) => boolean
  
  // Default prompts
  resetToDefaults: () => void
  loadDefaultPrompts: () => void
}

// Default medical prompt templates
const DEFAULT_MEDICAL_PROMPTS: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  {
    name: "Symptom Analysis",
    description: "Analyze patient symptoms with differential diagnosis approach",
    content: "Please analyze the following symptoms from a medical perspective, providing potential differential diagnoses, recommended investigations, and general guidance. Remember this is for educational purposes only and should not replace professional medical advice:\n\n{query}",
    category: "medical",
    isDefault: true,
    tags: ["symptoms", "diagnosis", "analysis"]
  },
  {
    name: "Drug Information",
    description: "Comprehensive medication information and interactions",
    content: "Provide comprehensive information about the following medication including mechanism of action, indications, contraindications, side effects, and important drug interactions:\n\n{query}",
    category: "medical",
    isDefault: true,
    tags: ["medications", "pharmacology", "interactions"]
  },
  {
    name: "Clinical Guidelines",
    description: "Latest evidence-based clinical practice guidelines",
    content: "Please provide the most current evidence-based clinical practice guidelines for:\n\n{query}\n\nInclude recent updates, key recommendations, and quality of evidence where available.",
    category: "medical",
    isDefault: true,
    tags: ["guidelines", "evidence-based", "practice"]
  },
  {
    name: "Research Literature",
    description: "Academic medical research and recent studies",
    content: "Find and summarize recent peer-reviewed research on:\n\n{query}\n\nFocus on high-quality studies, systematic reviews, and meta-analyses from the last 5 years.",
    category: "research",
    isDefault: true,
    tags: ["research", "literature", "studies"]
  },
  {
    name: "Patient Education",
    description: "Patient-friendly medical information",
    content: "Explain the following medical topic in patient-friendly language that is accurate, clear, and appropriate for patient education:\n\n{query}\n\nUse simple terminology while maintaining medical accuracy.",
    category: "medical",
    isDefault: true,
    tags: ["patient education", "communication", "simple language"]
  },
  {
    name: "Medical Calculation",
    description: "Medical calculations and dosing guidance",
    content: "Help with the following medical calculation or dosing question. Show the formula, calculation steps, and provide context for clinical application:\n\n{query}",
    category: "medical",
    isDefault: true,
    tags: ["calculations", "dosing", "formulas"]
  },
  {
    name: "General Medical Query",
    description: "General medical information and guidance",
    content: "Please provide comprehensive medical information about:\n\n{query}\n\nInclude relevant background, current understanding, and clinical significance.",
    category: "general",
    isDefault: true,
    tags: ["general", "medical", "information"]
  }
]

/**
 * Prompt management store using Zustand
 * Manages user-created and default prompt templates
 */
export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      // Initial state
      prompts: [],
      selectedPrompt: null,
      searchQuery: '',
      selectedCategory: null,
      isEditing: false,
      editingPrompt: null,

      // Add new prompt
      addPrompt: (promptData) => {
        const newPrompt: PromptTemplate = {
          ...promptData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
        }

        set(state => ({
          prompts: [...state.prompts, newPrompt]
        }))
      },

      // Update existing prompt
      updatePrompt: (id, updates) => {
        set(state => ({
          prompts: state.prompts.map(prompt =>
            prompt.id === id
              ? { ...prompt, ...updates, updatedAt: new Date().toISOString() }
              : prompt
          )
        }))
      },

      // Delete prompt
      deletePrompt: (id) => {
        set(state => ({
          prompts: state.prompts.filter(prompt => prompt.id !== id),
          selectedPrompt: state.selectedPrompt?.id === id ? null : state.selectedPrompt,
          editingPrompt: state.editingPrompt?.id === id ? null : state.editingPrompt,
        }))
      },

      // Duplicate prompt
      duplicatePrompt: (id) => {
        const prompt = get().prompts.find(p => p.id === id)
        if (prompt) {
          get().addPrompt({
            ...prompt,
            name: `${prompt.name} (Copy)`,
            isDefault: false,
            category: 'custom'
          })
        }
      },

      // Selection and editing
      setSelectedPrompt: (prompt) => {
        set({ selectedPrompt: prompt })
      },

      setEditingPrompt: (prompt) => {
        set({ editingPrompt: prompt, isEditing: !!prompt })
      },

      setIsEditing: (editing) => {
        set({ isEditing: editing })
      },

      // Search and filtering
      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category })
      },

      getFilteredPrompts: () => {
        const { prompts, searchQuery, selectedCategory } = get()
        
        return prompts.filter(prompt => {
          // Category filter
          if (selectedCategory && prompt.category !== selectedCategory) {
            return false
          }
          
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
              prompt.name.toLowerCase().includes(query) ||
              prompt.description.toLowerCase().includes(query) ||
              prompt.content.toLowerCase().includes(query) ||
              prompt.tags.some(tag => tag.toLowerCase().includes(query))
            )
          }
          
          return true
        }).sort((a, b) => {
          // Sort by: isDefault first, then by usage count, then by name
          if (a.isDefault && !b.isDefault) return -1
          if (!a.isDefault && b.isDefault) return 1
          if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount
          return a.name.localeCompare(b.name)
        })
      },

      // Usage tracking
      incrementUsage: (id) => {
        set(state => ({
          prompts: state.prompts.map(prompt =>
            prompt.id === id
              ? { ...prompt, usageCount: prompt.usageCount + 1 }
              : prompt
          )
        }))
      },

      // Import/Export
      exportPrompts: () => {
        const { prompts } = get()
        const customPrompts = prompts.filter(p => !p.isDefault)
        return JSON.stringify(customPrompts, null, 2)
      },

      importPrompts: (data) => {
        try {
          const importedPrompts = JSON.parse(data) as PromptTemplate[]
          
          // Validate imported data
          if (!Array.isArray(importedPrompts)) {
            return false
          }
          
          const validPrompts = importedPrompts.filter(prompt => 
            prompt.name && prompt.content && prompt.category
          ).map(prompt => ({
            ...prompt,
            id: crypto.randomUUID(), // Generate new IDs
            isDefault: false,
            category: 'custom' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
          }))
          
          if (validPrompts.length > 0) {
            set(state => ({
              prompts: [...state.prompts, ...validPrompts]
            }))
            return true
          }
          
          return false
        } catch (error) {
          console.error('Error importing prompts:', error)
          return false
        }
      },

      // Reset to defaults
      resetToDefaults: () => {
        set({ prompts: [] })
        get().loadDefaultPrompts()
      },

      loadDefaultPrompts: () => {
        const defaultPrompts = DEFAULT_MEDICAL_PROMPTS.map(prompt => ({
          ...prompt,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
        }))

        set(state => ({
          prompts: [...defaultPrompts, ...state.prompts.filter(p => !p.isDefault)]
        }))
      },
    }),
    {
      name: 'medverus-prompt-store',
      storage: createJSONStorage(() => localStorage),
      // Persist prompts and preferences, but not UI state
      partialize: (state) => ({
        prompts: state.prompts,
      }),
      // Initialize with default prompts if none exist
      onRehydrateStorage: () => (state) => {
        if (state && state.prompts.filter(p => p.isDefault).length === 0) {
          state.loadDefaultPrompts()
        }
      },
    }
  )
)

// Utility hooks for prompt operations
export const usePrompts = () => {
  const store = usePromptStore()
  return {
    prompts: store.getFilteredPrompts(),
    allPrompts: store.prompts,
    selectedPrompt: store.selectedPrompt,
    isEditing: store.isEditing,
    editingPrompt: store.editingPrompt,
    
    addPrompt: store.addPrompt,
    updatePrompt: store.updatePrompt,
    deletePrompt: store.deletePrompt,
    duplicatePrompt: store.duplicatePrompt,
    
    setSelectedPrompt: store.setSelectedPrompt,
    setEditingPrompt: store.setEditingPrompt,
    setIsEditing: store.setIsEditing,
    
    incrementUsage: store.incrementUsage,
    
    exportPrompts: store.exportPrompts,
    importPrompts: store.importPrompts,
    resetToDefaults: store.resetToDefaults,
  }
}

// Filtering hooks
export const usePromptFilters = () => usePromptStore((state) => ({
  searchQuery: state.searchQuery,
  selectedCategory: state.selectedCategory,
  setSearchQuery: state.setSearchQuery,
  setSelectedCategory: state.setSelectedCategory,
}))

// Quick actions
export const usePromptActions = () => usePromptStore((state) => ({
  addPrompt: state.addPrompt,
  incrementUsage: state.incrementUsage,
  setSelectedPrompt: state.setSelectedPrompt,
}))

// Categories for filtering
export const PROMPT_CATEGORIES = [
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'research', label: 'Research', icon: '🔬' },
  { id: 'general', label: 'General', icon: '💬' },
  { id: 'custom', label: 'Custom', icon: '✨' },
] as const