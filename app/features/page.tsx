import { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Brain, FileSearch, Activity, Zap, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Features | Medverus AI - Medical AI Platform",
  description: "Comprehensive medical AI features for healthcare professionals. Four content sources, HIPAA compliance, and advanced search capabilities.",
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Advanced Medical AI
            <span className="text-primary block">Platform Features</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive medical information platform designed specifically for healthcare professionals,
            featuring four trusted content sources and HIPAA-compliant security.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Four Content Sources */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Brain className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Four Content Sources</h3>
            <p className="text-muted-foreground mb-4">
              Access curated Medverus AI content, PubMed research, medical web search, and your private documents.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Admin-curated medical content
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Real-time PubMed integration
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Trusted medical websites
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Private document search
              </li>
            </ul>
          </div>

          {/* Advanced Search */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <FileSearch className="h-12 w-12 text-medical-green mb-4" />
            <h3 className="text-xl font-semibold mb-3">Intelligent Search</h3>
            <p className="text-muted-foreground mb-4">
              AI-powered medical query processing with Vancouver citation format.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Natural language queries
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Medical terminology optimization
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Academic citation formatting
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Search result filtering
              </li>
            </ul>
          </div>

          {/* HIPAA Compliance */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Activity className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">HIPAA Compliance</h3>
            <p className="text-muted-foreground mb-4">
              Enterprise-grade security with comprehensive audit trails and PHI protection.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                PHI detection and protection
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Comprehensive audit logging
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Role-based access control
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Encrypted data transmission
              </li>
            </ul>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Zap className="h-12 w-12 text-medical-yellow mb-4" />
            <h3 className="text-xl font-semibold mb-3">High Performance</h3>
            <p className="text-muted-foreground mb-4">
              Optimized for medical workflows with sub-second response times.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                &lt;500ms query response
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Real-time search suggestions
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Optimized medical databases
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Edge computing integration
              </li>
            </ul>
          </div>

          {/* Team Collaboration */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Users className="h-12 w-12 text-medical-purple mb-4" />
            <h3 className="text-xl font-semibold mb-3">Team Features</h3>
            <p className="text-muted-foreground mb-4">
              Collaborative tools for medical teams and healthcare institutions.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Shared document libraries
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Usage analytics dashboard
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Team administration
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Enterprise integrations
              </li>
            </ul>
          </div>

          {/* File Management */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <FileSearch className="h-12 w-12 text-medical-orange mb-4" />
            <h3 className="text-xl font-semibold mb-3">Document Management</h3>
            <p className="text-muted-foreground mb-4">
              Secure file upload and management with medical document processing.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                20MB file uploads
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                PDF, DOC, TXT support
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                OCR text extraction
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Full-text search capability
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-medical-blue text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of healthcare professionals using Medverus AI
          </p>
          <div className="space-x-4">
            <Link 
              href="/register" 
              className="bg-white text-medical-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/pricing" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-medical-blue transition-colors inline-block"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Medical Disclaimer */}
      <section className="border-t bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            🏥 <strong>Medical Disclaimer:</strong> This platform provides educational information only and should not replace professional medical judgment. 
            Always consult with qualified healthcare providers for medical decisions.
          </p>
        </div>
      </section>
    </div>
  )
}