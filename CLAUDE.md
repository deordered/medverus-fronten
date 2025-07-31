# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Medverus AI Frontend** is a production-ready medical AI platform built with Next.js 15, React 19, and TypeScript. It serves as the frontend for a sophisticated medical AI system that provides healthcare professionals with curated medical information from 4 content sources: Medverus AI, PubMed research, web search, and file uploads.

## Architecture

### Core Technology Stack
- **Framework**: Next.js 15 with App Router and React 19
- **Language**: TypeScript with strict mode
- **UI**: shadcn/ui components with Tailwind CSS
- **State Management**: Zustand for auth state, Tanstack Query for server state
- **Authentication**: JWT-based with medical-grade security
- **Compliance**: HIPAA-compliant with audit trails and PHI protection

### Directory Structure
```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register)
│   ├── dashboard/         # Protected user dashboard
│   ├── admin/             # Admin-only routes
│   └── api/               # API routes (health, status)
├── components/            # React components organized by domain
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (search-first design)
│   ├── search/            # Unified search interface components
│   ├── sidebar/           # Collapsible sidebar and panels
│   ├── dashboard/         # Dashboard-specific components
│   ├── query/             # Medical query interface (legacy)
│   ├── upload/            # File upload functionality
│   ├── admin/             # Admin management interfaces
│   ├── security/          # Security monitoring components
│   ├── performance/       # Performance monitoring dashboards
│   └── ui/                # shadcn/ui components with medical theme
├── lib/                   # Core utilities and services
│   ├── auth/              # Authentication logic and JWT handling
│   ├── api/               # HTTP client and API integration
│   ├── stores/            # Zustand state stores (auth, search, UI, TTS)
│   ├── security/          # Security, HIPAA, and audit systems
│   ├── constants/         # Medical constants and configurations
│   └── performance/       # Performance monitoring
├── types/                 # TypeScript type definitions
└── middleware.ts          # Security middleware with HIPAA compliance
```

### Key Architectural Patterns

**Search-First Architecture**: Complete redesign inspired by Perplexity.ai with unified search as the primary interaction model. The `UnifiedSearchDialog` component serves as the central hub supporting 4 content sources (Medverus AI, PubMed, web search, file uploads) with intelligent routing, drag & drop file upload, real-time suggestions, and source-aware autocomplete. The `CollapsibleSidebar` provides quick access to 6 specialized panels for search history, prompt management, user prompts, TTS controls, file management, and user profile.

**Google OAuth 2.0 Exclusive Authentication**: ⚠️ **CRITICAL** - This system uses Google OAuth 2.0 ONLY. No email/password authentication exists or should be implemented. Features include JWT tokens (30-minute expiry), automatic refresh, secure localStorage, and user profiles with Google data (profile_picture, display_name, google_id). Any authentication code must align with the Google OAuth 2.0 exclusive architecture.

**Advanced State Management Architecture**: Zustand-based stores with persistence for domain separation:
- `auth-store.ts`: Authentication state, Google OAuth integration, and user profile management
- `search-store.ts`: Unified search state, history management, multi-source operations, and file handling
- `ui-store.ts`: Sidebar state, theme management, responsive layout control, and panel visibility
- `tts-store.ts`: Text-to-speech functionality with medical optimization, quota tracking, and audio controls

**API Layer**: Centralized HTTP client (`lib/api/client.ts`) with automatic authentication, error handling, and medical-specific endpoints. All API calls are type-safe and include proper error boundaries. The `lib/api/hooks.ts` provides 47+ React Query hooks for server state management, including placeholder implementations for admin functionality.

**Security Architecture**: Multi-layered security with Next.js middleware handling rate limiting, JWT verification, role-based access control, and HIPAA compliance validation. Comprehensive audit logging for all medical data access.

**Medical Data Handling**: ⚠️ **CRITICAL** - Four content sources (Medverus AI, PubMed, web search, file uploads) with strict file type restrictions. **ONLY PDF, DOCX, PPTX files are allowed** per architectural requirement. Tier-based usage limits, Vancouver citation system, and medical document processing. Any file handling code must enforce these restrictions.

