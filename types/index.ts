// Core types for Medverus Frontend Application

// User and Authentication Types
export type UserTier = 'free' | 'pro' | 'enterprise'

export interface User {
  id: string
  email: string
  display_name: string           // REQUIRED per architecture.md
  profile_picture?: string
  google_id: string              // REQUIRED per architecture.md
  tier: UserTier
  is_admin: boolean
  user_prompt?: string           // Account-level persistent prompt per architecture.md
  created_at: string
  updated_at: string             // REQUIRED per architecture.md
  is_active: boolean
  last_login: string | null
  uploaded_files_count: number
  total_file_size: number
  daily_usage: {
    medverus_ai: number
    pubmed: number
    web_search: number
    file_upload: number
  }
}

export interface AuthTokens {
  access_token: string
  token_type: 'bearer'
  expires_in: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

// Google OAuth Types
export interface GoogleAuthRequest {
  redirect_uri: string
  state?: string
}

export interface GoogleAuthResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  user: User
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  user: User
}

// Medical Query Types
export type ContentSource = 'medverus_ai' | 'pubmed' | 'web_search' | 'file_upload'

export interface QueryRequest {
  query: string
  source: ContentSource
  user_prompt?: string
  max_results?: number
}

export interface QueryResult {
  id: string
  title: string
  content: string
  source: string
  citation: string
  relevance_score: number
  metadata: Record<string, any>
}

export interface QueryResponse {
  query_id: string
  query: string
  source: ContentSource
  user_prompt?: string
  response: string
  results: QueryResult[]
  citations: string[]
  processing_time_ms: number
  timestamp: string
  safety_applied: boolean
  content_filtered: boolean
}

export interface BatchQueryRequest {
  queries: QueryRequest[]
}

export interface BatchQueryResponse {
  results: QueryResponse[]
  total_processing_time_ms: number
}

// Usage and Limits Types
export interface UsageStats {
  tier: UserTier
  usage: {
    medverus_ai: number
    pubmed: number
    web_search: number
    file_upload: number
  }
  limits: {
    medverus_ai: number
    pubmed: number
    web_search: number
    file_upload: {
      count: number
      size_mb: number
    }
  }
  usage_percentages: {
    medverus_ai: {
      percentage: number
      used: number
      limit: number
    }
    pubmed: {
      percentage: number
      used: number
      limit: number
    }
    web_search: {
      percentage: number
      used: number
      limit: number
    }
    file_upload: {
      count_percentage: number
      count_used: number
      count_limit: number
      size_limit_mb: number
    }
  }
  reset_time: string
}

export interface TierLimits {
  [key: string]: {
    medverus_ai: number
    pubmed: number
    web_search: number
    file_upload: {
      count: number
      size_mb: number
    }
  }
}

// File Upload Types
export interface FileUploadRequest {
  file: File
  description?: string
}

export interface FileUploadResponse {
  id: string
  filename: string
  size: number
  content_type: string
  upload_date: string
  processed: boolean
  error?: string
}

export interface UploadedFile {
  id: string
  filename: string
  size: number
  content_type: string
  upload_date: string
  processed: boolean
  user_id: string
}

// Admin Types
export interface AdminUser {
  id: string
  email: string
  tier: UserTier
  is_active: boolean
  is_admin: boolean
  created_at: string
  last_login: string | null
  total_queries: number
  queries_today: number
  uploaded_files: number
  total_file_size: number
}

export interface Voucher {
  id: string
  voucher_code: string
  tier: UserTier
  status: 'active' | 'redeemed' | 'expired'
  created_at: string
  expires_at: string
  redeemed_by: string | null
  activated_at: string | null
  created_by: string
  description?: string
}

export interface CreateVoucherRequest {
  tier: UserTier
  expires_in_days: number
  description?: string
}

export interface CreateBatchVouchersRequest {
  tier: UserTier
  count: number
  expires_in_days: number
  description?: string
}

export interface BatchVouchersResponse {
  created_count: number
  failed_count: number
  voucher_codes: string[]
  tier: UserTier
  expires_at: string
}

export interface RedeemVoucherRequest {
  voucher_code: string
}

export interface RedeemVoucherResponse {
  message: string
  old_tier: UserTier
  new_tier: UserTier
  voucher_code: string
}

// Admin Dashboard Types
export interface AdminDashboard {
  system_metrics: {
    total_users: number
    active_users_today: number
    total_queries_today: number
    api_response_time_avg: number
  }
  source_metrics: {
    [key in ContentSource]: {
      queries_today: number
      avg_response_time: number
    }
  }
  voucher_metrics: {
    total_created: number
    total_redeemed: number
    active_vouchers: number
  }
  performance_metrics: {
    uptime_percentage: number
    error_rate: number
    database_health: 'healthy' | 'warning' | 'critical'
  }
}

// Content Source Configuration
export interface SourceConfig {
  id: ContentSource
  name: string
  description: string
  icon: string
  color: string
  type: 'global' | 'api' | 'search' | 'private'
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical'
  service: string
  version: string
  environment?: string
  components?: {
    database?: {
      status: 'healthy' | 'warning' | 'critical'
      connected: boolean
      stats?: {
        collections: number
        total_documents: number
      }
    }
    vector_store?: {
      status: 'healthy' | 'warning' | 'critical'
      collections: number
      total_embeddings: number
    }
    ai_service?: {
      status: 'healthy' | 'warning' | 'critical'
      openai_api: 'connected' | 'disconnected'
      model: string
    }
  }
}

// Error Types
export interface APIError {
  detail: string
  status: 'error'
  timestamp: string
  code?: string
}

