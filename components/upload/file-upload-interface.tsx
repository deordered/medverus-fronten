"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileDropzone } from "./file-dropzone"
import { UploadProgress } from "./upload-progress"
import { UploadLimits } from "./upload-limits"
import { RecentUploads } from "./recent-uploads"
import { UploadGuidelines } from "./upload-guidelines"
import { UsageLimitsAlert } from "@/components/query/usage-limits-alert"
import { useUsageLimitsCheck } from "@/lib/api/hooks"
import type { FileUploadResponse } from "@/types"

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  result?: FileUploadResponse
}

export function FileUploadInterface() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const { hasExceededLimits, isApproachingLimits } = useUsageLimitsCheck()

  const handleFilesSelected = (files: File[]) => {
    const newUploads: UploadFile[] = files.map(file => ({
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'pending'
    }))

    setUploadFiles(prev => [...prev, ...newUploads])
    
    // Start uploading files
    newUploads.forEach(upload => {
      startUpload(upload)
    })
  }

  const startUpload = async (upload: UploadFile) => {
    setUploadFiles(prev => 
      prev.map(u => u.id === upload.id ? { ...u, status: 'uploading' } : u)
    )

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setUploadFiles(prev => 
          prev.map(u => u.id === upload.id ? { ...u, progress } : u)
        )
      }

      // Simulate processing
      setUploadFiles(prev => 
        prev.map(u => u.id === upload.id ? { ...u, status: 'processing', progress: 100 } : u)
      )

      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock successful result
      const mockResult: FileUploadResponse = {
        id: `file_${Date.now()}`,
        filename: upload.file.name,
        size: upload.file.size,
        content_type: upload.file.type,
        upload_date: new Date().toISOString(),
        processed: true
      }

      setUploadFiles(prev => 
        prev.map(u => u.id === upload.id ? { 
          ...u, 
          status: 'completed', 
          result: mockResult 
        } : u)
      )

    } catch (error) {
      setUploadFiles(prev => 
        prev.map(u => u.id === upload.id ? { 
          ...u, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : u)
      )
    }
  }

  const handleRemoveUpload = (uploadId: string) => {
    setUploadFiles(prev => prev.filter(u => u.id !== uploadId))
  }

  const handleRetryUpload = (uploadId: string) => {
    const upload = uploadFiles.find(u => u.id === uploadId)
    if (upload) {
      setUploadFiles(prev => 
        prev.map(u => u.id === uploadId ? { 
          ...u, 
          status: 'pending', 
          progress: 0, 
          error: undefined 
        } : u)
      )
      startUpload({ ...upload, status: 'pending', progress: 0 })
    }
  }

  return (
    <div className="space-y-6">
      {/* Usage Limits Alert */}
      {(hasExceededLimits || isApproachingLimits) && (
        <UsageLimitsAlert 
          hasExceeded={hasExceededLimits}
          isApproaching={isApproachingLimits}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Limits */}
          <UploadLimits />

          {/* File Dropzone */}
          <Card>
            <CardContent className="p-6">
              <FileDropzone
                onFilesSelected={handleFilesSelected}
                disabled={hasExceededLimits}
              />
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploadFiles.length > 0 && (
            <UploadProgress
              uploads={uploadFiles}
              onRemove={handleRemoveUpload}
              onRetry={handleRetryUpload}
            />
          )}

          {/* Recent Uploads */}
          <RecentUploads />
        </div>

        {/* Right Column - Guidelines and Info */}
        <div className="space-y-6">
          <UploadGuidelines />
          
          {/* Medical Safety Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Medical Document Safety</h3>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>🔒 All uploaded documents are encrypted and stored securely</p>
                  <p>🏥 Documents are only accessible by your account</p>
                  <p>📚 Content is processed for search indexing only</p>
                  <p>⚕️ Follow institutional guidelines for document sharing</p>
                  <p>🗑️ You can delete documents at any time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HIPAA Compliance Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">HIPAA Compliance</h3>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>🛡️ Our platform maintains HIPAA compliance standards</p>
                  <p>📋 Audit logs track all document access</p>
                  <p>🔐 End-to-end encryption protects your data</p>
                  <p>⚖️ Users are responsible for proper PHI handling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}