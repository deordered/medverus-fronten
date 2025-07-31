"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Brain, 
  BookOpen, 
  Globe, 
  FileText, 
  Search, 
  Loader2, 
  AlertCircle,
  Info,
  Zap
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMedicalTier } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { cn, getMedicalSourceConfig } from "@/lib/utils"
import type { ContentSource, QueryRequest } from "@/types"

// Validation schema for medical queries
const queryFormSchema = z.object({
  query: z
    .string()
    .min(5, "Query must be at least 5 characters")
    .max(2000, "Query must be less than 2000 characters"),
  source: z.enum(["medverus_ai", "pubmed", "web_search", "file_upload"]),
  userPrompt: z
    .string()
    .max(500, "Additional instructions must be less than 500 characters")
    .optional(),
  maxResults: z
    .number()
    .min(1, "Must request at least 1 result")
    .max(20, "Cannot request more than 20 results")
    .default(5)
})

type QueryFormValues = z.infer<typeof queryFormSchema>

interface QueryFormProps {
  onSubmit: (query: QueryRequest) => Promise<void>
  isLoading?: boolean
  className?: string
}

export function QueryForm({ onSubmit, isLoading = false, className }: QueryFormProps) {
  const [selectedSource, setSelectedSource] = useState<ContentSource>("medverus_ai")
  const { tier, limits, usage } = useMedicalTier()
  const { toast } = useToast()

  const form = useForm<QueryFormValues>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: {
      query: "",
      source: "medverus_ai",
      userPrompt: "",
      maxResults: 5
    }
  })

  // Content source configurations
  const contentSources = [
    {
      id: "medverus_ai" as ContentSource,
      name: "Medverus AI",
      description: "Curated medical knowledge and clinical guidelines",
      icon: Brain,
      color: "bg-medical-primary",
      textColor: "text-medical-primary",
      available: true
    },
    {
      id: "pubmed" as ContentSource,
      name: "PubMed",
      description: "Real-time biomedical literature from NCBI",
      icon: BookOpen,
      color: "bg-medical-success",
      textColor: "text-medical-success",
      available: true
    },
    {
      id: "web_search" as ContentSource,
      name: "Medical Web Search",
      description: "Trusted medical websites and resources",
      icon: Globe,
      color: "bg-source-web",
      textColor: "text-source-web",
      available: true
    },
    {
      id: "file_upload" as ContentSource,
      name: "Your Documents",
      description: "Search your uploaded private documents",
      icon: FileText,
      color: "bg-source-files",
      textColor: "text-source-files",
      available: usage.file_upload > 0 // Only available if user has uploaded files
    }
  ]

  // Get usage status for selected source
  const getUsageStatus = (source: ContentSource) => {
    const currentUsage = usage[source as keyof typeof usage] || 0
    const limit = source === "file_upload" 
      ? limits.file_upload.count 
      : limits[source as keyof Omit<typeof limits, 'file_upload'>]
    
    const percentage = limit > 0 ? (currentUsage / limit) * 100 : 0
    
    return {
      current: currentUsage,
      limit,
      percentage,
      remaining: Math.max(0, limit - currentUsage),
      canQuery: currentUsage < limit
    }
  }

  const handleSubmit = async (values: QueryFormValues) => {
    const sourceUsage = getUsageStatus(values.source)
    
    if (!sourceUsage.canQuery) {
      toast({
        title: "Usage Limit Reached",
        description: `You've reached your daily limit for ${contentSources.find(s => s.id === values.source)?.name}. Consider upgrading your tier.`,
        variant: "destructive"
      })
      return
    }

    try {
      await onSubmit({
        query: values.query,
        source: values.source,
        user_prompt: values.userPrompt || undefined,
        max_results: values.maxResults
      })
    } catch (error) {
      console.error("Query submission failed:", error)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 bg-medical-primary/10 rounded-lg">
            <Search className="h-6 w-6 text-medical-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Medical AI Query</h2>
        </div>
        <p className="text-muted-foreground">
          Search medical knowledge across multiple trusted sources
        </p>
      </div>

      {/* Tier and Usage Status */}
      <Card className="border-medical-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={`tier-${tier}` as any}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                Daily Usage
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contentSources.map((source) => {
            const usageStatus = getUsageStatus(source.id)
            return (
              <div key={source.id} className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <source.icon className={cn("h-4 w-4", source.textColor)} />
                  <span className="text-sm font-medium">{source.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {usageStatus.current} / {usageStatus.limit}
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div 
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      usageStatus.percentage >= 90 ? "bg-medical-danger" :
                      usageStatus.percentage >= 75 ? "bg-medical-warning" :
                      "bg-medical-success"
                    )}
                    style={{ width: `${Math.min(usageStatus.percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Content Source Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Select Content Source</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contentSources.map((source) => {
            const usageStatus = getUsageStatus(source.id)
            const isSelected = selectedSource === source.id
            const isDisabled = !source.available || !usageStatus.canQuery

            return (
              <Card 
                key={source.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected ? "ring-2 ring-medical-primary bg-medical-primary/5" : "",
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={() => {
                  if (!isDisabled) {
                    setSelectedSource(source.id)
                    form.setValue("source", source.id)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", source.color)}>
                      <source.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{source.name}</h3>
                        {isSelected && (
                          <Badge variant="outline" className="text-xs">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {source.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {usageStatus.remaining} queries remaining
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Special notice for file uploads */}
      {selectedSource === "file_upload" && usage.file_upload === 0 && (
        <Alert variant="medical-warning">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You haven't uploaded any documents yet. Upload medical documents 
            in your dashboard to search through your private collection.
          </AlertDescription>
        </Alert>
      )}

      {/* Query Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Main Query Input */}
        <div className="space-y-2">
          <Label htmlFor="query" className="text-base font-medium">
            Medical Question
          </Label>
          <Input
            id="query"
            placeholder="e.g., What are the symptoms and treatment options for hypertension?"
            {...form.register("query")}
            disabled={isLoading}
            className="min-h-[80px] resize-none"
          />
          {form.formState.errors.query && (
            <p className="text-sm text-destructive">
              {form.formState.errors.query.message}
            </p>
          )}
          <div className="text-xs text-muted-foreground">
            {form.watch("query")?.length || 0} / 2000 characters
          </div>
        </div>

        {/* Additional Instructions */}
        <div className="space-y-2">
          <Label htmlFor="userPrompt" className="text-sm font-medium">
            Additional Instructions (Optional)
          </Label>
          <Input
            id="userPrompt"
            placeholder="e.g., Explain in simple terms, Focus on prevention, Include recent research"
            {...form.register("userPrompt")}
            disabled={isLoading}
          />
          {form.formState.errors.userPrompt && (
            <p className="text-sm text-destructive">
              {form.formState.errors.userPrompt.message}
            </p>
          )}
        </div>

        {/* Max Results */}
        <div className="space-y-2">
          <Label htmlFor="maxResults" className="text-sm font-medium">
            Number of Results
          </Label>
          <Input
            id="maxResults"
            type="number"
            min={1}
            max={20}
            {...form.register("maxResults", { valueAsNumber: true })}
            disabled={isLoading}
            className="w-24"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="medical"
          size="lg"
          className="w-full"
          disabled={isLoading || !form.formState.isValid || !getUsageStatus(selectedSource).canQuery}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Searching Medical Knowledge...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Search Medical AI
            </>
          )}
        </Button>
      </form>

      {/* Medical Disclaimer */}
      <Alert variant="medical">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Medical Disclaimer:</strong> This information is for educational 
          purposes only and should not replace professional medical advice. Always 
          consult with qualified healthcare providers for medical decisions.
        </AlertDescription>
      </Alert>
    </div>
  )
}