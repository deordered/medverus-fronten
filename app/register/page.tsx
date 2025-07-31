import { Metadata } from "next"
import Link from "next/link"

import { WelcomeLoginForm } from "@/components/auth/welcome-login-form"
import { AuthGuard } from "@/components/auth/auth-guard"
import { MEDICAL_ROUTES } from "@/lib/constants/medical"

export const metadata: Metadata = {
  title: "Create Account | Medverus - Medical AI Platform",
  description: "Create your Medverus account to access AI-powered medical research and clinical decision support tools.",
  robots: "noindex", // Don't index auth pages
}

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left Column - Branding */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-gradient-to-br from-medical-green to-medical-blue" />
          
          <div className="relative z-20 flex items-center text-lg font-medium">
            <div className="mr-2 h-6 w-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-medical-blue font-bold text-sm">M</span>
            </div>
            Medverus
          </div>
          
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Join thousands of healthcare professionals who trust Medverus for 
                evidence-based medical information and clinical research."
              </p>
              <footer className="text-sm">Join the Medical AI Revolution</footer>
            </blockquote>
          </div>
        </div>

        {/* Right Column - Register Form */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            {/* Mobile Logo */}
            <div className="flex flex-col space-y-2 text-center lg:hidden">
              <div className="mx-auto h-12 w-12 bg-medical-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Medverus
              </h1>
              <p className="text-sm text-muted-foreground">
                Medical AI Platform for Healthcare Professionals
              </p>
            </div>

            {/* Google OAuth Login */}
            <WelcomeLoginForm />

            {/* Feature Highlights */}
            <div className="space-y-3 text-center">
              <p className="text-sm font-medium text-foreground">
                What you'll get with Medverus:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-medical-blue rounded-full"></span>
                  <span>Curated Medical AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-medical-green rounded-full"></span>
                  <span>PubMed Integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                  <span>Medical Web Search</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-orange-500 rounded-full"></span>
                  <span>Document Upload</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="px-8 text-center text-sm text-muted-foreground">
              <Link
                href={MEDICAL_ROUTES.public.pricing}
                className="hover:text-brand underline underline-offset-4"
              >
                View Pricing
              </Link>
              {" · "}
              <Link
                href={MEDICAL_ROUTES.public.features}
                className="hover:text-brand underline underline-offset-4"
              >
                Platform Features
              </Link>
            </div>

            {/* Medical Compliance Notice */}
            <div className="px-8 text-center">
              <p className="text-xs text-muted-foreground">
                🛡️ HIPAA-compliant security · 📚 Evidence-based content
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                By creating an account, you acknowledge this platform is for educational purposes 
                and should not replace professional medical judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}