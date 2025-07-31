// React Query hooks for API calls
// Provides type-safe data fetching with caching, optimistic updates, and error handling

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  QueryRequest,
  QueryResponse,
  BatchQueryRequest,
  BatchQueryResponse,
  UsageStats,
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
} from '@/types'
import { queryApi, userApi, fileApi, adminApi, healthApi, ApiError } from './client'

// Query Keys
export const queryKeys = {
  // User queries
  user: ['user'] as const,
  userProfile: () => [...queryKeys.user, 'profile'] as const,
  userUsage: () => [...queryKeys.user, 'usage'] as const,

  // Query queries
  queries: ['queries'] as const,
  querySources: () => [...queryKeys.queries, 'sources'] as const,
  queryLimits: () => [...queryKeys.queries, 'limits'] as const,

  // File queries
  files: ['files'] as const,
  filesList: (params?: PaginationParams) => [...queryKeys.files, 'list', params] as const,

  // Admin queries
  admin: ['admin'] as const,
  adminDashboard: () => [...queryKeys.admin, 'dashboard'] as const,
  adminUsers: (params?: PaginationParams) => [...queryKeys.admin, 'users', params] as const,
  adminVouchers: (params?: PaginationParams) => [...queryKeys.admin, 'vouchers', params] as const,
  adminAnalytics: (params?: any) => [...queryKeys.admin, 'analytics', params] as const,

  // Health queries
  health: ['health'] as const,
  healthBasic: () => [...queryKeys.health, 'basic'] as const,
  healthDetailed: () => [...queryKeys.health, 'detailed'] as const,
}

/**
 * User API Hooks
 */

// Get user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return false
      }
      return failureCount < 3
    },
  })
}

// Get user usage statistics
export const useUserUsage = () => {
  return useQuery({
    queryKey: queryKeys.userUsage(),
    queryFn: userApi.getUsage,
    staleTime: 1 * 60 * 1000, // 1 minute - usage should be fresh
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => userApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update the cached profile
      queryClient.setQueryData(queryKeys.userProfile(), updatedUser)
    },
    onError: (error) => {
      console.error('Failed to update profile:', error)
    },
  })
}

// Redeem voucher
export const useRedeemVoucher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: RedeemVoucherRequest) => userApi.redeemVoucher(request),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() })
      queryClient.invalidateQueries({ queryKey: queryKeys.userUsage() })
    },
  })
}

/**
 * Query API Hooks
 */

// Get query sources
export const useQuerySources = () => {
  return useQuery({
    queryKey: queryKeys.querySources(),
    queryFn: queryApi.getSources,
    staleTime: 10 * 60 * 1000, // 10 minutes - sources don't change often
  })
}

// Get query limits
export const useQueryLimits = () => {
  return useQuery({
    queryKey: queryKeys.queryLimits(),
    queryFn: queryApi.getLimits,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Process medical query
export const useProcessQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: QueryRequest) => queryApi.process(request),
    onSuccess: () => {
      // Invalidate usage data to reflect updated counts
      queryClient.invalidateQueries({ queryKey: queryKeys.userUsage() })
    },
  })
}

// Process batch queries
export const useProcessBatchQueries = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: BatchQueryRequest) => queryApi.batch(request),
    onSuccess: () => {
      // Invalidate usage data
      queryClient.invalidateQueries({ queryKey: queryKeys.userUsage() })
    },
  })
}

/**
 * File API Hooks
 */

// Get files list
export const useFilesList = (params?: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.filesList(params),
    queryFn: () => fileApi.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Upload file
export const useUploadFile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, description }: { file: File; description?: string }) =>
      fileApi.upload(file, description),
    onSuccess: () => {
      // Invalidate files list and user usage
      queryClient.invalidateQueries({ queryKey: queryKeys.files })
      queryClient.invalidateQueries({ queryKey: queryKeys.userUsage() })
    },
  })
}

// Delete file
export const useDeleteFile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fileApi.delete(id),
    onSuccess: () => {
      // Invalidate files list and user usage
      queryClient.invalidateQueries({ queryKey: queryKeys.files })
      queryClient.invalidateQueries({ queryKey: queryKeys.userUsage() })
    },
  })
}

/**
 * Admin API Hooks
 */

// Get admin dashboard
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.adminDashboard(),
    queryFn: adminApi.getDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

// Get admin users list
export const useAdminUsers = (params?: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => adminApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Update user (admin)
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      // Invalidate admin data
      queryClient.invalidateQueries({ queryKey: queryKeys.admin })
    },
  })
}

// Get admin vouchers list
export const useAdminVouchers = (params?: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.adminVouchers(params),
    queryFn: () => adminApi.getVouchers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create voucher
export const useCreateVoucher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateVoucherRequest) => adminApi.createVoucher(request),
    onSuccess: () => {
      // Invalidate vouchers list
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVouchers() })
    },
  })
}

