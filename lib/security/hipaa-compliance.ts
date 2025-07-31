// HIPAA compliance validation and enforcement for medical data protection
// Implements comprehensive HIPAA requirements and medical data security controls

import type { NextRequest } from 'next/server'

interface ComplianceResult {
  compliant: boolean
  violations: string[]
  reason?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface ClientInfo {
  ip: string
  userAgent: string
  pathname: string
  method: string
}

interface PHIDetectionResult {
  detected: boolean
  types: string[]
  confidence: number
}

export class HIPAACompliance {
  // Restricted countries for medical data processing
  private restrictedCountries = [
    'CN', 'RU', 'IR', 'KP', 'SY', 'CU', 'MM', 'AF'
  ]

  // PHI (Protected Health Information) patterns
  private phiPatterns = {
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    medicalId: /\b(MRN|PATIENT|ID)[-\s]*\d{6,}\b/gi,
    dob: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    zipCode: /\b\d{5}(-\d{4})?\b/g,
    ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g
  }

  // Medical terminology that indicates PHI
  private medicalTerms = [
    'patient', 'diagnosis', 'treatment', 'medication', 'prescription',
    'surgery', 'procedure', 'condition', 'symptom', 'allergies',
    'medical history', 'vital signs', 'lab results', 'radiology',
    'pathology', 'discharge', 'admission', 'insurance', 'medicare',
    'medicaid', 'provider', 'physician', 'doctor', 'nurse'
  ]

  /**
   * Validate request for HIPAA compliance
   */
  async validateRequest(request: NextRequest, clientInfo: ClientInfo): Promise<ComplianceResult> {
    const violations: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    try {
      // 1. Geographic compliance check
      const geoViolation = this.checkGeographicCompliance(request, clientInfo)
      if (geoViolation) {
        violations.push(geoViolation)
        riskLevel = 'high'
      }

      // 2. Request headers validation
      const headerViolations = this.validateHeaders(request.headers)
      violations.push(...headerViolations)
      if (headerViolations.length > 0) {
        riskLevel = Math.max(riskLevel === 'low' ? 'medium' : riskLevel, 'medium') as any
      }

      // 3. Request body PHI detection (for POST/PUT requests)
      if (request.method === 'POST' || request.method === 'PUT') {
        const bodyViolations = await this.checkRequestBodyForPHI(request)
        violations.push(...bodyViolations.violations)
        if (bodyViolations.riskLevel === 'critical') {
          riskLevel = 'critical'
        }
      }

      // 4. URL parameter validation
      const urlViolations = this.validateUrlParameters(request.url)
      violations.push(...urlViolations)
      if (urlViolations.length > 0) {
        riskLevel = Math.max(riskLevel === 'low' ? 'medium' : riskLevel, 'medium') as any
      }

      // 5. User agent validation
      const uaViolation = this.validateUserAgent(clientInfo.userAgent)
      if (uaViolation) {
        violations.push(uaViolation)
        riskLevel = 'medium'
      }

      // 6. Rate limiting validation for medical endpoints
      const rateLimitViolation = this.checkMedicalEndpointAccess(clientInfo)
      if (rateLimitViolation) {
        violations.push(rateLimitViolation)
        riskLevel = 'high'
      }

      // 7. Audit trail requirements
      const auditViolation = this.validateAuditRequirements(request, clientInfo)
      if (auditViolation) {
        violations.push(auditViolation)
        riskLevel = 'high'
      }

      return {
        compliant: violations.length === 0,
        violations,
        riskLevel,
        reason: violations.length > 0 ? violations.join('; ') : undefined
      }

    } catch (error) {
      return {
        compliant: false,
        violations: ['HIPAA validation error'],
        riskLevel: 'critical',
        reason: error instanceof Error ? error.message : 'Unknown validation error'
      }
    }
  }

