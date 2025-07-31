"use client"

import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Loader2,
  FileText,
  Clock,
  Zap
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatBytes, formatProcessingTime } from "@/lib/utils"

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  result?: any
}

interface UploadProgressProps {
  uploads: UploadFile[]
  onRemove: (uploadId: string) => void
  onRetry: (uploadId: string) => void
}

export function UploadProgress({ uploads, onRemove, onRetry }: UploadProgressProps) {
  const completedUploads = uploads.filter(u => u.status === 'completed').length
  const failedUploads = uploads.filter(u => u.status === 'error').length
  const inProgressUploads = uploads.filter(u => ['pending', 'uploading', 'processing'].includes(u.status)).length

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (upload: UploadFile) => {
    switch (upload.status) {
      case 'pending':
        return 'Waiting to upload...'
      case 'uploading':
        return `Uploading... ${upload.progress}%`
      case 'processing':
        return 'Processing document...'
      case 'completed':
        return 'Upload completed'
      case 'error':
        return upload.error || 'Upload failed'
      default:
        return 'Unknown status'
    }
  }

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'processing':
      case 'uploading':
        return 'text-blue-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Upload Progress</span>
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm">
            {inProgressUploads > 0 && (
              <Badge variant="default">
                {inProgressUploads} uploading
              </Badge>
            )}
            {completedUploads > 0 && (
              <Badge variant="secondary" className="text-green-600">
                {completedUploads} completed
              </Badge>
            )}
            {failedUploads > 0 && (
              <Badge variant="destructive">
                {failedUploads} failed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {uploads.map((upload, index) => (
              <div key={upload.id}>
                <div className="flex items-start space-x-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(upload.status)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {upload.file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatBytes(upload.file.size)}</span>
                          <span>•</span>
                          <span>{upload.file.type}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        {upload.status === 'error' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRetry(upload.id)}
                            className="h-8 w-8 p-0"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(upload.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Status Text */}
                    <p className={`text-xs ${getStatusColor(upload.status)}`}>
                      {getStatusText(upload)}
                    </p>

                    {/* Progress Bar */}
                    {(upload.status === 'uploading' || upload.status === 'processing') && (
                      <div className="space-y-1">
                        <Progress 
                          value={upload.status === 'processing' ? 100 : upload.progress} 
                          className="h-2"
                          indicatorClassName={
                            upload.status === 'processing' 
                              ? "bg-blue-500 animate-pulse" 
                              : "bg-green-500"
                          }
                        />
                        {upload.status === 'uploading' && (
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{upload.progress}% uploaded</span>
                            <span>
                              {formatBytes(upload.file.size * (upload.progress / 100))} / {formatBytes(upload.file.size)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Success Details */}
                    {upload.status === 'completed' && upload.result && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Document processed successfully</span>
                        </div>
                        <div className="mt-1 text-muted-foreground">
                          File ID: {upload.result.id}
                        </div>
                      </div>
                    )}

                    {/* Error Details */}
                    {upload.status === 'error' && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Upload failed</span>
                        </div>
                        {upload.error && (
                          <div className="mt-1">{upload.error}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {index < uploads.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        {uploads.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium">{uploads.length}</div>
                <div className="text-xs text-muted-foreground">Total Files</div>
              </div>
              <div>
                <div className="font-medium text-green-600">{completedUploads}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="font-medium">
                  {formatBytes(uploads.reduce((total, upload) => total + upload.file.size, 0))}
                </div>
                <div className="text-xs text-muted-foreground">Total Size</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {uploads.length > 0 && (
          <div className="mt-4 pt-4 border-t flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => uploads.forEach(u => onRemove(u.id))}
            >
              Clear All
            </Button>
            
            {failedUploads > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => uploads.filter(u => u.status === 'error').forEach(u => onRetry(u.id))}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Failed
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}