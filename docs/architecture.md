# Medverus AI Frontend - System Architecture Specification

**Version:** 8.0 (Production Aligned)  
**Last Updated:** 2025-07-31  
**Status:** ✅ **Production Ready** - Complete architectural specification  

This document serves as the **sole source of truth** for all architectural decisions and system requirements for the Medverus AI Frontend application.

---

## 🏗️ System Architecture Overview

### Core Philosophy
Medverus AI Frontend is a **search-first medical AI platform** built with Next.js 15, React 19, and TypeScript. The architecture emphasizes:

- **Search-First Design**: Unified search interface as primary interaction model
- **Medical-Grade Security**: HIPAA compliance with comprehensive audit trails  
- **Performance Excellence**: Sub-3s response times with advanced monitoring
- **Scalable Architecture**: Microservices-ready with proper separation of concerns

### Technology Stack
```yaml
Frontend Framework: Next.js 15 (App Router + React Server Components)
Language: TypeScript 5.7 (Strict Mode)
UI Library: shadcn/ui + Tailwind CSS
State Management: Zustand 5 (Persistent Stores)
Server State: Tanstack Query 5 (React Query)
Authentication: Google OAuth 2.0 Exclusive (JWT Tokens)
Performance: Web Vitals 4.2.4 (Real-time monitoring)
Testing: Vitest + Playwright (Unit + E2E)
Deployment: Docker + Nginx (Production)
```

---

## 🎯 Core System Flow

### Medical AI Query Pipeline
```
User Input → Admin System Prompt → User Persistent Prompt → Content Retrieval (4 sources) → AI Response with Citations
```

#### Query Processing Architecture
1. **Input Validation**: Medical query validation (5-2000 characters)
2. **Prompt Assembly**: System prompt + user persistent prompt + per-query prompt
3. **Source Selection**: User selects from 4 content sources
4. **Content Retrieval**: Parallel retrieval from selected sources
5. **AI Processing**: GPT-4.1-mini-2025-04-14 with medical context
6. **Citation Generation**: Vancouver-style citations with source attribution
7. **Response Delivery**: Structured response with metadata

---

## 📚 Content Source System (4 Sources)

### 1. Medverus AI
**Type**: Admin-curated medical knowledge base  
**Implementation**: Global ChromaDB collection with PubMedBERT embeddings  
**Access**: All authenticated users  
**Control**: Admin-managed content via `/api/v1/admin/content/global`  

### 2. PubMed
**Type**: Real-time biomedical literature  
**Implementation**: NCBI E-utilities API integration  
**Access**: Tier-based rate limits  
**Processing**: XML parsing for abstracts, authors, citations  

### 3. Web Search  
**Type**: Trusted medical websites  
**Implementation**: OpenAI native web search tool  
**Access**: Tier-based rate limits  
**Control**: Admin system prompts guide search behavior  

### 4. File Upload
**Type**: User's private medical documents  
**Implementation**: User-specific ChromaDB collections  
**Privacy**: Complete user isolation, no cross-user access  
**Processing**: PubMedBERT embeddings for semantic search  

---

## 🔐 Authentication & Authorization

### Google OAuth 2.0 Exclusive System
**Authentication Method**: Google OAuth 2.0 ONLY (no email/password)  
**Token System**: JWT with 30-minute expiry + refresh tokens  
**Session Management**: Secure localStorage with automatic cleanup  
**Security Features**: CSRF protection, IP validation, audit logging  

#### User Profile Structure
```typescript
interface User {
  id: string;
  email: string;
  display_name: string;
  profile_picture?: string;
  google_id: string;
  tier: "free" | "pro" | "enterprise";
  is_admin: boolean;
  user_prompt?: string;  // Account-level persistent prompt
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
```

### Authorization Levels
- **Public**: Health checks, OAuth initiation, marketing pages
- **User**: Requires valid JWT token (`is_active: true`)
- **Admin**: Requires `is_admin: true` in JWT payload
- **Tier-based**: Feature access based on user tier

---

## 💾 State Management Architecture

### Zustand Store Separation
The application uses domain-specific Zustand stores with persistence:

#### 1. Auth Store (`auth-store.ts`)
- Google OAuth integration and user profile management
- JWT token handling with automatic refresh
- Admin privilege checking and role-based access
- Persistent login state across browser sessions

#### 2. Search Store (`search-store.ts`) 
- Unified search state management
- Search history with local persistence
- Multi-source search operations
- File upload integration and management
- Real-time search suggestions and autocomplete

