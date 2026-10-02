import { useState } from "react"
import { ArrowsOutLineVertical, PencilSimple, ShareNetwork } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"

import { playLift } from "@/audio/sounds"
import { NumberTicker } from "@/components/effects/NumberTicker"
import { OrderDialog } from "@/components/OrderDialog"
import { Button } from "@/components/ui/button"
import { formatDelta, formatPrice, priceLines, totalPrice } from "@/data/catalog"
import { useShareConfig } from "@/hooks/useShareConfig"
import { cn } from "@/lib/utils"
import { useConfigurator, type StepId, type SubId } from "@/store/configurator"

/** A qué capa y subcategoría lleva cada línea del resumen al editarla. */
const EDIT_TARGET: Record<string, { step: number; stepId: StepId; sub: SubId }> = {
  Formato: { step: 0, stepId: "carcasa", sub: "formato" },
  Carcasa: { step: 0, stepId: "carcasa", sub: "color" },
  Placa: { step: 1, stepId: "placa", sub: "placa" },
  Switches: { step: 2, stepId: "switches", sub: "switches" },
  Teclas: { step: 3, stepId: "teclas", sub: "teclas" },
  Perilla: { step: 4, stepId: "detalles", sub: "perilla" },
  Cable: { step: 4, stepId: "detalles", sub: "cable" },
  Luces: { step: 4, stepId: "detalles", sub: "luces" },
  Grabado: { step: 4, stepId: "detalles", sub: "grabado" },
}

interface SummaryPanelProps {
  className?: string
  style?: React.CSSProperties
  compact?: boolean
}

export function SummaryPanel({ className, style, compact = false }: SummaryPanelProps) {
  const config = useConfigurator((s) => s.config)
  const goToStep = useConfigurator((s) => s.goToStep)
  const setSub = useConfigurator((s) => s.setSub)
  const explode = useConfigurator((s) => s.explode)
  const share = useShareConfig()
  const reduce = useReducedMotion()
  const [orderOpen, setOrderOpen] = useState(false)
  const lines = priceLines(config)

  const edit = (label: string) => {
    const target = EDIT_TARGET[label]
    if (!target) return
    playLift()
    setSub(target.stepId, target.sub)
    goToStep(target.step)
  }

  return (
    <motion.aside
      aria-labelledby="resumen-titulo"
      initial={reduce ? false : { opacity: 0, x: compact ? 0 : 40, y: compact ? 20 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className={cn("flex flex-col bg-card text-card-foreground shadow-high", className)}
      style={style}
    >
      <header
        className={cn(
          "shrink-0 px-5",
          compact ? "sr-only" : "bg-primary pt-4 pb-3 text-primary-foreground"
        )}
      >
        <h2 id="resumen-titulo" className="font-display text-2xl font-bold uppercase">
          Tu Pulsa
        </h2>
        <p className="text-sm text-primary-foreground/80">Armado a mano, sale del taller en 3 semanas.</p>
      </header>

      <ul className={cn("flex-1 overflow-y-auto px-5 py-2", compact && "grid grid-cols-2 gap-x-3 px-4")}>
        {lines.map((line) => (
          <li key={line.label} className="group flex min-w-0 items-center gap-2 py-1">
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
                {line.label}
              </p>
              <p className="truncate text-sm text-foreground">{line.value}</p>
            </div>
            {compact ? null : (
              <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                {line.label === "Formato" ? formatPrice(line.price) : formatDelta(line.price)}
              </span>
            )}
            <button
              type="button"
              onClick={() => edit(line.label)}
              className="grid size-8 shrink-0 place-items-center text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
              aria-label={`Editar ${line.label.toLowerCase()}`}
            >
              <PencilSimple weight="bold" className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="shrink-0 border-t px-5 pt-3 pb-5">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="font-display text-sm font-bold tracking-[0.12em] uppercase">Total</span>
          <NumberTicker value={totalPrice(config)} className="font-display text-3xl font-bold text-heading" />
        </div>
        <div className="flex flex-col gap-4">
          <Button variant="ribbon" size="lg" className="w-full" onClick={() => setOrderOpen(true)}>
            Encargar
          </Button>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={share}>
              <ShareNetwork weight="bold" />
              Compartir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                playLift()
                explode()
              }}
            >
              <ArrowsOutLineVertical weight="bold" />
              Despiezar
            </Button>
          </div>
        </div>
      </div>
      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} />
    </motion.aside>
  )
}
