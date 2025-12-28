import * as React from "react"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface PhoneInputProps extends React.ComponentProps<typeof PhoneInput> {
    className?: string
}

const CustomPhoneInput = React.forwardRef<any, PhoneInputProps>(
    ({ className, ...props }, ref) => {
        return (
            <PhoneInput
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    "[&_.PhoneInputCountry]:mr-2 [&_.PhoneInputCountrySelect]:h-full [&_.PhoneInputCountrySelect]:w-full [&_.PhoneInputCountrySelect]:opacity-0",
                    "[&_.PhoneInputCountryIcon]:h-4 [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:shadow-sm",
                    "[&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-muted-foreground",
                    className
                )}
                {...props}
            />
        )
    }
)
CustomPhoneInput.displayName = "PhoneInput"

export { CustomPhoneInput as PhoneInput }
