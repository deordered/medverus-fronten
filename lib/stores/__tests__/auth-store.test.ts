// Auth store unit tests for medical AI platform
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../auth-store'
import { authService } from '@/lib/auth'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock as any

// Mock crypto.randomUUID using vi.stubGlobal
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'mock-uuid-123')
})

// Mock auth service using vi.mock factory - Google OAuth 2.0 EXCLUSIVE
vi.mock('@/lib/auth', () => ({
  authService: {
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    clearAuth: vi.fn(),
    getGoogleAuthUrl: vi.fn(),
    verifyGoogleAuth: vi.fn(),
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state - call logout to clear state
    useAuthStore.getState().setUser(null)
    useAuthStore.getState().setLoading(false)
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const state = useAuthStore.getState()
    
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should set loading state correctly', () => {
    const { setLoading } = useAuthStore.getState()
    
    setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    
    setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('should set user correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@medverus.com',
      display_name: 'Test User',
      google_id: 'google_123456',
      tier: 'pro' as const,
      is_admin: false,
      profile_picture: 'https://example.com/avatar.jpg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true,
      last_login: '2025-01-01T12:00:00Z',
      uploaded_files_count: 5,
      total_file_size: 1024000,
      daily_usage: {
        medverus_ai: 10,
        pubmed: 5,
        web_search: 15,
        file_upload: 2
      }
    }

    const { setUser } = useAuthStore.getState()
    setUser(mockUser)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should handle Google OAuth initiation', async () => {
    const mockRedirectUrl = 'https://accounts.google.com/oauth/v2/auth?...'
    
    vi.mocked(authService.getGoogleAuthUrl).mockResolvedValue(mockRedirectUrl)
    
    // Mock window.location
    const mockLocation = { href: '' }
    vi.stubGlobal('window', { location: mockLocation })

    const { loginWithGoogle } = useAuthStore.getState()
    
    await loginWithGoogle()
    
    expect(mockLocation.href).toBe(mockRedirectUrl)
    expect(vi.mocked(authService.getGoogleAuthUrl)).toHaveBeenCalled()
  })

  it('should handle Google OAuth initiation failure', async () => {
    vi.mocked(authService.getGoogleAuthUrl).mockRejectedValue(new Error('OAuth initiation failed'))

    const { loginWithGoogle } = useAuthStore.getState()
    
    await expect(loginWithGoogle()).rejects.toThrow('OAuth initiation failed')
    
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should handle logout correctly', async () => {
    // Set initial authenticated state
    const mockUser = {
      id: '1',
      email: 'test@medverus.com',
      display_name: 'Test User',
      google_id: 'google_123',
      tier: 'free' as const,
      is_admin: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true,
      last_login: '2025-01-01T12:00:00Z',
      uploaded_files_count: 0,
      total_file_size: 0,
      daily_usage: {
        medverus_ai: 5,
        pubmed: 0,
        web_search: 8,
        file_upload: 0
      }
    }
    
    useAuthStore.getState().setUser(mockUser)
    
    vi.mocked(authService).logout.mockResolvedValue(undefined)

    const { logout } = useAuthStore.getState()
    await logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    
    expect(vi.mocked(authService).logout).toHaveBeenCalled()
  })

  it('should handle logout with API failure gracefully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@medverus.com',
      display_name: 'Test User',
      google_id: 'google_123',
      tier: 'free' as const,
      is_admin: false,
      profile_picture: 'https://example.com/avatar.jpg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true,
      last_login: '2025-01-01T10:00:00Z',
      uploaded_files_count: 3,
      total_file_size: 512000,
      daily_usage: {
        medverus_ai: 8,
        pubmed: 2,
        web_search: 10,
        file_upload: 1
      }
    }
    
    useAuthStore.getState().setUser(mockUser)
    
    // Mock logout to fail
    vi.mocked(authService).logout.mockRejectedValue(new Error('Network error'))

    const { logout } = useAuthStore.getState()
    await logout() // Should not throw

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should refresh user profile when authenticated', async () => {
    const mockUser = {
      id: '1',
      email: 'updated@medverus.com',
      display_name: 'Updated User',
      google_id: 'google_123456',
      tier: 'pro' as const,
      is_admin: false,
      profile_picture: 'https://example.com/avatar.jpg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true,
      last_login: '2025-01-01T14:00:00Z',
      uploaded_files_count: 12,
      total_file_size: 2048000,
      daily_usage: {
        medverus_ai: 25,
        pubmed: 8,
        web_search: 30,
        file_upload: 5
      }
    }
    
    vi.mocked(authService).isAuthenticated.mockReturnValue(true)
    vi.mocked(authService).getCurrentUser.mockResolvedValue(mockUser)

    const { refreshUser } = useAuthStore.getState()
    await refreshUser()

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should clear user when not authenticated during refresh', async () => {
    // Set initial user
    useAuthStore.getState().setUser({
      id: '1',
      email: 'test@medverus.com',
      display_name: 'Test User',
      google_id: 'google_123',
      tier: 'free',
      is_admin: false,
      profile_picture: 'https://example.com/avatar.jpg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true,
      last_login: '2025-01-01T09:00:00Z',
      uploaded_files_count: 1,
      total_file_size: 128000,
      daily_usage: {
        medverus_ai: 3,
        pubmed: 1,
        web_search: 5,
        file_upload: 1
      }
    })
    
    vi.mocked(authService).isAuthenticated.mockReturnValue(false)

    const { refreshUser } = useAuthStore.getState()
    await refreshUser()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should handle Google OAuth verification successfully', async () => {
    const mockUser = {
      id: '3',
      email: 'google@medverus.com',
      display_name: 'Google User',
      google_id: 'google_789',
      tier: 'free' as const,
      is_admin: false,
      profile_picture: 'https://lh3.googleusercontent.com/a/default-user',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true,
      last_login: null,
      uploaded_files_count: 0,
      total_file_size: 0,
      daily_usage: {
        medverus_ai: 0,
        pubmed: 0,
        web_search: 0,
        file_upload: 0
      }
    }
    
    const mockAuthData = {
      code: 'auth-code',
      state: 'test-state'
    }
    
    vi.mocked(authService.verifyGoogleAuth).mockResolvedValue({
      user: mockUser,
      access_token: 'google-jwt-token',
      token_type: 'bearer',
      expires_in: 1800
    })

    const { handleGoogleVerification } = useAuthStore.getState()
    await handleGoogleVerification(mockAuthData)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
  })

  it('should handle Google OAuth verification failure', async () => {
    const mockAuthData = {
      code: 'auth-code',
      state: 'invalid-state'
    }
    
    vi.mocked(authService.verifyGoogleAuth).mockRejectedValue(new Error('Invalid state parameter'))

    const { handleGoogleVerification } = useAuthStore.getState()
    
    await expect(handleGoogleVerification(mockAuthData)).rejects.toThrow('Invalid state parameter')
    
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should initialize with valid authentication', async () => {
    const mockUser = {
      id: '1',
      email: 'existing@medverus.com',
      display_name: 'Existing User',
      google_id: 'google_existing_123',
      tier: 'pro' as const,
      is_admin: false,
      profile_picture: 'https://lh3.googleusercontent.com/a/existing-user',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true,
      last_login: '2024-12-31T18:00:00Z',
      uploaded_files_count: 7,
      total_file_size: 1536000,
      daily_usage: {
        medverus_ai: 18,
        pubmed: 6,
        web_search: 22,
        file_upload: 3
      }
    }
    
    vi.mocked(authService).isAuthenticated.mockReturnValue(true)
    vi.mocked(authService).getCurrentUser.mockResolvedValue(mockUser)

    const { initialize } = useAuthStore.getState()
    await initialize()

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
  })

  it('should initialize without authentication', async () => {
    vi.mocked(authService).isAuthenticated.mockReturnValue(false)

    const { initialize } = useAuthStore.getState()
    await initialize()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should handle initialization failure', async () => {
    vi.mocked(authService).isAuthenticated.mockReturnValue(true)
    vi.mocked(authService).getCurrentUser.mockRejectedValue(new Error('Network error'))
    vi.mocked(authService).clearAuth.mockImplementation(() => {})

    const { initialize } = useAuthStore.getState()
    await initialize()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(vi.mocked(authService).clearAuth).toHaveBeenCalled()
  })

  it('should check authentication status correctly', () => {
    vi.mocked(authService).isAuthenticated.mockReturnValue(true)

    const { checkAuth } = useAuthStore.getState()
    const isAuth = checkAuth()

    expect(isAuth).toBe(true)
    expect(vi.mocked(authService).isAuthenticated).toHaveBeenCalled()
  })

  it('should sync authentication state when out of sync', () => {
    // Set store as authenticated but service as not authenticated
    useAuthStore.getState().setUser({
      id: '1',
      email: 'test@medverus.com',
      display_name: 'Test User',
      google_id: 'google_123',
      tier: 'free',
      is_admin: false,
      profile_picture: 'https://example.com/avatar.jpg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true,
      last_login: '2025-01-01T11:00:00Z',
      uploaded_files_count: 2,
      total_file_size: 256000,
      daily_usage: {
        medverus_ai: 6,
        pubmed: 2,
        web_search: 9,
        file_upload: 1
      }
    })
    
    vi.mocked(authService).isAuthenticated.mockReturnValue(false)

    const { checkAuth } = useAuthStore.getState()
    checkAuth()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should handle Google login redirect', async () => {
    const mockRedirectUrl = 'https://accounts.google.com/oauth/v2/auth?client_id=...'
    
    vi.mocked(authService.getGoogleAuthUrl).mockResolvedValue(mockRedirectUrl)
    
    // Mock window.location
    const mockLocation = { href: '' }
    vi.stubGlobal('window', { location: mockLocation })
    
    const { loginWithGoogle } = useAuthStore.getState()
    
    await expect(loginWithGoogle()).resolves.not.toThrow()
    
    expect(mockLocation.href).toBe(mockRedirectUrl)
    expect(vi.mocked(authService.getGoogleAuthUrl)).toHaveBeenCalled()
  })
})