#### 3. UI Store (`ui-store.ts`)
- Sidebar state and panel visibility management
- Theme and responsive layout control
- Modal and dialog state management
- User interface preferences

#### 4. TTS Store (`tts-store.ts`)
- Text-to-speech functionality with medical optimization
- Audio playback controls and queue management
- Usage quota tracking and rate limiting
- Voice selection and speed controls

---

## 📱 User Interface Architecture

### Search-First Design (Perplexity.ai Inspired)
The interface prioritizes unified search as the primary interaction model:

#### UnifiedSearchDialog Component
- **Central Hub**: Primary search interface supporting all 4 content sources
- **Drag & Drop**: File upload integration with automatic source selection
- **Real-time Suggestions**: Source-aware autocomplete with medical terms
- **Performance Optimized**: Virtual rendering for large result sets
- **Mobile Responsive**: Touch-friendly with gesture support

#### CollapsibleSidebar System
Six specialized panels for enhanced functionality:
1. **Recent Activity**: Search history and quick access to previous queries
2. **Prompt Manager**: System prompt visibility and user prompt management
3. **User Prompts**: Account-level persistent prompt editing (800 chars max)
4. **TTS Controls**: Text-to-speech functionality with medical optimization
5. **File Manager**: Uploaded document management and organization
6. **User Profile**: Account information, usage statistics, and settings

---

## 📊 Usage Limits & Tier System

### Tier-Based Limits (Daily Reset at 00:00 UTC)

#### Free Tier
```yaml
Medverus AI: 10 queries/day
PubMed: 10 queries/day  
Web Search: 10 queries/day
File Upload: 1 file/day (5MB max each)
Features: Basic medical safety, community support
```

#### Pro Tier ($29/month)
```yaml
Medverus AI: 100 queries/day
PubMed: 20 queries/day
Web Search: 100 queries/day  
File Upload: 10 files/day (10MB max each)
Features: Priority support, advanced safety, usage analytics
```

#### Enterprise Tier ($99/month)
```yaml
Medverus AI: 250 queries/day
PubMed: 50 queries/day
Web Search: 250 queries/day
File Upload: 25 files/day (20MB max each)
Features: Dedicated support, enterprise security, team management
```

---

## 📄 File Handling System

### Supported File Types (Architectural Restriction)
**Allowed**: PDF, DOCX, PPTX ONLY  
**Rationale**: Medical document focus with enterprise compatibility  
**Processing**: PubMedBERT embeddings for semantic search  
**Storage**: User-isolated ChromaDB collections  

#### File Type Configuration
```typescript
SUPPORTED_TYPES = {
  'application/pdf': { maxSize: '20MB', description: 'PDF Documents' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxSize: '20MB', description: 'Word Documents' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxSize: '20MB', description: 'PowerPoint Presentations' }
}
```

### File Security & Compliance
- **PHI Detection**: Automatic detection and protection of protected health information
- **User Isolation**: Complete separation between user file collections
- **Audit Logging**: Comprehensive file access and modification tracking
- **HIPAA Compliance**: Medical-grade security for all file operations

---

## 🎭 Prompt System Architecture

### Two-Layer Prompt System

#### 1. System Prompts (Admin-Controlled)
**Control**: Complete admin autonomy via `/api/v1/admin/system-prompts/*`  
**Format**: Direct text (NO templates, NO hardcoded medical logic)  
**Purpose**: AI behavior control, medical safety guidelines, citation formats  
**Integration**: Applied to ALL queries automatically  

```typescript
interface SystemPrompt {
  id: string;
  name: string;
  description: string;
  prompt_type: string;
  prompt_content: string;  // Direct admin text
  is_active: boolean;
  has_context_placeholder: boolean;  // {context} injection
  has_query_placeholder: boolean;    // {query} injection
}
```

#### 2. User Prompts (Account-Level Persistent)
**Scope**: Account-level persistence across ALL sessions and searches  
**Character Limit**: 800 characters maximum (2-3 paragraphs)  
**Application**: Applied to Medverus AI, PubMed, Web Search, and File Uploads  
**Management**: 3 endpoints (GET/PUT/DELETE `/api/v1/users/me/prompt`)  

#### Prompt Priority Order
1. **Per-query prompt** (highest priority, overrides persistent)
2. **User persistent prompt** (account-level, applies when no per-query prompt)
3. **No user prompt** (system prompt only)

