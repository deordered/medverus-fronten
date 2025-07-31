import { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing | Medverus AI - Medical AI Platform",
  description: "Flexible pricing plans for healthcare professionals. Free, Pro, and Enterprise tiers with HIPAA compliance and dedicated support.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transparent Pricing
            <span className="text-primary block">for Medical Professionals</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your medical practice. All plans include HIPAA compliance,
            medical safety features, and access to our four trusted content sources.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-gray-500 mb-4">Getting Started</div>
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-600">Perfect for trying out the platform</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>10 queries/day per source</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>1 file upload/day (5MB)</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Basic medical safety features</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Community support</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Medical disclaimers</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>HIPAA-compliant infrastructure</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-medical-blue relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-medical-blue text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Most Popular
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-gray-500 mb-4">For Active Professionals</div>
              <div className="mb-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-600">For active healthcare professionals</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>100 Medverus AI queries/day</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>20 PubMed queries/day</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>100 Web search queries/day</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>10 file uploads/day (10MB each)</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Advanced medical safety features</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Usage analytics</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="w-full bg-medical-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-medical-blue/90 transition-colors text-center block"
            >
              Start Pro Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-gray-500 mb-4">Healthcare Organizations</div>
              <div className="mb-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-600">For medical institutions and teams</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>250 Medverus AI queries/day</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>50 PubMed queries/day</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>250 Web search queries/day</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>25 file uploads/day (20MB each)</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Dedicated support</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Enterprise security & compliance</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>Team management</span>
              </li>
            </ul>

            <Link
              href="/contact"
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Is all data HIPAA compliant?</h3>
              <p className="text-gray-600">
                Yes, all plans include HIPAA-compliant infrastructure with encrypted data transmission, 
                comprehensive audit trails, and PHI protection mechanisms.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, 
                while downgrades will take effect at the next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">What content sources are included?</h3>
              <p className="text-gray-600">
                All plans include access to four content sources: Medverus AI (curated medical content), 
                PubMed (biomedical literature), Medical Web Search (trusted medical websites), 
                and Your Documents (private file uploads).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Is there a free trial for paid plans?</h3>
              <p className="text-gray-600">
                Yes, both Pro and Enterprise plans include a 14-day free trial. 
                No credit card required to start your trial.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">What kind of support is included?</h3>
              <p className="text-gray-600">
                Free plans include community support, Pro plans include priority email support, 
                and Enterprise plans include dedicated support with phone access and custom training.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-20 text-center bg-medical-blue text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-xl mb-6 opacity-90">
            Large healthcare organizations can benefit from custom pricing and features
          </p>
          <Link 
            href="/contact" 
            className="bg-white text-medical-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Contact Enterprise Sales
          </Link>
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