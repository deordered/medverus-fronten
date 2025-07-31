"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_ROUTES } from "@/lib/constants/medical"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallbackPath?: string
  loadingComponent?: React.ReactNode
}

/**
 * Authentication guard component
 * Protects routes based on authentication and admin status
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallbackPath = MEDICAL_ROUTES.public.login,
  loadingComponent,
}: AuthGuardProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, initialize, checkAuth } = useAuth()

  useEffect(() => {
    // Initialize auth state on mount
    const initializeAuth = async () => {
      try {
        await initialize()
        
        // Verify authentication status
        checkAuth()
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Auth initialization failed:', error)
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [initialize, checkAuth])

  useEffect(() => {
    // Only run checks after initialization is complete
    if (!isInitialized || isLoading) return

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      // Store current path for redirect after login
      const returnUrl = encodeURIComponent(pathname)
      const loginUrl = `${fallbackPath}?returnUrl=${returnUrl}`
      router.push(loginUrl)
      return
    }

    // Check if admin access is required
    if (requireAdmin && (!user || !user.is_admin)) {
      // Redirect to dashboard or unauthorized page
      router.push(MEDICAL_ROUTES.protected.dashboard)
      return
    }

    // If authentication is NOT required but user is authenticated,
    // and they're on auth pages, redirect to dashboard
    if (!requireAuth && isAuthenticated) {
      const authPages = [
        MEDICAL_ROUTES.public.login,
        MEDICAL_ROUTES.public.register,
      ]
      
      if (authPages.includes(pathname as "/login" | "/register")) {
        router.push(MEDICAL_ROUTES.protected.dashboard)
        return
      }
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    user,
    requireAuth,
    requireAdmin,
    pathname,
    router,
    fallbackPath,
  ])

  // Show loading state during initialization or auth checks
  if (!isInitialized || isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-medical-blue" />
          <p className="text-sm text-muted-foreground">
            Initializing Medverus...
          </p>
        </div>
      </div>
    )
  }

  // Don't render children during redirect
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (requireAdmin && (!user || !user.is_admin)) {
    return null
  }

  // Render children when all auth checks pass
  return <>{children}</>
}

/**
 * HOC for protecting page components
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

/**
 * Hook for checking authentication status in components
 */
export function useAuthGuard(
  requireAuth: boolean = true,
  requireAdmin: boolean = false
) {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  const isAuthorized = () => {
    if (requireAuth && !isAuthenticated) return false
    if (requireAdmin && (!user || !user.is_admin)) return false
    return true
  }

  return {
    isAuthenticated,
    isAuthorized: isAuthorized(),
    isAdmin: user?.is_admin || false,
    isLoading,
    user,
  }
}