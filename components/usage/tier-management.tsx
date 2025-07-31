"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Crown, 
  Zap, 
  Star, 
  ExternalLink, 
  Gift,
  Check,
  ArrowUp,
  CreditCard,
  AlertTriangle
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/stores/auth-store"
import { useRedeemVoucher } from "@/lib/api/hooks"
import { MEDICAL_TIER_PRICING, MEDICAL_ROUTES } from "@/lib/constants/medical"
import { getMedicalTierInfo } from "@/lib/utils"

export function TierManagement() {
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const redeemVoucherMutation = useRedeemVoucher()

  const currentTier = user?.tier || 'free'
  const tierInfo = getMedicalTierInfo(currentTier)
  const tierPricing = MEDICAL_TIER_PRICING[currentTier]

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Invalid voucher code",
        description: "Please enter a valid voucher code",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await redeemVoucherMutation.mutateAsync({
        voucher_code: voucherCode.trim().toUpperCase()
      })

      toast({
        title: "Voucher redeemed successfully!",
        description: `Your tier has been upgraded from ${result.old_tier} to ${result.new_tier}`,
      })

      setVoucherCode("")
      setVoucherDialogOpen(false)
    } catch (error) {
      toast({
        title: "Failed to redeem voucher",
        description: error instanceof Error ? error.message : "Invalid voucher code or voucher already used",
        variant: "destructive",
      })
    }
  }

  const getNextTier = () => {
    switch (currentTier) {
      case 'free': return 'pro'
      case 'pro': return 'enterprise'
      default: return null
    }
  }

  const nextTier = getNextTier()
  const nextTierPricing = nextTier ? MEDICAL_TIER_PRICING[nextTier] : null

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            <span>Current Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tier Badge */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm">
                  {tierInfo.label}
                </Badge>
                {tierPricing.popular && (
                  <Badge className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {tierPricing.description}
              </p>
            </div>
            
            {tierPricing.price > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${tierPricing.price}
                </div>
                <div className="text-xs text-muted-foreground">
                  per {tierPricing.billing}
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Included features:</Label>
            <div className="space-y-1">
              {tierPricing.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Check className="h-3 w-3 flex-shrink-0" style={{color: '#2d2d2d'}} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Status */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span>Account Status</span>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full" style={{backgroundColor: '#2d2d2d'}}></div>
                <span style={{color: '#2d2d2d'}}>Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {nextTier && nextTierPricing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowUp className="h-5 w-5 text-blue-600" />
              <span>Upgrade Available</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{nextTierPricing.name} Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    {nextTierPricing.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    ${nextTierPricing.price}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    per {nextTierPricing.billing}
                  </div>
                </div>
              </div>

              {/* Key upgrades */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">Additional benefits:</Label>
                {nextTierPricing.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm" style={{color: '#2d2d2d'}}>
                    <Zap className="h-3 w-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="w-full">
                <Link href={MEDICAL_ROUTES.public.pricing}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade to {nextTierPricing.name}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voucher Redemption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-purple-600" />
            <span>Voucher Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Have a voucher code? Redeem it here to upgrade your tier or extend your subscription.
            </p>
            
            <Dialog open={voucherDialogOpen} onOpenChange={setVoucherDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Redeem Voucher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Redeem Voucher Code</DialogTitle>
                  <DialogDescription>
                    Enter your voucher code to upgrade your tier or extend your subscription.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voucherCode">Voucher Code</Label>
                    <Input
                      id="voucherCode"
                      placeholder="Enter your 16-character voucher code"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      maxLength={16}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Voucher codes are 16 characters long and case-insensitive
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setVoucherDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRedeemVoucher}
                    disabled={!voucherCode.trim() || redeemVoucherMutation.isPending}
                  >
                    {redeemVoucherMutation.isPending ? (
                      "Redeeming..."
                    ) : (
                      "Redeem Voucher"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Compare Plans</span>
            <Button variant="outline" size="sm" asChild>
              <Link href={MEDICAL_ROUTES.public.pricing}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Plans
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="space-y-1">
                <Badge variant="outline" className="w-full">Free</Badge>
                <div className="text-xs text-muted-foreground">$0/month</div>
              </div>
              <div className="space-y-1">
                <Badge variant="default" className="w-full">Pro</Badge>
                <div className="text-xs text-muted-foreground">$29/month</div>
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="w-full">Enterprise</Badge>
                <div className="text-xs text-muted-foreground">$99/month</div>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-4 text-center py-1 border-b">
                <span>10 queries/day</span>
                <span>100+ queries/day</span>
                <span>250+ queries/day</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center py-1 border-b">
                <span>1 file/day</span>
                <span>10 files/day</span>
                <span>25 files/day</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center py-1">
                <span>Basic support</span>
                <span>Priority support</span>
                <span>Dedicated support</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Compliance Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Enterprise Compliance</p>
              <p className="mt-1">
                Enterprise plans include additional HIPAA compliance features, 
                audit logging, and dedicated support for healthcare institutions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}