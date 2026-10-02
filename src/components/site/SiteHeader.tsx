import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useConfigurator, type View } from "@/store/configurator"

const VIEWS: { id: View; label: string }[] = [
  { id: "configurador", label: "Armá el tuyo" },
  { id: "galeria", label: "Galería" },
]

export function SiteHeader() {
  const soundOn = useConfigurator((s) => s.soundOn)
  const toggleSound = useConfigurator((s) => s.toggleSound)
  const view = useConfigurator((s) => s.view)
  const setView = useConfigurator((s) => s.setView)
  const reduce = useReducedMotion()

  return (
    <header className="relative z-(--z-header) grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-5">
      <span className="text-[17px] font-semibold tracking-tight">Pulsa</span>

      <nav aria-label="Vistas" className="flex items-center gap-0.5 rounded-full bg-muted p-1">
        {VIEWS.map((v) => {
          const active = view === v.id
          return (
            <button
              key={v.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setView(v.id)}
              className={cn(
                "relative h-8 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="vista-activa"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                  className="absolute inset-0 rounded-full bg-card shadow-soft"
                />
              ) : null}
              <span className="relative">{v.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/45"
            >
              {soundOn ? <SpeakerHigh className="size-[18px]" /> : <SpeakerSlash className="size-[18px]" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{soundOn ? "Silenciar sonidos" : "Activar sonidos"}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
