"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useAuth } from "@/lib/stores/auth-store"
import { useSearch } from "@/lib/stores/search-store"
import { useUI } from "@/lib/stores/ui-store"
import { useMedicalTTS } from "@/lib/stores/tts-store"
import { MEDICAL_TIER_LIMITS } from "@/lib/constants/medical"
import { cn } from "@/lib/utils"
import { 
  X,
  Upload,
  Search,
  FileText,
  Image,
  Film,
  File,
  Download,
  Trash2,
  Eye,
  Tag,
  Calendar,
  HardDrive,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Share2
} from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  status: 'uploading' | 'completed' | 'error'
  progress?: number
  url?: string
  thumbnail?: string
  tags: string[]
  category: 'document' | 'image' | 'video' | 'other'
}

interface FileManagerPanelProps {
  className?: string
}

/**
 * File Manager Panel Component
 * Enhanced file management with preview, organization, and search
 */
export function FileManagerPanel({ className }: FileManagerPanelProps) {
  const { user } = useAuth()
  const { files, addFiles, removeFile, clearFiles } = useSearch()
  const { activePanel, setActivePanel } = useUI()
  const { speakMedicalContent } = useMedicalTTS()

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Mock uploaded files (in real implementation, this would come from API)
  const [uploadedFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'medical-guidelines-2024.pdf',
      type: 'application/pdf',
      size: 2048000,
      uploadedAt: '2025-01-20T10:30:00Z',
      status: 'completed',
      tags: ['guidelines', 'cardiology', '2024'],
      category: 'document'
    },
    {
      id: '2',
      name: 'patient-case-study.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 512000,
      uploadedAt: '2025-01-19T14:15:00Z',
      status: 'completed',
      tags: ['case study', 'patient'],
      category: 'document'
    },
    {
      id: '3',
      name: 'lab-results.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 256000,
      uploadedAt: '2025-01-18T09:45:00Z',
      status: 'completed',
      tags: ['lab', 'results', 'data'],
      category: 'document'
    }
  ])

  // Get tier limits
  const tierLimits = MEDICAL_TIER_LIMITS[user?.tier || 'free']
  const usedStorage = uploadedFiles.reduce((sum, file) => sum + file.size, 0)
  const maxFileSize = tierLimits.file_upload.max_size_mb * 1024 * 1024
  const maxFiles = tierLimits.file_upload.max_files_per_day

  // File type icons
  const getFileIcon = (type: string, category: string) => {
    if (category === 'image') return <Image className="h-4 w-4" />
    if (category === 'video') return <Film className="h-4 w-4" />
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (type.includes('doc')) return <FileText className="h-4 w-4 text-blue-500" />
    if (type.includes('sheet') || type.includes('excel')) return <FileText className="h-4 w-4 text-green-500" />
    return <File className="h-4 w-4" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Filter and sort files
  const filteredFiles = uploadedFiles
    .filter(file => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return file.name.toLowerCase().includes(query) ||
               file.tags.some(tag => tag.toLowerCase().includes(query))
      }
      return true
    })
    .filter(file => {
      if (selectedCategory) {
        return file.category === selectedCategory
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Handle file upload
  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    addFiles(uploadedFiles)
    speakMedicalContent(`Added ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} for processing`)
  }, [addFiles, speakMedicalContent])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }, [handleFileUpload])

  // Handle file input
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      handleFileUpload(selectedFiles)
    }
    e.target.value = ''
  }, [handleFileUpload])

  // File preview
  const handlePreview = (file: FileItem) => {
    setSelectedFile(file)
    setShowPreview(true)
  }

  if (activePanel !== 'files') return null

  return (
    <div className={cn(
      "fixed inset-y-16 right-0 w-96 bg-background border-l border-border shadow-lg z-40",
      "transform transition-transform duration-300 ease-in-out",
      className
    )}>
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-medical-primary" />
          <h3 className="font-semibold">File Manager</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="p-1"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload files</TooltipContent>
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

      {/* Storage Stats */}
      <div className="p-4 border-b bg-muted/30">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="font-medium">
              {formatFileSize(usedStorage)} / {formatFileSize(maxFileSize * maxFiles)}
            </span>
          </div>
          
          <Progress 
            value={(usedStorage / (maxFileSize * maxFiles)) * 100} 
            className="h-2"
          />
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-medical-primary">
                {uploadedFiles.length}
              </div>
              <div className="text-xs text-muted-foreground">Files Uploaded</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-medical-primary">
                {maxFiles - uploadedFiles.length}
              </div>
              <div className="text-xs text-muted-foreground">Remaining Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="p-4 border-b">
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
            isDragOver ? "border-medical-primary bg-medical-primary/5" : "border-muted-foreground/25"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop files here or{' '}
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="text-medical-primary hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {formatFileSize(maxFileSize)} per file
          </p>
        </div>

        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
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
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="document">📄 Documents</SelectItem>
              <SelectItem value="image">🖼️ Images</SelectItem>
              <SelectItem value="video">🎥 Videos</SelectItem>
              <SelectItem value="other">📁 Other</SelectItem>
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle view mode</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1 h-[calc(100vh-400px)]">
        <div className="p-4">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedCategory ? 'No files match your filters' : 'No files uploaded yet'}
              </p>
              {!searchQuery && !selectedCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="mt-2"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload your first file
                </Button>
              )}
            </div>
          ) : (
            <div className={cn(
              "space-y-2",
              viewMode === 'grid' && "grid grid-cols-2 gap-2 space-y-0"
            )}>
              {filteredFiles.map((file) => (
                <Card 
                  key={file.id} 
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handlePreview(file)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getFileIcon(file.type, file.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-1">
                            {file.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              file.status === 'completed' ? "bg-green-500" :
                              file.status === 'uploading' ? "bg-yellow-500" :
                              "bg-red-500"
                            )} />
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handlePreview(file)
                                  }}
                                  className="p-1"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Preview file</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Handle download
                                  }}
                                  className="p-1"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download file</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm('Delete this file?')) {
                                      // Handle delete
                                    }
                                  }}
                                  className="p-1 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete file</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {/* Tags */}
                      {file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {file.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {file.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{file.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Upload progress */}
                      {file.status === 'uploading' && file.progress !== undefined && (
                        <Progress value={file.progress} className="h-1" />
                      )}

                      <div className="text-xs text-muted-foreground">
                        Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Panel Footer */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          {filteredFiles.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                if (confirm('Clear all files from search queue?')) {
                  clearFiles()
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground mt-2">
          {filteredFiles.length} of {uploadedFiles.length} files
        </div>
      </div>

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFile && getFileIcon(selectedFile.type, selectedFile.category)}
              {selectedFile?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2">{formatFileSize(selectedFile.size)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2">{selectedFile.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="ml-2">{new Date(selectedFile.uploadedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge 
                    variant={selectedFile.status === 'completed' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {selectedFile.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {selectedFile.status === 'uploading' && <Clock className="h-3 w-3 mr-1" />}
                    {selectedFile.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {selectedFile.status}
                  </Badge>
                </div>
              </div>

              {selectedFile.tags.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFile.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  File preview would be displayed here
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

FileManagerPanel.displayName = "FileManagerPanel"

export default FileManagerPanel