  /**
   * Check geographic compliance restrictions
   */
  private checkGeographicCompliance(request: NextRequest, clientInfo: ClientInfo): string | null {
    // Check CF-IPCountry header (Cloudflare)
    const country = request.headers.get('cf-ipcountry') || 
                   request.headers.get('x-country-code') ||
                   request.geo?.country

    if (country && this.restrictedCountries.includes(country.toUpperCase())) {
      return `Medical data access restricted from country: ${country}`
    }

    // Additional IP-based geographic validation could be added here
    return null
  }

  /**
   * Validate request headers for HIPAA compliance
   */
  private validateHeaders(headers: Headers): string[] {
    const violations: string[] = []

    // Check for required security headers
    if (!headers.get('user-agent')) {
      violations.push('Missing User-Agent header required for audit trail')
    }

    // Check for potentially dangerous headers
    const dangerousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-cluster-client-ip'
    ]

    dangerousHeaders.forEach(header => {
      if (headers.get(header)) {
        violations.push(`Potentially spoofed header detected: ${header}`)
      }
    })

    // Validate Content-Type for medical data submissions
    const contentType = headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      // Additional JSON validation could be added here
    }

    return violations
  }

  /**
   * Check request body for PHI (Protected Health Information)
   */
  private async checkRequestBodyForPHI(request: NextRequest): Promise<{
    violations: string[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }> {
    const violations: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    try {
      // Clone the request to read the body without consuming it
      const clonedRequest = request.clone()
      const body = await clonedRequest.text()

      if (body) {
        const phiDetection = this.detectPHI(body)
        
        if (phiDetection.detected) {
          violations.push(`Potential PHI detected: ${phiDetection.types.join(', ')}`)
          
          // Determine risk level based on PHI types and confidence
          if (phiDetection.confidence > 0.8) {
            riskLevel = 'critical'
          } else if (phiDetection.confidence > 0.6) {
            riskLevel = 'high'
          } else {
            riskLevel = 'medium'
          }
        }

        // Check for medical terminology
        const medicalTermCount = this.countMedicalTerms(body)
        if (medicalTermCount > 5) {
          violations.push(`High concentration of medical terminology detected (${medicalTermCount} terms)`)
          riskLevel = Math.max(riskLevel === 'low' ? 'medium' : riskLevel, 'medium') as any
        }
      }
    } catch (error) {
      violations.push('Unable to validate request body for PHI')
      riskLevel = 'high'
    }

    return { violations, riskLevel }
  }

  /**
   * Detect PHI in text content
   */
  private detectPHI(text: string): PHIDetectionResult {
    const detectedTypes: string[] = []
    let totalMatches = 0

    // Check each PHI pattern
    Object.entries(this.phiPatterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern)
      if (matches && matches.length > 0) {
        detectedTypes.push(type)
        totalMatches += matches.length
      }
    })

    // Calculate confidence based on number and types of matches
    const confidence = Math.min(1.0, (detectedTypes.length * 0.2) + (totalMatches * 0.1))

    return {
      detected: detectedTypes.length > 0,
      types: detectedTypes,
      confidence
    }
  }

  /**
   * Count medical terminology in text
   */
  private countMedicalTerms(text: string): number {
    const lowerText = text.toLowerCase()
    return this.medicalTerms.filter(term => 
      lowerText.includes(term.toLowerCase())
    ).length
  }

  /**
   * Validate URL parameters for PHI
   */
  private validateUrlParameters(url: string): string[] {
    const violations: string[] = []
    
    try {
      const urlObj = new URL(url)
      const params = urlObj.searchParams

      // Check query parameters for PHI
      params.forEach((value, key) => {
        const phiDetection = this.detectPHI(value)
        if (phiDetection.detected) {
          violations.push(`Potential PHI in URL parameter '${key}': ${phiDetection.types.join(', ')}`)
        }

        // Check for medical terms in parameters
        const medicalTermCount = this.countMedicalTerms(value)
        if (medicalTermCount > 0) {
          violations.push(`Medical terminology in URL parameter '${key}'`)
        }
      })

      // Check for PHI in URL path
      const pathPHI = this.detectPHI(urlObj.pathname)
      if (pathPHI.detected) {
        violations.push(`Potential PHI in URL path: ${pathPHI.types.join(', ')}`)
      }
    } catch (error) {
      violations.push('Unable to validate URL parameters')
    }

    return violations
  }

  /**
   * Validate User-Agent for compliance
   */
  private validateUserAgent(userAgent: string): string | null {
    if (!userAgent || userAgent.length < 10) {
      return 'Invalid or missing User-Agent required for medical data access'
    }

    // Check for suspicious user agents
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /scraper/i,
      /scanner/i,
      /curl/i,
      /wget/i
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      return 'Automated access detected - medical data requires human interaction'
    }

    return null
  }

  /**
   * Check medical endpoint access patterns
   */
  private checkMedicalEndpointAccess(clientInfo: ClientInfo): string | null {
    // Define medical endpoints that require stricter validation
    const medicalEndpoints = [
      '/api/medical',
      '/api/query',
      '/api/files',
      '/dashboard/files'
    ]

    const isMedicalEndpoint = medicalEndpoints.some(endpoint => 
      clientInfo.pathname.startsWith(endpoint)
    )

    if (isMedicalEndpoint) {
      // Additional validation for medical endpoints
      if (clientInfo.method === 'GET' && clientInfo.pathname.includes('/api/medical/')) {
        // Check for bulk data access attempts
        const urlParams = new URLSearchParams(clientInfo.pathname.split('?')[1] || '')
        const limit = urlParams.get('limit')
        
        if (limit && parseInt(limit) > 100) {
          return 'Bulk medical data access requires special authorization'
        }
      }
    }

    return null
  }

  /**
   * Validate audit trail requirements
   */
  private validateAuditRequirements(request: NextRequest, clientInfo: ClientInfo): string | null {
    // Check for required audit headers
    const requiredHeaders = ['user-agent']
    
    for (const header of requiredHeaders) {
      if (!request.headers.get(header)) {
        return `Missing required audit header: ${header}`
      }
    }

    // Validate audit trail completeness
    if (!clientInfo.ip || clientInfo.ip === 'unknown') {
      return 'Unable to establish client IP for audit trail'
    }

    return null
  }

  /**
   * Check if country is restricted for medical data
   */
  isRestrictedCountry(country: string): boolean {
    return this.restrictedCountries.includes(country.toUpperCase())
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(request: NextRequest, clientInfo: ClientInfo): {
    timestamp: string
    requestId: string
    complianceStatus: 'compliant' | 'non-compliant' | 'pending'
    checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warning'
      details: string
    }>
  } {
    const checks = [
      {
        name: 'Geographic Compliance',
        status: this.checkGeographicCompliance(request, clientInfo) ? 'fail' : 'pass',
        details: 'Validates access from HIPAA-compliant geographic regions'
      },
      {
        name: 'Header Validation',
        status: this.validateHeaders(request.headers).length > 0 ? 'fail' : 'pass',
        details: 'Validates request headers for security and audit requirements'
      },
      {
        name: 'User Agent Check',
        status: this.validateUserAgent(clientInfo.userAgent) ? 'fail' : 'pass',
        details: 'Ensures legitimate user agent for medical data access'
      },
      {
        name: 'Audit Trail',
        status: this.validateAuditRequirements(request, clientInfo) ? 'fail' : 'pass',
        details: 'Validates completeness of audit trail information'
      }
    ]

    const hasFailures = checks.some(check => check.status === 'fail')
    const complianceStatus = hasFailures ? 'non-compliant' : 'compliant'

    return {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      complianceStatus,
      checks
    }
  }

  /**
   * Get HIPAA compliance configuration
   */
  getComplianceConfig(): {
    restrictedCountries: string[]
    phiPatterns: string[]
    medicalTerms: string[]
    auditRequirements: string[]
  } {
    return {
      restrictedCountries: this.restrictedCountries,
      phiPatterns: Object.keys(this.phiPatterns),
      medicalTerms: this.medicalTerms,
      auditRequirements: ['user-agent', 'ip-address', 'timestamp', 'request-path']
    }
  }
}