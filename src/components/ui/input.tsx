import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 border border-input bg-card px-3 py-1 text-base text-foreground transition-[border-color,box-shadow] outline-none selection:bg-turquesa selection:text-crema placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-turquesa-profundo focus-visible:ring-[3px] focus-visible:ring-ring/40",
        "aria-invalid:border-rojo aria-invalid:ring-rojo/25",
        className
      )}
      {...props}
    />
  )
}

export { Input }
