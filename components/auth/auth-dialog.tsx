"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WelcomeLoginForm } from "./welcome-login-form"
import { Stethoscope } from "lucide-react"

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const handleSuccess = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl shadow-lg">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            Medverus AI
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Advanced Medical AI Platform for Healthcare Professionals
          </DialogDescription>
        </DialogHeader>

        {/* Google OAuth 2.0 Exclusive - No tabs needed */}

        {/* Content - Google OAuth 2.0 Exclusive */}
        <div className="p-6 pt-4">
          <WelcomeLoginForm 
            onSuccess={handleSuccess}
            className="space-y-4"
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-xs text-muted-foreground bg-card/50 rounded-lg p-3 border border-primary/10">
            <Stethoscope className="w-3 h-3 inline mr-1 text-primary" />
            <strong>Medical Disclaimer:</strong> This platform provides educational information for healthcare professionals only.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}