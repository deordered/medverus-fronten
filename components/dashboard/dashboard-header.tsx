"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Menu,
  Shield,
  Activity,
  HelpCircle
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/stores/auth-store"
import { useUsageLimitsCheck } from "@/lib/api/hooks"
import { MEDICAL_ROUTES } from "@/lib/constants/medical"
import { getMedicalTierInfo } from "@/lib/utils"

interface DashboardHeaderProps {
  onMenuToggle?: () => void
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { isApproachingLimits, hasExceededLimits } = useUsageLimitsCheck()

  const handleLogout = async () => {
    try {
      await logout()
      router.push(MEDICAL_ROUTES.public.home)
    } catch (error) {
      console.error('Logout failed:', error)
      // Force redirect even if logout API fails
      router.push(MEDICAL_ROUTES.public.home)
    }
  }

  const userInitials = user?.email
    ?.split('@')[0]
    ?.split('.')
    ?.map(part => part[0])
    ?.join('')
    ?.toUpperCase()
    ?.slice(0, 2) || 'U'

  const tierInfo = user?.tier ? getMedicalTierInfo(user.tier) : null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Logo */}
          <Link 
            href={MEDICAL_ROUTES.protected.dashboard}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="h-8 w-8 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center shadow-sm">
              <span className="text-brand-secondary font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-foreground">Medverus AI</span>
          </Link>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center space-x-4">
          {/* Usage Warning Indicator */}
          {(isApproachingLimits || hasExceededLimits) && (
            <Link href={MEDICAL_ROUTES.protected.usage}>
              <Badge 
                variant={hasExceededLimits ? "destructive" : "secondary"}
                className="cursor-pointer hover:opacity-80"
              >
                <Activity className="h-3 w-3 mr-1" />
                {hasExceededLimits ? "Limit Exceeded" : "Approaching Limit"}
              </Badge>
            </Link>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {(isApproachingLimits || hasExceededLimits) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {hasExceededLimits && (
                <DropdownMenuItem className="text-red-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Usage limits exceeded for today
                </DropdownMenuItem>
              )}
              
              {isApproachingLimits && !hasExceededLimits && (
                <DropdownMenuItem className="text-yellow-600">
                  <Activity className="h-4 w-4 mr-2" />
                  Approaching daily usage limits
                </DropdownMenuItem>
              )}
              
              {!isApproachingLimits && !hasExceededLimits && (
                <DropdownMenuItem className="text-muted-foreground">
                  No new notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-medical-blue text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {tierInfo && (
                    <Badge variant="secondary" className="w-fit mt-1">
                      {tierInfo.label}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href={MEDICAL_ROUTES.protected.profile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href={MEDICAL_ROUTES.protected.usage}>
                  <Activity className="mr-2 h-4 w-4" />
                  <span>Usage & Billing</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href={MEDICAL_ROUTES.protected.settings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href={MEDICAL_ROUTES.public.contact}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}