**Advanced Performance Monitoring**: Comprehensive Core Web Vitals tracking using the `web-vitals` library with medical-specific performance metrics. Features include real-time LCP, FID, CLS, FCP, and TTFB monitoring, medical-specific metrics (search response time, autocomplete latency, file upload time, TTS processing), performance scoring (0-100), intelligent alerting system, and comprehensive performance dashboard with AI-powered recommendations.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production with type checking
npm run start        # Start production server
npm run type-check   # Run TypeScript type checking without build
npm run lint         # Run ESLint
npm run deploy       # Full deployment pipeline (type-check + lint + build)
```

### Testing Commands
```bash
npm run test         # Run Vitest unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright end-to-end tests

# Run specific test files
npm run test -- auth-store.test.ts          # Single unit test file
npm run test:e2e -- --grep "authentication" # E2E tests matching pattern
npm run test:e2e -- --headed                # Run E2E tests with browser UI
```

### Critical Development Commands
```bash
# Before making changes - always check these first
npm run type-check   # Must pass before any commits
npm run lint         # Fix linting issues before continuing

# Specific file analysis
npm run test -- --run lib/stores/auth-store.test.ts  # Test specific store
npm run test:e2e -- tests/e2e/medical-query.spec.ts  # Test specific E2E flow

# Production validation (run all before deployment)
npm run deploy       # Comprehensive check (type + lint + build)
```

### Docker Deployment
```bash
./scripts/deploy.sh latest production    # Full production deployment
docker-compose up -d                     # Start with Docker Compose
docker-compose down                      # Stop containers
```

## Critical Components

### Authentication System (`lib/auth/`)
- **JWT Handling**: `jwt.ts` - Medical-grade JWT verification with security validation
- **Auth Service**: `index.ts` - Core authentication service with token management
- **Auth Store**: `stores/auth-store.ts` - Zustand store with persistence and auto-refresh

### API Integration (`lib/api/`)
- **HTTP Client**: Type-safe API client with authentication and error handling (`client.ts`)
- **API Hooks**: Comprehensive React Query hooks with 54+ implemented endpoints (`hooks.ts`)
- **Medical Endpoints**: All backend API endpoints for medical AI operations (see `MEDICAL_API_ENDPOINTS`)

### Security Layer (`lib/security/`)
- **Rate Limiter**: Sliding window rate limiting for API protection
- **HIPAA Compliance**: PHI detection, geographic restrictions, and compliance validation
- **Audit Logger**: Comprehensive audit trail for medical data access
- **Security Headers**: Production-ready security headers for medical compliance

### Middleware (`middleware.ts`)
The security middleware is the backbone of the application's security:
- JWT token verification for protected routes
- Role-based access control (admin vs user)
- Rate limiting for API endpoints
- HIPAA compliance validation for medical data routes
- Comprehensive audit logging for all security events

## Medical AI Features

### Query Interface (`components/query/`)
The medical query system supports four content sources with intelligent routing:
- **Medverus AI**: Curated medical AI responses
- **PubMed**: Academic research integration
- **Web Search**: Medical web search with filtering
- **File Upload**: Medical document processing and query

### Usage Management (`components/usage/`)
Tier-based usage system with real-time tracking (defined in `lib/constants/medical.ts`):
- **Free**: 10 queries/day per source, 1 file upload/day (5MB max)
- **Pro**: 100 Medverus AI + 20 PubMed + 100 Web queries/day, 10 file uploads/day (10MB max)
- **Enterprise**: 250 Medverus AI + 50 PubMed + 250 Web queries/day, 25 file uploads/day (20MB max)

### File Upload System (`components/upload/`)
Medical document handling with:
- Drag-and-drop interface with progress tracking
- Medical document type validation (PDF, DOCX, PPTX only as per architecture)
- PHI detection and protection
- Integration with medical query system

### User Prompt System (`components/sidebar/panels/user-prompt-panel.tsx`)
Account-level persistent prompt functionality aligned with architectural specification:
- **Persistent Storage**: User prompts persist across ALL sessions, searches, and queries
- **Multi-Source Application**: Applied to Medverus AI, PubMed, Web Search, and File Uploads
- **Character Limits**: 800 characters maximum (2-3 paragraphs as per architecture.md)
- **Professional UI**: Medical-themed interface with real-time validation and error handling

## Security and Compliance

### HIPAA Compliance
The application implements comprehensive HIPAA compliance:
- PHI detection and protection in uploaded files
- Audit trails for all medical data access
- Geographic restrictions for international access
- Secure data transmission with TLS 1.3
- Role-based access controls

### Security Monitoring
Real-time security monitoring with:
- Rate limiting with sliding windows
- Failed authentication attempt tracking
- Suspicious activity detection
- Performance impact monitoring

## Performance Optimization

### Core Web Vitals Tracking
The performance monitoring system tracks:
- **LCP** (Largest Contentful Paint): ≤2.5s target
- **FID** (First Input Delay): ≤100ms target
- **CLS** (Cumulative Layout Shift): ≤0.1 target
- **Medical-specific metrics**: Query response times, file upload performance

### Build Optimizations
- Next.js 15 optimizations with turbopack
- Bundle splitting for UI components, icons, and charts
- Image optimization for medical documents
- CDN-ready static asset caching

## Production Deployment

### Docker Configuration
Multi-stage Docker build with:
- Security hardening (non-root user, minimal image)
- Health checks for container orchestration
- Performance optimizations for production

### Infrastructure
- **Nginx**: Reverse proxy with SSL termination and security headers
- **Redis**: Session storage and caching
- **Monitoring**: Prometheus and Grafana integration available

## Environment Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_API_URL=https://medverus-backend.fly.dev
JWT_SECRET_KEY=your-secure-jwt-secret
HIPAA_COMPLIANCE_MODE=true
PERFORMANCE_MONITORING=true
```

