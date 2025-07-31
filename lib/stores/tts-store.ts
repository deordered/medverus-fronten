// TTS (Text-to-Speech) store for medical content audio generation
// Manages TTS queue, settings, and quota tracking

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TTSState, TTSItem, TTSSettings } from '@/types'

interface TTSStore extends TTSState {
  // Actions
  addToQueue: (text: string, options?: Partial<TTSSettings>) => void
  removeFromQueue: (id: string) => void
  clearQueue: () => void
  playNext: () => Promise<void>
  pausePlayback: () => void
  stopPlayback: () => void
  skipCurrent: () => void
  
  // Settings management
  updateSettings: (settings: Partial<TTSSettings>) => void
  setVoice: (voice: string) => void
  setRate: (rate: number) => void
  setVolume: (volume: number) => void
  setAutoPlay: (autoPlay: boolean) => void
  setEnabled: (enabled: boolean) => void
  
  // Quota management
  updateQuota: (used: number, limit: number) => void
  canUseTTS: () => boolean
  
  // Playback state
  setCurrentItem: (item: TTSItem | null) => void
  setPlaying: (isPlaying: boolean) => void
  updateItemStatus: (id: string, status: TTSItem['status']) => void
}

// Default TTS settings optimized for medical content
const DEFAULT_TTS_SETTINGS: TTSSettings = {
  voice: 'en-US-AriaNeural', // Microsoft's clear medical voice
  rate: 0.9, // Slightly slower for medical terms
  volume: 0.8,
  autoPlay: false,
  enabled: true,
}

/**
 * TTS store using Zustand
 * Manages text-to-speech functionality with medical optimization
 */
export const useTTSStore = create<TTSStore>()(
  persist(
    (set, get) => ({
      // Initial state
      queue: [],
      currentItem: null,
      settings: DEFAULT_TTS_SETTINGS,
      remainingQuota: 1000, // Default quota
      dailyLimit: 1000,
      isPlaying: false,

      // Queue management
      addToQueue: (text: string, options?: Partial<TTSSettings>) => {
        const { settings, canUseTTS } = get()
        
        if (!canUseTTS()) {
          throw new Error('TTS quota exceeded for today')
        }

        const item: TTSItem = {
          id: crypto.randomUUID(),
          text: text.trim(),
          voice: options?.voice || settings.voice,
          rate: options?.rate || settings.rate,
          volume: options?.volume || settings.volume,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }

        set(state => ({
          queue: [...state.queue, item]
        }))

        // Auto-play if enabled and nothing is currently playing
        if (settings.autoPlay && !get().isPlaying && !get().currentItem) {
          get().playNext()
        }
      },

      removeFromQueue: (id: string) => {
        set(state => ({
          queue: state.queue.filter(item => item.id !== id)
        }))
      },

      clearQueue: () => {
        set({ queue: [] })
      },

      // Playback controls
      playNext: async () => {
        const { queue, settings, isPlaying } = get()
        
        if (isPlaying || queue.length === 0) {
          return
        }

        const nextItem = queue[0]
        if (!nextItem) {
          return
        }
        
        set({
          currentItem: nextItem,
          isPlaying: true,
          queue: queue.slice(1)
        })

        get().updateItemStatus(nextItem.id, 'playing')

        try {
          // Use Web Speech API for TTS
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(nextItem.text)
            utterance.voice = speechSynthesis.getVoices().find(voice => 
              voice.name.includes(nextItem.voice) || voice.lang.startsWith('en')
            ) || null
            utterance.rate = nextItem.rate
            utterance.volume = nextItem.volume

            utterance.onend = () => {
              if (nextItem) {
                get().updateItemStatus(nextItem.id, 'completed')
              }
              set({ 
                currentItem: null, 
                isPlaying: false 
              })
              
              // Update quota
              const { remainingQuota } = get()
              set({ remainingQuota: Math.max(0, remainingQuota - 1) })
              
              // Auto-play next if enabled
              if (settings.autoPlay && get().queue.length > 0) {
                setTimeout(() => get().playNext(), 500)
              }
            }

            utterance.onerror = () => {
              if (nextItem) {
                get().updateItemStatus(nextItem.id, 'error')
              }
              set({ 
                currentItem: null, 
                isPlaying: false 
              })
            }

            speechSynthesis.speak(utterance)
          } else {
            throw new Error('Speech synthesis not supported')
          }
        } catch (error) {
          if (nextItem) {
            get().updateItemStatus(nextItem.id, 'error')
          }
          set({ 
            currentItem: null, 
            isPlaying: false 
          })
          console.error('TTS playback error:', error)
        }
      },

      pausePlayback: () => {
        if ('speechSynthesis' in window) {
          speechSynthesis.pause()
        }
      },

      stopPlayback: () => {
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel()
        }
        
        const { currentItem } = get()
        if (currentItem) {
          get().updateItemStatus(currentItem.id, 'completed')
        }
        
        set({ 
          currentItem: null, 
          isPlaying: false 
        })
      },

      skipCurrent: () => {
        get().stopPlayback()
        
        // Auto-play next if available and auto-play is enabled
        if (get().settings.autoPlay && get().queue.length > 0) {
          setTimeout(() => get().playNext(), 100)
        }
      },

      // Settings management
      updateSettings: (newSettings: Partial<TTSSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      setVoice: (voice: string) => {
        get().updateSettings({ voice })
      },

      setRate: (rate: number) => {
        // Clamp rate between 0.5 and 2.0 for medical safety
        const clampedRate = Math.max(0.5, Math.min(2.0, rate))
        get().updateSettings({ rate: clampedRate })
      },

      setVolume: (volume: number) => {
        // Clamp volume between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, volume))
        get().updateSettings({ volume: clampedVolume })
      },

      setAutoPlay: (autoPlay: boolean) => {
        get().updateSettings({ autoPlay })
      },

      setEnabled: (enabled: boolean) => {
        get().updateSettings({ enabled })
        
        // Stop playback if disabled
        if (!enabled) {
          get().stopPlayback()
          get().clearQueue()
        }
      },

      // Quota management
      updateQuota: (used: number, limit: number) => {
        set({ 
          remainingQuota: Math.max(0, limit - used),
          dailyLimit: limit 
        })
      },

      canUseTTS: () => {
        const { remainingQuota, settings } = get()
        return settings.enabled && remainingQuota > 0
      },

      // Internal state management
      setCurrentItem: (item: TTSItem | null) => {
        set({ currentItem: item })
      },

      setPlaying: (isPlaying: boolean) => {
        set({ isPlaying })
      },

      updateItemStatus: (id: string, status: TTSItem['status']) => {
        const { currentItem } = get()
        if (currentItem && currentItem.id === id) {
          set({
            currentItem: { ...currentItem, status }
          })
        }
      },
    }),
    {
      name: 'medverus-tts-store',
      storage: createJSONStorage(() => localStorage),
      // Persist settings and quota, but not playback state
      partialize: (state) => ({
        settings: state.settings,
        remainingQuota: state.remainingQuota,
        dailyLimit: state.dailyLimit,
      }),
    }
  )
)

