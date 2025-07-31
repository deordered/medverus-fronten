"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/stores/auth-store'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { handleGoogleVerification } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error('Authorization code not found')
        }

        // Use auth store to handle Google verification
        await handleGoogleVerification({
          code,
          redirect_uri: window.location.origin + '/auth/callback'
        })

        toast({
          title: "Welcome to Medverus AI!",
          description: "You have been successfully authenticated with Google.",
        })

        // Redirect to dashboard
        router.push('/dashboard')

      } catch (error: any) {
        console.error('Google OAuth callback error:', error)
        
        toast({
          title: "Authentication Failed",
          description: error.message || "Google authentication failed. Please try again.",
          variant: "destructive",
        })

        // Redirect to home page with error
        router.push('/?error=auth_failed')
      }
    }

    handleCallback()
  }, [router, toast, handleGoogleVerification])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Completing Google Sign In...
        </h2>
        <p className="text-gray-600">
          Please wait while we verify your Google account
        </p>
      </div>
    </div>
  )
}