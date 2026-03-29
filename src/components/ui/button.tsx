import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] hover:shadow-lg hover:-translate-y-0.5",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-xl hover:from-primary/90 hover:to-primary",
                destructive:
                    "bg-gradient-to-br from-red-500 to-red-600 text-destructive-foreground shadow-md hover:shadow-xl hover:from-red-600 hover:to-red-700",
                outline:
                    "border-2 border-input bg-background/80 backdrop-blur-sm hover:bg-accent/10 hover:text-accent-foreground hover:border-primary/30",
                secondary:
                    "bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground shadow-md hover:shadow-xl",
                ghost: "hover:bg-accent/10 hover:text-accent-foreground hover:shadow-sm",
                link: "text-primary underline-offset-4 hover:underline",
                accent: "bg-gradient-to-br from-accent to-accent/90 text-accent-foreground shadow-md hover:shadow-xl",
                glass: "glass-button text-primary hover:from-primary/10 hover:to-secondary/10",
            },
            size: {
                default: "h-11 px-6 py-2.5",
                sm: "h-9 rounded-lg px-4 text-xs",
                lg: "h-12 rounded-xl px-8 text-base font-semibold",
                xl: "h-14 rounded-xl px-10 text-base font-semibold",
                icon: "h-11 w-11 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
