// Zustand store for authentication state management - Google OAuth 2.0 EXCLUSIVE
// Aligned with Backend API v7.0 - NO email/password authentication

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types'
import { authService } from '@/lib/auth'

interface AuthState {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions - Google OAuth 2.0 EXCLUSIVE
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  loginWithGoogle: () => Promise<void>
  handleGoogleVerification: (authData: any) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  initialize: () => Promise<void>
  checkAuth: () => boolean
}

/**
 * Authentication store using Zustand
 * Manages authentication state with persistence
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,

      // Set user and update authentication status
      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: user !== null 
        })
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Google OAuth 2.0 exclusive authentication - NO email/password

      // Google OAuth login - Backend handles OAuth flow
      loginWithGoogle: async () => {
        set({ isLoading: true })
        
        try {
          // Get Google OAuth URL from backend
          const googleAuthUrl = await authService.getGoogleAuthUrl()
          
          // Redirect to backend's Google OAuth flow
          window.location.href = googleAuthUrl
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // Handle Google OAuth verification
      handleGoogleVerification: async (authData: any) => {
        set({ isLoading: true })
        
        try {
          // Verify Google auth with backend
          const response = await authService.verifyGoogleAuth(authData)
          
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          })
          throw error
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true })
        
        try {
          await authService.logout()
        } catch (error) {
          console.warn('Logout API call failed:', error)
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },

      // Refresh user profile
      refreshUser: async () => {
        if (!authService.isAuthenticated()) {
          set({ user: null, isAuthenticated: false })
          return
        }

        try {
          const user = await authService.getCurrentUser()
          set({ user, isAuthenticated: true })
        } catch (error) {
          console.error('Failed to refresh user:', error)
          // Don't clear auth immediately, might be temporary network issue
          // Let the auth service handle token expiry
        }
      },

      // Initialize authentication state on app start
      initialize: async () => {
        set({ isLoading: true })
        
        try {
          // Check if user has valid token
          if (authService.isAuthenticated()) {
            // Try to get current user profile
            const user = await authService.getCurrentUser()
            set({ 
              user, 
              isAuthenticated: true,
              isLoading: false 
            })
          } else {
            // No valid token, clear state
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            })
          }
        } catch (error) {
          console.error('Auth initialization failed:', error)
          // Clear auth data on initialization failure
          authService.clearAuth()
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },

      // Check current authentication status
      checkAuth: () => {
        const isAuth = authService.isAuthenticated()
        const state = get()
        
        // Update state if it's out of sync
        if (state.isAuthenticated !== isAuth) {
          if (!isAuth) {
            set({ user: null, isAuthenticated: false })
          }
        }
        
        return isAuth
      },
    }),
    {
      name: 'medverus-auth-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user data, not loading states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Handle hydration from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Verify authentication status on hydration
          const isAuth = authService.isAuthenticated()
          if (!isAuth && state.isAuthenticated) {
            // Token expired while app was closed
            state.setUser(null)
          }
        }
      },
    }
  )
)

// Utility hooks for common auth operations - Google OAuth 2.0 EXCLUSIVE
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    loginWithGoogle: store.loginWithGoogle,
    handleGoogleVerification: store.handleGoogleVerification,
    logout: store.logout,
    refreshUser: store.refreshUser,
    initialize: store.initialize,
    checkAuth: store.checkAuth,
  }
}

// Selectors for specific data
export const useAuthUser = () => useAuthStore((state) => state.user)
export const useAuthStatus = () => useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
}))

// Auth actions without state subscription - Google OAuth 2.0 EXCLUSIVE
export const useAuthActions = () => useAuthStore((state) => ({
  loginWithGoogle: state.loginWithGoogle,
  handleGoogleVerification: state.handleGoogleVerification,
  logout: state.logout,
  refreshUser: state.refreshUser,
  initialize: state.initialize,
  checkAuth: state.checkAuth,
}))