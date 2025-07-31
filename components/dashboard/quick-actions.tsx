"use client"

import Link from "next/link"
import { 
  Search, 
  Upload, 
  BarChart3, 
  FileText,
  Brain,
  BookOpen,
  Globe,
  Plus
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MEDICAL_ROUTES } from "@/lib/constants/medical"

const quickActions = [
  {
    title: "New Medical Query",
    description: "Search across all content sources",
    icon: Search,
    href: MEDICAL_ROUTES.protected.query,
    color: "bg-blue-500 hover:bg-blue-600",
    primary: true
  },
  {
    title: "Upload Document",
    description: "Add medical documents for analysis",
    icon: Upload,
    href: "/dashboard/upload",
    color: "bg-green-500 hover:bg-green-600"
  },
  {
    title: "View Analytics",
    description: "Track your usage and insights",
    icon: BarChart3,
    href: MEDICAL_ROUTES.protected.usage,
    color: "bg-purple-500 hover:bg-purple-600"
  },
  {
    title: "My Documents",
    description: "Manage uploaded files",
    icon: FileText,
    href: MEDICAL_ROUTES.protected.files,
    color: "bg-orange-500 hover:bg-orange-600"
  },
]

const contentSources = [
  {
    title: "Medverus AI",
    description: "Curated medical content",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100"
  },
  {
    title: "PubMed Search",
    description: "Scientific literature",
    icon: BookOpen,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100"
  },
  {
    title: "Medical Web",
    description: "Trusted medical sites",
    icon: Globe,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100"
  },
  {
    title: "Your Files",
    description: "Private documents",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100"
  },
]

export function QuickActions() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            
            if (action.primary) {
              return (
                <Link key={action.href} href={action.href}>
                  <Button className={`w-full justify-start h-auto p-4 ${action.color}`}>
                    <Icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                  </Button>
                </Link>
              )
            }

            return (
              <Link key={action.href} href={action.href}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3 hover:bg-muted"
                >
                  <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </CardContent>
      </Card>

      {/* Content Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Sources</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access medical information from multiple trusted sources
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {contentSources.map((source) => {
            const Icon = source.icon
            
            return (
              <Link key={source.title} href={MEDICAL_ROUTES.protected.query}>
                <div className={`p-3 rounded-lg transition-colors cursor-pointer ${source.bgColor}`}>
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${source.color}`} />
                    <div>
                      <div className="font-medium text-sm">{source.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {source.description}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}