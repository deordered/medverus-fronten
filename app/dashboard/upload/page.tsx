import { Metadata } from "next"

import { FileUploadInterface } from "@/components/upload/file-upload-interface"

export const metadata: Metadata = {
  title: "File Upload | Medverus",
  description: "Upload medical documents for AI-powered analysis and search. Supports PDF, Word, and other medical document formats.",
}

export default function UploadPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">File Upload</h1>
        <p className="text-muted-foreground">
          Upload medical documents to create your private searchable knowledge base. 
          Supported formats include PDF, Word documents, and text files.
        </p>
      </div>

      {/* File Upload Interface */}
      <FileUploadInterface />
    </div>
  )
}