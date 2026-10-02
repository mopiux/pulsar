import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3.5 text-base text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 md:text-sm",
        "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "aria-invalid:border-danger aria-invalid:ring-danger/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