System prompts ALWAYS apply regardless of user prompt settings.

---

## 🚀 Performance & Monitoring

### Core Web Vitals Monitoring
Real-time performance tracking with medical-specific metrics:

#### Standard Metrics
- **LCP** (Largest Contentful Paint): ≤2.5s target
- **FID** (First Input Delay): ≤100ms target  
- **CLS** (Cumulative Layout Shift): ≤0.1 target
- **FCP** (First Contentful Paint): ≤1.8s target
- **TTFB** (Time to First Byte): ≤600ms target

#### Medical-Specific Metrics
- **Search Response Time**: ≤3s for medical queries
- **Autocomplete Latency**: ≤200ms for suggestions
- **File Upload Time**: Progress tracking with ETA
- **TTS Processing**: ≤2s for medical text synthesis

### Performance Optimization Features
- **Virtual Rendering**: Large result sets with smooth scrolling
- **Intelligent Caching**: React Query with medical-specific invalidation
- **Bundle Optimization**: Next.js 15 with turbopack and code splitting
- **CDN Integration**: Static asset optimization and caching
- **Lazy Loading**: Component and route-based lazy loading

---

## 🔒 Security & Compliance

### HIPAA Compliance Implementation
- **PHI Detection**: Automatic scanning and protection in uploaded files
- **Audit Logging**: Comprehensive tracking of all medical data access
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Geographic Restrictions**: Compliance with international data regulations
- **Role-Based Access**: Granular permissions for admin vs user functions

### Security Features
- **Rate Limiting**: Sliding window rate limiting with medical-specific thresholds
- **Input Validation**: Comprehensive sanitization of all user inputs
- **XSS Protection**: Content Security Policy with strict guidelines
- **CSRF Protection**: Token-based protection for state-changing operations
- **Session Security**: Secure session management with automatic timeout

---

## 🏥 Admin Dashboard Architecture

### Admin Control Features
- **User Management**: Complete user lifecycle management
- **System Prompt Control**: Direct text editing with NO templates
- **Content Management**: Global medical content curation
- **Analytics Dashboard**: Usage patterns and system metrics
- **Voucher System**: Tier upgrade management and tracking
- **Health Monitoring**: Real-time system status and performance

### Admin API Coverage (22 Endpoints)
```yaml
Voucher Management: 8 endpoints (create, batch, list, stats, cleanup)
User Management: 3 endpoints (list, details, update)
Analytics: 3 endpoints (dashboard, usage analytics, content metrics)
Content Management: 1 endpoint (global content upload)
System Prompts: 7 endpoints (CRUD, activation, active retrieval)
```

---

## 🔧 API Integration Architecture

### Backend Integration (54 Endpoints)
Complete integration with Medverus AI Backend API v8.0:

#### Endpoint Categories
- **Authentication** (4): Google OAuth flow, token management
- **Users** (7): Profile, usage, vouchers, persistent prompts
- **Query** (4): Process, batch, sources, limits
- **Health** (9): Comprehensive system monitoring
- **Admin** (22): Complete administrative functionality
- **App-Level** (8): Health checks, OAuth compatibility

#### API Client Architecture
```typescript
// Centralized API modules
export const apiClient = {
  auth: AuthAPI,      // Google OAuth 2.0 exclusive
  users: UsersAPI,    // Profile and usage management  
  query: QueryAPI,    // Medical AI query processing
  files: FilesAPI,    // File upload and management
  admin: AdminAPI,    // Administrative functionality
  health: HealthAPI   // System monitoring
}
```

### Error Handling Strategy
- **Retry Logic**: Exponential backoff for transient errors
- **Circuit Breaker**: Automatic fallback for service failures
- **Rate Limit Handling**: Intelligent queuing and user feedback
- **Auth Refresh**: Automatic token refresh on expiry
- **User Feedback**: Clear error messages with recovery guidance

---

## 📱 Mobile & Responsive Design

### Mobile-First Architecture
- **Responsive Breakpoints**: Tailwind CSS with medical-specific spacing
- **Touch Optimization**: Gesture-friendly interfaces for medical professionals
- **Progressive Web App**: Service worker integration for offline capability
- **Performance**: Optimized for 3G networks and lower-end devices

### Accessibility Compliance
- **WCAG 2.1 AA**: Full compliance with accessibility standards
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: Medical-grade contrast ratios for clinical environments

---

