import { useId, type ReactNode } from "react"
import { Minus, Plus, ShareNetwork, X } from "@phosphor-icons/react"

import { playLift, playSwitchDemo, playTick } from "@/audio/sounds"
import { NumberTicker } from "@/components/effects/NumberTicker"
import { TextEffect } from "@/components/effects/TextEffect"
import { OptionCarousel, type CarouselOption } from "@/components/OptionCarousel"
import { KeyboardPreview } from "@/components/previews/KeyboardPreview"
import { CableSwatch, KeycapSwatch, KnobSwatch, PlateSwatch, SwitchSwatch } from "@/components/previews/OptionPreviews"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CABLES,
  CASES,
  ENGRAVING_MAX,
  ENGRAVING_PRICE,
  FORMATS,
  KEYCAP_SETS,
  KNOBS,
  PLATES,
  RGB_MODES,
  RGB_PRESETS,
  SWITCHES,
  formatDelta,
  formatPrice,
  getCase,
  totalPrice,
  type Config,
} from "@/data/catalog"
import { useShareConfig } from "@/hooks/useShareConfig"
import { cn } from "@/lib/utils"
import { activeStepIndex, STEPS, useConfigurator, type SubId } from "@/store/configurator"

interface CarouselSpec {
  options: CarouselOption[]
  value: string
  onChange: (id: string) => void
  label: string
}

const previewClass = "h-full w-auto max-w-full"

function useCarouselSpec(sub: SubId, config: Config): CarouselSpec | null {
  const setOption = useConfigurator((s) => s.setOption)
  const triggerDemoPress = useConfigurator((s) => s.triggerDemoPress)

  const change = <K extends keyof Config>(key: K) => (id: string) => {
    playTick()
    setOption(key, id as Config[K])
  }

  switch (sub) {
    case "formato":
      return {
        label: "Formato",
        value: config.format,
        onChange: change("format"),
        options: FORMATS.map((o) => ({
          id: o.id,
          name: o.name,
          price: formatPrice(o.price),
          preview: <KeyboardPreview config={{ ...config, format: o.id, rgbMode: "apagada" }} className={previewClass} />,
        })),
      }
    case "color":
      return {
        label: "Color de la carcasa",
        value: config.case,
        onChange: change("case"),
        options: CASES.map((o) => ({
          id: o.id,
          name: o.name,
          price: formatDelta(o.price),
          preview: <KeyboardPreview config={{ ...config, case: o.id, rgbMode: "apagada" }} className={previewClass} />,
        })),
      }
    case "placa":
      return {
        label: "Material de la placa",
        value: config.plate,
        onChange: change("plate"),
        options: PLATES.map((o) => ({ id: o.id, name: o.name, price: formatDelta(o.price), preview: <PlateSwatch plate={o} /> })),
      }
    case "switches":
      return {
        label: "Tipo de switch",
        value: config.switches,
        onChange: (id) => {
          setOption("switches", id as Config["switches"])
          playSwitchDemo(id as Config["switches"])
          triggerDemoPress()
        },
        options: SWITCHES.map((o) => ({ id: o.id, name: o.name, price: formatPrice(o.price), preview: <SwitchSwatch option={o} /> })),
      }
    case "teclas":
      return {
        label: "Juego de teclas",
        value: config.keycaps,
        onChange: change("keycaps"),
        options: KEYCAP_SETS.map((o) => ({ id: o.id, name: o.name, price: formatPrice(o.price), preview: <KeycapSwatch set={o} /> })),
      }
    case "perilla":
      return {
        label: "Perilla de volumen",
        value: config.knob,
        onChange: change("knob"),
        options: KNOBS.map((o) => ({
          id: o.id,
          name: o.name,
          price: formatDelta(o.price),
          preview: <KnobSwatch option={o} color={o.id === "ninguna" ? null : (o.color ?? getCase(config.case).color)} />,
        })),
      }
    case "cable":
      return {
        label: "Cable en espiral",
        value: config.cable,
        onChange: change("cable"),
        options: CABLES.map((o) => ({ id: o.id, name: o.name, price: formatPrice(o.price), preview: <CableSwatch option={o} /> })),
      }
    case "luces":
      return {
        label: "Retroiluminación",
        value: config.rgbMode,
        onChange: change("rgbMode"),
        options: RGB_MODES.map((o) => ({
          id: o.id,
          name: o.name,
          price: formatDelta(o.price),
          preview: <KeyboardPreview config={{ ...config, rgbMode: o.id }} className={previewClass} />,
        })),
      }
    default:
      return null
  }
}

