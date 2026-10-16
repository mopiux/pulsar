import { CaretDown, ShoppingBag, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import { DropdownMenu } from "radix-ui"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { cartCount, useCart } from "@/store/cart"
import { useConfigurator, type View } from "@/store/configurator"

const NAV: { id: View; label: string }[] = [
  { id: "configurador", label: "Armá el tuyo" },
  { id: "galeria", label: "Galería" },
  { id: "nosotros", label: "Nosotros" },
  { id: "ayuda", label: "Ayuda" },
]

const iconButton =
  "relative grid size-9 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/45"

export function SiteHeader() {
  const soundOn = useConfigurator((s) => s.soundOn)
  const toggleSound = useConfigurator((s) => s.toggleSound)
  const view = useConfigurator((s) => s.view)
  const setView = useConfigurator((s) => s.setView)
  const count = useCart((s) => cartCount(s.items))
  const openCart = useCart((s) => s.setOpen)
  const wide = useMediaQuery("(min-width: 768px)")
  const reduce = useReducedMotion()

  return (
    <header className="relative z-(--z-header) grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-5">
      <button
        type="button"
        onClick={() => setView("configurador")}
        className="justify-self-start rounded-md text-[17px] font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45"
      >
        Pulsa
      </button>

      {wide ? (
        <nav aria-label="Secciones" className="flex items-center gap-0.5 rounded-full bg-muted p-1">
          {NAV.map((v) => {
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
      ) : (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            className="flex h-9 items-center gap-1.5 rounded-full bg-muted px-3.5 text-[13px] font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45"
            aria-label={`Sección: ${NAV.find((n) => n.id === view)?.label}. Cambiar de sección`}
          >
            {NAV.find((n) => n.id === view)?.label}
            <CaretDown className="size-3.5 text-muted-foreground" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={6}
              align="center"
              className="z-(--z-tooltip) min-w-[200px] rounded-2xl border bg-card p-1.5 shadow-float data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
            >
              {NAV.map((v) => (
                <DropdownMenu.Item
                  key={v.id}
                  onSelect={() => setView(v.id)}
                  className={cn(
                    "flex h-10 cursor-pointer items-center rounded-xl px-3 text-sm outline-none data-highlighted:bg-muted",
                    view === v.id ? "font-medium" : "text-muted-foreground"
                  )}
                >
                  {v.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}

      <div className="flex items-center justify-end gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
              className={iconButton}
            >
              {soundOn ? <SpeakerHigh className="size-[18px]" /> : <SpeakerSlash className="size-[18px]" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{soundOn ? "Silenciar sonidos" : "Activar sonidos"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => openCart(true)}
              aria-label={count ? `Carrito, ${count} ${count === 1 ? "teclado" : "teclados"}` : "Carrito vacío"}
              className={iconButton}
            >
              <ShoppingBag className="size-[18px]" />
              {count ? (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground tabular-nums">
                  {count}
                </span>
              ) : null}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Carrito</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
