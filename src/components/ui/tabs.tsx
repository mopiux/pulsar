import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Pestañas con forma de etiqueta de color pleno, como "Latest / Trending /
// Most popular" de ref-2. El color de cada pestaña llega por --tab-color.
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex w-fit flex-wrap items-end gap-1", className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  style?: React.CSSProperties & { "--tab-color"?: string; "--tab-ink"?: string }
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      style={style}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 px-4 font-display text-sm font-bold tracking-[0.08em] whitespace-nowrap uppercase outline-none",
        "bg-crema/8 text-crema/80 transition-[background-color,color,height] duration-200 hover:bg-crema/14 hover:text-crema",
        "focus-visible:ring-[3px] focus-visible:ring-crema/60",
        "data-[state=active]:h-11 data-[state=active]:bg-(--tab-color) data-[state=active]:text-(--tab-ink)",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