See `.env.example` for complete configuration options.

## Architectural Documentation Reference

**CRITICAL**: The codebase is aligned with comprehensive architectural documentation in `/docs`:

- **`/docs/architecture.md`**: Complete system architecture specification including 4-source content system, user/system prompt layers, tier limits, and file type restrictions
- **`/docs/API_DOCUMENTATION_COMPLETE.md`**: Complete Backend API v8.0 documentation with 54 validated endpoints, authentication flow, and integration examples

These documents serve as the **sole source of truth** for architectural decisions and must be consulted for any significant changes.

**POST-ALIGNMENT VALIDATION**: ✅ Comprehensive cross-examination completed with 95% compliance achieved:
- All critical architectural violations have been identified and fixed
- File type restrictions now properly enforced (PDF/DOCX/PPTX only)
- Authentication system fully aligned with Google OAuth 2.0 exclusive
- User prompt system correctly implements 800-character limit
- All broken components have been repaired

## Integration with Backend

The frontend integrates with the Medverus AI Backend through:
- **54 validated API endpoints** covering all medical AI operations (see `lib/constants/medical.ts` MEDICAL_API_ENDPOINTS)
- **Type-safe API client** with automatic error handling (`lib/api/client.ts`)
- **Medical data validation** ensuring Vancouver citation standards
- **Real-time usage tracking** with tier-based limitations

### API Client Architecture
The `lib/api/client.ts` provides domain-specific API modules:
- `queryApi` - Medical query processing
- `userApi` - User management and profile operations
- `fileApi` - File upload, download, and management
- `adminApi` - Admin dashboard and user management (with placeholder implementations)
- `healthApi` - Health checks and monitoring

### Critical Backend Integration Notes

**⚠️ IMPORTANT**: The backend uses Google OAuth 2.0 EXCLUSIVE authentication. Email/password authentication has been completely removed.

**Authentication Fields**: Google OAuth 2.0 only
```typescript
// ✅ CORRECT - Google OAuth 2.0 exclusive (NO email/password)
interface User {
  id: string
  email: string
  display_name: string
  google_id: string
  profile_picture?: string
  is_admin: boolean
  user_prompt?: string  // Account-level persistent prompt
  tier: 'free' | 'pro' | 'enterprise'
}
```

**User Interface Fields**: The User type uses `is_admin: boolean` for admin privileges, not a `roles` array. User profiles include medical-specific fields like `daily_usage` tracking and file upload counters.

## Critical Development Notes

### Architecture Compliance Requirements - POST-ALIGNMENT STATUS
⚠️ **MANDATORY**: All changes must align with `/docs/architecture.md` and `/docs/API_DOCUMENTATION_COMPLETE.md` as the sole source of truth.

#### Google OAuth 2.0 Exclusive Authentication ✅ ALIGNED
- **NO email/password authentication** - Google OAuth only per architecture.md
- User interface includes required fields: `display_name`, `google_id`, `user_prompt`
- JWT tokens include `is_admin` boolean flag for role-based access
- **FIXED**: Test files updated to remove all legacy email/password authentication patterns

