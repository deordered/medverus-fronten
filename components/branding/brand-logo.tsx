"use client"

import React from "react"
import Image from "next/image"
import { getBrandLogos } from "@/lib/branding/assets"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  variant?: 'primary' | 'light' | 'dark' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  alt?: string
  priority?: boolean
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 }
}

/**
 * Brand Logo Component
 * Uses the branding assets from /public/branding/
 */
export function BrandLogo({ 
  variant = 'primary', 
  size = 'md', 
  className,
  alt = "Medverus AI",
  priority = false
}: BrandLogoProps) {
  const logos = getBrandLogos()
  const logoSrc = logos[variant]
  const { width, height } = sizeMap[size]

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image
        src={logoSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          "object-contain transition-all duration-200",
          "hover:scale-105 active:scale-95"
        )}
        style={{
          filter: variant === 'dark' ? 'none' : 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))'
        }}
      />
    </div>
  )
}

/**
 * Brand Logo with Text
 * Displays logo alongside brand text
 */
export function BrandLogoWithText({ 
  variant = 'primary',
  size = 'md',
  className,
  showText = true,
  textClassName
}: BrandLogoProps & { 
  showText?: boolean
  textClassName?: string 
}) {
  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandLogo variant={variant} size={size} />
      {showText && (
        <span className={cn(
          "font-semibold text-brand-secondary tracking-tight",
          textSizeMap[size],
          textClassName
        )}>
          Medverus AI
        </span>
      )}
    </div>
  )
}

/**
 * Responsive Brand Logo
 * Adapts to screen size automatically
 */
export function ResponsiveBrandLogo({ 
  className,
  showTextOn = 'md',
  ...props 
}: BrandLogoProps & { 
  showTextOn?: 'sm' | 'md' | 'lg' | 'xl' | 'never'
}) {
  const showTextClasses = {
    sm: 'sm:inline',
    md: 'md:inline',
    lg: 'lg:inline',
    xl: 'xl:inline',
    never: 'hidden'
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandLogo {...props} className="flex-shrink-0" />
      <span className={cn(
        "font-semibold text-brand-secondary tracking-tight text-lg hidden",
        showTextClasses[showTextOn]
      )}>
        Medverus AI
      </span>
    </div>
  )
}

/**
 * Medical Context Logo
 * Special logo treatment for medical contexts
 */
export function MedicalBrandLogo({ 
  className,
  urgent = false,
  ...props 
}: BrandLogoProps & { urgent?: boolean }) {
  return (
    <div className={cn(
      "relative",
      urgent && "animate-pulse",
      className
    )}>
      <BrandLogo {...props} />
      {urgent && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
      <span className="sr-only">
        Medverus AI Medical Platform {urgent && '- Urgent Context'}
      </span>
    </div>
  )
}

export default BrandLogo