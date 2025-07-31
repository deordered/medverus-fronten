import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Terms of Service | Medverus AI",
  description: "Terms of Service for Medverus AI Medical Information Platform - Terms and conditions for using our medical AI services.",
  robots: "index, follow",
}

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="mt-4 text-xl text-muted-foreground font-medium">
              Professional terms and conditions for using Medverus AI medical platform
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-destructive/10 p-8 rounded-2xl border border-destructive/30 mb-8 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Important Medical Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                <strong className="text-foreground">Medverus AI is designed for educational and informational purposes only.</strong> This platform does not provide medical advice, 
                diagnosis, or treatment recommendations. The information provided should not replace professional medical consultation. 
                Always consult with qualified healthcare providers for medical decisions.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using Medverus AI, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
                If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Eligibility and User Requirements</h2>
              
              <h3 className="text-xl font-medium mb-3 text-foreground">Professional Use Only</h3>
              <p className="text-muted-foreground mb-4">
                Medverus AI is intended exclusively for use by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Licensed healthcare professionals</li>
                <li>Medical students and residents</li>
                <li>Healthcare researchers and academics</li>
                <li>Medical institution personnel</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 text-foreground">Account Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You must be at least 18 years old</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must not share your account credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Acceptable Use Policy</h2>
              
              <h3 className="text-xl font-medium mb-3 text-foreground">Permitted Uses</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Educational research and learning</li>
                <li>Clinical information gathering and reference</li>
                <li>Medical literature review and analysis</li>
                <li>Professional development and continuing education</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 text-foreground">Prohibited Uses</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Providing direct patient care decisions based solely on platform outputs</li>
                <li>Sharing or distributing patient-specific information</li>
                <li>Using the platform for commercial redistribution of content</li>
                <li>Attempting to reverse engineer or duplicate our AI systems</li>
                <li>Using the platform for any illegal or unethical purposes</li>
                <li>Overloading or attempting to disrupt platform services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Service Availability and Limitations</h2>
              
              <h3 className="text-xl font-medium mb-3 text-foreground">Service Tiers and Usage Limits</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Free Tier:</strong> 10 queries per day per source, 1 file upload per day (5MB max)</li>
                <li><strong>Pro Tier:</strong> 100 Medverus AI + 20 PubMed + 100 Web queries/day, 10 file uploads/day (10MB max)</li>
                <li><strong>Enterprise Tier:</strong> 250 Medverus AI + 50 PubMed + 250 Web queries/day, 25 file uploads/day (20MB max)</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 text-foreground">Service Availability</h3>
              <p className="text-muted-foreground mb-4">
                While we strive for high availability, we do not guarantee uninterrupted service. Medverus AI may be temporarily unavailable for maintenance, 
                updates, or due to factors beyond our control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-medium mb-3 text-foreground">Platform Content</h3>
              <p className="text-muted-foreground mb-4">
                All content, features, and functionality of Medverus AI, including but not limited to AI models, algorithms, text, graphics, logos, 
                and software, are owned by Medverus AI and are protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium mb-3 text-foreground">User-Generated Content</h3>
              <p className="text-muted-foreground mb-4">
                You retain ownership of any content you upload to the platform. However, by uploading content, you grant Medverus AI a limited, 
                non-exclusive license to process and analyze your content solely for the purpose of providing our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Privacy and Data Protection</h2>
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our 
                <Link href="/privacy" className="text-primary hover:underline"> Privacy Policy</Link>, 
                which is incorporated into these Terms by reference.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We implement HIPAA-compliant security measures</li>
                <li>Your data is encrypted in transit and at rest</li>
                <li>We do not sell or share your personal information with third parties</li>
                <li>You have rights to access, correct, and delete your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Payment Terms and Billing</h2>
              
              <h3 className="text-xl font-medium mb-3 text-foreground">Subscription Plans</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Subscription fees are billed monthly in advance</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You may cancel your subscription at any time</li>
                <li>Price changes will be communicated 30 days in advance</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 text-foreground">Payment Processing</h3>
              <p className="text-muted-foreground mb-4">
                Payments are processed through secure third-party payment processors. We do not store your payment information on our servers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Limitation of Liability</h2>
              <div className="bg-warning/10 p-6 rounded-xl border border-warning/30 mb-4 backdrop-blur-sm">
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Important:</strong> Medverus AI is provided "as is" without warranties of any kind. 
                  We are not liable for any decisions made based on information provided by our platform.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>No warranty regarding accuracy, completeness, or reliability of information</li>
                <li>No liability for medical decisions or patient outcomes</li>
                <li>Limited liability for service interruptions or data loss</li>
                <li>Maximum liability limited to amount paid for services in the past 12 months</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless Medverus AI from any claims, damages, or expenses arising from your use of the platform, 
                violation of these terms, or infringement of any third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Termination</h2>
              
              <h3 className="text-xl font-medium mb-3 text-foreground">Termination by You</h3>
              <p className="text-muted-foreground mb-4">
                You may terminate your account at any time by contacting our support team or using the account deletion feature in your profile settings.
              </p>

              <h3 className="text-xl font-medium mb-3 text-foreground">Termination by Medverus AI</h3>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend your account immediately if you violate these terms, engage in prohibited activities, or for any other reason at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Governing Law and Disputes</h2>
              <p className="text-muted-foreground mb-4">
                These Terms are governed by and construed in accordance with applicable laws. Any disputes arising under these Terms will be resolved through binding arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. 
                Continued use of the platform after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Medverus AI Legal Team</strong><br />
                  Email: legal@medverus.ai<br />
                  Subject line: "Terms of Service Inquiry"
                </p>
              </div>
            </section>

            <div className="bg-card/60 p-8 rounded-2xl border border-primary/30 mt-12 backdrop-blur-md shadow-lg">
              <p className="text-base text-muted-foreground text-center leading-relaxed">
                By using Medverus AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/80 backdrop-blur-md shadow-inner">
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