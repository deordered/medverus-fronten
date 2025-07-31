"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users, 
  Shield, 
  Heart, 
  CheckCircle2,
  Star
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WelcomeLoginForm } from '@/components/auth/welcome-login-form'
import { AuthGuard } from '@/components/auth/auth-guard'

// Google OAuth configuration
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://medverus-backend.fly.dev'

export default function HomePage() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
  }

  const handleGoogleLogin = () => {
    const state = crypto.randomUUID()
    sessionStorage.setItem('oauth_state', state)
    
    const authUrl = `${BACKEND_BASE_URL}/api/v1/auth/google/authorize?state=${state}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}`
    window.location.href = authUrl
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary/40 via-white/60 to-primary/45 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-primary/15 pointer-events-none"></div>
        <div className="grid lg:grid-cols-2 min-h-screen relative z-10">
          
          {/* Auth Form Side - Fixed on Right */}
          <div className="lg:order-2 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-lg space-y-6">
              
              {/* Logo & Brand */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/assets/logos/main.svg"
                    alt="Medverus AI"
                    width={80}
                    height={80}
                    className="h-20 w-20"
                  />
                </div>
                <h1 className="text-3xl font-bold leading-tight" style={{color: '#2d2d2d'}}>
                  Medverus AI
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  Advanced Medical AI Platform
                </p>
                <Badge variant="outline" className="border-primary/40 bg-primary/5" style={{color: '#2d2d2d'}}>
                  <Heart className="h-3 w-3 mr-1" />
                  For Healthcare Professionals
                </Badge>
              </div>

              {/* Auth Form */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl space-y-6">
                <div className="transition-all duration-300 ease-in-out">
                  {authMode === 'login' ? (
                    <WelcomeLoginForm onSuccess={() => {}} />
                  ) : (
                    <WelcomeLoginForm onSuccess={() => {}} />
                  )}
                </div>

                {/* Google OAuth Button */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                {/* Auth Toggle */}
                <div className="text-center pt-4 border-t border-gray-100">
                  {authMode === 'login' ? (
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        onClick={toggleAuthMode}
                        className="font-medium transition-colors underline-offset-4 hover:underline"
                        style={{color: '#2d2d2d'}}
                      >
                        Sign up here
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={toggleAuthMode}
                        className="font-medium transition-colors underline-offset-4 hover:underline"
                        style={{color: '#2d2d2d'}}
                      >
                        Sign in here
                      </button>
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="text-center text-sm text-gray-500 space-y-2">
                <div className="flex justify-center space-x-4">
                  <Link href="/privacy" className="hover:text-gray-700 hover:underline transition-colors">Privacy</Link>
                  <span>•</span>
                  <Link href="/terms" className="hover:text-gray-700 hover:underline transition-colors">Terms</Link>
                  <span>•</span>
                  <Link href="/contact" className="hover:text-gray-700 hover:underline transition-colors">Support</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Information Side - Fixed on Left */}
          <div className="lg:order-1 p-6 lg:p-12 flex items-center">
            <div className="w-full max-w-2xl mx-auto space-y-8">
              
              {/* Header */}
              <div className="text-center lg:text-left">
                <Badge variant="outline" className="mb-4 border-primary/50 bg-white/80 backdrop-blur-sm shadow-sm" style={{color: '#2d2d2d'}}>
                  <Shield className="h-4 w-4 mr-1" />
                  HIPAA Compliant • Trusted by Healthcare Professionals
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4" style={{color: '#2d2d2d'}}>
                  Comprehensive Medical 
                  <span className="block" style={{color: '#2d2d2d'}}>Intelligence Platform</span>
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                  Integrate multiple trusted sources with AI-powered analysis for evidence-based clinical decisions
                </p>
              </div>

              {/* Content Sources Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/95 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                        <Image
                          src="/assets/logos/main.svg"
                          alt="Medverus AI"
                          width={20}
                          height={20}
                          className="h-5 w-5"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">Medverus AI</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">Curated clinical guidelines and protocols</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/70 to-primary rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                          <title>PubMed</title>
                          <path d="M8.23 7.982l.006-1.005C7.846 1.417 5.096 0 5.096 0l.048 2.291C3.73 1.056 2.6 1.444 2.6 1.444l.118 15.307s4.218-1.796 5.428 5.505C10.238 13.535 21.401 24 21.401 24V9S10.52-.18 8.231 7.982zm9.79 9.941l-1.046-5.232-1.904 4.507h-.96l-1.72-4.301-1.046 5.04H9.321l2.093-9.39h.802l2.491 5.543 2.508-5.557h.869l2.075 9.39h-2.138z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">PubMed</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">Latest biomedical research and studies</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/50 to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Web Search</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">Trusted medical websites and resources</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/40 to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Your Files</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">Upload and search your documents</p>
                  </CardContent>
                </Card>
              </div>

              {/* Pricing Section - Enhanced */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-xl">
                <h3 className="text-2xl font-bold mb-8 flex items-center justify-center lg:justify-start" style={{color: '#2d2d2d'}}>
                  <Users className="w-7 h-7 mr-3" style={{color: '#2d2d2d'}} />
                  Choose Your Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  
                  {/* Free Plan */}
                  <div className="bg-gray-50/95 backdrop-blur-sm rounded-xl p-4 md:p-6 border-2 border-gray-200 hover:border-primary/30 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 text-center flex flex-col min-h-full">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Free</h4>
                    <p className="text-sm text-gray-600 mb-6 font-medium">Getting Started</p>
                    <div className="mb-6 md:mb-8">
                      <div className="flex items-baseline justify-center gap-1 flex-nowrap">
                        <span className="text-base font-bold" style={{color: '#2d2d2d'}}>$0</span>
                        <span className="text-xs text-gray-600">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-3 md:space-y-4 text-sm text-gray-700 flex-1">
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">10 queries per source daily</span>
                      </li>
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">1 file upload (5MB)</span>
                      </li>
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">Basic medical features</span>
                      </li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-gradient-to-br from-primary/15 to-primary/8 backdrop-blur-sm rounded-xl p-4 md:p-6 border-2 border-primary/40 relative shadow-xl text-center hover:scale-[1.02] hover:shadow-2xl hover:border-primary/60 transition-all duration-200 flex flex-col min-h-full">
                    <div className="flex items-center justify-center mb-2">
                      <Badge className="bg-primary text-white px-3 py-1 text-xs font-semibold shadow-lg inline-flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Pro</h4>
                    <p className="text-sm text-gray-700 mb-6 font-medium">For Professionals</p>
                    <div className="mb-6 md:mb-8">
                      <div className="flex items-baseline justify-center gap-1 flex-nowrap">
                        <span className="text-base font-bold" style={{color: '#2d2d2d'}}>IQD 15,000</span>
                        <span className="text-xs text-gray-600">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-3 md:space-y-4 text-sm text-gray-700 flex-1">
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">100 AI + 20 PubMed queries</span>
                      </li>
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">10 files daily (10MB each)</span>
                      </li>
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">Priority support</span>
                      </li>
                    </ul>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="bg-gray-50/95 backdrop-blur-sm rounded-xl p-4 md:p-6 border-2 border-gray-200 hover:border-primary/30 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 text-center flex flex-col min-h-full">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Enterprise</h4>
                    <p className="text-sm text-gray-600 mb-6 font-medium">Organizations</p>
                    <div className="mb-6 md:mb-8">
                      <div className="flex items-baseline justify-center gap-1 flex-nowrap">
                        <span className="text-base font-bold" style={{color: '#2d2d2d'}}>IQD 45,000</span>
                        <span className="text-xs text-gray-600">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-3 md:space-y-4 text-sm text-gray-700 flex-1">
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">250 AI + 50 PubMed queries</span>
                      </li>
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">25 files daily (20MB each)</span>
                      </li>
                      <li className="flex items-center text-left">
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                        <span className="font-medium">HIPAA compliance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-6">
            <p className="text-sm text-gray-500 text-center">
              © 2025 Medverus AI. All rights reserved. This platform is for medical professionals only.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}