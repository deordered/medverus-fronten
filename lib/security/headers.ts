// Security headers implementation for HIPAA compliance and medical data protection
// Implements comprehensive security headers following OWASP guidelines

import { NextResponse } from 'next/server'

export class SecurityHeaders {
  /**
   * Apply comprehensive security headers to response
   */
  static apply(response: NextResponse): void {
    // Prevent DNS prefetching
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    
    // Enforce HTTPS with HSTS
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
    
    // Prevent clickjacking attacks
    response.headers.set('X-Frame-Options', 'DENY')
    
    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Prevent XSS attacks
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Content Security Policy for medical application
    response.headers.set(
      'Content-Security-Policy',
      SecurityHeaders.getContentSecurityPolicy()
    )
    
    // Permissions Policy (Feature Policy)
    response.headers.set(
      'Permissions-Policy',
      SecurityHeaders.getPermissionsPolicy()
    )
    
    // HIPAA compliance headers
    response.headers.set('X-Medical-Data-Protection', 'enabled')
    response.headers.set('X-Audit-Trail', 'required')
    
    // Additional security headers
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
    
    // Cache control for sensitive data
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Remove server information
    response.headers.delete('Server')
    response.headers.delete('X-Powered-By')
  }

  /**
   * Generate Content Security Policy for medical application
   */
  private static getContentSecurityPolicy(): string {
    const policies = [
      // Default policy - restrict everything by default
      "default-src 'self'",
      
      // Script sources - allow self and specific trusted sources
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
      
      // Style sources - allow self and inline styles for component libraries
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      
      // Font sources
      "font-src 'self' data: https://fonts.gstatic.com",
      
      // Image sources - allow self, data URIs, and secure external sources
      "img-src 'self' data: blob: https:",
      
      // Media sources
      "media-src 'self'",
      
      // Object sources - restrict plugin content
      "object-src 'none'",
      
      // Base URI restriction
      "base-uri 'self'",
      
      // Form action restriction
      "form-action 'self'",
      
      // Frame sources - prevent embedding
      "frame-src 'none'",
      
      // Connect sources - API and WebSocket connections
      "connect-src 'self' https: wss:",
      
      // Worker sources
      "worker-src 'self' blob:",
      
      // Manifest source
      "manifest-src 'self'",
      
      // Child sources
      "child-src 'none'",
      
      // Frame ancestors - prevent embedding in other sites
      "frame-ancestors 'none'",
      
      // Upgrade insecure requests
      "upgrade-insecure-requests",
      
      // Block mixed content
      "block-all-mixed-content"
    ]
    
    return policies.join('; ')
  }

  /**
   * Generate Permissions Policy for medical application
   */
  private static getPermissionsPolicy(): string {
    const policies = [
      // Camera and microphone - disabled for privacy
      'camera=()',
      'microphone=()',
      
      // Geolocation - disabled for privacy
      'geolocation=()',
      
      // Payment - self only
      'payment=(self)',
      
      // USB and serial - disabled
      'usb=()',
      'serial=()',
      
      // Bluetooth - disabled
      'bluetooth=()',
      
      // Magnetometer and accelerometer - disabled
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      
      // Ambient light sensor - disabled
      'ambient-light-sensor=()',
      
      // Autoplay - self only
      'autoplay=(self)',
      
      // Encrypted media - self only
      'encrypted-media=(self)',
      
      // Fullscreen - self only
      'fullscreen=(self)',
      
      // Picture in picture - disabled
      'picture-in-picture=()',
      
      // Screen wake lock - disabled
      'screen-wake-lock=()',
      
      // Sync xhr - disabled
      'sync-xhr=()',
      
      // Web share - self only
      'web-share=(self)',
      
      // Interest cohort (FLoC) - disabled for privacy
      'interest-cohort=()'
    ]
    
    return policies.join(', ')
  }

  /**
   * Apply API-specific security headers
   */
  static applyApiHeaders(response: NextResponse): void {
    SecurityHeaders.apply(response)
    
    // Additional API-specific headers
    response.headers.set('Content-Type', 'application/json; charset=utf-8')
    response.headers.set('X-API-Version', '1.0')
    response.headers.set('X-Request-ID', crypto.randomUUID())
    
    // CORS headers for API
    response.headers.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://medverus.com')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-API-Key'
    )
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
    
    // API security headers
    response.headers.set('X-Medical-API', 'v1')
    response.headers.set('X-Compliance-Level', 'HIPAA')
  }

  /**
   * Apply file upload specific security headers
   */
  static applyFileUploadHeaders(response: NextResponse): void {
    SecurityHeaders.apply(response)
    
    // File upload specific headers
    response.headers.set('X-File-Upload-Security', 'enabled')
    response.headers.set('X-Virus-Scan-Required', 'true')
    response.headers.set('X-File-Type-Validation', 'strict')
    response.headers.set('X-Medical-Document-Processing', 'hipaa-compliant')
  }

  /**
   * Apply admin dashboard specific security headers
   */
  static applyAdminHeaders(response: NextResponse): void {
    SecurityHeaders.apply(response)
    
    // Enhanced security for admin areas
    response.headers.set('X-Admin-Access-Control', 'strict')
    response.headers.set('X-Privilege-Level', 'administrator')
    response.headers.set('X-Session-Security', 'enhanced')
    
    // Stricter CSP for admin areas
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
    )
  }

  /**
   * Validate and sanitize headers from client requests
   */
  static validateRequestHeaders(headers: Headers): { valid: boolean; violations: string[] } {
    const violations: string[] = []
    
    // Check for potentially dangerous headers
    const dangerousHeaders = [
      'x-forwarded-host',
      'x-forwarded-proto',
      'x-real-ip'
    ]
    
    dangerousHeaders.forEach(header => {
      if (headers.has(header)) {
        violations.push(`Dangerous header detected: ${header}`)
      }
    })
    
    // Validate User-Agent
    const userAgent = headers.get('user-agent')
    if (!userAgent || userAgent.length < 10) {
      violations.push('Invalid or missing User-Agent header')
    }
    
    // Check for SQL injection patterns in headers
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i
    ]
    
    headers.forEach((value, key) => {
      sqlPatterns.forEach(pattern => {
        if (pattern.test(value)) {
          violations.push(`Potential SQL injection in header ${key}`)
        }
      })
    })
    
    return {
      valid: violations.length === 0,
      violations
    }
  }

  /**
   * Generate nonce for CSP
   */
  static generateNonce(): string {
    return crypto.randomUUID().replace(/-/g, '')
  }
}