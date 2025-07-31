"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { MEDICAL_ROUTES } from "@/lib/constants/medical"
import type { 
  UserResponse
} from "@/types"

interface AuthState {
  user: UserResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  })

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser()
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          }))
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          }))
        }
      } catch (error) {
        // Token might be expired or invalid
        authService.clearAuth()
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        }))
      }
    }

    checkAuth()
  }, [])

  // Google OAuth login function
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const googleAuthUrl = await authService.getGoogleAuthUrl()
      window.location.href = googleAuthUrl
    } catch (error: any) {
      const errorMessage = error.message || 'Google authentication failed'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // Handle Google OAuth verification
  const handleGoogleVerification = useCallback(async (authData: any): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await authService.verifyGoogleAuth(authData)
      const user = await authService.getCurrentUser()
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }))
    } catch (error: any) {
      const errorMessage = error.message || 'Google verification failed'
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await authService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      
      // Redirect to login page
      router.push(MEDICAL_ROUTES.public.login)
    }
  }, [router])

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!authService.isAuthenticated()) return

    try {
      const user = await authService.getCurrentUser()
      setState(prev => ({
        ...prev,
        user,
        error: null
      }))
    } catch (error: any) {
      console.error('Failed to refresh user:', error)
      // If refresh fails, user might need to re-authenticate
      if (error.response?.status === 401) {
        await logout()
      }
    }
  }, [logout])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // Actions - Google OAuth 2.0 EXCLUSIVE
    loginWithGoogle,
    handleGoogleVerification,
    logout,
    refreshUser,
    clearError
  }
}

// Hook for protecting routes
export function useAuthGuard(requireAuth = true) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(MEDICAL_ROUTES.public.login)
      } else if (!requireAuth && isAuthenticated) {
        router.push(MEDICAL_ROUTES.protected.dashboard)
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router])

  return {
    isAuthenticated,
    isLoading,
    canAccess: requireAuth ? isAuthenticated : !isAuthenticated
  }
}

// Hook for getting medical tier information
export function useMedicalTier() {
  const { user } = useAuth()
  
  const tierLimits = {
    free: {
      medverus_ai: 10,
      pubmed: 10,
      web_search: 10,
      file_upload: { count: 1, size_mb: 5 }
    },
    pro: {
      medverus_ai: 100,
      pubmed: 20,
      web_search: 100,
      file_upload: { count: 10, size_mb: 10 }
    },
    enterprise: {
      medverus_ai: 250,
      pubmed: 50,
      web_search: 250,
      file_upload: { count: 25, size_mb: 20 }
    }
  }

  return {
    tier: user?.tier || 'free',
    limits: user ? tierLimits[user.tier] : tierLimits.free,
    usage: user?.daily_usage || {
      medverus_ai: 0,
      pubmed: 0,
      web_search: 0,
      file_upload: 0
    },
    user
  }
}