"use client"

import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Info,
  FileCheck,
  Lock,
  Zap
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MEDICAL_FILE_TYPES } from "@/lib/constants/medical"
import { formatBytes } from "@/lib/utils"

const guidelines = [
  {
    icon: FileCheck,
    title: "Supported File Types",
    description: "Upload medical documents in supported formats",
    items: [
      "PDF documents (.pdf) - up to 20MB",
      "Microsoft Word (.doc, .docx) - up to 15MB", 
      "Text files (.txt, .md) - up to 5MB",
      "CSV spreadsheets (.csv) - up to 10MB"
    ]
  },
  {
    icon: Shield,
    title: "Medical Data Security",
    description: "Your documents are protected with enterprise-grade security",
    items: [
      "End-to-end encryption during upload and storage",
      "HIPAA-compliant infrastructure and access controls",
      "Secure processing with medical data protection",
      "Automatic deletion after account termination"
    ]
  },
  {
    icon: Zap,
    title: "Document Processing",
    description: "How we prepare your documents for AI-powered search",
    items: [
      "Text extraction and content indexing",
      "Medical terminology recognition and tagging",
      "Searchable content generation for queries",
      "Preservation of original document formatting"
    ]
  },
  {
    icon: Lock,
    title: "Privacy & Access",
    description: "Your documents remain private and secure",
    items: [
      "Documents are only accessible by your account",
      "No sharing with other users or third parties",
      "Audit logging for all document access",
      "Right to download or delete at any time"
    ]
  }
]

const bestPractices = [
  {
    icon: CheckCircle2,
    title: "Do",
    color: "text-green-600",
    items: [
      "Use descriptive filenames for easy identification",
      "Upload high-quality, readable documents",
      "Ensure documents contain relevant medical content",
      "Remove any unnecessary personal identifiers",
      "Follow your institution's data sharing policies"
    ]
  },
  {
    icon: AlertTriangle,
    title: "Don't",
    color: "text-red-600",
    items: [
      "Upload corrupted or password-protected files",
      "Include patient identifiers unless necessary",
      "Upload copyrighted content without permission",
      "Share documents containing PHI inappropriately",
      "Upload documents with sensitive financial data"
    ]
  }
]

export function UploadGuidelines() {
  return (
    <div className="space-y-6">
      {/* File Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Upload Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {guidelines.map((guideline, index) => {
            const Icon = guideline.icon
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium text-sm">{guideline.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {guideline.description}
                </p>
                <ul className="space-y-1">
                  {guideline.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2 text-xs">
                      <span className="h-1 w-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {index < guidelines.length - 1 && <Separator />}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {bestPractices.map((practice, index) => {
            const Icon = practice.icon
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${practice.color}`} />
                  <h3 className={`font-medium text-sm ${practice.color}`}>
                    {practice.title}
                  </h3>
                </div>
                <ul className="space-y-1">
                  {practice.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2 text-xs">
                      <span className={`h-1 w-1 rounded-full mt-2 flex-shrink-0 ${
                        practice.color === 'text-green-600' ? 'bg-green-600' : 'bg-red-600'
                      }`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {index < bestPractices.length - 1 && <Separator />}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Supported Formats Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>File Format Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(MEDICAL_FILE_TYPES).map(([mimeType, info]) => (
              <div key={mimeType} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{info.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{info.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {info.extension}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Max {formatBytes(info.maxSize)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Document Processing</p>
              <p className="mt-1">
                After upload, documents are processed to extract searchable content. 
                This typically takes 1-3 minutes depending on file size and complexity. 
                Processed documents can be searched using the Medical Query interface.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}