## 🚢 Deployment & DevOps

### Production Deployment
```yaml
Container: Multi-stage Docker build with security hardening
Proxy: Nginx with SSL termination and security headers
Cache: Redis for session storage and API caching  
Monitoring: Prometheus + Grafana integration ready
Health: Kubernetes-compatible health check endpoints
```

### Development Workflow
```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build with type checking
npm run type-check   # TypeScript validation
npm run lint         # ESLint with medical-specific rules
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run deploy       # Full deployment pipeline
```

---

## 📋 Implementation Compliance Checklist

### ✅ Core Architecture Compliance
- [x] Google OAuth 2.0 exclusive authentication (no email/password)
- [x] 4 content sources implemented (Medverus AI, PubMed, Web Search, File Upload)
- [x] Search-first interface with UnifiedSearchDialog
- [x] Collapsible sidebar with 6 specialized panels
- [x] Zustand state management with domain separation
- [x] Next.js 15 App Router with React Server Components

### ✅ API Integration Compliance  
- [x] All 54 backend endpoints defined and integrated
- [x] Comprehensive error handling with retry logic
- [x] JWT token management with automatic refresh
- [x] Rate limiting with tier-based enforcement
- [x] Health monitoring with 9 detailed endpoints

### ✅ Security & Compliance
- [x] HIPAA compliance with PHI detection
- [x] Comprehensive audit logging
- [x] Role-based access control (admin vs user)
- [x] Input validation and XSS protection
- [x] Secure session management

### ✅ Performance & Monitoring
- [x] Core Web Vitals monitoring with medical-specific metrics
- [x] Performance optimization with virtual rendering
- [x] Bundle optimization with Next.js 15 and turbopack
- [x] Real-time performance dashboard

### ✅ File Handling
- [x] Restricted to PDF, DOCX, PPTX only (architectural requirement)
- [x] Tier-based size limits (5MB/10MB/20MB)
- [x] User-isolated storage with PHI protection
- [x] Comprehensive file management interface

### ✅ Prompt System
- [x] Admin system prompts with direct text control
- [x] User persistent prompts (800 character limit)
- [x] Account-level persistence across all sessions
- [x] Priority handling (per-query > persistent > none)

---

## 🔮 Future Architecture Considerations

### Scalability Roadmap
- **Microservices**: Service mesh ready with proper domain boundaries
- **Global CDN**: Multi-region deployment for international medical users
- **Real-time Features**: WebSocket integration for collaborative medical research
- **Offline Support**: Progressive Web App with offline medical reference
- **Integration APIs**: Healthcare system integration (FHIR, HL7)

### Technology Evolution
- **React 19**: Concurrent features and server components optimization
- **Edge Computing**: Vercel Edge Runtime for global performance
- **AI Enhancement**: Local medical model inference for offline capability
- **Voice Interface**: Advanced medical voice recognition and dictation
- **Compliance**: Additional healthcare compliance standards (SOC 2, HITRUST)

---

## 📚 Architecture Decision Records

### ADR-001: Search-First Interface Design
**Decision**: Adopt Perplexity.ai-inspired search-first interface  
**Rationale**: Medical professionals need rapid access to information  
**Impact**: Simplified user experience with unified search paradigm  
**Status**: ✅ Implemented

### ADR-002: Google OAuth 2.0 Exclusive Authentication
**Decision**: Remove email/password authentication, use Google OAuth only  
**Rationale**: Reduces security risk, leverages Google's medical compliance  
**Impact**: Simplified authentication flow, reduced attack surface  
**Status**: ✅ Implemented

### ADR-003: File Type Restriction (PDF, DOCX, PPTX Only)
**Decision**: Limit file uploads to PDF, DOCX, PPTX formats only  
**Rationale**: Focus on professional medical documents, security concerns  
**Impact**: Reduced file processing complexity, better user experience  
**Status**: ✅ Implemented

### ADR-004: Zustand for State Management
**Decision**: Use Zustand over Redux Toolkit for state management  
**Rationale**: Smaller bundle size, simpler API, better TypeScript support  
**Impact**: Improved developer experience, reduced complexity  
**Status**: ✅ Implemented

---

**Document Status**: ✅ **Production Ready**  
**Compliance**: 100% aligned with backend API v8.0  
**Validation**: Cross-referenced with complete codebase analysis

This architecture specification serves as the definitive guide for all development decisions and system implementations in the Medverus AI Frontend application.