import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useConfigurator } from "@/store/configurator"

import { Logo } from "./Logo"

const link =
  "font-display text-sm font-bold tracking-[0.12em] text-crema/75 uppercase transition-colors outline-none hover:text-crema focus-visible:text-crema focus-visible:ring-[3px] focus-visible:ring-crema/50 sm:text-[15px]"

export function SiteHeader() {
  const soundOn = useConfigurator((s) => s.soundOn)
  const toggleSound = useConfigurator((s) => s.toggleSound)

  return (
    <header className="sticky top-0 z-(--z-header) h-14 bg-ciruela">
      <nav aria-label="Principal" className="mx-auto grid h-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:gap-10">
        <a href="#configurador" className={`${link} justify-self-end`}>
          Armá el tuyo
        </a>
        <a href="#configurador" className="relative z-10 -mb-5 self-start pt-1.5 outline-none focus-visible:ring-[3px] focus-visible:ring-crema/50" aria-label="Pulsa, ir al configurador">
          <Logo />
        </a>
        <div className="flex items-center justify-between gap-3">
          <a href="#galeria" className={link}>
            Galería
          </a>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={soundOn}
                aria-label={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
                className="grid size-10 place-items-center text-crema/80 transition-colors outline-none hover:bg-crema/10 hover:text-crema focus-visible:ring-[3px] focus-visible:ring-crema/50"
              >
                {soundOn ? <SpeakerHigh weight="bold" className="size-5" /> : <SpeakerSlash weight="bold" className="size-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{soundOn ? "Silenciar sonidos" : "Activar sonidos"}</TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </header>
  )
}
