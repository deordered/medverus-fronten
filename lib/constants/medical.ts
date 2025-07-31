// Medical application constants and configurations

import type { TierLimits, SourceConfig, ContentSource, UserTier } from '@/types'

/**
 * Medical tier limits configuration - ALIGNED WITH ARCHITECTURE.MD
 * Defines daily usage limits for each user tier and content source
 */
export const MEDICAL_TIER_LIMITS: TierLimits = {
  free: {
    medverus_ai: 10,
    pubmed: 10,        // Fixed from 5 to 10 per architecture.md
    web_search: 10,    // Fixed from 5 to 10 per architecture.md
    file_upload: {
      count: 1,        // Fixed from 0 to 1 per architecture.md
      size_mb: 5       // Fixed from 0 to 5 per architecture.md
    }
  },
  pro: {
    medverus_ai: 100,
    pubmed: 20,
    web_search: 100,   // Fixed from 30 to 100 per architecture.md
    file_upload: {
      count: 10,
      size_mb: 10
    }
  },
  enterprise: {
    medverus_ai: 250,
    pubmed: 50,
    web_search: 250,   // Fixed from 100 to 250 per architecture.md
    file_upload: {
      count: 25,       // Fixed from 50 to 25 per architecture.md
      size_mb: 20
    }
  }
}

/**
 * Content source configurations
 * Defines properties and metadata for each medical content source
 */
export const MEDICAL_SOURCE_CONFIG: Record<ContentSource, SourceConfig> = {
  medverus_ai: {
    id: 'medverus_ai',
    name: 'Medverus AI',
    description: 'Admin-curated medical documents and clinical guidelines',
    icon: '🧠',
    color: 'bg-blue-500',
    type: 'global'
  },
  pubmed: {
    id: 'pubmed',
    name: 'PubMed',
    description: 'Real-time biomedical literature from NCBI',
    icon: '📚',
    color: 'bg-green-500',
    type: 'api'
  },
  web_search: {
    id: 'web_search',
    name: 'Medical Web Search',
    description: 'Trusted medical websites and resources',
    icon: '🌐',
    color: 'bg-purple-500',
    type: 'search'
  },
  file_upload: {
    id: 'file_upload',
    name: 'Your Documents',
    description: 'Search your uploaded private documents',
    icon: '📄',
    color: 'bg-orange-500',
    type: 'private'
  }
}

/**
 * Medical file type configurations - ALIGNED WITH ARCHITECTURE.MD
 * Supported file types: PDF, DOCX, PPTX only (as per architectural specification)
 */
export const MEDICAL_FILE_TYPES = {
  'application/pdf': {
    label: 'PDF Document',
    extension: '.pdf',
    maxSize: 20 * 1024 * 1024, // 20MB
    icon: '📄',
    description: 'Portable Document Format for medical documents'
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    label: 'Word Document (DOCX)',
    extension: '.docx',
    maxSize: 20 * 1024 * 1024, // 20MB
    icon: '📄',
    description: 'Microsoft Word document format'
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    label: 'PowerPoint Presentation (PPTX)',
    extension: '.pptx',
    maxSize: 20 * 1024 * 1024, // 20MB
    icon: '📊',
    description: 'Microsoft PowerPoint presentation format'
  }
} as const

/**
 * Medical query validation rules
 * Defines validation constraints for medical queries
 */
export const MEDICAL_QUERY_VALIDATION = {
  minLength: 5,
  maxLength: 2000,
  maxResults: {
    min: 1,
    max: 20,
    default: 5
  },
  userPrompt: {
    maxLength: 800  // ALIGNED WITH ARCHITECTURE.MD: 800 characters (2-3 paragraphs)
  }
} as const

/**
 * Medical API endpoints configuration - ALIGNED WITH BACKEND API v7.0
 * Centralized endpoint definitions for the medical backend
 */
