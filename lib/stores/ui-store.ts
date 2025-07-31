// UI store for sidebar, theme, and interface state management
// Manages responsive layout and user interface preferences

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UIState, SidebarPanel } from '@/types'

interface UIStore extends UIState {
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setActivePanel: (panel: SidebarPanel | null) => void
  togglePanel: (panel: SidebarPanel) => void
  setSearchDialogExpanded: (expanded: boolean) => void
  setIsMobile: (isMobile: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  
  // Responsive helpers
  initializeResponsive: () => void
  handleResize: () => void
  
  // Panel utilities
  isPanelActive: (panel: SidebarPanel) => boolean
  closeAllPanels: () => void
}

/**
 * UI store using Zustand
 * Manages interface state with responsive behavior
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      activePanel: null,
      searchDialogExpanded: false,
      isMobile: false,
      theme: 'light',

      // Sidebar controls
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
        
        // Auto-close panels when sidebar collapses on mobile
        if (collapsed && get().isMobile) {
          set({ activePanel: null })
        }
      },

      toggleSidebar: () => {
        const { sidebarCollapsed } = get()
        get().setSidebarCollapsed(!sidebarCollapsed)
      },

      // Panel management
      setActivePanel: (panel: SidebarPanel | null) => {
        set({ activePanel: panel })
        
        // Auto-expand sidebar when panel is activated
        if (panel && get().sidebarCollapsed) {
          set({ sidebarCollapsed: false })
        }
      },

      togglePanel: (panel: SidebarPanel) => {
        const { activePanel } = get()
        const newPanel = activePanel === panel ? null : panel
        get().setActivePanel(newPanel)
      },

      // Search dialog
      setSearchDialogExpanded: (expanded: boolean) => {
        set({ searchDialogExpanded: expanded })
      },

      // Mobile responsiveness
      setIsMobile: (isMobile: boolean) => {
        const wasDesktop = !get().isMobile
        set({ isMobile })
        
        // Auto-collapse sidebar when switching to mobile
        if (isMobile && wasDesktop) {
          set({ 
            sidebarCollapsed: true,
            activePanel: null 
          })
        }
        
        // Auto-expand sidebar when switching to desktop
        if (!isMobile && !wasDesktop) {
          set({ sidebarCollapsed: false })
        }
      },

      // Theme management
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme })
        
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },

      toggleTheme: () => {
        const { theme } = get()
        get().setTheme(theme === 'light' ? 'dark' : 'light')
      },

      // Responsive initialization
      initializeResponsive: () => {
        if (typeof window === 'undefined') return
        
        const checkMobile = () => {
          const isMobile = window.innerWidth < 768
          get().setIsMobile(isMobile)
        }
        
        // Initial check
        checkMobile()
        
        // Listen for resize events
        window.addEventListener('resize', checkMobile)
        
        // Cleanup function (should be called in component cleanup)
        return () => {
          window.removeEventListener('resize', checkMobile)
        }
      },

      handleResize: () => {
        if (typeof window === 'undefined') return
        
        const isMobile = window.innerWidth < 768
        get().setIsMobile(isMobile)
      },

      // Panel utilities
      isPanelActive: (panel: SidebarPanel) => {
        return get().activePanel === panel
      },

      closeAllPanels: () => {
        set({ activePanel: null })
      },
    }),
    {
      name: 'medverus-ui-store',
      storage: createJSONStorage(() => localStorage),
      // Persist user preferences but not responsive state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
      // Initialize theme on hydration
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', state.theme === 'dark')
        }
      },
    }
  )
)

// Utility hooks for common UI operations
export const useUI = () => {
  const store = useUIStore()
  return {
    sidebarCollapsed: store.sidebarCollapsed,
    activePanel: store.activePanel,
    searchDialogExpanded: store.searchDialogExpanded,
    isMobile: store.isMobile,
    theme: store.theme,
    
    setSidebarCollapsed: store.setSidebarCollapsed,
    toggleSidebar: store.toggleSidebar,
    setActivePanel: store.setActivePanel,
    togglePanel: store.togglePanel,
    setSearchDialogExpanded: store.setSearchDialogExpanded,
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    
    isPanelActive: store.isPanelActive,
    closeAllPanels: store.closeAllPanels,
    initializeResponsive: store.initializeResponsive,
    handleResize: store.handleResize,
  }
}

// Selectors for specific UI state
export const useSidebarState = () => useUIStore((state) => ({
  collapsed: state.sidebarCollapsed,
  activePanel: state.activePanel,
  isMobile: state.isMobile,
}))

export const useTheme = () => useUIStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
}))

export const useResponsive = () => useUIStore((state) => ({
  isMobile: state.isMobile,
  sidebarCollapsed: state.sidebarCollapsed,
  searchDialogExpanded: state.searchDialogExpanded,
}))

// UI actions without state subscription
export const useUIActions = () => useUIStore((state) => ({
  toggleSidebar: state.toggleSidebar,
  togglePanel: state.togglePanel,
  toggleTheme: state.toggleTheme,
  closeAllPanels: state.closeAllPanels,
  setSearchDialogExpanded: state.setSearchDialogExpanded,
}))

// Panel-specific hooks
export const usePanelState = (panel: SidebarPanel) => {
  return useUIStore((state) => ({
    isActive: state.activePanel === panel,
    toggle: () => state.togglePanel(panel),
    activate: () => state.setActivePanel(panel),
    deactivate: () => state.activePanel === panel ? state.setActivePanel(null) : undefined,
  }))
}