// Utility hooks for TTS operations
export const useTTS = () => {
  const store = useTTSStore()
  return {
    queue: store.queue,
    currentItem: store.currentItem,
    settings: store.settings,
    remainingQuota: store.remainingQuota,
    dailyLimit: store.dailyLimit,
    isPlaying: store.isPlaying,
    
    addToQueue: store.addToQueue,
    removeFromQueue: store.removeFromQueue,
    clearQueue: store.clearQueue,
    playNext: store.playNext,
    pausePlayback: store.pausePlayback,
    stopPlayback: store.stopPlayback,
    skipCurrent: store.skipCurrent,
    
    updateSettings: store.updateSettings,
    setVoice: store.setVoice,
    setRate: store.setRate,
    setVolume: store.setVolume,
    setAutoPlay: store.setAutoPlay,
    setEnabled: store.setEnabled,
    
    updateQuota: store.updateQuota,
    canUseTTS: store.canUseTTS,
  }
}

// Selectors for specific TTS data
export const useTTSPlayback = () => useTTSStore((state) => ({
  currentItem: state.currentItem,
  isPlaying: state.isPlaying,
  queue: state.queue,
  queueLength: state.queue.length,
}))

export const useTTSSettings = () => useTTSStore((state) => ({
  settings: state.settings,
  updateSettings: state.updateSettings,
  setVoice: state.setVoice,
  setRate: state.setRate,
  setVolume: state.setVolume,
  setAutoPlay: state.setAutoPlay,
  setEnabled: state.setEnabled,
}))

export const useTTSQuota = () => useTTSStore((state) => ({
  remaining: state.remainingQuota,
  limit: state.dailyLimit,
  percentage: (state.remainingQuota / state.dailyLimit) * 100,
  canUse: state.canUseTTS(),
}))

// TTS actions without state subscription
export const useTTSActions = () => useTTSStore((state) => ({
  addToQueue: state.addToQueue,
  playNext: state.playNext,
  stopPlayback: state.stopPlayback,
  skipCurrent: state.skipCurrent,
  clearQueue: state.clearQueue,
}))

// Medical-specific TTS helpers
export const useMedicalTTS = () => {
  const { addToQueue, settings } = useTTS()
  
  return {
    // Speak medical content with optimized settings
    speakMedicalContent: (text: string) => {
      addToQueue(text, {
        rate: 0.85, // Slower for medical terms
        voice: 'en-US-AriaNeural', // Clear medical voice
      })
    },
    
    // Speak search results
    speakSearchResult: (title: string, content: string) => {
      const medicalText = `${title}. ${content}`
      addToQueue(medicalText, {
        rate: 0.9,
        voice: settings.voice,
      })
    },
    
    // Speak citations in Vancouver format
    speakCitation: (citation: string) => {
      addToQueue(`Citation: ${citation}`, {
        rate: 0.8, // Slower for citations
        voice: settings.voice,
      })
    },
  }
}