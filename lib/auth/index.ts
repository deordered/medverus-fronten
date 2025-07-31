// Authentication service for Medverus Frontend - Google OAuth 2.0 EXCLUSIVE
// Aligned with Backend API v7.0 - NO email/password authentication

import type { 
  AuthTokens, 
  User,
  GoogleAuthResponse
} from '@/types'
import { MEDICAL_API_ENDPOINTS } from '@/lib/constants/medical'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://medverus-backend.fly.dev'

// Token storage keys
const ACCESS_TOKEN_KEY = 'medverus_access_token'
const REFRESH_TOKEN_KEY = 'medverus_refresh_token'
const TOKEN_EXPIRY_KEY = 'medverus_token_expiry'
const USER_INFO_KEY = 'medverus_user_info'

/**
 * Google OAuth 2.0 Exclusive Authentication Service
 * Backend API v7.0 - 54 endpoints validated
 */
class AuthService {
  private refreshPromise: Promise<AuthTokens> | null = null

  /**
   * Store authentication tokens securely
   */
  private setTokens(tokenResponse: {
    access_token: string
    refresh_token?: string
    token_type: string
    expires_in: number
    user_info?: any
  }): void {
    // Store access token
    localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token)
    
    // Store refresh token if provided
    if (tokenResponse.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token)
    }
    
    // Calculate and store expiry time
    const expiryTime = Date.now() + (tokenResponse.expires_in * 1000)
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    
    // Store user info if provided
    if (tokenResponse.user_info) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(tokenResponse.user_info))
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Get stored user info
   */
  getUserInfo(): any | null {
    const userInfo = localStorage.getItem(USER_INFO_KEY)
    return userInfo ? JSON.parse(userInfo) : null
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiryTime) return true
    
    // Add 60 second buffer for token refresh
    return Date.now() >= (parseInt(expiryTime) - 60000)
  }

  /**
   * Clear stored authentication data
   */
  clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = this.getAccessToken()

    // Refresh token if expired
    if (!token || this.isTokenExpired()) {
      try {
        const newTokens = await this.refreshToken()
        token = newTokens.access_token
      } catch (error) {
        // If refresh fails, clear auth and throw error
        this.clearAuth()
        throw new Error('Authentication failed. Please log in again.')
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    // Handle 401 unauthorized responses
    if (response.status === 401) {
      this.clearAuth()
      throw new Error('Authentication failed. Please log in again.')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get Google OAuth authorization URL from backend
   * Backend handles OAuth configuration - /api/v1/auth/google/authorize
   */
  async getGoogleAuthUrl(): Promise<string> {
    return `${API_BASE_URL}${MEDICAL_API_ENDPOINTS.auth.googleAuthorize}`
  }

  /**
   * Handle Google OAuth verification
   * Exchange authorization code for access token via /api/v1/auth/google/verify
   */
  async verifyGoogleAuth(authData: any): Promise<GoogleAuthResponse> {
    const response = await fetch(`${API_BASE_URL}${MEDICAL_API_ENDPOINTS.auth.googleVerify}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || errorData.detail || 'Google authentication failed')
    }

    const data: GoogleAuthResponse = await response.json()
    
    // Store tokens after successful Google authentication
    this.setTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      user_info: data.user_info,
    })

    return data
  }

  /**
   * Refresh access token using refresh token
   * Backend endpoint: /api/v1/auth/refresh
   */
  async refreshToken(): Promise<AuthTokens> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this._performTokenRefresh()
    
    try {
      const tokens = await this.refreshPromise
      return tokens
    } finally {
      this.refreshPromise = null
    }
  }

  private async _performTokenRefresh(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${API_BASE_URL}${MEDICAL_API_ENDPOINTS.auth.refresh}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Token refresh failed')
    }

    const tokenResponse = await response.json()
    this.setTokens(tokenResponse)
    
    return {
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_type: tokenResponse.token_type,
      expires_in: tokenResponse.expires_in,
    }
  }

  /**
   * Logout user and clear authentication data
   * Backend endpoint: /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      // Attempt to notify backend of logout
      await this.makeAuthenticatedRequest(MEDICAL_API_ENDPOINTS.auth.logout, {
        method: 'POST',
      })
    } catch (error) {
      // Continue with logout even if backend call fails
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear local authentication data
      this.clearAuth()
    }
  }

  /**
   * Get current user profile
   * Backend endpoint: /api/v1/users/me
   */
  async getCurrentUser(): Promise<User> {
    return this.makeAuthenticatedRequest<User>('/api/v1/users/me')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return token !== null && !this.isTokenExpired()
  }

  /**
   * Get user tier from stored user info
   */
  getUserTier(): string {
    const userInfo = this.getUserInfo()
    return userInfo?.tier || 'free'
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const userInfo = this.getUserInfo()
    return userInfo?.is_admin === true
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export utilities for components
export const isAuthenticated = () => authService.isAuthenticated()
export const getAccessToken = () => authService.getAccessToken()
export const clearAuth = () => authService.clearAuth()
export const getUserTier = () => authService.getUserTier()
export const isAdmin = () => authService.isAdmin()

// Export types for convenience
export type { AuthTokens, User, GoogleAuthResponse }