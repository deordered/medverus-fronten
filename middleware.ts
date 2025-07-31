// Enhanced security middleware with HIPAA compliance and medical data protection
// Handles authentication, authorization, rate limiting, audit logging, and compliance validation

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { RateLimiter } from '@/lib/security/rate-limiter'
import { SecurityHeaders } from '@/lib/security/headers'
import { AuditLogger } from '@/lib/security/audit-logger'
import { HIPAACompliance } from '@/lib/security/hipaa-compliance'

// Security components initialization
const rateLimiter = new RateLimiter()
const auditLogger = new AuditLogger()
const hipaaCompliance = new HIPAACompliance()

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/api/protected'
]

// Admin routes that require admin role
const ADMIN_ROUTES = [
  '/admin'
]

// API routes that require rate limiting
const API_ROUTES = [
  '/api/'
]

// Medical data routes requiring HIPAA compliance
const HIPAA_ROUTES = [
  '/dashboard/files',
  '/api/files',
  '/api/medical',
  '/api/query'
]

// Routes that should redirect authenticated users away
const authRoutes = [
  '/auth/login',
  '/auth/register', 
  '/login',
  '/register',
]

// Public routes that don't require any checks
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/features',
  '/pricing',
  '/api/health',
]

/**
 * Check if route matches any of the given patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => pathname.startsWith(route))
}

/**
 * Get token from request cookies or headers
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Fallback to localStorage (handled by client-side)
  // Note: We can't access localStorage in middleware, so we rely on client-side checks
  return null
}

/**
 * Check if token is expired (basic check)
 */
function isTokenExpired(token: string): boolean {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) return true

    // Decode payload (base64)
    const payload = JSON.parse(atob(parts[1]!))
    
    // Check expiration
    if (payload.exp) {
      const expirationTime = payload.exp * 1000 // Convert to milliseconds
      return Date.now() >= expirationTime
    }
    
    // If no expiration claim, consider it expired for safety
    return true
  } catch (error) {
    // If we can't decode the token, consider it invalid
    return true
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // Apply security headers to all responses
  SecurityHeaders.apply(response)
  
  // Get client information for security logging
  const clientInfo = {
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    pathname,
    method: request.method
  }

  try {
    // 1. Rate Limiting for API routes
    if (API_ROUTES.some(route => pathname.startsWith(route))) {
      const rateLimitResult = await rateLimiter.checkLimit(clientInfo.ip, pathname)
      
      if (rateLimitResult.blocked) {
        await auditLogger.log({
          event: 'RATE_LIMIT_EXCEEDED',
          severity: 'warning',
          details: {
            ip: clientInfo.ip,
            pathname,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining
          }
        })
        
        return new NextResponse(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter 
          }),
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': rateLimitResult.retryAfter.toString(),
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
            }
          }
        )
      }
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    }

    // 2. Authentication check for protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const token = request.cookies.get('medverus_token')?.value ||
                   request.headers.get('authorization')?.replace('Bearer ', '')

      if (!token) {
        await auditLogger.log({
          event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          severity: 'warning',
          details: {
            ...clientInfo,
            reason: 'No authentication token provided'
          }
        })
        
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }
        
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Verify JWT token
      try {
        const payload = await verifyJWT(token)
        
        // Add user info to request headers for downstream consumption
        response.headers.set('X-User-ID', payload.sub)
        response.headers.set('X-User-Email', payload.email)
        response.headers.set('X-User-Tier', payload.tier || 'free')
        
        // Check if user is active
        if (payload.status !== 'active') {
          await auditLogger.log({
            event: 'INACTIVE_USER_ACCESS_ATTEMPT',
            severity: 'warning',
            details: {
              ...clientInfo,
              userId: payload.sub,
              userStatus: payload.status
            }
          })
          
          if (pathname.startsWith('/api/')) {
            return new NextResponse(
              JSON.stringify({ error: 'Account suspended' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
          }
          
          return NextResponse.redirect(new URL('/login?suspended=true', request.url))
        }

        // 3. Admin role check for admin routes - FIXED for Google OAuth User type
        if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
          if (!payload.is_admin) {
            await auditLogger.log({
              event: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
              severity: 'high',
              details: {
                ...clientInfo,
                userId: payload.sub,
                isAdmin: payload.is_admin || false
              }
            })
            
            if (pathname.startsWith('/api/')) {
              return new NextResponse(
                JSON.stringify({ error: 'Admin access required' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
              )
            }
            
            return NextResponse.redirect(new URL('/dashboard', request.url))
          }
        }

        // Log successful authentication
        await auditLogger.log({
          event: 'AUTHENTICATED_ACCESS',
          severity: 'info',
          details: {
            ...clientInfo,
            userId: payload.sub,
            tier: payload.tier
          }
        })

      } catch (error) {
        await auditLogger.log({
          event: 'INVALID_TOKEN_ACCESS_ATTEMPT',
          severity: 'warning',
          details: {
            ...clientInfo,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        })
        
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid authentication token' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }
        
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // 4. HIPAA Compliance validation for medical data routes
    if (HIPAA_ROUTES.some(route => pathname.startsWith(route))) {
      const complianceCheck = await hipaaCompliance.validateRequest(request, clientInfo)
      
      if (!complianceCheck.compliant) {
        await auditLogger.log({
          event: 'HIPAA_COMPLIANCE_VIOLATION',
          severity: 'critical',
          details: {
            ...clientInfo,
            violations: complianceCheck.violations,
            reason: complianceCheck.reason
          }
        })
        
        return new NextResponse(
          JSON.stringify({ 
            error: 'HIPAA compliance violation',
            violations: complianceCheck.violations 
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Add HIPAA compliance headers
      response.headers.set('X-HIPAA-Compliant', 'true')
      response.headers.set('X-Audit-Required', 'true')
    }

    // Handle public routes
    if (matchesRoute(pathname, publicRoutes)) {
      return response
    }

    // Handle auth routes (login, register)
    if (matchesRoute(pathname, authRoutes)) {
      const token = getTokenFromRequest(request)
      // If user is already authenticated, redirect to dashboard
      if (token && !isTokenExpired(token)) {
        // Check if there's a return URL
        const returnUrl = request.nextUrl.searchParams.get('returnUrl')
        if (returnUrl && !matchesRoute(returnUrl, authRoutes)) {
          return NextResponse.redirect(new URL(returnUrl, request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return response

  } catch (error) {
    // Log middleware errors
    await auditLogger.log({
      event: 'MIDDLEWARE_ERROR',
      severity: 'critical',
      details: {
        ...clientInfo,
        error: error instanceof Error ? error.message : 'Unknown middleware error',
        stack: error instanceof Error ? error.stack : undefined
      }
    })

    // Return generic error to avoid information disclosure
    return new NextResponse(
      JSON.stringify({ error: 'Internal security error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}