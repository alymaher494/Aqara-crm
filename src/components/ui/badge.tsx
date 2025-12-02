import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/components/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom variants for CRM
        success: "border-transparent bg-gradient-to-r from-success to-green-700 text-white",
        warning: "border-transparent bg-gradient-to-r from-warning to-amber-600 text-white",
        error: "border-transparent bg-gradient-to-r from-error to-red-700 text-white",
        // Status specific badges
        new: "border-transparent bg-status-new text-white",
        "in-progress": "border-transparent bg-status-in-progress text-white",
        completed: "border-transparent bg-status-completed text-white",
        cancelled: "border-transparent bg-status-cancelled text-white",
        pending: "border-transparent bg-status-pending text-white",
        // Property status badges
        available: "border-transparent bg-property-available text-white",
        sold: "border-transparent bg-property-sold text-white",
        reserved: "border-transparent bg-property-reserved text-white",
        construction: "border-transparent bg-property-construction text-white",
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
