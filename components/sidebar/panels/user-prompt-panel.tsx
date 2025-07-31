"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { userApi } from "@/lib/api/client"
import { useAuth } from "@/lib/stores/auth-store"
import { useUI } from "@/lib/stores/ui-store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  X,
  Save,
  RotateCcw,
  User,
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Settings
} from "lucide-react"

interface UserPromptPanelProps {
  className?: string
}

/**
 * User Prompt Panel Component - ALIGNED WITH ARCHITECTURE.MD
 * Account-level persistent prompt that applies to ALL queries, searches, and sessions
 * Maximum 2-3 paragraphs as per architectural specification
 */
export function UserPromptPanel({ className }: UserPromptPanelProps) {
  const { user, isAuthenticated } = useAuth()
  const { activePanel, setActivePanel } = useUI()
  const { toast } = useToast()

  // State management
  const [userPrompt, setUserPrompt] = useState('')
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Character count limits (2-3 paragraphs as per architecture.md)
  const MAX_CHARACTERS = 800 // Approximately 2-3 paragraphs
  const characterCount = userPrompt.length
  const isOverLimit = characterCount > MAX_CHARACTERS

  // Load user prompt on component mount
  useEffect(() => {
    if (isAuthenticated && activePanel === 'user-prompt') {
      loadUserPrompt()
    }
  }, [isAuthenticated, activePanel])

  // Check for changes
  useEffect(() => {
    setHasChanges(userPrompt !== originalPrompt)
  }, [userPrompt, originalPrompt])

  // Load user prompt from backend
  const loadUserPrompt = async () => {
    setIsLoading(true)
    try {
      const response = await userApi.getUserPrompt()
      const prompt = response.user_prompt || ''
      setUserPrompt(prompt)
      setOriginalPrompt(prompt)
      
      if (response.updated_at) {
        setLastSaved(new Date(response.updated_at))
      }
    } catch (error: any) {
      // If prompt doesn't exist yet, that's fine
      if (!error.message?.includes('404')) {
        toast({
          title: "Failed to load user prompt",
          description: error.message || "Could not load your personal prompt settings.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Save user prompt to backend
  const saveUserPrompt = async () => {
    if (isOverLimit) {
      toast({
        title: "Prompt too long",
        description: `Please keep your prompt under ${MAX_CHARACTERS} characters (currently ${characterCount}).`,
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await userApi.setUserPrompt(userPrompt.trim())
      setOriginalPrompt(userPrompt)
      setLastSaved(new Date())
      
      toast({
        title: "User prompt saved",
        description: "Your personal prompt will now be applied to all future queries.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to save prompt",
        description: error.message || "Could not save your personal prompt.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete user prompt
  const deleteUserPrompt = async () => {
    setIsSaving(true)
    try {
      await userApi.deleteUserPrompt()
      setUserPrompt('')
      setOriginalPrompt('')
      setLastSaved(null)
      
      toast({
        title: "User prompt deleted",
        description: "Your personal prompt has been removed from all future queries.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to delete prompt",
        description: error.message || "Could not delete your personal prompt.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to original
  const resetPrompt = () => {
    setUserPrompt(originalPrompt)
  }

  if (activePanel !== 'user-prompt') return null

  return (
    <div className={cn(
      "fixed inset-y-16 right-0 w-96 bg-background border-l border-border shadow-lg z-40",
      "transform transition-transform duration-300 ease-in-out",
      className
    )}>
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-medical-primary" />
          <h3 className="font-semibold">Personal Prompt</h3>
          <Badge variant="secondary" className="text-xs">Account-level</Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePanel(null)}
          className="p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Info Section */}
        <div className="p-4 border-b">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How Personal Prompts Work</p>
                  <p className="text-xs">
                    Your personal prompt is applied to <strong>ALL queries</strong> across 
                    all sources (Medverus AI, PubMed, Web Search, File Uploads) and persists 
                    across all sessions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompt Editor */}
        <div className="flex-1 p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-medical-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading prompt...</span>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Personal Prompt (Applied to all queries)
                </label>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Enter your personal prompt here... This will be applied to every query you make.

Examples:
• Focus on clinical trials and peer-reviewed research
• Explain in layperson terms suitable for patient education
• Prioritize recent studies from the last 5 years
• Format responses in tabular format when possible"
                  rows={12}
                  className={cn(
                    "resize-none text-sm",
                    isOverLimit && "border-destructive focus:border-destructive"
                  )}
                />
                
                {/* Character Counter */}
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="text-muted-foreground">
                    Maximum 2-3 paragraphs as per architectural specification
                  </div>
                  <div className={cn(
                    "font-medium",
                    isOverLimit ? "text-destructive" : 
                    characterCount > MAX_CHARACTERS * 0.8 ? "text-orange-600" : 
                    "text-muted-foreground"
                  )}>
                    {characterCount}/{MAX_CHARACTERS}
                  </div>
                </div>
              </div>

              {/* Examples Section */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Example Use Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground space-y-2">
                    <div>
                      <span className="font-medium">Clinical Focus:</span> "Focus on clinical trials and evidence-based medicine"
                    </div>
                    <div>
                      <span className="font-medium">Patient Education:</span> "Explain in simple terms for patient understanding"
                    </div>
                    <div>
                      <span className="font-medium">Research Preference:</span> "Prioritize recent studies from the last 3 years"
                    </div>
                    <div>
                      <span className="font-medium">Format Preference:</span> "Provide responses in structured bullet points"
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t space-y-3">
          {/* Status */}
          {lastSaved && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              Last saved: {lastSaved.toLocaleString()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={saveUserPrompt}
              disabled={!hasChanges || isOverLimit || isSaving}
              className="flex-1"
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Prompt
                </>
              )}
            </Button>

            {hasChanges && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPrompt}
                      disabled={isSaving}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset changes</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Delete Button */}
          {originalPrompt && (
            <>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Delete your personal prompt? This will remove it from all future queries.')) {
                    deleteUserPrompt()
                  }
                }}
                disabled={isSaving}
                className="w-full text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Delete Personal Prompt
              </Button>
            </>
          )}

          {/* Warning */}
          {isOverLimit && (
            <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <span>
                Prompt exceeds maximum length. Please reduce to {MAX_CHARACTERS} characters or less.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

UserPromptPanel.displayName = "UserPromptPanel"

export default UserPromptPanel