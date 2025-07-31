"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/stores/auth-store"
import { useUI } from "@/lib/stores/ui-store"
import { useMobileViewport } from "@/lib/hooks/use-mobile-responsive"
import { AuthGuard } from "@/components/auth/auth-guard"
import { SearchFirstTopBar } from "./search-first-top-bar"
import { UnifiedSearchDialog } from "@/components/search/unified-search-dialog"
import { CollapsibleSidebar } from "@/components/sidebar/collapsible-sidebar"
import { SearchResults } from "@/components/search/search-results"
import { RecentActivityPanel } from "@/components/sidebar/panels/recent-activity-panel"
import { PromptManagerPanel } from "@/components/sidebar/panels/prompt-manager-panel"
import { UserPromptPanel } from "@/components/sidebar/panels/user-prompt-panel"
import { TTSPanel } from "@/components/sidebar/panels/tts-panel"
import { FileManagerPanel } from "@/components/sidebar/panels/file-manager-panel"
import { AnimatedPage } from "@/components/animations/animated-page"
import { pageVariants, overlayVariants } from "@/lib/animations/motion-variants"
import { useAnimationSafeMotion } from "@/lib/animations/hooks"
import { cn } from "@/lib/utils"

interface SearchFirstLayoutProps {
  children?: React.ReactNode
  className?: string
}

/**
 * Search-First Layout Component
 * Main layout for the redesigned Medverus AI platform
 * Inspired by Perplexity.ai with medical-focused enhancements
 */
export function SearchFirstLayout({ children, className }: SearchFirstLayoutProps) {
  const { user, isAuthenticated } = useAuth()
  const { 
    sidebarCollapsed, 
    isMobile, 
    theme,
    initializeResponsive 
  } = useUI()
  const { shouldAnimate } = useAnimationSafeMotion()
  const { viewportHeight } = useMobileViewport()

  // Initialize responsive behavior
  useEffect(() => {
    const cleanup = initializeResponsive()
    return cleanup
  }, [initializeResponsive])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (!isAuthenticated) {
    return <AuthGuard requireAuth={true}>{children}</AuthGuard>
  }

  return (
    <AnimatedPage className={cn(
      "min-h-screen bg-background text-foreground",
      "transition-colors duration-200",
      className
    )}>
      {/* Top Navigation Bar */}
      <motion.div
        initial={shouldAnimate ? { y: -20, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <SearchFirstTopBar />
      </motion.div>

      {/* Main Layout Container */}
      <div className={cn(
        "flex",
        isMobile ? `h-[calc(${viewportHeight}-4rem)]` : "h-[calc(100vh-4rem)]"
      )}>
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar />

        {/* Main Content Area */}
        <motion.main 
          className={cn(
            "flex-1 flex flex-col",
            "transition-all duration-300 ease-in-out",
            isMobile ? "w-full" : sidebarCollapsed ? "ml-16" : "ml-64"
          )}
          layout={shouldAnimate}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Search Interface Container */}
          <motion.div 
            className={cn(
              "flex-1 flex flex-col w-full mx-auto",
              isMobile ? "px-0 py-4 max-w-none" : "max-w-4xl px-4 py-6"
            )}
            variants={pageVariants}
            initial="initial"
            animate="animate"
          >
            {/* Unified Search Dialog */}
            <motion.div 
              className="mb-6"
              initial={shouldAnimate ? { y: 20, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            >
              <UnifiedSearchDialog />
            </motion.div>

            {/* Search Results */}
            <motion.div 
              className="flex-1"
              initial={shouldAnimate ? { y: 20, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            >
              <SearchResults />
            </motion.div>

            {/* Additional Content (if any) */}
            <AnimatePresence mode="wait">
              {children && (
                <motion.div 
                  className="mt-6"
                  initial={shouldAnimate ? { y: 20, opacity: 0 } : false}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && !sidebarCollapsed && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => useUI.getState().setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Accessibility Skip Links */}
      <div className="sr-only">
        <a href="#main-search" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded">
          Skip to search
        </a>
        <a href="#search-results" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-primary text-primary-foreground px-4 py-2 rounded">
          Skip to results
        </a>
      </div>

      {/* Sidebar Panels */}
      <RecentActivityPanel />
      <PromptManagerPanel />
      <UserPromptPanel />
      <TTSPanel />
      <FileManagerPanel />

      {/* Medical Disclaimer for Screen Readers */}
      <div className="sr-only" role="alert" aria-live="polite">
        Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions.
      </div>
    </AnimatedPage>
  )
}

// Export with default props for convenience
SearchFirstLayout.displayName = "SearchFirstLayout"

export default SearchFirstLayout