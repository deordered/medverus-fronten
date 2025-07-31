import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for combining class names with clsx and tailwind-merge
 * Provides optimal class name handling for medical UI components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format bytes to human readable format
 * Useful for displaying file sizes in medical document uploads
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format medical query processing time
 * Displays milliseconds in a user-friendly format
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  } else {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.round((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}

/**
 * Format percentage for medical usage displays
 * Ensures consistent percentage formatting across the medical app
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate usage percentage for medical tier limits
 * Returns percentage with safety bounds (0-100)
 */
export function calculateUsagePercentage(used: number, limit: number): number {
  if (limit <= 0) return 0
  const percentage = (used / limit) * 100
  return Math.min(Math.max(percentage, 0), 100)
}

/**
 * Format date for medical records
 * Provides consistent date formatting for medical data
 */
export function formatMedicalDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  }
  
  return dateObj.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format medical citation in Vancouver style
 * Ensures proper medical citation formatting
 */
export function formatMedicalCitation(citation: string): string {
  // Basic Vancouver style formatting
  // This is a simplified version - real implementation would be more comprehensive
  return citation.trim().replace(/\s+/g, ' ')
}

/**
 * Truncate text for medical content display
 * Safely truncates long medical content with ellipsis
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Validate email address for medical professional accounts
 * Enhanced email validation for healthcare context
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * Validate medical password strength
 * Ensures strong passwords for medical data security
 */
export function validateMedicalPassword(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score += 1
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else {
    score += 1
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 4) strength = 'strong'
  else if (score >= 3) strength = 'medium'

  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Sanitize medical query input
 * Removes potentially harmful content from medical queries
 */
export function sanitizeMedicalQuery(query: string): string {
  // Remove HTML tags
  const withoutHtml = query.replace(/<[^>]*>/g, '')
  
  // Remove excessive whitespace
  const trimmed = withoutHtml.replace(/\s+/g, ' ').trim()
  
  // Limit length for security
  const maxLength = 2000
  return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed
}

/**
 * Get medical tier display information
 * Returns display properties for user tiers
 */
export function getMedicalTierInfo(tier: 'free' | 'pro' | 'enterprise') {
  const tierInfo = {
    free: {
      label: 'Free',
      color: 'bg-gray-100 text-gray-800',
      badge: 'secondary',
      description: 'Basic access for trying the platform'
    },
    pro: {
      label: 'Pro',
      color: 'bg-blue-100 text-blue-800',
      badge: 'default',
      description: 'Enhanced access for active professionals'
    },
    enterprise: {
      label: 'Enterprise',
      color: 'bg-purple-100 text-purple-800',
      badge: 'destructive',
      description: 'Full access for medical institutions'
    }
  }
  
  return tierInfo[tier]
}

/**
 * Get medical source configuration
 * Returns configuration for content sources
 */
export function getMedicalSourceConfig(source: 'medverus_ai' | 'pubmed' | 'web_search' | 'file_upload') {
  const sourceConfig = {
    medverus_ai: {
      label: 'Medverus AI',
      description: 'Admin-curated medical documents and clinical guidelines',
      icon: '🧠',
      color: 'bg-blue-500',
      textColor: 'text-blue-700'
    },
    pubmed: {
      label: 'PubMed',
      description: 'Real-time biomedical literature from NCBI',
      icon: '📚',
      color: 'bg-green-500',
      textColor: 'text-green-700'
    },
    web_search: {
      label: 'Medical Web Search',
      description: 'Trusted medical websites and resources',
      icon: '🌐',
      color: 'bg-purple-500',
      textColor: 'text-purple-700'
    },
    file_upload: {
      label: 'Your Documents',
      description: 'Search your uploaded private documents',
      icon: '📄',
      color: 'bg-orange-500',
      textColor: 'text-orange-700'
    }
  }
  
  return sourceConfig[source]
}

/**
 * Generate medical query ID
 * Creates unique identifiers for medical queries
 */
export function generateMedicalQueryId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `query_${timestamp}_${randomPart}`
}

/**
 * Check if medical usage is approaching limit
 * Returns warning level for usage monitoring
 */
export function getMedicalUsageWarningLevel(used: number, limit: number): 'safe' | 'warning' | 'critical' | 'exceeded' {
  const percentage = calculateUsagePercentage(used, limit)
  
  if (percentage >= 100) return 'exceeded'
  if (percentage >= 90) return 'critical'
  if (percentage >= 75) return 'warning'
  return 'safe'
}

/**
 * Format medical file type for display
 * Returns user-friendly file type names
 */
export function formatMedicalFileType(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF Document',
    'text/plain': 'Text File',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'text/csv': 'CSV File',
    'application/json': 'JSON File',
    'text/html': 'HTML File',
    'text/markdown': 'Markdown File'
  }
  
  return typeMap[mimeType] || 'Unknown File Type'
}

/**
 * Sleep utility for medical data processing delays
 * Useful for managing API rate limits and user experience
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce function for medical search inputs
 * Prevents excessive API calls during user typing
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func.apply(this, args)
    }
    
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generate medical disclaimer text
 * Returns standardized medical disclaimer
 */
export function getMedicalDisclaimer(): string {
  return "This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions."
}

/**
 * Check if current environment is medical production
 * Useful for conditional logic in medical applications
 */
export function isMedicalProduction(): boolean {
  return process.env.NODE_ENV === 'production' && 
         process.env.NEXT_PUBLIC_APP_ENV === 'production'
}

/**
 * Format medical relevance score
 * Displays relevance scores in medical context
 */
export function formatMedicalRelevanceScore(score: number): string {
  const percentage = Math.round(score * 100)
  return `${percentage}% match`
}

/**
 * Get medical status color class
 * Returns appropriate Tailwind classes for medical status indicators
 */
export function getMedicalStatusColor(status: 'active' | 'inactive' | 'pending' | 'processing' | 'error'): string {
  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  }
  
  return statusColors[status] || statusColors.inactive
}