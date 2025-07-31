"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Files, 
  History, 
  TrendingUp,
  FileText,
  Download,
  Search,
  Filter,
  Settings
} from "lucide-react"

import { FileUploadInterface } from "@/components/upload/file-upload-interface"
import { RecentUploads } from "@/components/upload/recent-uploads"
import { UploadLimits } from "@/components/upload/upload-limits"
import { UploadGuidelines } from "@/components/upload/upload-guidelines"
import { useAuth } from "@/lib/stores/auth-store"
import { useUserUsage } from "@/lib/api/hooks"
import { getMedicalTierInfo } from "@/lib/utils"

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const { user } = useAuth()
  const { data: usage } = useUserUsage()

  const tierInfo = user?.tier ? getMedicalTierInfo(user.tier) : null

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Files</h1>
          <p className="text-muted-foreground">
            Upload, manage, and search your medical documents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {tierInfo && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>{tierInfo.label}</span>
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Files Uploaded Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage.usage.file_upload}</div>
              <p className="text-xs text-muted-foreground">
                {usage.limits?.file_upload.count 
                  ? `of ${usage.limits.file_upload.count} daily limit`
                  : "No limit set"
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Across all uploads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Storage Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156 MB</div>
              <p className="text-xs text-muted-foreground">
                Medical documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Processing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">22</div>
              <p className="text-xs text-muted-foreground">
                2 processing, 22 ready
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center space-x-2">
            <Files className="h-4 w-4" />
            <span>My Files</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Recent</span>
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Guidelines</span>
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FileUploadInterface />
            </div>
            <div className="space-y-6">
              <UploadLimits />
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Search Files
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Bulk Download
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Type
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* My Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Files className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Complete File Management</h3>
                <p className="text-sm max-w-md mx-auto">
                  Advanced file browser with search, filtering, batch operations, and detailed file information. 
                  This comprehensive interface will be implemented in the next development phase.
                </p>
                <Button variant="outline" className="mt-4">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent" className="space-y-6">
          <RecentUploads />
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <UploadGuidelines />
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-muted-foreground">
          Medical document upload and management system
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            Help & Support
          </Button>
        </div>
      </div>
    </div>
  )
}