/** Detalle de la opción elegida, para no repetirlo debajo de cada muestra. */
function selectedDetail(sub: SubId, config: Config): string {
  const find = <T extends { id: string; detail: string }>(list: T[], id: string) => list.find((o) => o.id === id)?.detail ?? ""
  switch (sub) {
    case "formato":
      return find(FORMATS, config.format)
    case "color":
      return find(CASES, config.case)
    case "placa":
      return find(PLATES, config.plate)
    case "switches":
      return find(SWITCHES, config.switches)
    case "teclas":
      return find(KEYCAP_SETS, config.keycaps)
    case "perilla":
      return find(KNOBS, config.knob)
    case "cable":
      return find(CABLES, config.cable)
    case "luces":
      return find(RGB_MODES, config.rgbMode)
    default:
      return ""
  }
}

export function PriceTag({ className }: { className?: string }) {
  const config = useConfigurator((s) => s.config)
  return (
    <div className={cn("flex flex-col items-end leading-none", className)}>
      <span className="text-[11px] text-muted-foreground">Total</span>
      <NumberTicker value={totalPrice(config)} className="mt-1 text-lg font-semibold tracking-tight" aria-live="polite" />
    </div>
  )
}

export function ShareButton({ className }: { className?: string }) {
  const share = useShareConfig()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={share} aria-label="Compartir configuración" className={className}>
          <ShareNetwork weight="bold" className="size-[18px]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Compartir configuración</TooltipContent>
    </Tooltip>
  )
}

interface ConfiguratorPanelProps {
  variant: "desktop" | "mobile"
  onAssemble: () => void
  assembling: boolean
  className?: string
}

/**
 * Panel de la capa activa: arriba qué se está eligiendo y el precio; al
 * medio el carrusel de opciones flanqueado por quitar (−) y encastrar (+).
 */
