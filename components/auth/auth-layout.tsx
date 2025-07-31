"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Heart, Users } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  showMedicalDisclaimer?: boolean
}

export function AuthLayout({
  children,
  title,
  description,
  showMedicalDisclaimer = true
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-primary/5 to-medical-success/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-medical-primary/10 rounded-lg">
              <Heart className="h-8 w-8 text-medical-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Medverus AI</h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Advanced Medical AI Platform for Healthcare Professionals
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              HIPAA Compliant
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              Professional Use
            </Badge>
          </div>
        </div>

        {/* Main auth card */}
        <div className="max-w-md mx-auto">
          <Card className="shadow-medical-elevated">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>

          {/* Medical disclaimer */}
          {showMedicalDisclaimer && (
            <Alert variant="medical" className="mt-6">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Medical Professional Platform:</strong> This platform is designed for 
                healthcare professionals and medical students. All AI-generated content is for 
                educational purposes only and should not replace professional medical judgment.
              </AlertDescription>
            </Alert>
          )}

          {/* Footer links */}
          <div className="text-center mt-6 space-y-2">
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-foreground transition-colors">
                Contact Support
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 Medverus AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}