export interface ValidationError {
  detail: Array<{
    loc: string[]
    msg: string
    type: string
  }>
}

// Form Types
export interface FormState {
  message?: string
  errors?: Record<string, string[]>
  success?: boolean
}

// Navigation Types
export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
  icon?: React.ComponentType<any>
  label?: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

// UI Component Types
export interface DataTableColumn<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (info: { row: { original: T } }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  pagination?: boolean
  sorting?: boolean
  filtering?: boolean
  selection?: boolean
  onRowSelect?: (rows: T[]) => void
}

// Chart Types for Usage Visualization
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
  percentage?: number
}

export interface UsageChartData {
  daily: ChartDataPoint[]
  weekly: ChartDataPoint[]
  monthly: ChartDataPoint[]
  by_source: ChartDataPoint[]
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    usage_warnings: boolean
    system_updates: boolean
  }
  privacy: {
    analytics: boolean
    error_reporting: boolean
  }
  medical: {
    disclaimer_acknowledged: boolean
    professional_verification: boolean
  }
}

// Medical Disclaimer Types
export interface MedicalDisclaimer {
  id: string
  title: string
  content: string
  version: string
  required: boolean
  acknowledgment_required: boolean
  last_updated: string
}

// Professional Verification Types
export interface ProfessionalVerification {
  license_number?: string
  license_type?: string
  issuing_authority?: string
  expiry_date?: string
  verified: boolean
  verification_date?: string
}

// Audit Log Types (for admin)
export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource: string
  resource_id?: string
  details: Record<string, any>
  ip_address: string
  user_agent: string
  timestamp: string
}

// Search and Filter Types
export interface SearchFilters {
  query?: string
  source?: ContentSource[]
  date_range?: {
    start: string
    end: string
  }
  tier?: UserTier[]
  status?: string[]
}

export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
  has_next: boolean
  has_prev: boolean
}

// WebSocket Types for Real-time Updates
export interface WebSocketMessage {
  type: 'usage_update' | 'system_notification' | 'query_complete'
  data: any
  timestamp: string
}

// PWA Types
export interface PWAConfig {
  name: string
  short_name: string
  description: string
  theme_color: string
  background_color: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  orientation: 'portrait' | 'landscape' | 'any'
  start_url: string
  scope: string
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose?: string
  }>
}

// Search-First Interface Types
export interface SearchSession {
  id: string
  query: string
  sources: ContentSource[]
  results: QueryResponse | null
  timestamp: string
  processing_time?: number
}

export interface SearchState {
  currentQuery: string
  selectedSources: ContentSource[]
  activeResults: QueryResponse | null
  isSearching: boolean
  searchHistory: SearchSession[]
  files: File[]
}

// UI State Types
export type SidebarPanel = 'recent' | 'prompts' | 'user-prompt' | 'tts' | 'files' | 'profile' | 'admin'

export interface UIState {
  sidebarCollapsed: boolean
  activePanel: SidebarPanel | null
  searchDialogExpanded: boolean
  isMobile: boolean
  theme: 'light' | 'dark'
}

// Prompt Manager Types
export interface PromptTemplate {
  id: string
  name: string
  category: 'Clinical' | 'Research' | 'Patient Education' | 'Drug Information' | 'Custom'
  template: string
  variables: string[]
  isPublic: boolean
  isSystem: boolean
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface PromptVariable {
  name: string
  description: string
  type: 'text' | 'number' | 'select' | 'multiselect'
  options?: string[]
  required: boolean
  defaultValue?: string
}

// TTS (Text-to-Speech) Types
export interface TTSItem {
  id: string
  text: string
  voice: string
  rate: number
  volume: number
  status: 'pending' | 'playing' | 'completed' | 'error'
  duration?: number
  createdAt: string
}

export interface TTSSettings {
  voice: string
  rate: number
  volume: number
  autoPlay: boolean
  enabled: boolean
}

export interface TTSState {
  queue: TTSItem[]
  currentItem: TTSItem | null
  settings: TTSSettings
  remainingQuota: number
  dailyLimit: number
  isPlaying: boolean
}

// Recent Activity Types
export interface RecentActivity {
  searchSessions: SearchSession[]
  fileUploads: UploadedFile[]
  promptsUsed: PromptTemplate[]
  totalCount: number
  lastUpdated: string
}

// File Manager Enhanced Types
export interface FilePreview {
  id: string
  filename: string
  content_type: string
  size: number
  upload_date: string
  processed: boolean
  thumbnail?: string
  preview_available: boolean
  metadata?: {
    pages?: number
    word_count?: number
    language?: string
    topics?: string[]
  }
}

export interface FileManagerState {
  files: FilePreview[]
  selectedFiles: string[]
  viewMode: 'grid' | 'list'
  sortBy: 'name' | 'date' | 'size' | 'type'
  sortOrder: 'asc' | 'desc'
  searchQuery: string
  loading: boolean
}

// Admin Panel Types for Sidebar
export interface AdminStats {
  activeUsers: number
  totalQueries: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  lastUpdated: string
}

// Source Toggle Types
export interface SourceToggleState {
  source: ContentSource
  enabled: boolean
  usage: {
    used: number
    limit: number
    percentage: number
  }
  available: boolean
}

// Autocomplete Types
export interface SearchSuggestion {
  id: string
  text: string
  type: 'history' | 'medical_term' | 'template'
  category?: string
  confidence: number
}

// Drag and Drop Types
export interface FileDropZoneState {
  isDragOver: boolean
  files: File[]
  acceptedTypes: string[]
  maxFileSize: number
  maxFiles: number
}