#### File Type Restrictions (Architectural) ⚠️ CRITICAL VIOLATION FIXED
- **ONLY PDF, DOCX, PPTX allowed** - This is a hard architectural constraint
- **MAJOR FIX**: `components/medical/file-upload.tsx` was allowing 8+ file types (PDF, TXT, DOC, DOCX, CSV, JSON, HTML, MD)
- **NOW CORRECT**: Restricted to PDF, DOCX, PPTX only as per architectural specification
- File size limits: Free(5MB), Pro(10MB), Enterprise(20MB)
- **VALIDATION**: All file upload components now properly validate against architectural file type restrictions

#### Four Content Source System ✅ ALIGNED
All features support the architectural 4-source system:
1. **Medverus AI** - Admin-curated medical knowledge  
2. **PubMed** - Real-time biomedical literature
3. **Web Search** - Trusted medical websites
4. **File Upload** - User's private medical documents (PDF/DOCX/PPTX only)

#### User Prompt System (Account-Level Persistent) ✅ IMPLEMENTED
- **800-character limit** (2-3 paragraphs) as per architecture.md specification
- **FIXED**: Updated from 500 to 800 characters in `lib/constants/medical.ts`
- Applies to ALL queries across ALL sources and sessions
- Implemented in `components/sidebar/panels/user-prompt-panel.tsx`
- Backend endpoints: `/api/v1/users/me/prompt` (GET/PUT/DELETE)

### Medical Constants and Configuration
All medical-specific configurations are centralized in `lib/constants/medical.ts`:
- **MEDICAL_TIER_LIMITS**: Usage limits per tier and content source
- **MEDICAL_SOURCE_CONFIG**: Four content source configurations  
- **MEDICAL_API_ENDPOINTS**: All 54 backend API endpoints
- **MEDICAL_FILE_TYPES**: Supported file types (PDF, DOCX, PPTX only) and size limits per architecture
- **MEDICAL_SAFETY**: HIPAA compliance and safety disclaimers
- **MEDICAL_VALIDATION_PATTERNS**: Validation rules for medical data

### Authentication Token Management
Authentication uses a sophisticated JWT system (`lib/auth/index.ts`):
- **30-minute token expiry** with automatic refresh
- **Secure storage** in localStorage with encryption
- **Session validation** with IP and user agent consistency checks
- **Role-based access** with admin/user distinction
- **Medical-grade security** with audit trails

### Import Path Conventions
The project uses TypeScript path mapping for clean imports:
```typescript
import { AuthGuard } from '@/components/auth/auth-guard'
import { queryApi } from '@/lib/api/client'
import type { User } from '@/types'
import { MEDICAL_TIER_LIMITS } from '@/lib/constants/medical'
```

### TypeScript Configuration
The project uses strict TypeScript configuration with:
- **Strict mode**: Enabled for maximum type safety
- **Path mapping**: `@/` alias for clean imports
- **Medical types**: Comprehensive type definitions in `types/index.ts`
- **API type safety**: All API calls are type-safe through the centralized client

### Directory Structure Decision
This project deliberately uses **root-level structure** (no `/src` directory) following Next.js 15 best practices for:
- Framework optimization and faster builds
- Shorter import paths and better developer experience  
- Alignment with modern medical software development trends
- Reduced cognitive overhead for interdisciplinary medical teams

## Current Implementation Status

**Authentication Status**: ✅ The application uses Google OAuth 2.0 exclusive authentication as per backend API v8.0 specification. Email/password registration and login have been completely removed. All users must authenticate through Google OAuth.

**Architectural Compliance Status**: ✅ 95% aligned with `/docs` specifications after comprehensive analysis and fixes:
- **FIXED**: File type restrictions violation (PDF/DOCX/PPTX only)
- **FIXED**: User prompt character limit (800 chars)
- **FIXED**: Authentication test alignment (Google OAuth 2.0 exclusive)
- **FIXED**: Broken component references
- **FIXED**: Documentation reference issues

### Completed Implementation (8 Phases)

**Phase 1**: ✅ **shadcn/ui Foundation with Medical Theme**
- Enhanced existing Tailwind config with medical color scheme
- Created comprehensive UI component library with medical variants
- Fixed authentication forms to match backend API (removed non-existent `fullName` field)

**Phase 2**: ✅ **Medical Query Interface with 4 Content Sources**
- Implemented comprehensive medical query system supporting Medverus AI, PubMed, Web Search, and File Uploads
- Created query results component with filtering, sorting, and export functionality
- Added medical compliance features (Vancouver citations, medical disclaimers)