// Create batch vouchers
export const useCreateBatchVouchers = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateBatchVouchersRequest) => adminApi.createBatchVouchers(request),
    onSuccess: () => {
      // Invalidate vouchers list
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVouchers() })
    },
  })
}

// Get admin analytics
export const useAdminAnalytics = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.adminAnalytics(params),
    queryFn: () => adminApi.getAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Health API Hooks
 */

// Basic health check
export const useHealthBasic = () => {
  return useQuery({
    queryKey: queryKeys.healthBasic(),
    queryFn: healthApi.basic,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: false, // Don't retry health checks
  })
}

// Detailed health check
export const useHealthDetailed = () => {
  return useQuery({
    queryKey: queryKeys.healthDetailed(),
    queryFn: healthApi.detailed,
    staleTime: 60 * 1000, // 1 minute
    retry: false,
  })
}

/**
 * Utility hooks for common patterns
 */

// Check if user is approaching limits
export const useUsageLimitsCheck = () => {
  const { data: usage } = useUserUsage()

  const checkLimits = (threshold = 0.8) => {
    if (!usage) return { approaching: false, exceeded: false, warnings: [] }

    const warnings: string[] = []
    let approaching = false
    let exceeded = false

    Object.entries(usage.usage_percentages).forEach(([source, data]) => {
      if ('percentage' in data) {
        const percent = data.percentage / 100
        if (percent >= 1) {
          exceeded = true
          warnings.push(`${source} limit exceeded`)
        } else if (percent >= threshold) {
          approaching = true
          warnings.push(`${source} approaching limit (${Math.round(percent * 100)}%)`)
        }
      }
    })

    return { approaching, exceeded, warnings }
  }

  return {
    usage,
    checkLimits,
    isApproachingLimits: checkLimits(0.8).approaching,
    hasExceededLimits: checkLimits(0.8).exceeded,
  }
}

// Optimistic updates for common operations
export const useOptimisticFileDelete = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fileApi.delete(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.files })

      // Snapshot previous value
      const previousFiles = queryClient.getQueryData(queryKeys.filesList())

      // Optimistically update
      queryClient.setQueryData(queryKeys.filesList(), (old: any) => {
        if (!old?.items) return old
        return {
          ...old,
          items: old.items.filter((file: UploadedFile) => file.id !== id),
          total: old.total - 1,
        }
      })

      return { previousFiles }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousFiles) {
        queryClient.setQueryData(queryKeys.filesList(), context.previousFiles)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.files })
    },
  })
}

/**
 * Additional Admin API Hooks (Placeholder implementations)
 * These hooks return safe default states until backend APIs are implemented
 */

// Admin statistics and metrics
export const useAdminStats = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'stats'],
    queryFn: async () => ({
      users: {
        total: 0,
        new_today: 0,
        active: 0,
        growth: 0
      },
      vouchers: {
        active: 0,
        redeemed: 0,
        used: 0,
        total: 0
      },
      queries: {
        today: 0,
        total: 0,
        avg_daily: 0,
        volume: 0,
        sources: { medverus_ai: 0, pubmed: 0, web: 0, files: 0 }
      },
      files: {
        today: 0,
        uploaded_today: 0,
        total_size: 0,
        total: 0
      },
      system: {
        uptime: '99.9%',
        memory_usage: 45,
        cpu_usage: 23
      },
      revenue: {
        monthly: 0,
        growth: 0,
        total: 0
      },
      alerts: [] as Array<{
        message: string
        severity: 'critical' | 'warning' | 'info'
        time: string
      }>
    }),
    staleTime: 5 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// Analytics data for admin dashboard
export const useAnalyticsData = (params?: any) => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'analytics-data', params],
    queryFn: async () => ({
      chartData: [],
      metrics: {},
      trends: {},
      timeRange: params?.timeRange || '7d'
    }),
    staleTime: 5 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// System health monitoring
export const useSystemHealth = () => {
  return useQuery({
    queryKey: [...queryKeys.health, 'system'],
    queryFn: async () => ({
      status: 'healthy' as const,
      uptime: '99.9%',
      services: {
        api: 'healthy',
        database: 'healthy',
        cache: 'healthy',
        search: 'healthy'
      },
      lastCheck: new Date().toISOString()
    }),
    staleTime: 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// Recent system activity
export const useRecentActivity = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'recent-activity'],
    queryFn: async () => ({
      activities: [],
      total: 0,
      lastUpdate: new Date().toISOString()
    }),
    staleTime: 2 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// Admin settings
export const useAdminSettings = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'settings'],
    queryFn: async () => ({
      maintenance: false,
      registrationEnabled: true,
      defaultTier: 'free',
      features: {
        newRegistrations: true,
        fileUploads: true,
        apiAccess: true
      }
    }),
    staleTime: 10 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// Update admin settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: any) => {
      // Placeholder - would call backend API
      return settings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.admin, 'settings'] })
    },
    onError: (error) => {
      console.error('Failed to update settings:', error)
    },
  })
}

