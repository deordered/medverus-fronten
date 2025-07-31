"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Settings, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Mail,
  Users,
  FileText,
  CheckCircle2
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAdminSettings, useUpdateSettings } from "@/lib/api/hooks"

export function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  useAdminSettings()
  const updateSettingsMutation = useUpdateSettings()

  const [localSettings, setLocalSettings] = useState({
    // General Settings
    platform_name: "Medverus AI",
    platform_description: "AI-powered medical knowledge platform",
    maintenance_mode: false,
    registration_enabled: true,
    
    // Rate Limiting
    free_tier_queries_daily: 50,
    pro_tier_queries_daily: 500,
    enterprise_tier_queries_daily: 5000,
    
    // File Upload Limits
    free_tier_file_size_mb: 5,
    pro_tier_file_size_mb: 20,
    enterprise_tier_file_size_mb: 100,
    
    // Email Settings
    email_notifications: true,
    smtp_host: "smtp.medverus.com",
    smtp_port: 587,
    smtp_username: "",
    smtp_from_email: "noreply@medverus.com",
    
    // Security Settings
    session_timeout_minutes: 30,
    require_email_verification: true,
    enforce_strong_passwords: true,
    enable_2fa: false,
    
    // API Settings
    ai_response_timeout_seconds: 30,
    max_concurrent_requests: 100,
    enable_rate_limiting: true,
    
    // Medical Compliance
    hipaa_compliance_mode: true,
    audit_logging_enabled: true,
    data_retention_days: 2555, // 7 years
    
    // Monitoring
    health_check_interval_minutes: 5,
    alert_email: "admin@medverus.com",
    enable_system_alerts: true
  })

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await updateSettingsMutation.mutateAsync(localSettings)
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Limits</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Monitoring</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Platform Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input
                    id="platform_name"
                    value={localSettings.platform_name}
                    onChange={(e) => updateSetting('platform_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localSettings.maintenance_mode}
                      onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                    />
                    <span className="text-sm">
                      {localSettings.maintenance_mode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform_description">Platform Description</Label>
                <Textarea
                  id="platform_description"
                  value={localSettings.platform_description}
                  onChange={(e) => updateSetting('platform_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={localSettings.registration_enabled}
                  onCheckedChange={(checked) => updateSetting('registration_enabled', checked)}
                />
                <Label>Allow new user registrations</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={localSettings.session_timeout_minutes}
                    onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_concurrent">Max Concurrent Requests</Label>
                  <Input
                    id="max_concurrent"
                    type="number"
                    value={localSettings.max_concurrent_requests}
                    onChange={(e) => updateSetting('max_concurrent_requests', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localSettings.require_email_verification}
                    onCheckedChange={(checked) => updateSetting('require_email_verification', checked)}
                  />
                  <Label>Require email verification for new accounts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localSettings.enforce_strong_passwords}
                    onCheckedChange={(checked) => updateSetting('enforce_strong_passwords', checked)}
                  />
                  <Label>Enforce strong password requirements</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localSettings.enable_2fa}
                    onCheckedChange={(checked) => updateSetting('enable_2fa', checked)}
                  />
                  <Label>Enable two-factor authentication (Coming Soon)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localSettings.enable_rate_limiting}
                    onCheckedChange={(checked) => updateSetting('enable_rate_limiting', checked)}
                  />
                  <Label>Enable API rate limiting</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tier Limits */}
        <TabsContent value="limits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Query Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="free_queries">Free Tier</Label>
                  <Input
                    id="free_queries"
                    type="number"
                    value={localSettings.free_tier_queries_daily}
                    onChange={(e) => updateSetting('free_tier_queries_daily', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pro_queries">Pro Tier</Label>
                  <Input
                    id="pro_queries"
                    type="number"
                    value={localSettings.pro_tier_queries_daily}
                    onChange={(e) => updateSetting('pro_tier_queries_daily', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enterprise_queries">Enterprise Tier</Label>
                  <Input
                    id="enterprise_queries"
                    type="number"
                    value={localSettings.enterprise_tier_queries_daily}
                    onChange={(e) => updateSetting('enterprise_tier_queries_daily', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Upload Limits (MB)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="free_file_size">Free Tier</Label>
                  <Input
                    id="free_file_size"
                    type="number"
                    value={localSettings.free_tier_file_size_mb}
                    onChange={(e) => updateSetting('free_tier_file_size_mb', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pro_file_size">Pro Tier</Label>
                  <Input
                    id="pro_file_size"
                    type="number"
                    value={localSettings.pro_tier_file_size_mb}
                    onChange={(e) => updateSetting('pro_tier_file_size_mb', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enterprise_file_size">Enterprise Tier</Label>
                  <Input
                    id="enterprise_file_size"
                    type="number"
                    value={localSettings.enterprise_tier_file_size_mb}
                    onChange={(e) => updateSetting('enterprise_tier_file_size_mb', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  checked={localSettings.email_notifications}
                  onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                />
                <Label>Enable email notifications</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={localSettings.smtp_host}
                    onChange={(e) => updateSetting('smtp_host', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={localSettings.smtp_port}
                    onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={localSettings.smtp_username}
                    onChange={(e) => updateSetting('smtp_username', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_from">From Email Address</Label>
                  <Input
                    id="smtp_from"
                    type="email"
                    value={localSettings.smtp_from_email}
                    onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Compliance */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Medical Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div className="text-sm">
                  <span className="font-medium">HIPAA Compliance Mode: </span>
                  <span className="text-green-600">Enabled</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localSettings.hipaa_compliance_mode}
                    onCheckedChange={(checked) => updateSetting('hipaa_compliance_mode', checked)}
                  />
                  <Label>Enable HIPAA compliance mode</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localSettings.audit_logging_enabled}
                    onCheckedChange={(checked) => updateSetting('audit_logging_enabled', checked)}
                  />
                  <Label>Enable comprehensive audit logging</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_retention">Data Retention Period (days)</Label>
                <Input
                  id="data_retention"
                  type="number"
                  value={localSettings.data_retention_days}
                  onChange={(e) => updateSetting('data_retention_days', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Current setting: {Math.round(localSettings.data_retention_days / 365)} years (recommended: 7 years for medical data)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai_timeout">AI Response Timeout (seconds)</Label>
                <Input
                  id="ai_timeout"
                  type="number"
                  value={localSettings.ai_response_timeout_seconds}
                  onChange={(e) => updateSetting('ai_response_timeout_seconds', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Settings */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>System Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={localSettings.enable_system_alerts}
                  onCheckedChange={(checked) => updateSetting('enable_system_alerts', checked)}
                />
                <Label>Enable system alerts and notifications</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="health_check_interval">Health Check Interval (minutes)</Label>
                  <Input
                    id="health_check_interval"
                    type="number"
                    value={localSettings.health_check_interval_minutes}
                    onChange={(e) => updateSetting('health_check_interval_minutes', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alert_email">Alert Email Address</Label>
                  <Input
                    id="alert_email"
                    type="email"
                    value={localSettings.alert_email}
                    onChange={(e) => updateSetting('alert_email', e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm font-medium">Alert Types</span>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>System performance degradation</li>
                    <li>High error rates or API failures</li>
                    <li>Security breach attempts</li>
                    <li>Storage capacity warnings</li>
                    <li>Scheduled maintenance reminders</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}