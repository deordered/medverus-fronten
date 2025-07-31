"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, Loader2, Sparkles, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { useProcessQuery } from "@/lib/api/hooks"
import { MEDICAL_QUERY_VALIDATION } from "@/lib/constants/medical"
import { sanitizeMedicalQuery } from "@/lib/utils"
import type { ContentSource } from "@/types"

// Form validation schema
const queryFormSchema = z.object({
  query: z
    .string()
    .min(MEDICAL_QUERY_VALIDATION.minLength, `Query must be at least ${MEDICAL_QUERY_VALIDATION.minLength} characters`)
    .max(MEDICAL_QUERY_VALIDATION.maxLength, `Query must be less than ${MEDICAL_QUERY_VALIDATION.maxLength} characters`),
  userPrompt: z
    .string()
    .max(MEDICAL_QUERY_VALIDATION.userPrompt.maxLength, `Additional context must be less than ${MEDICAL_QUERY_VALIDATION.userPrompt.maxLength} characters`)
    .optional(),
  maxResults: z
    .number()
    .min(MEDICAL_QUERY_VALIDATION.maxResults.min)
    .max(MEDICAL_QUERY_VALIDATION.maxResults.max)
    .default(MEDICAL_QUERY_VALIDATION.maxResults.default),
})

type QueryFormValues = z.infer<typeof queryFormSchema>

interface MedicalQueryFormProps {
  selectedSource: ContentSource
  onQuerySubmit: (query: string, source: ContentSource, userPrompt?: string, maxResults?: number) => Promise<void>
  isLoading?: boolean
  disabled?: boolean
}

const exampleQueries = {
  medverus_ai: [
    "Treatment protocols for hypertension in elderly patients",
    "Differential diagnosis for acute chest pain",
    "Latest guidelines for diabetes management",
  ],
  pubmed: [
    "COVID-19 vaccine efficacy in immunocompromised patients",
    "Machine learning applications in radiology",
    "Microbiome and inflammatory bowel disease",
  ],
  web_search: [
    "CDC guidelines for infection control 2024",
    "American Heart Association CPR updates",
    "FDA drug safety communications",
  ],
  file_upload: [
    "Find protocols related to patient discharge",
    "Search for medication dosing guidelines",
    "Locate quality improvement initiatives",
  ],
}

export function MedicalQueryForm({ 
  selectedSource, 
  onQuerySubmit, 
  isLoading = false, 
  disabled = false 
}: MedicalQueryFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { toast } = useToast()
  const processQueryMutation = useProcessQuery()

  const form = useForm<QueryFormValues>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: {
      query: "",
      userPrompt: "",
      maxResults: MEDICAL_QUERY_VALIDATION.maxResults.default,
    },
  })

  const onSubmit = async (values: QueryFormValues) => {
    try {
      // Sanitize the query for security
      const sanitizedQuery = sanitizeMedicalQuery(values.query)
      const sanitizedPrompt = values.userPrompt ? sanitizeMedicalQuery(values.userPrompt) : undefined

      // Call the parent submit handler
      await onQuerySubmit(
        sanitizedQuery,
        selectedSource,
        sanitizedPrompt,
        values.maxResults
      )

      toast({
        title: "Query processed successfully",
        description: "Your medical query has been processed and results are displayed below.",
      })
    } catch (error) {
      toast({
        title: "Query failed",
        description: error instanceof Error ? error.message : "Failed to process your query. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExampleClick = (example: string) => {
    form.setValue("query", example)
  }

  const currentExamples = exampleQueries[selectedSource] || []
  const queryLength = form.watch("query")?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medical Query</h3>
        <Badge variant="secondary">
          {selectedSource.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Query Field */}
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medical Query</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter your medical question or search query..."
                    className="min-h-[120px] resize-none"
                    disabled={isLoading || disabled}
                  />
                </FormControl>
                <div className="flex items-center justify-between">
                  <FormDescription>
                    Ask medical questions in natural language. Be specific for better results.
                  </FormDescription>
                  <span className="text-xs text-muted-foreground">
                    {queryLength}/{MEDICAL_QUERY_VALIDATION.maxLength}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Example Queries */}
          {currentExamples.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Example queries for {selectedSource.replace('_', ' ')}:</Label>
              <div className="flex flex-wrap gap-2">
                {currentExamples.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleExampleClick(example)}
                    disabled={isLoading || disabled}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Advanced Options
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Additional Context */}
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide additional context, specific patient population, or constraints for your query..."
                        className="min-h-[80px] resize-none"
                        disabled={isLoading || disabled}
                      />
                    </FormControl>
                    <FormDescription>
                      Help refine results with additional context about your specific use case.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Results */}
              <FormField
                control={form.control}
                name="maxResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Results</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={MEDICAL_QUERY_VALIDATION.maxResults.min}
                        max={MEDICAL_QUERY_VALIDATION.maxResults.max}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || MEDICAL_QUERY_VALIDATION.maxResults.default)}
                        disabled={isLoading || disabled}
                        className="w-24"
                      />
                    </FormControl>
                    <FormDescription>
                      Number of results to return ({MEDICAL_QUERY_VALIDATION.maxResults.min}-{MEDICAL_QUERY_VALIDATION.maxResults.max})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || disabled || !form.watch("query")?.trim()}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Query...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Medical Content
              </>
            )}
          </Button>

          {/* Disabled State Message */}
          {disabled && (
            <div className="text-center text-sm text-muted-foreground bg-muted rounded-lg p-3">
              Daily query limit reached for this source. Limits reset at midnight UTC.
            </div>
          )}
        </form>
      </Form>

      {/* Medical Safety Notice */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <div className="flex items-start space-x-2">
          <div className="text-yellow-600 mt-0.5">⚠️</div>
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Medical Safety Notice</p>
            <p className="mt-1">
              This AI-powered search is for educational and informational purposes only. 
              Always consult with qualified healthcare professionals for medical decisions 
              and patient care.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}