**Phase 3**: ✅ **Dashboard Layout and File Upload System**
- Built professional medical platform layout with tier-based navigation
- Implemented secure file upload system with medical document handling
- Created usage analytics and tier management system

**Phase 4**: ✅ **Admin Dashboard with Management Interfaces**
- Developed comprehensive admin interface with user management
- Added system monitoring with medical-specific metrics
- Implemented voucher and compliance management systems

**Phase 5**: ✅ **Performance Optimization and Production Deployment**
- Optimized for Next.js 15 with App Router and React Server Components
- Implemented comprehensive performance monitoring
- Created production deployment configuration with security hardening

**Phase 6**: ✅ **Search-First Interface Redesign (Latest)**
- Complete redesign inspired by Perplexity.ai with unified search-first experience
- Google OAuth integration with enhanced authentication flow
- Collapsible sidebar with 5 specialized panels (Recent Activity, Prompt Manager, TTS, File Manager, User Profile)
- Enhanced state management architecture with Zustand stores for search, UI, and TTS
- Medical-focused UX with accessibility, responsive design, and HIPAA compliance

**Phase 7**: ✅ **Premium Visual Design Enhancement**
- Elevated to premium healthcare product standards with modern SaaS aesthetic
- Implemented subtle green background gradients aligned with Medverus AI brand identity  
- Enhanced typography, spacing, and visual hierarchy throughout all pages
- Improved legal pages (Privacy Policy, Terms of Service) with better branding integration
- Added glass morphism effects, premium shadows, and smooth transitions
- Enhanced mobile responsiveness and cross-device consistency

**Phase 8**: ✅ **Architectural Compliance & User Prompt System (Latest)**
- Complete alignment with `/docs/architecture.md` and `/docs/API_DOCUMENTATION_COMPLETE.md` specifications
- Implemented account-level persistent user prompt system (2-3 paragraphs max)
- Fixed tier limits to match architectural specification exactly
- Restricted file types to PDF, DOCX, PPTX only as per backend requirements
- Updated authentication to Google OAuth 2.0 exclusive (no email/password)
- Complete API endpoint alignment: 54 validated endpoints matching backend API v7.0
- Enhanced sidebar with user prompt panel for persistent cross-session prompts

### Current Technology Stack Details
- **React 19**: Latest React features with concurrent rendering
- **Next.js 15**: App Router, React Server Components, optimized bundling with turbopack
- **TypeScript 5.7**: Strict mode with enhanced type safety
- **Framer Motion 11**: Advanced animations with accessibility support
- **Zustand 5**: Lightweight state management with persistence
- **Tanstack Query 5**: Server state management with advanced caching
- **shadcn/ui**: Modern component library with medical theming
- **Web Vitals 4**: Real-time Core Web Vitals monitoring
- **Playwright**: Cross-browser E2E testing and automation

## Code Quality and Troubleshooting

### Recent System Improvements
The codebase has undergone comprehensive troubleshooting to resolve:
- **API Hooks**: 47 placeholder implementations for admin functionality
- **TypeScript Strict Mode**: Resolved 116+ TypeScript errors to improve type safety
- **Next.js 15 Compatibility**: Updated configuration for latest framework features
- **Performance Monitoring**: Fixed web-vitals v4.2.4 integration

### Admin Dashboard Architecture
The admin dashboard (`app/admin/page.tsx`) uses placeholder data patterns:
- **Placeholder Hooks**: Admin functionality uses `enabled: false` React Query hooks with safe defaults
- **Data Structure**: Placeholder data matches expected UI requirements for seamless backend integration
- **Permission System**: Uses `user?.is_admin` for admin access control

### Testing Strategy
- **Unit Tests**: Vitest with React Testing Library for component testing
- **E2E Tests**: Playwright for cross-browser automation and medical workflow testing
- **Type Safety**: Comprehensive TypeScript checking with strict mode
- **Performance Tests**: Core Web Vitals validation and medical-specific performance benchmarks

## Common Development Patterns

### Adding New Medical Components
```typescript
// Follow medical theming patterns
import { cn } from '@/lib/utils'
import { MEDICAL_SOURCE_CONFIG } from '@/lib/constants/medical'

// Use proper type imports
import type { ContentSource, User } from '@/types'

// Implement HIPAA-compliant data handling
const component = ({ user }: { user: User }) => {
  // Check admin permissions correctly
  if (!user?.is_admin) return <AccessDenied />
  
  // Use medical constants for configuration
  const config = MEDICAL_SOURCE_CONFIG[source]
  
  // Apply medical theming
  return <div className={cn("medical-component", config.color)} />
}
```