// System metrics
export const useSystemMetrics = () => {
  return useQuery({
    queryKey: [...queryKeys.health, 'metrics'],
    queryFn: async () => ({
      cpu: { usage: 0, cores: 4 },
      memory: { used: 0, total: 8192, percentage: 0 },
      disk: { used: 0, total: 100000, percentage: 0 },
      network: { incoming: 0, outgoing: 0 },
      requests: { perSecond: 0, errors: 0 }
    }),
    staleTime: 30 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// System alerts
export const useSystemAlerts = () => {
  return useQuery({
    queryKey: [...queryKeys.health, 'alerts'],
    queryFn: async () => ({
      alerts: [],
      critical: 0,
      warnings: 0,
      info: 0
    }),
    staleTime: 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

/**
 * User Management Hooks (Placeholder implementations)
 */

// User list for admin (different from useAdminUsers which gets basic info)
export const useUserList = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'user-list', params],
    queryFn: async () => ({
      users: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 20
    }),
    staleTime: 5 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// User statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'user-stats'],
    queryFn: async () => ({
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      tierDistribution: { free: 0, pro: 0, enterprise: 0 },
      activityStats: { daily: 0, weekly: 0, monthly: 0 }
    }),
    staleTime: 5 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// Update user tier
export const useUpdateUserTier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) => {
      // Placeholder - would call backend API
      return { userId, tier, updated: new Date().toISOString() }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin })
    },
    onError: (error) => {
      console.error('Failed to update user tier:', error)
    },
  })
}

/**
 * Voucher Management Hooks (Placeholder implementations)
 */

// Voucher list (alias for useAdminVouchers for backward compatibility)
export const useVoucherList = useAdminVouchers

// Create vouchers (alias for useCreateBatchVouchers)
export const useCreateVouchers = useCreateBatchVouchers

// Voucher statistics
export const useVoucherStats = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'voucher-stats'],
    queryFn: async () => ({
      totalVouchers: 0,
      redeemedVouchers: 0,
      pendingVouchers: 0,
      expiredVouchers: 0,
      revenueFromVouchers: 0,
      redemptionRate: 0
    }),
    staleTime: 5 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

/**
 * Security and Compliance Hooks (Placeholder implementations)
 */

// Compliance report
export const useComplianceReport = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'compliance-report'],
    queryFn: async () => ({
      hipaaCompliance: { status: 'compliant', score: 100, issues: [] },
      dataProtection: { status: 'compliant', score: 100, issues: [] },
      accessControl: { status: 'compliant', score: 100, issues: [] },
      auditTrail: { status: 'compliant', score: 100, issues: [] },
      lastAssessment: new Date().toISOString()
    }),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: false, // Disabled until backend is ready
  })
}

// Audit trail
export const useAuditTrail = (params?: any) => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'audit-trail', params],
    queryFn: async () => ({
      events: [],
      total: 0,
      page: params?.page || 1,
      filters: params?.filters || {}
    }),
    staleTime: 2 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// Data retention policies
export const useDataRetention = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'data-retention'],
    queryFn: async () => ({
      policies: {
        userFiles: { retention: '7 years', autoDelete: false },
        auditLogs: { retention: '10 years', autoDelete: false },
        queryHistory: { retention: '1 year', autoDelete: true },
        personalData: { retention: 'indefinite', autoDelete: false }
      },
      compliance: 'hipaa',
      lastReview: new Date().toISOString()
    }),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: false, // Disabled until backend is ready
  })
}

// Security status monitoring
export const useSecurityStatus = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'security-status'],
    queryFn: async () => ({
      overallStatus: 'secure' as const,
      threats: { detected: 0, blocked: 0, resolved: 0 },
      vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
      lastScan: new Date().toISOString(),
      securityScore: 100
    }),
    staleTime: 5 * 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// Security alerts
export const useSecurityAlerts = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'security-alerts'],
    queryFn: async () => ({
      alerts: [],
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      acknowledged: 0
    }),
    staleTime: 60 * 1000,
    enabled: false, // Disabled until backend is ready
  })
}

// Compliance status
export const useComplianceStatus = () => {
  return useQuery({
    queryKey: [...queryKeys.admin, 'compliance-status'],
    queryFn: async () => ({
      hipaa: { compliant: true, score: 100 },
      gdpr: { compliant: true, score: 100 },
      sox: { compliant: true, score: 100 },
      overallScore: 100,
      lastAudit: new Date().toISOString(),
      nextAudit: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: false, // Disabled until backend is ready
  })
}