export function ConfiguratorPanel({ variant, onAssemble, assembling, className }: ConfiguratorPanelProps) {
  const config = useConfigurator((s) => s.config)
  const placed = useConfigurator((s) => s.placed)
  const place = useConfigurator((s) => s.place)
  const remove = useConfigurator((s) => s.remove)
  const setSub = useConfigurator((s) => s.setSub)
  const step = STEPS[activeStepIndex(placed)]
  const sub = useConfigurator((s) => s.sub[step.id])
  const spec = useCarouselSpec(sub, config)
  const mobile = variant === "mobile"

  let content: ReactNode
  if (sub === "grabado") content = <EngravingField />
  else if (spec) {
    content = (
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0 flex-1">
          <OptionCarousel key={sub} {...spec} />
        </div>
        {sub === "luces" && config.rgbMode !== "apagada" ? <ColorPicker /> : null}
      </div>
    )
  }

  const removable = placed > 0
  const detail = sub === "grabado" ? `Suma ${formatPrice(ENGRAVING_PRICE)}` : selectedDetail(sub, config)

  const tabs =
    step.subs.length > 1 ? (
      <ToggleGroup
        type="single"
        size="sm"
        value={sub}
        onValueChange={(next) => next && setSub(step.id, next as SubId)}
        aria-label={`Partes de ${step.label.toLowerCase()}`}
        className="max-w-full shrink-0 overflow-x-auto no-scrollbar"
      >
        {step.subs.map((s) => (
          <ToggleGroupItem key={s.id} value={s.id}>
            {s.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    ) : null

  const minus = (
    <Button
      variant="secondary"
      size="icon"
      disabled={!removable}
      onClick={() => {
        playLift()
        remove()
      }}
      aria-label={removable ? `Quitar ${STEPS[placed - 1].label.toLowerCase()}` : "No hay capas para quitar"}
    >
      <Minus weight="bold" />
    </Button>
  )

  const plus = (
    <Button
      variant="primary"
      size={mobile ? "default" : "lg"}
      onClick={() => place()}
      aria-label={`Encastrar ${step.label.toLowerCase()} sobre la capa anterior`}
      className={mobile ? "flex-1" : "px-5"}
    >
      <Plus weight="bold" />
      Encastrar
    </Button>
  )

  const heading = (
    <div className="min-w-0">
      <TextEffect as="h2" id={`${step.id}`} className="text-[15px] leading-tight font-semibold tracking-tight sm:text-base">
        {step.title}
      </TextEffect>
      <p className="truncate text-[13px] text-muted-foreground">{detail}</p>
    </div>
  )

  if (mobile) {
    return (
      <div className={cn("flex flex-col gap-2.5", className)}>
        <div className="flex items-start justify-between gap-2 px-4">
          {heading}
          <div className="flex shrink-0 items-center gap-1">
            <ShareButton className="-my-1" />
            <PriceTag />
          </div>
        </div>
        {tabs ? <div className="flex justify-center px-4">{tabs}</div> : null}
        <div className="px-2">{content}</div>
        <div className="flex items-center gap-2 px-4">
          {minus}
          {plus}
          <Button variant="quiet" onClick={onAssemble} disabled={assembling}>
            Ver terminado
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full rounded-2xl border bg-card shadow-float", className)}>
      <div className="flex items-center gap-4 px-5 pt-3.5">
        <div className="min-w-0 flex-1">{heading}</div>
        {tabs}
        <div className="flex flex-1 items-center justify-end gap-1.5">
          <PriceTag className="mr-2" />
          <ShareButton />
          <Button variant="quiet" size="sm" onClick={onAssemble} disabled={assembling}>
            Ver terminado
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 pt-1 pb-3.5">
        {minus}
        <div className="min-w-0 flex-1">{content}</div>
        {plus}
      </div>
    </div>
  )
}

function ColorPicker() {
  const color = useConfigurator((s) => s.config.rgbColor)
  const setOption = useConfigurator((s) => s.setOption)
  const preset = RGB_PRESETS.find((p) => p.hex === color)
  const inputId = useId()

  return (
    <div className="flex shrink-0 flex-col items-center gap-2 pr-1">
      <span className="text-[12px] text-muted-foreground">Color</span>
      <ToggleGroup
        type="single"
        variant="swatch"
        size="swatch"
        value={preset?.hex ?? ""}
        onValueChange={(next) => next && setOption("rgbColor", next)}
        aria-label="Color de la retroiluminación"
        className="grid grid-cols-3 gap-2"
      >
        {RGB_PRESETS.map((p) => (
          <ToggleGroupItem key={p.hex} value={p.hex} aria-label={p.name} title={p.name} style={{ background: p.hex }} />
        ))}
        <label
          htmlFor={inputId}
          title="Otro color"
          className={cn(
            "relative size-6 cursor-pointer rounded-full ring-offset-2 ring-offset-card",
            !preset && "ring-2 ring-foreground"
          )}
          style={{ background: preset ? "conic-gradient(#ff5f5f, #ffd25f, #5fff8a, #5fd2ff, #a35fff, #ff5f5f)" : color }}
        >
          <span className="sr-only">Otro color</span>
          <input
            id={inputId}
            type="color"
            value={color}
            onChange={(e) => setOption("rgbColor", e.target.value)}
            className="sr-only"
          />
        </label>
      </ToggleGroup>
    </div>
  )
}

function EngravingField() {
  const engraving = useConfigurator((s) => s.config.engraving)
  const setOption = useConfigurator((s) => s.setOption)
  const id = useId()
  const helpId = `${id}-ayuda`

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-2 py-3">
      <Label htmlFor={id}>Texto para la barra espaciadora</Label>
      <div className="relative">
        <Input
          id={id}
          value={engraving}
          maxLength={ENGRAVING_MAX}
          autoComplete="off"
          spellCheck={false}
          placeholder="Ej.: Hecho en BA"
          aria-describedby={helpId}
          onChange={(e) => setOption("engraving", e.target.value)}
          className="pr-20"
        />
        <span className="pointer-events-none absolute top-1/2 right-11 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
          {engraving.length}/{ENGRAVING_MAX}
        </span>
        {engraving ? (
          <button
            type="button"
            onClick={() => setOption("engraving", "")}
            className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/45"
            aria-label="Borrar grabado"
          >
            <X weight="bold" className="size-4" />
          </button>
        ) : null}
      </div>
      <p id={helpId} className="text-[13px] text-muted-foreground">
        Se graba con láser y lo ves en el modelo mientras escribís.
      </p>
    </div>
  )
}
