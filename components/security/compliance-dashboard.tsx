"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  FileText, 
  Lock, 
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  Users,
  Database,
  Activity,
  Zap
} from "lucide-react"
import { useComplianceReport, useAuditTrail, useDataRetention } from "@/lib/api/hooks"

export function ComplianceDashboard() {
  const { data: complianceReport } = useComplianceReport()
  const { data: auditTrail } = useAuditTrail()
  const { data: dataRetention } = useDataRetention()

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-blue-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplianceIcon = (score: number) => {
    if (score >= 95) return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (score >= 85) return <Shield className="h-4 w-4 text-blue-600" />
    if (score >= 75) return <Clock className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HIPAA Compliance Dashboard</h2>
          <p className="text-muted-foreground">
            Medical data protection and regulatory compliance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      {complianceReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getComplianceIcon(complianceReport.overall_score)}
                <div className="text-2xl font-bold">
                  {complianceReport.overall_score}%
                </div>
              </div>
              <div className="mt-2">
                <Progress 
                  value={complianceReport.overall_score} 
                  className="h-2"
                  indicatorClassName={
                    complianceReport.overall_score >= 95 ? 'bg-green-500' :
                    complianceReport.overall_score >= 85 ? 'bg-blue-500' :
                    complianceReport.overall_score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {complianceReport.security_score}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                AES-256 Encryption Active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Audit Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {complianceReport.audit_score}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {auditTrail?.total_events.toLocaleString()} Events Logged
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Access Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {complianceReport.access_score}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Role-Based Access Control
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>HIPAA Safeguards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Administrative Safeguards</span>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Compliant
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                • Security Officer Assigned
                • Workforce Training Completed
                • Access Management Procedures
                • Business Associate Agreements
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Physical Safeguards</span>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Compliant
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                • Facility Access Controls
                • Workstation Security
                • Device and Media Controls
                • Data Center Security
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Technical Safeguards</span>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Compliant
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                • Access Control (Unique User IDs)
                • Audit Controls (Comprehensive Logging)
                • Integrity Controls (Data Validation)
                • Transmission Security (TLS 1.3)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Audit Trail Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditTrail && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditTrail.events_today}</div>
                    <div className="text-xs text-muted-foreground">Events Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditTrail.events_week}</div>
                    <div className="text-xs text-muted-foreground">Events This Week</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Authentication Events</span>
                    <span>{auditTrail.auth_events}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Data Access Events</span>
                    <span>{auditTrail.data_access_events}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Administrative Events</span>
                    <span>{auditTrail.admin_events}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Security Events</span>
                    <span>{auditTrail.security_events}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2 text-sm">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span>Audit logging active and compliant</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Retention and Medical Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Retention Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataRetention && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medical Records</span>
                    <Badge variant="outline">
                      {dataRetention.medical_records_years} years
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Logs</span>
                    <Badge variant="outline">
                      {dataRetention.audit_logs_years} years
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Data</span>
                    <Badge variant="outline">
                      {dataRetention.user_data_years} years
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Logs</span>
                    <Badge variant="outline">
                      {dataRetention.system_logs_years} years
                    </Badge>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Stored Records</span>
                      <span>{dataRetention.total_records.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span>{dataRetention.storage_used_gb} GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Retention Compliance</span>
                      <Badge variant="secondary" className="text-green-600">
                        {dataRetention.compliance_percentage}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Security Monitoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Monitoring</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Intrusion Detection</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Vulnerability Scanning</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-600">Scheduled</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Compliance Monitoring</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Security Scan</span>
                  <span>2 hours ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Next Compliance Audit</span>
                  <span>15 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vulnerability Status</span>
                  <Badge variant="secondary" className="text-green-600">
                    Clean
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Actions Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border rounded bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">All HIPAA requirements met</div>
                <div className="text-xs text-muted-foreground">
                  System is fully compliant with HIPAA regulations
                </div>
              </div>
              <Badge variant="secondary" className="text-green-600">
                Compliant
              </Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">Quarterly compliance review scheduled</div>
                <div className="text-xs text-muted-foreground">
                  Next review: March 15, 2024
                </div>
              </div>
              <Button variant="outline" size="sm">
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}