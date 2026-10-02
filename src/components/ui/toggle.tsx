import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Segmentos de un control en píldora: el activo sube a la superficie.
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "text-muted-foreground hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-soft",
        swatch:
          "p-0 ring-offset-2 ring-offset-card data-[state=on]:ring-2 data-[state=on]:ring-foreground",
      },
      size: {
        default: "h-8 px-3.5",
        sm: "h-7 px-3",
        swatch: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