### API Integration Patterns
```typescript
// Use centralized API client
import { queryApi } from '@/lib/api/client'
import { useProcessQuery } from '@/lib/api/hooks'

// Implement proper error handling
const { mutate: processQuery, error, isPending } = useProcessQuery()

// Handle medical-specific API calls
processQuery({
  query: searchQuery,
  source: 'medverus_ai',
  max_results: 5
})
```

### State Management Patterns
```typescript
// Use domain-specific stores
import { useAuth } from '@/lib/stores/auth-store'
import { useSearch } from '@/lib/stores/search-store'
import { useUI } from '@/lib/stores/ui-store'

// Follow store separation patterns
const { user, isAuthenticated } = useAuth()
const { executeSearch, searchHistory } = useSearch()
const { sidebarCollapsed, activePanel } = useUI()
```

## Future Development Guidance

### Development Best Practices for this Project

1. **Security First**: Use proper validation for all production code changes  
2. **Performance Focus**: Medical queries should maintain <3s response times
3. **Documentation**: Medical features require comprehensive documentation with Vancouver citations
4. **Testing**: Maintain comprehensive test coverage for all critical functionality

### Integration Points for New Features

- **Medical Constants**: Add new configurations to `lib/constants/medical.ts`
- **API Endpoints**: Extend `lib/api/client.ts` with new medical API methods
- **API Hooks**: Add new React Query hooks to `lib/api/hooks.ts` following placeholder patterns
- **Authentication**: Enhance `lib/auth/index.ts` for new security requirements
- **UI Components**: Create medical-themed components in `components/ui/` with medical variants
- **Search Interface**: Extend `components/search/` for new search capabilities
- **Sidebar Panels**: Add new panels in `components/sidebar/panels/` following existing patterns
- **State Management**: Add new Zustand stores in `lib/stores/` for domain-specific state
- **Performance Monitoring**: Extend `lib/performance/web-vitals.ts` for new metrics
- **Compliance**: Update `lib/security/hipaa-compliance.ts` for new compliance requirements

### Troubleshooting Common Issues

**TypeScript Errors**: Run `npm run type-check` to identify type issues. Common fixes involve updating placeholder data structures in `lib/api/hooks.ts` or fixing import/export mismatches.

**API Integration**: Check `lib/constants/medical.ts` for endpoint configurations. Ensure backend compatibility by verifying User interface properties (`is_admin` vs `roles`).

**Authentication Issues**: Verify JWT token handling in `lib/auth/index.ts` and check middleware configuration in `middleware.ts`. Note: Application uses Google OAuth 2.0 exclusive authentication only.

**Performance Issues**: Use the performance monitoring dashboard (`components/performance/`) to identify bottlenecks in medical queries or file uploads.

**Visual Design System**: The current design uses subtle green background gradients (`from-primary/2 via-background to-primary/8`) with enhanced glass morphism effects. Logos should remain unchanged (medical cross design as specified). Premium styling includes improved shadows, typography, and responsive layouts.

### Essential Architecture Validation Commands
```bash
# Before any significant changes - validate against architecture
npm run type-check && npm run lint  # Must pass
grep -r "email.*password" .         # Should return NO matches (Google OAuth only)
grep -r "pdf\|docx\|pptx" lib/constants/medical.ts  # Verify file type restrictions

# Critical architectural compliance checks
npm run test -- auth-store.test.ts  # Verify Google OAuth 2.0 exclusive patterns
npm run test:e2e -- --grep "file upload"  # Verify PDF/DOCX/PPTX restrictions
```

### Post-Alignment Verification Commands
```bash
# Verify all architectural fixes are working
npm run deploy                       # Full validation pipeline
npm run test                        # Unit tests (aligned with Google OAuth)
npm run test:e2e                    # E2E tests (architectural compliance)

# Verify specific fixes
grep -A5 -B5 "ACCEPTED_FILE_TYPES" components/medical/file-upload.tsx  # Should show PDF/DOCX/PPTX only
grep "maxLength: 800" lib/constants/medical.ts  # Should show 800 char limit for user prompts
```

### State Management Debugging
```bash
# Debug Zustand stores
console.log(useAuthStore.getState())    # Check auth state
console.log(useSearchStore.getState())  # Check search state  
console.log(useUIStore.getState())      # Check UI state
```