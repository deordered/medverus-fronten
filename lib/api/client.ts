// API client for Medverus Frontend
// Type-safe HTTP client with authentication, error handling, and medical-specific features

import type {
  QueryRequest,
  QueryResponse,
  BatchQueryRequest,
  BatchQueryResponse,
  UsageStats,
  FileUploadRequest,
  FileUploadResponse,
  UploadedFile,
  User,
  AdminDashboard,
  AdminUser,
  Voucher,
  CreateVoucherRequest,
  CreateBatchVouchersRequest,
  BatchVouchersResponse,
  RedeemVoucherRequest,
  RedeemVoucherResponse,
  HealthStatus,
  PaginatedResponse,
  PaginationParams,
  APIError,
} from '@/types'
import { authService } from '@/lib/auth'
import { MEDICAL_API_ENDPOINTS } from '@/lib/constants/medical'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
  public status: number
  public code?: string
  public timestamp: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.timestamp = new Date().toISOString()
  }
}

/**
 * HTTP Client class with authentication and error handling
 */
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      return await authService.makeAuthenticatedRequest<T>(endpoint, options)
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(error.message, 500)
      }
      throw new ApiError('Unknown error occurred', 500)
    }
  }

  /**
   * Make public request (no authentication required)
   */
  async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.detail || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.code
      )
    }

    return response.json()
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return this.request<T>(url.pathname + url.search)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // Public methods (no auth required)
  async publicGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return this.publicRequest<T>(url.pathname + url.search)
  }

  // File upload method
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const token = authService.getAccessToken()
      if (!token) {
        throw new Error('Authentication required for file upload')
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.detail || `Upload failed: ${response.status}`,
          response.status,
          errorData.code
        )
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('File upload failed', 500)
    }
  }
}

// Create HTTP client instance
const httpClient = new HttpClient(API_BASE_URL)

/**
 * Authentication API endpoints - Google OAuth 2.0 EXCLUSIVE
 */
export const authApi = {
  /**
   * Get Google OAuth authorization URL
   */
  getGoogleAuthUrl: (): Promise<string> => {
    // Direct redirect to Google OAuth flow
    return Promise.resolve(`${API_BASE_URL}${MEDICAL_API_ENDPOINTS.auth.googleAuthorize}`)
  },

  /**
   * Verify Google OAuth callback
   */
  verifyGoogleAuth: (authData: any): Promise<any> =>
    httpClient.publicRequest(MEDICAL_API_ENDPOINTS.auth.googleVerify, {
      method: 'POST',
      body: JSON.stringify(authData)
    }),

  /**
   * Refresh access token
   */
  refreshToken: (refreshToken: string): Promise<any> =>
    httpClient.publicRequest(MEDICAL_API_ENDPOINTS.auth.refresh, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken })
    }),

  /**
   * Logout and invalidate session
   */
  logout: (): Promise<{ message: string }> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.auth.logout)
}

/**
 * Medical Query API endpoints
 */
export const queryApi = {
  /**
   * Process a medical query
   */
  process: (request: QueryRequest): Promise<QueryResponse> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.queries.process, request),

  /**
   * Process multiple queries in batch
   */
  batch: (request: BatchQueryRequest): Promise<BatchQueryResponse> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.queries.batch, request),

  /**
   * Get available content sources
   */
  getSources: (): Promise<any> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.queries.sources),

  /**
   * Get query limits for current user
   */
  getLimits: (): Promise<any> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.queries.limits),
}

/**
 * User management API endpoints
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: (): Promise<User> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.users.profile),

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<User>): Promise<User> =>
    httpClient.patch(MEDICAL_API_ENDPOINTS.users.updateProfile, data),

  /**
   * Get user usage statistics
   */
  getUsage: (): Promise<UsageStats> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.users.usage),

  /**
   * Delete user account
   */
  deleteAccount: (): Promise<{ message: string }> =>
    httpClient.delete(MEDICAL_API_ENDPOINTS.users.deleteAccount),

  /**
   * Redeem voucher code
   */
  redeemVoucher: (request: RedeemVoucherRequest): Promise<RedeemVoucherResponse> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.users.redeemVoucher, request),

  /**
   * Get user's persistent prompt
   */
  getUserPrompt: (): Promise<{ user_prompt: string; updated_at: string }> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.users.getPrompt),

  /**
   * Set/update user's persistent prompt
   */
  setUserPrompt: (prompt: string): Promise<{ user_prompt: string; updated_at: string }> =>
    httpClient.put(MEDICAL_API_ENDPOINTS.users.setPrompt, { user_prompt: prompt }),

  /**
   * Delete user's persistent prompt
   */
  deleteUserPrompt: (): Promise<{ message: string }> =>
    httpClient.delete(MEDICAL_API_ENDPOINTS.users.deletePrompt),
}

/**
 * File management API endpoints
 */
export const fileApi = {
  /**
   * Upload a file
   */
  upload: (file: File, description?: string): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }
    
    return httpClient.uploadFile(MEDICAL_API_ENDPOINTS.files.upload, formData)
  },

  /**
   * Get uploaded files list
   */
  list: (params?: PaginationParams): Promise<PaginatedResponse<UploadedFile>> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.files.list, params),

  /**
   * Delete a file
   */
  delete: (id: string): Promise<{ message: string }> =>
    httpClient.delete(MEDICAL_API_ENDPOINTS.files.delete.replace('{id}', id)),

  /**
   * Download a file
   */
  download: (id: string): Promise<Blob> => {
    const endpoint = MEDICAL_API_ENDPOINTS.files.download.replace('{id}', id)
    return httpClient.request(endpoint, {
      headers: {
        'Accept': 'application/octet-stream',
      },
    })
  },
}

