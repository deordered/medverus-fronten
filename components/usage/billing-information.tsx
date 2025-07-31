"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  ExternalLink,
  Receipt,
  Download,
  RefreshCw
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/stores/auth-store"
import { MEDICAL_TIER_PRICING, MEDICAL_ROUTES } from "@/lib/constants/medical"
import { formatMedicalDate } from "@/lib/utils"

// Mock billing data - in real app this would come from API
const mockBillingInfo = {
  current_period: {
    start: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  },
  next_billing: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  payment_method: {
    type: 'card',
    last_four: '4242',
    brand: 'visa',
    expires: '12/25'
  },
  billing_history: [
    {
      id: 'inv_001',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 29.00,
      status: 'paid',
      period: 'March 2024',
      download_url: '#'
    },
    {
      id: 'inv_002', 
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 29.00,
      status: 'paid',
      period: 'February 2024',
      download_url: '#'
    },
    {
      id: 'inv_003',
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 29.00,
      status: 'paid', 
      period: 'January 2024',
      download_url: '#'
    }
  ]
}

export function BillingInformation() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const currentTier = user?.tier || 'free'
  const tierPricing = MEDICAL_TIER_PRICING[currentTier]

  const handleUpdatePayment = () => {
    // In real app, this would open a payment method update flow
    console.log('Update payment method')
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // In real app, this would download the actual invoice
    console.log('Download invoice:', invoiceId)
  }

  // Free tier doesn't have billing information
  if (currentTier === 'free') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Billing Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{color: '#2d2d2d'}} />
            <h3 className="font-medium">Free Plan</h3>
            <p className="text-sm text-muted-foreground">
              You're currently on the free plan. No billing information required.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Ready to upgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro or Enterprise for higher usage limits and additional features.
            </p>
            <Button asChild className="w-full">
              <Link href={MEDICAL_ROUTES.public.pricing}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Pricing Plans
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{tierPricing.name} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {tierPricing.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">
                ${tierPricing.price}
              </div>
              <div className="text-xs text-muted-foreground">
                per {tierPricing.billing}
              </div>
            </div>
          </div>

          {/* Billing Period */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Current billing period</span>
              <Badge variant="outline" style={{color: '#2d2d2d'}}>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatMedicalDate(mockBillingInfo.current_period.start, { 
                month: 'short', 
                day: 'numeric' 
              })} - {formatMedicalDate(mockBillingInfo.current_period.end, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>

          {/* Next Billing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Next billing date</span>
              <span className="font-medium">
                {formatMedicalDate(mockBillingInfo.next_billing, { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Method</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-medium">
                VISA
              </div>
              <div>
                <div className="font-medium">•••• •••• •••• {mockBillingInfo.payment_method.last_four}</div>
                <div className="text-sm text-muted-foreground">
                  Expires {mockBillingInfo.payment_method.expires}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleUpdatePayment}>
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Billing History</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockBillingInfo.billing_history.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    ${invoice.amount.toFixed(2)} - {invoice.period}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Billed on {formatMedicalDate(invoice.date, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={invoice.status === 'paid' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {invoice.status === 'paid' ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {invoice.status}
                      </>
                    )}
                  </Badge>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Notifications */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Automatic Billing</p>
              <p className="mt-1">
                Your subscription will automatically renew on {formatMedicalDate(mockBillingInfo.next_billing, { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}. 
                You'll receive an email receipt after successful payment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}