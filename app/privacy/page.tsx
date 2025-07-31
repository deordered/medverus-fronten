import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy | Medverus AI",
  description: "Privacy Policy for Medverus AI Medical Information Platform - How we protect your data and ensure HIPAA compliance.",
  robots: "index, follow",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/2 via-background to-primary/8">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg mr-2">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">Medverus AI</span>
            </div>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-xl text-muted-foreground font-medium">
              Your privacy and data security are fundamental to our commitment to healthcare excellence
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-card/60 p-8 rounded-2xl border border-primary/30 mb-8 backdrop-blur-md shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Overview</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Medverus AI is committed to protecting the privacy and security of your personal and medical information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical AI platform, ensuring the highest standards of healthcare data protection.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3 text-foreground">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Email address and authentication credentials</li>
                <li>Professional information (medical specialty, institution)</li>
                <li>Account preferences and settings</li>
                <li>Usage analytics and platform interaction data</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 text-foreground">Medical Queries and Documents</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Medical queries submitted to our AI systems</li>
                <li>Uploaded medical documents and files</li>
                <li>Search history and query patterns</li>
                <li>Research preferences and saved content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide and improve our medical AI services</li>
                <li>Process your medical queries and deliver relevant results</li>
                <li>Maintain account security and prevent fraud</li>
                <li>Send important service updates and medical safety notifications</li>
                <li>Analyze usage patterns to enhance platform performance</li>
                <li>Ensure compliance with medical and healthcare regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">HIPAA Compliance</h2>
              <div className="bg-primary/10 p-6 rounded-xl border border-primary/30 mb-4 backdrop-blur-sm">
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Important:</strong> Medverus AI implements HIPAA-compliant security measures to protect any protected health information (PHI) 
                  that may be processed through our platform. We maintain strict data handling procedures and security controls to ensure compliance with healthcare privacy regulations.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>End-to-end encryption for all data transmission and storage</li>
                <li>Access controls and audit trails for all PHI interactions</li>
                <li>Regular security assessments and compliance monitoring</li>
                <li>Staff training on HIPAA requirements and data protection</li>
                <li>Incident response procedures for potential data breaches</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>With trusted service providers who assist in platform operations (under strict confidentiality agreements)</li>
                <li>In connection with a business merger or acquisition (with continued privacy protection)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Security</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Industry-standard encryption for data in transit and at rest</li>
                <li>Multi-factor authentication and secure access controls</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure data centers with physical and digital protections</li>
                <li>Employee background checks and security training</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Rights and Choices</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request copies of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your information only as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Account information: Retained while your account is active</li>
                <li>Medical queries: Retained for 7 years for quality assurance and compliance</li>
                <li>Uploaded documents: Retained until you delete them or close your account</li>
                <li>Usage analytics: Aggregated data retained for 5 years for service improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws 
                and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Medverus AI Privacy Team</strong><br />
                  Email: privacy@medverus.ai<br />
                  Subject line: "Privacy Policy Inquiry"
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
                We will notify you of any material changes by email or through prominent notices on our platform. 
                Your continued use of Medverus AI after such changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Medverus AI. All rights reserved. This platform is for medical professionals only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}