import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api'
process.env.JWT_SECRET_KEY = 'test-secret-key'
process.env.HIPAA_COMPLIANCE_MODE = 'true'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock crypto.randomUUID
Object.defineProperty(global.crypto, 'randomUUID', {
  value: vi.fn(() => 'mock-uuid-123'),
})

// Mock localStorage and sessionStorage
const storageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: storageMock,
})

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: storageMock,
})

Object.defineProperty(global, 'localStorage', {
  writable: true,
  value: storageMock,
})

Object.defineProperty(global, 'sessionStorage', {
  writable: true,
  value: storageMock,
})

// Mock fetch globally
global.fetch = vi.fn()

// Mock Performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  now: vi.fn(() => 1000),
}

Object.defineProperty(global, 'performance', {
  writable: true,
  value: mockPerformance,
})

Object.defineProperty(window, 'performance', {
  writable: true,
  value: mockPerformance,
})

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})