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
  /** dentro del panel inferior de mobile: sin tarjeta propia */
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
      initial={reduce ? false : { opacity: 0, x: compact ? 0 : 24, y: compact ? 12 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn(
        "flex flex-col text-card-foreground",
        !compact && "overflow-hidden rounded-2xl border bg-card shadow-float",
        className
      )}
      style={style}
    >
      <header className={cn("shrink-0", compact ? "px-4 pb-1" : "px-5 pt-5 pb-2")}>
        <h2 id="resumen-titulo" className="text-lg font-semibold tracking-tight">
          Listo, es tuyo
        </h2>
        <p className="text-[13px] text-muted-foreground">Armado a mano en Buenos Aires, sale del taller en 3 semanas.</p>
      </header>

      <ul data-scroll className={cn("min-h-0 flex-1 overflow-y-auto", compact ? "grid grid-cols-2 gap-x-3 px-4" : "px-5")}>
        {lines.map((line) => (
          <li key={line.label} className="group flex min-w-0 items-center gap-2 border-b py-2 last:border-b-0">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">{line.label}</p>
              <p className="truncate text-sm">{line.value}</p>
            </div>
            {compact ? null : (
              <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
                {line.label === "Formato" ? formatPrice(line.price) : formatDelta(line.price)}
              </span>
            )}
            <button
              type="button"
              onClick={() => edit(line.label)}
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/45"
              aria-label={`Editar ${line.label.toLowerCase()}`}
            >
              <PencilSimple className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className={cn("shrink-0", compact ? "px-4 pt-3" : "border-t px-5 pt-4 pb-5")}>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <NumberTicker value={totalPrice(config)} className="text-2xl font-semibold tracking-tight" />
        </div>
        <Button variant="primary" size="lg" className="w-full" onClick={() => setOrderOpen(true)}>
          Encargar
        </Button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={share}>
            <ShareNetwork />
            Compartir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              playLift()
              explode()
            }}
          >
            <ArrowsOutLineVertical />
            Despiezar
          </Button>
        </div>
      </div>
      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} />
    </motion.aside>
  )
}
