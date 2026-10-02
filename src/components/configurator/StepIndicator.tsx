import { Check } from "@phosphor-icons/react"

import { playLift } from "@/audio/sounds"
import { cn } from "@/lib/utils"
import { STEPS, useConfigurator } from "@/store/configurator"

export function StepIndicator({ className }: { className?: string }) {
  const placed = useConfigurator((s) => s.placed)
  const phase = useConfigurator((s) => s.phase)
  const goToStep = useConfigurator((s) => s.goToStep)

  return (
    <nav aria-label="Pasos del armado" className={className}>
      <ol className="flex items-center gap-0.5 rounded-full border bg-card p-1 shadow-soft">
        {STEPS.map((step, i) => {
          const done = i < placed
          const active = phase === "building" && i === placed
          const reachable = i <= placed
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reachable || active}
                aria-current={active ? "step" : undefined}
                aria-label={`Paso ${i + 1}, ${step.label}${done ? ": encastrada, tocá para volver a esta capa" : ""}`}
                onClick={() => {
                  if (i < placed) {
                    playLift()
                    goToStep(i)
                  }
                }}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:cursor-default",
                  active && "bg-foreground text-background",
                  done && "text-foreground hover:bg-muted",
                  !active && !done && "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full text-[11px] tabular-nums",
                    active ? "bg-background/20" : done ? "bg-muted" : "border border-input"
                  )}
                >
                  {done ? <Check weight="bold" className="size-3" /> : i + 1}
                </span>
                <span className={cn(!active && "hidden md:inline")}>{step.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
