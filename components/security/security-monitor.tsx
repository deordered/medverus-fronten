"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Eye,
  Lock,
  FileText,
  Activity,
  Bell,
  Zap,
  Users,
  Database
} from "lucide-react"
import { useSecurityStatus, useSecurityAlerts, useComplianceStatus } from "@/lib/api/hooks"

interface SecurityAlert {
  id: string
  type: 'rate_limit' | 'auth_failure' | 'hipaa_violation' | 'suspicious_activity'
  severity: 'info' | 'warning' | 'high' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
  details?: Record<string, any>
}

export function SecurityMonitor() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: securityStatus } = useSecurityStatus()
  const { data: alerts } = useSecurityAlerts()
  const { data: complianceStatus } = useComplianceStatus()

  const getSecurityLevel = () => {
    if (!securityStatus) return 'unknown'
    
    const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && !a.resolved).length || 0
    const highAlerts = alerts?.filter(a => a.severity === 'high' && !a.resolved).length || 0
    
    if (criticalAlerts > 0) return 'critical'
    if (highAlerts > 2) return 'high'
    if (highAlerts > 0) return 'medium'
    return 'secure'
  }

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'secure': return 'text-green-600'
      case 'medium': return 'text-yellow-600' 
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'secure': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const securityLevel = getSecurityLevel()
  const unresolved = alerts?.filter(a => !a.resolved).length || 0

  if (!isExpanded) {
    return (
      <Card className="w-80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security Status</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(true)}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getSecurityIcon(securityLevel)}
              <span className={`text-sm font-medium capitalize ${getSecurityColor(securityLevel)}`}>
                {securityLevel}
              </span>
            </div>
            {unresolved > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unresolved} alerts
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Monitor</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Security Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Security</span>
            <div className="flex items-center space-x-2">
              {getSecurityIcon(securityLevel)}
              <span className={`text-sm font-medium capitalize ${getSecurityColor(securityLevel)}`}>
                {securityLevel}
              </span>
            </div>
          </div>
          
          {securityStatus && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Security Score</span>
                <span>{securityStatus.score}/100</span>
              </div>
              <Progress 
                value={securityStatus.score} 
                className="h-2"
                indicatorClassName={
                  securityStatus.score >= 90 ? 'bg-green-500' :
                  securityStatus.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }
              />
            </div>
          )}
        </div>

        {/* HIPAA Compliance Status */}
        {complianceStatus && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">HIPAA Compliance</span>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Compliant</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Compliance Score</span>
                <span>{complianceStatus.score}%</span>
              </div>
              <Progress value={complianceStatus.score} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <FileText className="h-3 w-3 text-blue-600" />
                <span>Audit Trail: Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lock className="h-3 w-3 text-green-600" />
                <span>Encryption: AES-256</span>
              </div>
            </div>
          </div>
        )}

        {/* Security Metrics */}
        {securityStatus && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Security Metrics</h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3 text-blue-600" />
                <div>
                  <div className="font-medium">{securityStatus.metrics.activeConnections}</div>
                  <div className="text-muted-foreground">Active Sessions</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3 text-yellow-600" />
                <div>
                  <div className="font-medium">{securityStatus.metrics.rateLimitHits}</div>
                  <div className="text-muted-foreground">Rate Limits (24h)</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-green-600" />
                <div>
                  <div className="font-medium">{securityStatus.metrics.failedLogins}</div>
                  <div className="text-muted-foreground">Failed Logins (24h)</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Database className="h-3 w-3 text-purple-600" />
                <div>
                  <div className="font-medium">{securityStatus.metrics.dataRequests}</div>
                  <div className="text-muted-foreground">Data Requests (24h)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Recent Alerts</h4>
            {unresolved > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unresolved} unresolved
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {alerts && alerts.length > 0 ? (
              alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-2 p-2 rounded border text-xs">
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.severity === 'critical' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                    {alert.severity === 'high' && <AlertTriangle className="h-3 w-3 text-orange-600" />}
                    {alert.severity === 'warning' && <Clock className="h-3 w-3 text-yellow-600" />}
                    {alert.severity === 'info' && <CheckCircle2 className="h-3 w-3 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{alert.message}</div>
                    <div className="text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {!alert.resolved && (
                    <div className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No security alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Bell className="h-3 w-3 mr-1" />
              View All Alerts
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Security Report
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}