/**
 * Admin API endpoints - Complete 22-endpoint implementation
 */
export const adminApi = {
  /**
   * Get admin dashboard data
   */
  getDashboard: (): Promise<AdminDashboard> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.dashboard),

  /**
   * Get users list
   */
  getUsers: (params?: PaginationParams & { tier?: string; is_active?: boolean }): Promise<PaginatedResponse<AdminUser>> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.users, params),

  /**
   * Get specific user details
   */
  getUser: (userId: string): Promise<AdminUser> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.getUser.replace('{user_id}', userId)),

  /**
   * Update user
   */
  updateUser: (userId: string, data: { tier?: string; is_active?: boolean; is_admin?: boolean }): Promise<AdminUser> =>
    httpClient.put(MEDICAL_API_ENDPOINTS.admin.updateUser.replace('{user_id}', userId), data),

  /**
   * Get analytics data
   */
  getAnalytics: (params?: { period?: 'daily' | 'weekly' | 'monthly' | 'yearly' }): Promise<any> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.analytics, params),

  /**
   * Get content source metrics
   */
  getContentMetrics: (): Promise<any> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.contentMetrics),

  /**
   * Upload global content to Medverus AI source
   */
  uploadGlobalContent: (content: { title: string; content_type: string; content: string; metadata?: any }): Promise<any> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.admin.uploadGlobalContent, content),

  // Voucher Management (7 endpoints)
  /**
   * Get vouchers list
   */
  getVouchers: (params?: PaginationParams & { status?: string; tier?: string }): Promise<PaginatedResponse<Voucher>> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.vouchers, params),

  /**
   * Get specific voucher details
   */
  getVoucher: (voucherCode: string): Promise<Voucher> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.getVoucher.replace('{voucher_code}', voucherCode)),

  /**
   * Create single voucher
   */
  createVoucher: (request: CreateVoucherRequest): Promise<Voucher> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.admin.createVoucher, request),

  /**
   * Create batch vouchers
   */
  createBatchVouchers: (request: CreateBatchVouchersRequest): Promise<BatchVouchersResponse> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.admin.createBatchVouchers, request),

  /**
   * Get voucher statistics
   */
  getVoucherStats: (): Promise<any> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.voucherStats),

  /**
   * Clean up expired vouchers
   */
  cleanupVouchers: (): Promise<{ message: string; cleaned_count: number }> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.admin.cleanupVouchers),

  /**
   * Generate printable voucher format
   */
  generatePrintableVouchers: (request: CreateBatchVouchersRequest): Promise<any> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.admin.printableVouchers, request),

  // System Prompt Management (8 endpoints)
  /**
   * List all system prompts
   */
  getSystemPrompts: (params?: { prompt_type?: string; is_active?: boolean; limit?: number; offset?: number }): Promise<PaginatedResponse<any>> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.systemPrompts, params),

  /**
   * Get specific system prompt
   */
  getSystemPrompt: (promptId: string): Promise<any> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.getSystemPrompt.replace('{prompt_id}', promptId)),

  /**
   * Create new system prompt
   */
  createSystemPrompt: (prompt: { name: string; description: string; prompt_type: string; prompt_content: string; is_active?: boolean; is_default?: boolean }): Promise<any> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.admin.createSystemPrompt, prompt),

  /**
   * Update system prompt
   */
  updateSystemPrompt: (promptId: string, prompt: Partial<any>): Promise<any> =>
    httpClient.put(MEDICAL_API_ENDPOINTS.admin.updateSystemPrompt.replace('{prompt_id}', promptId), prompt),

  /**
   * Delete system prompt
   */
  deleteSystemPrompt: (promptId: string): Promise<{ message: string }> =>
    httpClient.delete(MEDICAL_API_ENDPOINTS.admin.deleteSystemPrompt.replace('{prompt_id}', promptId)),

  /**
   * Get currently active system prompt
   */
  getActiveSystemPrompt: (): Promise<any> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.getActivePrompt),

  /**
   * Activate specific system prompt
   */
  activateSystemPrompt: (promptId: string): Promise<{ message: string }> =>
    httpClient.post(MEDICAL_API_ENDPOINTS.admin.activatePrompt.replace('{prompt_id}', promptId)),

  /**
   * Get system health for admin monitoring
   */
  getSystemHealth: (): Promise<any> =>
    httpClient.get(MEDICAL_API_ENDPOINTS.admin.systemHealth),
}

/**
 * Health check API endpoints - Complete 9-endpoint monitoring
 */
export const healthApi = {
  /**
   * Basic health check
   */
  basic: (): Promise<{ status: string; service: string; version: string }> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.basic),

  /**
   * Detailed health check with all service statuses
   */
  detailed: (): Promise<any> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.detailed),

  /**
   * Kubernetes-style readiness probe
   */
  ready: (): Promise<{ status: string; checks: any }> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.ready),

  /**
   * Kubernetes-style liveness probe
   */
  live: (): Promise<{ status: string; service: string }> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.live),

  /**
   * Circuit breaker status monitoring
   */
  getCircuitBreakers: (): Promise<any> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.circuitBreakers),

  /**
   * Redis cache status and performance metrics
   */
  getCacheStatus: (): Promise<any> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.cache),

  /**
   * MongoDB database status and connection pool monitoring
   */
  getDatabaseStatus: (): Promise<any> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.database),

  /**
   * Gzip compression status and configuration
   */
  getCompressionStatus: (): Promise<any> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.compression),

  /**
   * Compression demonstration with large JSON response
   */
  testCompression: (): Promise<any> =>
    httpClient.publicGet(MEDICAL_API_ENDPOINTS.health.compressionTest),
}

// Export the HTTP client for custom requests
export { httpClient }