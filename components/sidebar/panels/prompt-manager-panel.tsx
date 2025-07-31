"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePrompts, usePromptFilters, PROMPT_CATEGORIES, type PromptTemplate } from "@/lib/stores/prompt-store"
import { useSearch } from "@/lib/stores/search-store"
import { useUI } from "@/lib/stores/ui-store"
import { useMedicalTTS } from "@/lib/stores/tts-store"
import { cn } from "@/lib/utils"
import { 
  X,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Play,
  Volume2,
  Tag,
  Calendar,
  BarChart3,
  FileText,
  Sparkles,
  Filter
} from "lucide-react"

interface PromptManagerPanelProps {
  className?: string
}

/**
 * Prompt Manager Panel Component
 * Manages custom user prompts with categories, search, and editing
 */
export function PromptManagerPanel({ className }: PromptManagerPanelProps) {
  const {
    prompts,
    selectedPrompt,
    isEditing,
    editingPrompt,
    addPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    setSelectedPrompt,
    setEditingPrompt,
    setIsEditing,
    incrementUsage,
    exportPrompts,
    importPrompts,
    resetToDefaults,
  } = usePrompts()

  const {
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
  } = usePromptFilters()

  const { activePanel, setActivePanel } = useUI()
  const { setCurrentQuery, executeSearch } = useSearch()
  const { speakMedicalContent } = useMedicalTTS()

  // Local state for editing
  const [editForm, setEditForm] = useState<Partial<PromptTemplate>>({})
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState('')

  // Handle prompt creation/editing
  const handleSavePrompt = () => {
    if (!editForm.name || !editForm.content) return

    if (editingPrompt) {
      // Update existing prompt
      updatePrompt(editingPrompt.id, editForm)
    } else {
      // Create new prompt
      addPrompt({
        name: editForm.name,
        description: editForm.description || '',
        content: editForm.content,
        category: (editForm.category as any) || 'custom',
        isDefault: false,
        tags: editForm.tags || [],
      })
    }

    setIsEditing(false)
    setEditingPrompt(null)
    setEditForm({})
  }

  // Handle prompt usage
  const handleUsePrompt = (prompt: PromptTemplate) => {
    // Replace {query} placeholder with current search or prompt for input
    let promptContent = prompt.content
    
    if (promptContent.includes('{query}')) {
      const userQuery = window.prompt('Enter your query:', '')
      if (!userQuery) return
      
      promptContent = promptContent.replace(/\{query\}/g, userQuery)
    }

    setCurrentQuery(promptContent)
    incrementUsage(prompt.id)
    
    // Close panel and focus on search
    setActivePanel(null)
    
    // Auto-execute search
    executeSearch(promptContent)
    
    // Speak prompt usage
    speakMedicalContent(`Using prompt: ${prompt.name}`)
  }

  // Handle import
  const handleImport = () => {
    if (importPrompts(importData)) {
      setShowImportDialog(false)
      setImportData('')
    } else {
      alert('Invalid import data. Please check the format.')
    }
  }

  // Handle export
  const handleExport = () => {
    const data = exportPrompts()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'medverus-prompts.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Start editing
  const startEditing = (prompt?: PromptTemplate) => {
    if (prompt) {
      setEditingPrompt(prompt)
      setEditForm(prompt)
    } else {
      setEditingPrompt(null)
      setEditForm({
        name: '',
        description: '',
        content: '',
        category: 'custom',
        tags: [],
      })
    }
    setIsEditing(true)
  }

  if (activePanel !== 'prompts') return null

  return (
    <div className={cn(
      "fixed inset-y-16 right-0 w-96 bg-background border-l border-border shadow-lg z-40",
      "transform transition-transform duration-300 ease-in-out",
      className
    )}>
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-medical-primary" />
          <h3 className="font-semibold">Prompt Manager</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing()}
                  className="p-1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create new prompt</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePanel(null)}
            className="p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PROMPT_CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)}>
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear filters</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Prompt List */}
      <ScrollArea className="flex-1 h-[calc(100vh-240px)]">
        <div className="p-4 space-y-3">
          {prompts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedCategory ? 'No prompts match your filters' : 'No prompts yet'}
              </p>
              {!searchQuery && !selectedCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing()}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create your first prompt
                </Button>
              )}
            </div>
          ) : (
            prompts.map((prompt) => (
              <Card 
                key={prompt.id} 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedPrompt?.id === prompt.id && "ring-2 ring-medical-primary"
                )}
                onClick={() => setSelectedPrompt(selectedPrompt?.id === prompt.id ? null : prompt)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium line-clamp-1">
                        {prompt.name}
                      </CardTitle>
                      {prompt.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {prompt.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {prompt.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="text-xs">
                        {PROMPT_CATEGORIES.find(c => c.id === prompt.category)?.icon} 
                        {PROMPT_CATEGORIES.find(c => c.id === prompt.category)?.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Tags */}
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prompt.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {prompt.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{prompt.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>

                {selectedPrompt?.id === prompt.id && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Prompt Preview */}
                      <div className="bg-muted/50 p-3 rounded text-xs">
                        <p className="line-clamp-3">{prompt.content}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          Used {prompt.usageCount} times
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(prompt.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUsePrompt(prompt)
                          }}
                          className="flex-1"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Use Prompt
                        </Button>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  speakMedicalContent(prompt.content)
                                }}
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Read aloud</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditing(prompt)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit prompt</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  duplicatePrompt(prompt.id)
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate prompt</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {!prompt.isDefault && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm('Delete this prompt?')) {
                                      deletePrompt(prompt.id)
                                    }
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete prompt</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Panel Footer */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export prompts</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import prompts</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (confirm('Reset to default prompts? This will remove all custom prompts.')) {
                      resetToDefaults()
                    }
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset to defaults</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="text-xs text-center text-muted-foreground mt-2">
          {prompts.length} prompts available
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter prompt name..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Brief description of the prompt..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={editForm.category || 'custom'} 
                onValueChange={(value) => setEditForm({ ...editForm, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Prompt Content</label>
              <Textarea
                value={editForm.content || ''}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="Enter your prompt content here... Use {query} as a placeholder for user input."
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use <code>{'{query}'}</code> as a placeholder where user input should be inserted.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={editForm.tags?.join(', ') || ''}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="medical, diagnosis, treatment..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePrompt}
              disabled={!editForm.name || !editForm.content}
            >
              {editingPrompt ? 'Update' : 'Create'} Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Prompts</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">JSON Data</label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste exported prompt JSON data here..."
                rows={8}
                className="resize-none font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!importData.trim()}
            >
              Import Prompts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

PromptManagerPanel.displayName = "PromptManagerPanel"

export default PromptManagerPanel