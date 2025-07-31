import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Medical tier badges
        "tier-free": "border-transparent bg-tier-free/10 text-tier-free",
        "tier-pro": "border-transparent bg-tier-pro/10 text-tier-pro",
        "tier-enterprise": "border-transparent bg-tier-enterprise/10 text-tier-enterprise",
        // Medical source badges
        "source-medverus": "border-transparent bg-source-medverus/10 text-source-medverus",
        "source-pubmed": "border-transparent bg-source-pubmed/10 text-source-pubmed",
        "source-web": "border-transparent bg-source-web/10 text-source-web",
        "source-files": "border-transparent bg-source-files/10 text-source-files",
        // Medical status badges
        "status-active": "border-transparent bg-medical-success/10 text-medical-success",
        "status-inactive": "border-transparent bg-medical-danger/10 text-medical-danger",
        "status-pending": "border-transparent bg-medical-warning/10 text-medical-warning",
        "status-processing": "border-transparent bg-medical-primary/10 text-medical-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }