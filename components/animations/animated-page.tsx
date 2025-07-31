"use client"

import { motion } from "framer-motion"
import { pageVariants } from "@/lib/animations/motion-variants"
import { useAnimationSafeMotion } from "@/lib/animations/hooks"
import { cn } from "@/lib/utils"

interface AnimatedPageProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Animated Page Wrapper
 * Provides consistent page transition animations across the platform
 */
export function AnimatedPage({ children, className, delay = 0 }: AnimatedPageProps) {
  const { shouldAnimate } = useAnimationSafeMotion()

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn("w-full h-full", className)}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={{ delay }}
    >
      {children}
    </motion.div>
  )
}

AnimatedPage.displayName = "AnimatedPage"
export default AnimatedPage