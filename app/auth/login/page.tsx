// Redirect route for cached browser redirects
// This page handles the 308 redirect cache issue where browsers redirect /login → /auth/login
// Immediately redirects to the main homepage with integrated login experience

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect to homepage for streamlined authentication experience
    router.replace('/')
  }, [router])

  // Show minimal loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  )
}