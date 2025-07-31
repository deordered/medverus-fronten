/**
 * Animation Hooks
 * Custom hooks for managing animations across the Medverus AI platform
 */

import { useReducedMotion } from "framer-motion"
import { useCallback, useMemo } from "react"

/**
 * Hook to check if user prefers reduced motion
 * Automatically disables animations for accessibility
 */
export function useAnimationSafeMotion() {
  const shouldReduceMotion = useReducedMotion()
  
  return useMemo(() => ({
    shouldAnimate: !shouldReduceMotion,
    duration: shouldReduceMotion ? 0 : undefined,
    initial: shouldReduceMotion ? false : undefined
  }), [shouldReduceMotion])
}

/**
 * Hook for creating accessible animation variants
 * Automatically reduces motion when user prefers it
 */
export function useAccessibleVariants(variants: any) {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  return useMemo(() => {
    if (!shouldAnimate) {
      // Return static variants with no animation
      return Object.keys(variants).reduce((acc, key) => {
        acc[key] = {
          ...variants[key],
          transition: { duration: 0 }
        }
        return acc
      }, {} as any)
    }
    return variants
  }, [variants, shouldAnimate])
}

/**
 * Hook for managing staggered animations
 */
export function useStaggeredAnimation(
  itemCount: number,
  baseDelay: number = 0.1,
  maxDelay: number = 1
) {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  return useMemo(() => {
    if (!shouldAnimate) {
      return {
        staggerChildren: 0,
        delayChildren: 0
      }
    }
    
    const staggerDelay = Math.min(baseDelay, maxDelay / itemCount)
    
    return {
      staggerChildren: staggerDelay,
      delayChildren: baseDelay
    }
  }, [itemCount, baseDelay, maxDelay, shouldAnimate])
}

/**
 * Hook for managing search result animations
 */
export function useSearchAnimation() {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  const getResultVariants = useCallback((index: number) => {
    if (!shouldAnimate) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 }
      }
    }
    
    return {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: {
          delay: index * 0.05,
          duration: 0.3,
          ease: "easeOut"
        }
      },
      exit: { 
        opacity: 0, 
        y: -10,
        transition: {
          duration: 0.2,
          ease: "easeIn"
        }
      }
    }
  }, [shouldAnimate])
  
  return { getResultVariants }
}

/**
 * Hook for managing sidebar animations
 */
export function useSidebarAnimation(isOpen: boolean) {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  return useMemo(() => {
    if (!shouldAnimate) {
      return {
        initial: false,
        animate: isOpen ? "open" : "closed",
        transition: { duration: 0 }
      }
    }
    
    return {
      initial: "closed",
      animate: isOpen ? "open" : "closed",
      exit: "closed",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }, [isOpen, shouldAnimate])
}

/**
 * Hook for managing modal animations
 */
export function useModalAnimation(isOpen: boolean) {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  return useMemo(() => {
    if (!shouldAnimate) {
      return {
        initial: false,
        animate: "visible",
        exit: "hidden",
        transition: { duration: 0 }
      }
    }
    
    return {
      initial: "hidden",
      animate: isOpen ? "visible" : "hidden",
      exit: "hidden",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }, [isOpen, shouldAnimate])
}

/**
 * Hook for managing button press animations
 */
export function useButtonAnimation() {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  return useMemo(() => {
    if (!shouldAnimate) {
      return {
        whileHover: undefined,
        whileTap: undefined,
        transition: { duration: 0 }
      }
    }
    
    return {
      whileHover: "hover",
      whileTap: "tap",
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    }
  }, [shouldAnimate])
}

/**
 * Hook for managing card hover animations
 */
export function useCardAnimation() {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  return useMemo(() => {
    if (!shouldAnimate) {
      return {
        initial: "rest",
        whileHover: "rest",
        whileTap: "rest",
        transition: { duration: 0 }
      }
    }
    
    return {
      initial: "rest",
      whileHover: "hover",
      whileTap: "tap",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }, [shouldAnimate])
}

/**
 * Hook for managing query state animations
 */
export function useQueryAnimation(status: 'idle' | 'processing' | 'success' | 'error') {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  return useMemo(() => {
    if (!shouldAnimate) {
      return {
        animate: status,
        transition: { duration: 0 }
      }
    }
    
    return {
      animate: status,
      transition: {
        duration: status === 'processing' ? 1.5 : 0.3,
        ease: status === 'processing' ? "easeInOut" : "easeOut",
        repeat: status === 'processing' ? Infinity : 0,
        repeatType: status === 'processing' ? "reverse" as const : undefined
      }
    }
  }, [status, shouldAnimate])
}

/**
 * Hook for managing file upload animations
 */
export function useUploadAnimation(status: 'idle' | 'dragOver' | 'uploading' | 'success') {
  const { shouldAnimate } = useAnimationSafeMotion()
  
  return useMemo(() => {
    if (!shouldAnimate) {
      return {
        animate: status,
        transition: { duration: 0 }
      }
    }
    
    return {
      animate: status,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }, [status, shouldAnimate])
}