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
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i < placed
          const active = phase === "building" && i === placed
          const reachable = i <= placed
          return (
            <li key={step.id} className="flex items-center">
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn("h-0.5 w-3 transition-colors sm:w-6 lg:w-8", i <= placed ? "bg-primary" : "bg-border")}
                />
              ) : null}
              <button
                type="button"
                disabled={!reachable || active}
                aria-current={active ? "step" : undefined}
                aria-label={`${i + 1}. ${step.label}${done ? ", encastrada. Tocá para despiezar desde acá" : ""}`}
                onClick={() => {
                  if (i < placed) {
                    playLift()
                    goToStep(i)
                  }
                }}
                className={cn(
                  "group flex items-center gap-2.5 px-1.5 py-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:cursor-default",
                  done && "cursor-pointer"
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center font-display text-base font-bold transition-[background-color,color,transform] duration-300",
                    active && "scale-110 bg-turquesa-profundo text-crema",
                    done && "bg-primary text-primary-foreground group-hover:bg-rojo",
                    !active && !done && "border-2 border-input bg-background text-muted-foreground"
                  )}
                >
                  {done ? <Check weight="bold" className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "font-display text-sm font-semibold tracking-wide uppercase",
                    active ? "text-heading" : "text-muted-foreground",
                    !active && "hidden md:inline"
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
