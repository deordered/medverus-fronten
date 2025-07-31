"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2,
  File,
  Image,
  FileSpreadsheet
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_FILE_TYPES, MEDICAL_TIER_LIMITS } from "@/lib/constants/medical"
import { formatBytes } from "@/lib/utils"

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.includes('spreadsheet') || mimeType === 'text/csv') return FileSpreadsheet
  if (mimeType === 'application/pdf' || mimeType.includes('document')) return FileText
  return File
}

const getFileTypeInfo = (mimeType: string) => {
  return MEDICAL_FILE_TYPES[mimeType as keyof typeof MEDICAL_FILE_TYPES] || {
    label: 'Unknown File Type',
    extension: '',
    maxSize: 5 * 1024 * 1024, // 5MB default
    icon: '📄'
  }
}

export function FileDropzone({ onFilesSelected, disabled = false, maxFiles = 10 }: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const tierLimits = user?.tier ? MEDICAL_TIER_LIMITS[user.tier] : null
  const maxFileSize = tierLimits?.file_upload.size_mb ? tierLimits.file_upload.size_mb * 1024 * 1024 : 5 * 1024 * 1024

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!Object.keys(MEDICAL_FILE_TYPES).includes(file.type)) {
      return `Unsupported file type: ${file.type}. Supported types: PDF, DOCX, PPTX only`
    }

    // Check file size
    const fileTypeInfo = getFileTypeInfo(file.type)
    const maxSize = Math.min(fileTypeInfo.maxSize, maxFileSize)
    
    if (file.size > maxSize) {
      return `File too large: ${formatBytes(file.size)}. Maximum size: ${formatBytes(maxSize)}`
    }

    // Check filename
    if (file.name.length > 255) {
      return `Filename too long: ${file.name.length} characters. Maximum: 255 characters`
    }

    // Check for invalid characters in filename
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(file.name)) {
      return `Filename contains invalid characters: < > : " / \\ | ? *`
    }

    return null
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setDragActive(false)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      )
      
      toast({
        title: "Some files were rejected",
        description: errors.join('\n'),
        variant: "destructive",
      })
    }

    // Validate accepted files
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    for (const file of acceptedFiles) {
      const error = validateFile(file)
      if (error) {
        invalidFiles.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    }

    // Show validation errors
    if (invalidFiles.length > 0) {
      toast({
        title: "File validation failed",
        description: invalidFiles.join('\n'),
        variant: "destructive",
      })
    }

    // Process valid files
    if (validFiles.length > 0) {
      if (validFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed. Only first ${maxFiles} files will be processed.`,
          variant: "destructive",
        })
        onFilesSelected(validFiles.slice(0, maxFiles))
      } else {
        onFilesSelected(validFiles)
        toast({
          title: "Files selected",
          description: `${validFiles.length} file(s) ready for upload`,
        })
      }
    }
  }, [onFilesSelected, maxFiles, maxFileSize, toast])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept
  } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: Object.keys(MEDICAL_FILE_TYPES).reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    maxFiles,
    disabled,
    multiple: true
  })

  const getDropzoneStyles = () => {
    if (disabled) return "border-gray-200 bg-gray-50 cursor-not-allowed"
    if (isDragReject) return "border-red-500 bg-red-50"
    if (isDragAccept) return "border-green-500 bg-green-50"
    if (isDragActive) return "border-blue-500 bg-blue-50"
    return "border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${getDropzoneStyles()}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {isDragActive ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : disabled ? (
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            {disabled ? (
              <div>
                <p className="text-lg font-medium text-gray-500">Upload Disabled</p>
                <p className="text-sm text-gray-400">
                  You have reached your daily file upload limit
                </p>
              </div>
            ) : isDragActive ? (
              <div>
                <p className="text-lg font-medium text-green-600">Drop files here</p>
                <p className="text-sm text-muted-foreground">
                  Release to upload your medical documents
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload medical documents for AI-powered search and analysis
                </p>
              </div>
            )}
          </div>

          {/* Browse Button */}
          {!disabled && !isDragActive && (
            <Button type="button" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          )}
        </div>
      </div>

      {/* File Type Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Supported File Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(MEDICAL_FILE_TYPES).map(([mimeType, info]) => {
              const Icon = getFileIcon(mimeType)
              return (
                <div key={mimeType} className="flex items-center space-x-2 p-2 rounded border bg-card">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{info.label}</div>
                    <div className="text-xs text-muted-foreground">
                      Max: {formatBytes(Math.min(info.maxSize, maxFileSize))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upload Limits */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Upload Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center justify-between p-2 rounded border bg-card">
              <span>Max file size</span>
              <Badge variant="secondary">{formatBytes(maxFileSize)}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded border bg-card">
              <span>Max files per upload</span>
              <Badge variant="secondary">{maxFiles}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded border bg-card">
              <span>Daily upload limit</span>
              <Badge variant="secondary">{tierLimits?.file_upload.count || 0}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}