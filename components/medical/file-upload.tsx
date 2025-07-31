"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { 
  Upload, 
  File, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useMedicalTier } from "@/hooks/use-auth"
import { cn, formatBytes, formatMedicalFileType } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  url?: string
  error?: string
  extractedText?: string
}

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  maxFiles?: number
  className?: string
}

// ARCHITECTURAL COMPLIANCE: PDF, DOCX, PPTX ONLY per architecture.md specification
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export function FileUpload({ onUploadComplete, maxFiles = 10, className }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { tier, limits, usage } = useMedicalTier()

  const canUploadMore = () => {
    const fileLimit = typeof limits.file_upload === 'object' ? limits.file_upload.count : limits.file_upload
    return uploadedFiles.length < fileLimit && uploadedFiles.length < maxFiles
  }

  const getFileSizeLimit = () => {
    return typeof limits.file_upload === 'object' ? limits.file_upload.size_mb * 1024 * 1024 : MAX_FILE_SIZE
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!canUploadMore()) {
      toast({
        title: "Upload Limit Reached",
        description: `You can only upload ${typeof limits.file_upload === 'object' ? limits.file_upload.count : limits.file_upload} files with your ${tier} tier.`,
        variant: "destructive"
      })
      return
    }

    const fileSizeLimit = getFileSizeLimit()
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > fileSizeLimit) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the ${formatBytes(fileSizeLimit)} size limit.`,
          variant: "destructive"
        })
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setIsUploading(true)

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate file upload process
    for (const newFile of newFiles) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === newFile.id 
                ? { ...f, progress }
                : f
            )
          )
        }

        // Simulate processing phase
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'processing', progress: 100 }
              : f
          )
        )

        await new Promise(resolve => setTimeout(resolve, 1500))

        // Complete upload
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { 
                  ...f, 
                  status: 'completed',
                  url: `https://example.com/files/${f.id}`,
                  extractedText: `Extracted text content from ${f.name}...`
                }
              : f
          )
        )

        toast({
          title: "File Uploaded",
          description: `${newFile.name} has been successfully uploaded and processed.`
        })

      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { 
                  ...f, 
                  status: 'error',
                  error: 'Upload failed. Please try again.'
                }
              : f
          )
        )

        toast({
          title: "Upload Failed",
          description: `Failed to upload ${newFile.name}. Please try again.`,
          variant: "destructive"
        })
      }
    }

    setIsUploading(false)
    
    if (onUploadComplete) {
      onUploadComplete(uploadedFiles.filter(f => f.status === 'completed'))
    }
  }, [uploadedFiles, limits, tier, toast, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    disabled: !canUploadMore() || isUploading,
    maxSize: getFileSizeLimit()
  })

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const retryUpload = (id: string) => {
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === id 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      )
    )
    // Implement retry logic here
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText
    if (type.includes('image')) return Image
    if (type.includes('video')) return Video
    if (type.includes('audio')) return Music
    if (type.includes('zip') || type.includes('rar')) return Archive
    return File
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-blue-600'
      case 'processing': return 'text-yellow-600'
      case 'completed': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return Loader2
      case 'processing': return RefreshCw
      case 'completed': return CheckCircle2
      case 'error': return AlertCircle
      default: return File
    }
  }

  const completedFiles = uploadedFiles.filter(f => f.status === 'completed')
  const processingFiles = uploadedFiles.filter(f => f.status === 'uploading' || f.status === 'processing')
  const errorFiles = uploadedFiles.filter(f => f.status === 'error')

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-medical-success/10 rounded-lg">
            <Upload className="h-6 w-6 text-medical-success" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Document Upload</h2>
            <p className="text-muted-foreground">
              Upload medical documents to your private library for AI-powered search
            </p>
          </div>
        </div>
      </div>

      {/* Usage Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Upload Limits</CardTitle>
            <Badge variant={`tier-${tier}` as any}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {uploadedFiles.length} / {typeof limits.file_upload === 'object' ? limits.file_upload.count : limits.file_upload}
              </div>
              <p className="text-sm text-muted-foreground">Files Uploaded</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatBytes(getFileSizeLimit())}
              </div>
              <p className="text-sm text-muted-foreground">Max File Size</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Object.keys(ACCEPTED_FILE_TYPES).length}
              </div>
              <p className="text-sm text-muted-foreground">Supported Formats</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragActive ? "border-medical-primary bg-medical-primary/5" : "border-muted-foreground/25",
              !canUploadMore() || isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-medical-primary hover:bg-medical-primary/5"
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-medical-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-medical-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  {isDragActive ? "Drop files here" : "Upload Medical Documents"}
                </h3>
                <p className="text-muted-foreground">
                  Drag and drop files here, or click to browse
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Supported formats: PDF, DOCX, PPTX (Medical documents only)</p>
                <p>Maximum file size: {formatBytes(getFileSizeLimit())}</p>
              </div>
              {!canUploadMore() && (
                <Alert variant="medical-warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You've reached your upload limit. Remove files or upgrade your tier to upload more.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Tabs */}
      {uploadedFiles.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All Files ({uploadedFiles.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedFiles.length})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing ({processingFiles.length})
            </TabsTrigger>
            <TabsTrigger value="errors">
              Errors ({errorFiles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.type)
              const StatusIcon = getStatusIcon(file.status)
              const statusColor = getStatusColor(file.status)

              return (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{file.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>{formatMedicalFileType(file.type)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <StatusIcon 
                              className={cn(
                                "h-4 w-4",
                                statusColor,
                                (file.status === 'uploading' || file.status === 'processing') && "animate-spin"
                              )} 
                            />
                            <span className={cn("text-sm font-medium", statusColor)}>
                              {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {(file.status === 'uploading' || file.status === 'processing') && (
                          <Progress value={file.progress} className="h-2" />
                        )}

                        {file.error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{file.error}</AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {file.status === 'completed' && (
                          <>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {file.status === 'error' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => retryUpload(file.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed uploads yet
              </div>
            ) : (
              completedFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatBytes(file.size)} • Ready for search
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="processing" className="space-y-3">
            {processingFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No files currently processing
              </div>
            ) : (
              processingFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {file.status === 'uploading' ? 'Uploading...' : 'Processing content...'}
                        </p>
                        <Progress value={file.progress} className="h-2 mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="errors" className="space-y-3">
            {errorFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upload errors
              </div>
            ) : (
              errorFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-red-600">{file.error}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => retryUpload(file.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Tier Upgrade Prompt */}
      {tier === 'free' && (
        <Alert>
          <Plus className="h-4 w-4" />
          <AlertDescription>
            Upgrade to Pro for higher upload limits, larger file sizes, and priority processing.
            <Button variant="link" className="p-0 h-auto ml-1 text-medical-primary">
              Learn more
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}