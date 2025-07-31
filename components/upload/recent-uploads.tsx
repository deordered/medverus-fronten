"use client"

import { useState } from "react"
import { formatDistance } from "date-fns"
import { 
  History, 
  FileText, 
  Download, 
  Trash2, 
  MoreVertical,
  ExternalLink,
  Eye,
  Search,
  Filter
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useFilesList, useDeleteFile } from "@/lib/api/hooks"
import { formatBytes, formatMedicalDate, formatMedicalFileType, truncateText } from "@/lib/utils"

// Mock data for recent uploads - in real app this would come from API
const mockRecentUploads = [
  {
    id: "file_001",
    filename: "clinical_guidelines_2024.pdf",
    size: 2457600, // 2.4MB
    content_type: "application/pdf",
    upload_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    processed: true,
    user_id: "user_123"
  },
  {
    id: "file_002",
    filename: "patient_protocol_emergency.docx",
    size: 1024000, // 1MB
    content_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    upload_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    processed: true,
    user_id: "user_123"
  },
  {
    id: "file_003",
    filename: "medication_dosage_chart.csv",
    size: 512000, // 512KB
    content_type: "text/csv",
    upload_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    processed: true,
    user_id: "user_123"
  },
  {
    id: "file_004",
    filename: "research_notes_cardiology.txt",
    size: 128000, // 128KB
    content_type: "text/plain",
    upload_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    processed: true,
    user_id: "user_123"
  },
  {
    id: "file_005",
    filename: "hospital_procedures_update.pdf",
    size: 3072000, // 3MB
    content_type: "application/pdf",
    upload_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    processed: false,
    user_id: "user_123"
  },
]

export function RecentUploads() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const deleteFileMutation = useDeleteFile()

  // In real app, this would use the actual API hook
  const { data: files, isLoading, error } = useFilesList()
  
  // Use mock data for now
  const recentFiles = mockRecentUploads

  const handleDownloadFile = (fileId: string, filename: string) => {
    // In real app, this would trigger actual file download
    toast({
      title: "Download started",
      description: `Downloading ${filename}`,
    })
  }

  const handleDeleteFile = async (fileId: string, filename: string) => {
    try {
      await deleteFileMutation.mutateAsync(fileId)
      toast({
        title: "File deleted",
        description: `${filename} has been deleted successfully`,
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const handleViewFile = (fileId: string) => {
    // In real app, this would open file viewer or navigate to file details
    toast({
      title: "Feature coming soon",
      description: "File preview will be available soon",
    })
  }

  const filteredFiles = recentFiles.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <RecentUploadsSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Recent Uploads</span>
          </CardTitle>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Files
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Files List */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No uploaded files found</p>
            <p className="text-sm">Upload medical documents to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium truncate">
                      {file.filename}
                    </p>
                    {file.processed ? (
                      <Badge variant="secondary" className="text-xs">
                        Processed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Processing
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span>{formatMedicalFileType(file.content_type)}</span>
                    <span>•</span>
                    <span>{formatDistance(new Date(file.upload_date), new Date(), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewFile(file.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => handleDownloadFile(file.id, file.filename)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => handleDeleteFile(file.id, file.filename)}
                      className="text-red-600 focus:text-red-600"
                      disabled={deleteFileMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredFiles.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium">{filteredFiles.length}</div>
                <div className="text-xs text-muted-foreground">Files</div>
              </div>
              <div>
                <div className="font-medium">
                  {formatBytes(filteredFiles.reduce((total, file) => total + file.size, 0))}
                </div>
                <div className="text-xs text-muted-foreground">Total Size</div>
              </div>
              <div>
                <div className="font-medium">
                  {filteredFiles.filter(f => f.processed).length}
                </div>
                <div className="text-xs text-muted-foreground">Processed</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentUploadsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-16" />
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}