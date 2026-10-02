import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Base shadcn/ui Button adaptada al Design DNA: esquinas vivas, mayúsculas
// condensadas y la cinta turquesa con subrayado mostaza a rojo de ref-1.
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 font-display font-bold tracking-wide uppercase whitespace-nowrap transition-[transform,background-color,color,box-shadow] duration-150 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/60 active:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        ribbon: "ribbon text-crema hover:-translate-y-0.5 active:translate-y-0",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-2 border-current bg-transparent text-heading hover:bg-primary hover:text-primary-foreground hover:border-primary",
        ghost: "text-current hover:bg-foreground/8",
        plus: "bg-turquesa-profundo text-crema hover:bg-turquesa-hondo",
        minus: "bg-rojo text-crema hover:bg-rojo/90",
        link: "px-0 text-current underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 text-base",
        sm: "h-8 px-3 text-sm",
        lg: "h-14 px-10 text-xl",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
