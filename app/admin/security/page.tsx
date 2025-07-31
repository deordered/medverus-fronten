import { ComplianceDashboard } from "@/components/security/compliance-dashboard"

export default function SecurityPage() {
  return (
    <div className="container mx-auto p-6">
      <ComplianceDashboard />
    </div>
  )
}

export const metadata = {
  title: "Security Dashboard | Medverus AI",
  description: "HIPAA compliance monitoring and security status for the medical AI platform",
}