"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Chrome, ArrowRight, Shield, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/client"
import { MEDICAL_ROUTES } from "@/lib/constants/medical"

// Google OAuth 2.0 Exclusive Authentication - Backend API v7.0

interface WelcomeLoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
  className?: string
}

export function WelcomeLoginForm({ 
  onSuccess, 
  redirectTo = MEDICAL_ROUTES.protected.dashboard,
  className = "" 
}: WelcomeLoginFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Google OAuth 2.0 exclusive authentication flow

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      // Use backend's Google OAuth authorization endpoint
      const googleAuthUrl = await authApi.getGoogleAuthUrl()
      
      toast({
        title: "Redirecting to Google...",
        description: "You'll be redirected to Google for secure authentication.",
      })
      
      // Redirect to backend's Google OAuth flow
      window.location.href = googleAuthUrl
    } catch (error: any) {
      toast({
        title: "Google Login Failed",
        description: error.message || "Failed to initialize Google login. Please try again.",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className={`bg-white shadow-lg ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Welcome to Medverus
        </CardTitle>
        <CardDescription>
          Join healthcare professionals using AI-powered medical research
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Google OAuth 2.0 Exclusive Authentication */}
        <div className="space-y-6">
          {/* Primary Google Login Button */}
          <Button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-14 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            variant="outline"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <Chrome className="mr-3 h-6 w-6 text-blue-500" />
                <span className="flex-1 text-center font-medium">Continue with Google</span>
                <ArrowRight className="ml-3 h-5 w-5 text-gray-400" />
              </>
            )}
          </Button>

          {/* Security Features */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-semibold text-blue-900 mb-1">Secure Google Authentication</h4>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• Medical-grade security with Google OAuth 2.0</li>
                  <li>• No passwords stored - enhanced data protection</li>
                  <li>• HIPAA-compliant authentication system</li>
                  <li>• Quick access with your existing Google account</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Information Section */}
        <div className="space-y-3 text-center">
          <div className="text-sm text-gray-600">
            <p className="font-medium">New to Medverus AI?</p>
            <p className="text-xs text-gray-500 mt-1">
              Just click "Continue with Google" above to create your account automatically.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Lock className="h-3 w-3" />
            <span>Your Google account is never stored or accessed beyond authentication</span>
          </div>
        </div>

        {/* Medical Disclaimer & Terms */}
        <div className="text-xs text-center text-gray-500 space-y-2">
          <p>
            By continuing with Google, you acknowledge that this platform is for educational 
            purposes only and should not replace professional medical advice.
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs">
            <Button 
              variant="link" 
              size="sm"
              onClick={() => router.push(MEDICAL_ROUTES.public.privacy)}
              className="p-0 h-auto text-xs text-gray-500 hover:text-blue-600"
            >
              Privacy Policy
            </Button>
            <span>•</span>
            <Button 
              variant="link" 
              size="sm"
              onClick={() => router.push('/terms')}
              className="p-0 h-auto text-xs text-gray-500 hover:text-blue-600"
            >
              Terms of Service
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}