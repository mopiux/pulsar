import { ShareNetwork } from "@phosphor-icons/react"

import { NumberTicker } from "@/components/effects/NumberTicker"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { totalPrice } from "@/data/catalog"
import { useShareConfig } from "@/hooks/useShareConfig"
import { cn } from "@/lib/utils"
import { useConfigurator } from "@/store/configurator"

interface PriceTagProps {
  className?: string
  align?: "left" | "right"
  /** etiqueta mostaza, como la insignia del logo */
  badge?: boolean
}

export function PriceTag({ className, align = "left", badge = false }: PriceTagProps) {
  const config = useConfigurator((s) => s.config)
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "right" ? "items-end" : "items-start",
        badge && "bg-mostaza px-4 py-2 text-ciruela shadow-low",
        className
      )}
    >
      <span
        className={cn(
          "font-display text-xs font-bold tracking-[0.12em] uppercase",
          badge ? "text-ciruela/80" : "text-muted-foreground"
        )}
      >
        Total
      </span>
      <NumberTicker
        value={totalPrice(config)}
        className={cn("font-display text-2xl leading-none font-bold xl:text-3xl", badge ? "text-ciruela" : "text-heading")}
        aria-live="polite"
      />
    </div>
  )
}

/** Compartir: con etiqueta en pantallas anchas, solo ícono en las chicas. */
export function ShareButton({ className, labelFrom = "xl" }: { className?: string; labelFrom?: "xl" | "never" }) {
  const share = useShareConfig()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          onClick={share}
          aria-label="Compartir configuración"
          className={cn("bg-card", labelFrom === "never" ? "size-10 px-0" : "max-xl:size-10 max-xl:px-0", className)}
        >
          <ShareNetwork weight="bold" className="size-5" />
          {labelFrom === "xl" ? <span className="hidden xl:inline">Compartir configuración</span> : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent className={labelFrom === "xl" ? "xl:hidden" : undefined}>Compartir configuración</TooltipContent>
    </Tooltip>
  )
}

export function AssembleButton({
  onAssemble,
  assembling,
  className,
}: {
  onAssemble: () => void
  assembling: boolean
  className?: string
}) {
  return (
    <Button variant="ribbon" size="lg" onClick={onAssemble} disabled={assembling} className={className}>
      Ver terminado
    </Button>
  )
}