export const MEDICAL_API_ENDPOINTS = {
  // Authentication endpoints - Google OAuth 2.0 EXCLUSIVE
  auth: {
    googleAuthorize: '/api/v1/auth/google/authorize',
    googleVerify: '/api/v1/auth/google/verify',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout'
  },
  
  // User management endpoints
  users: {
    profile: '/api/v1/users/me',
    usage: '/api/v1/users/usage',
    updateProfile: '/api/v1/users/me',
    deleteAccount: '/api/v1/users/me',
    redeemVoucher: '/api/v1/users/vouchers/redeem',
    // Persistent user prompt endpoints
    getPrompt: '/api/v1/users/me/prompt',
    setPrompt: '/api/v1/users/me/prompt',
    deletePrompt: '/api/v1/users/me/prompt'
  },
  
  // Query processing endpoints
  queries: {
    process: '/api/v1/query/',
    batch: '/api/v1/query/batch',
    sources: '/api/v1/query/sources',
    limits: '/api/v1/query/limits'
  },
  
  // File management endpoints
  files: {
    upload: '/api/v1/files/upload',
    list: '/api/v1/files',
    delete: '/api/v1/files/{id}',
    download: '/api/v1/files/{id}/download'
  },
  
  // Admin endpoints - Complete 22-endpoint implementation
  admin: {
    dashboard: '/api/v1/admin/dashboard',
    users: '/api/v1/admin/users',
    getUser: '/api/v1/admin/users/{user_id}',
    updateUser: '/api/v1/admin/users/{user_id}',
    analytics: '/api/v1/admin/analytics',
    contentMetrics: '/api/v1/admin/content/metrics',
    uploadGlobalContent: '/api/v1/admin/content/global',
    // Voucher management (7 endpoints)
    vouchers: '/api/v1/admin/vouchers',
    getVoucher: '/api/v1/admin/vouchers/{voucher_code}',
    createVoucher: '/api/v1/admin/vouchers',
    createBatchVouchers: '/api/v1/admin/vouchers/batch',
    voucherStats: '/api/v1/admin/vouchers/stats',
    cleanupVouchers: '/api/v1/admin/vouchers/cleanup',
    printableVouchers: '/api/v1/admin/vouchers/batch/printable',
    // System prompt management (8 endpoints)
    systemPrompts: '/api/v1/admin/system-prompts',
    getSystemPrompt: '/api/v1/admin/system-prompts/{prompt_id}',
    createSystemPrompt: '/api/v1/admin/system-prompts',
    updateSystemPrompt: '/api/v1/admin/system-prompts/{prompt_id}',
    deleteSystemPrompt: '/api/v1/admin/system-prompts/{prompt_id}',
    getActivePrompt: '/api/v1/admin/system-prompts/active/current',
    activatePrompt: '/api/v1/admin/system-prompts/{prompt_id}/activate',
    systemHealth: '/api/v1/admin/health/system'
  },
  
  // Health check endpoints - Complete 9-endpoint monitoring
  health: {
    basic: '/api/v1/health/',
    detailed: '/api/v1/health/detailed',
    ready: '/api/v1/health/ready',
    live: '/api/v1/health/live',
    circuitBreakers: '/api/v1/health/circuit-breakers',
    cache: '/api/v1/health/cache',
    database: '/api/v1/health/database',
    compression: '/api/v1/health/compression',
    compressionTest: '/api/v1/health/compression-test'
  }
} as const

/**
 * Medical tier pricing information
 * Defines pricing and features for each user tier
 */
export const MEDICAL_TIER_PRICING = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'USD',
    billing: 'month',
    features: [
      '10 queries per day per source',
      '1 file upload per day (5MB)',
      'Basic medical safety features',
      'Community support',
      'Medical disclaimers'
    ],
    popular: false,
    description: 'Perfect for trying out the platform'
  },
  pro: {
    name: 'Pro',
    price: 29,
    currency: 'USD',
    billing: 'month',
    features: [
      '100 Medverus AI queries/day',
      '20 PubMed queries/day',
      '100 Web search queries/day',
      '10 file uploads/day (10MB each)',
      'Priority support',
      'Advanced medical safety features',
      'Usage analytics'
    ],
    popular: true,
    description: 'For active healthcare professionals'
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    billing: 'month',
    features: [
      '250 Medverus AI queries/day',
      '50 PubMed queries/day',
      '250 Web search queries/day',
      '25 file uploads/day (20MB each)',
      'Dedicated support',
      'Enterprise security & compliance',
      'Custom integrations',
      'Advanced analytics',
      'Team management'
    ],
    popular: false,
    description: 'For medical institutions and teams'
  }
} as const

/**
 * Medical safety and compliance constants
 * Important disclaimers and safety information
 */
