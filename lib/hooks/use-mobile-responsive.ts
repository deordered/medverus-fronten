/**
 * Mobile Responsive Hook
 * Enhanced responsive behavior for mobile devices
 */

import { useState, useEffect, useCallback } from "react"
import { useUI } from "@/lib/stores/ui-store"

export interface MobileBreakpoints {
  xs: number    // Extra small devices (phones, 480px and down)
  sm: number    // Small devices (landscape phones, 640px and down)
  md: number    // Medium devices (tablets, 768px and down)
  lg: number    // Large devices (desktops, 1024px and down)
  xl: number    // Extra large devices (large desktops, 1280px and down)
}

export interface DeviceType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  orientation: 'portrait' | 'landscape'
  touchDevice: boolean
}

const BREAKPOINTS: MobileBreakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
}

/**
 * Enhanced mobile responsive hook with device detection
 */
export function useMobileResponsive() {
  const { isMobile, setIsMobile } = useUI()
  const [deviceInfo, setDeviceInfo] = useState<DeviceType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
    orientation: 'landscape',
    touchDevice: false
  })

  const [viewport, setViewport] = useState({
    width: 1024,
    height: 768,
    availableHeight: 768
  })

  // Detect device type and capabilities
  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const availableHeight = window.screen?.availHeight || height

    // Determine screen size
    let screenSize: DeviceType['screenSize'] = 'lg'
    if (width <= BREAKPOINTS.xs) screenSize = 'xs'
    else if (width <= BREAKPOINTS.sm) screenSize = 'sm'
    else if (width <= BREAKPOINTS.md) screenSize = 'md'
    else if (width <= BREAKPOINTS.lg) screenSize = 'lg'
    else screenSize = 'xl'

    // Determine device type
    const isMobileSize = width <= BREAKPOINTS.md
    const isTabletSize = width > BREAKPOINTS.md && width <= BREAKPOINTS.lg
    const isDesktopSize = width > BREAKPOINTS.lg

    // Detect touch capability
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Detect orientation
    const orientation = width > height ? 'landscape' : 'portrait'

    // More sophisticated mobile detection
    const userAgent = navigator.userAgent.toLowerCase()
    const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword))

    const newDeviceInfo: DeviceType = {
      isMobile: isMobileSize || isMobileUA,
      isTablet: isTabletSize && !isMobileUA,
      isDesktop: isDesktopSize && !touchDevice,
      screenSize,
      orientation,
      touchDevice: touchDevice || isMobileUA
    }

    setDeviceInfo(newDeviceInfo)
    setViewport({ width, height, availableHeight })
    
    // Update UI store
    setIsMobile(newDeviceInfo.isMobile)
  }, [setIsMobile])

  // Initialize and handle resize
  useEffect(() => {
    detectDevice()

    const handleResize = () => {
      detectDevice()
    }

    const handleOrientationChange = () => {
      // Delay to allow viewport to stabilize
      setTimeout(detectDevice, 150)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [detectDevice])

  // Mobile-specific utilities
  const utils = {
    // Check if current screen size matches breakpoint
    isBreakpoint: (breakpoint: keyof MobileBreakpoints) => {
      return viewport.width <= BREAKPOINTS[breakpoint]
    },

    // Get safe area dimensions for mobile devices
    getSafeAreaHeight: () => {
      if (deviceInfo.isMobile) {
        // Account for mobile browser UI
        return Math.min(viewport.height, viewport.availableHeight - 100)
      }
      return viewport.height
    },

    // Get optimal container padding for screen size
    getContainerPadding: () => {
      if (deviceInfo.screenSize === 'xs') return 'px-3'
      if (deviceInfo.screenSize === 'sm') return 'px-4'
      if (deviceInfo.screenSize === 'md') return 'px-6'
      return 'px-8'
    },

    // Get optimal text size for screen
    getTextSize: (base: string = 'text-base') => {
      if (deviceInfo.screenSize === 'xs') return base.replace('base', 'sm')
      if (deviceInfo.screenSize === 'sm') return base
      return base
    },

    // Get optimal spacing for screen
    getSpacing: (desktop: string, mobile?: string) => {
      return deviceInfo.isMobile && mobile ? mobile : desktop
    },

    // Check if device supports hover (non-touch devices)
    supportsHover: () => {
      return !deviceInfo.touchDevice
    },

    // Get touch-optimized button size
    getTouchButtonSize: (defaultSize: string = 'h-10') => {
      if (deviceInfo.touchDevice) {
        // Ensure minimum 44px height for touch targets
        return 'h-11 min-h-[44px]'
      }
      return defaultSize
    },

    // Get mobile-optimized dialog size
    getDialogSize: () => {
      if (deviceInfo.isMobile) {
        return 'w-full h-full max-w-none max-h-none'
      }
      return 'max-w-lg max-h-[90vh]'
    }
  }

  return {
    ...deviceInfo,
    viewport,
    breakpoints: BREAKPOINTS,
    utils
  }
}

/**
 * Hook for mobile-specific viewport management
 */
export function useMobileViewport() {
  const [viewportHeight, setViewportHeight] = useState('100vh')
  const { isMobile } = useMobileResponsive()

  useEffect(() => {
    if (!isMobile) {
      setViewportHeight('100vh')
      return
    }

    const updateViewportHeight = () => {
      // Use actual viewport height to account for mobile browser UI
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      setViewportHeight('calc(var(--vh, 1vh) * 100)')
    }

    updateViewportHeight()
    
    window.addEventListener('resize', updateViewportHeight)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateViewportHeight, 150)
    })

    return () => {
      window.removeEventListener('resize', updateViewportHeight)
      window.removeEventListener('orientationchange', updateViewportHeight)
    }
  }, [isMobile])

  return { viewportHeight }
}

/**
 * Hook for mobile-optimized touch gestures
 */
export function useMobileTouchGestures() {
  const { touchDevice } = useMobileResponsive()
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!touchDevice) return
    
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }, [touchDevice])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchDevice) return
    
    const touch = e.changedTouches[0]
    setTouchEnd({ x: touch.clientX, y: touch.clientY })
  }, [touchDevice])

  const getSwipeDirection = useCallback(() => {
    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        return deltaX > 0 ? 'right' : 'left'
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        return deltaY > 0 ? 'down' : 'up'
      }
    }
    
    return null
  }, [touchStart, touchEnd])

  return {
    touchDevice,
    handleTouchStart,
    handleTouchEnd,
    getSwipeDirection,
    touchStart,
    touchEnd
  }
}

export default useMobileResponsive