export const MEDICAL_SAFETY = {
  disclaimer: {
    short: 'This information is for educational purposes only and should not replace professional medical advice.',
    full: 'This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions. The content provided through this platform is not intended to diagnose, treat, cure, or prevent any disease.',
    legal: 'This platform is designed for use by healthcare professionals and medical students for educational and informational purposes only. It is not intended to provide medical advice, diagnosis, or treatment recommendations.'
  },
  
  warnings: {
    notMedicalAdvice: 'This platform does not provide medical advice',
    consultProfessional: 'Always consult with qualified healthcare providers',
    educationalOnly: 'Content is for educational purposes only',
    noTreatmentRecommendations: 'Platform does not recommend treatments',
    professionalUseOnly: 'Designed for healthcare professionals'
  },
  
  compliance: {
    hipaa: {
      statement: 'This platform implements HIPAA-compliant security measures for protected health information.',
      notice: 'Users are responsible for ensuring their use complies with applicable privacy regulations.'
    },
    gdpr: {
      statement: 'This platform complies with GDPR requirements for data protection and user privacy.',
      rights: 'Users have rights to access, modify, and delete their personal data.'
    }
  }
} as const

/**
 * Medical UI theme constants
 * Color schemes and styling for medical interface
 */
export const MEDICAL_UI_THEME = {
  colors: {
    primary: {
      medical: '#2563eb', // Medical blue
      success: '#16a34a', // Medical green
      warning: '#eab308', // Medical yellow
      danger: '#dc2626', // Medical red
      neutral: '#6b7280' // Medical gray
    },
    
    status: {
      active: '#16a34a',
      inactive: '#dc2626',
      pending: '#eab308',
      processing: '#2563eb'
    },
    
    tier: {
      free: '#6b7280',
      pro: '#2563eb',
      enterprise: '#7c3aed'
    },
    
    source: {
      medverus_ai: '#2563eb',
      pubmed: '#16a34a',
      web_search: '#7c3aed',
      file_upload: '#ea580c'
    }
  },
  
  spacing: {
    medical: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem'
    }
  },
  
  typography: {
    medical: {
      caption: 'text-xs font-medium',
      body: 'text-sm',
      label: 'text-sm font-semibold',
      heading: 'text-lg font-semibold'
    }
  }
} as const

/**
 * Medical application routes
 * Centralized route definitions for navigation
 */
export const MEDICAL_ROUTES = {
  // Public routes
  public: {
    home: '/',
    login: '/login',
    register: '/register',
    features: '/features',
    pricing: '/pricing',
    about: '/about',
    contact: '/contact',
    privacy: '/privacy'
  },
  
  // Protected routes
  protected: {
    dashboard: '/dashboard',
    query: '/dashboard/query',
    usage: '/dashboard/usage',
    files: '/dashboard/files',
    profile: '/dashboard/profile',
    settings: '/dashboard/settings'
  },
  
  // Admin routes
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    vouchers: '/admin/vouchers',
    analytics: '/admin/analytics',
    settings: '/admin/settings'
  },
  
  // API routes
  api: {
    auth: '/api/auth',
    health: '/api/health'
  }
} as const

/**
 * Medical performance and monitoring constants
 * Thresholds and limits for performance monitoring
 */
export const MEDICAL_PERFORMANCE = {
  // API response time thresholds (in milliseconds)
  responseTime: {
    excellent: 200,
    good: 500,
    acceptable: 1000,
    slow: 2000,
    critical: 5000
  },
  
  // File upload size limits by tier (in bytes)
  fileSizeLimits: {
    free: 5 * 1024 * 1024, // 5MB
    pro: 10 * 1024 * 1024, // 10MB
    enterprise: 20 * 1024 * 1024 // 20MB
  },
  
  // Query processing limits
  queryLimits: {
    concurrent: 3, // Maximum concurrent queries per user
    timeout: 30000, // 30 seconds
    retries: 3
  },
  
  // Cache settings
  cache: {
    queryResults: 300000, // 5 minutes
    userProfile: 600000, // 10 minutes
    usage: 60000, // 1 minute
    static: 86400000 // 24 hours
  }
} as const

/**
 * Medical validation patterns
 * Regular expressions and validation rules for medical data
 */
// GOOGLE OAUTH 2.0 EXCLUSIVE: No password validation needed
export const MEDICAL_VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  medicalQuery: {
    minLength: 5,
    maxLength: 2000,
    allowedChars: /^[a-zA-Z0-9\s\.\,\?\!\-\(\)\[\]\/\:\;\"\']+$/
  },
  
  fileName: {
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-\_\.\(\)]+$/,
    invalidChars: /[<>:"/\\|?*]/
  },
  
  voucherCode: {
    length: 16,
    pattern: /^[A-Z0-9]{16}$/
  }
} as const