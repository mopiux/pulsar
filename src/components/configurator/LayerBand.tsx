import { useId, type ReactNode } from "react"
import { List, Minus, Plus, X } from "@phosphor-icons/react"

import { playLift, playSwitchDemo, playTick } from "@/audio/sounds"
import { OptionCarousel, type CarouselOption } from "@/components/OptionCarousel"
import { KeyboardPreview } from "@/components/previews/KeyboardPreview"
import {
  CableSwatch,
  KeycapSwatch,
  KnobSwatch,
  PlateSwatch,
  SwitchSwatch,
} from "@/components/previews/OptionPreviews"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
  type Config,
} from "@/data/catalog"
import { cn } from "@/lib/utils"
import { activeStepIndex, STEPS, useConfigurator, type SubId } from "@/store/configurator"

import { AssembleButton, PriceTag, ShareButton } from "./CtaRow"

interface CarouselSpec {
  options: CarouselOption[]
  value: string
  onChange: (id: string) => void
  label: string
}

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
          detail: o.detail,
          price: formatPrice(o.price),
          preview: <KeyboardPreview config={{ ...config, format: o.id, rgbMode: "apagada" }} className="max-h-full w-auto max-w-full" />,
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
          detail: o.detail,
          price: formatDelta(o.price),
          preview: <KeyboardPreview config={{ ...config, case: o.id, rgbMode: "apagada" }} className="max-h-full w-auto max-w-full" />,
        })),
      }
    case "placa":
      return {
        label: "Material de la placa",
        value: config.plate,
        onChange: change("plate"),
        options: PLATES.map((o) => ({
          id: o.id,
          name: o.name,
          detail: o.detail,
          price: formatDelta(o.price),
          preview: <PlateSwatch plate={o} />,
        })),
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
        options: SWITCHES.map((o) => ({
          id: o.id,
          name: o.name,
          detail: o.detail,
          price: formatPrice(o.price),
          preview: <SwitchSwatch option={o} />,
        })),
      }
    case "teclas":
      return {
        label: "Juego de teclas",
        value: config.keycaps,
        onChange: change("keycaps"),
        options: KEYCAP_SETS.map((o) => ({
          id: o.id,
          name: o.name,
          detail: o.detail,
          price: formatPrice(o.price),
          preview: <KeycapSwatch set={o} />,
        })),
      }
    case "perilla":
      return {
        label: "Perilla de volumen",
        value: config.knob,
        onChange: change("knob"),
        options: KNOBS.map((o) => ({
          id: o.id,
          name: o.name,
          detail: o.detail,
          price: formatDelta(o.price),
          preview: <KnobSwatch option={o} color={o.id === "ninguna" ? null : (o.color ?? getCase(config.case).color)} />,
        })),
      }
    case "cable":
      return {
        label: "Cable en espiral",
        value: config.cable,
        onChange: change("cable"),
        options: CABLES.map((o) => ({
          id: o.id,
          name: o.name,
          detail: o.detail,
          price: formatPrice(o.price),
          preview: <CableSwatch option={o} />,
        })),
      }
    case "luces":
      return {
        label: "Retroiluminación",
        value: config.rgbMode,
        onChange: change("rgbMode"),
        options: RGB_MODES.map((o) => ({
          id: o.id,
          name: o.name,
          detail: o.detail,
          price: formatDelta(o.price),
          preview: <KeyboardPreview config={{ ...config, rgbMode: o.id }} className="max-h-full w-auto max-w-full" />,
        })),
      }
    default:
      return null
  }
}

interface LayerBandProps {
  variant: "desktop" | "mobile"
  onAssemble: () => void
  assembling: boolean
  className?: string
}

/**
 * Banda de opciones de la capa activa, como la de ingredientes de ref-1:
 * arriba las acciones (+ encastrar / - quitar), al medio el carrusel y la
 * cinta para ver el teclado terminado montada sobre el borde inferior.
 */
export function LayerBand({ variant, onAssemble, assembling, className }: LayerBandProps) {
  const config = useConfigurator((s) => s.config)
  const placed = useConfigurator((s) => s.placed)
  const place = useConfigurator((s) => s.place)
  const remove = useConfigurator((s) => s.remove)
  const setSub = useConfigurator((s) => s.setSub)
  const step = STEPS[activeStepIndex(placed)]
  const sub = useConfigurator((s) => s.sub[step.id])
  const spec = useCarouselSpec(sub, config)

  let content: ReactNode
  if (sub === "grabado") content = <EngravingField />
  else if (spec) {
    content = (
      <>
        <OptionCarousel key={sub} {...spec} />
        {sub === "luces" && config.rgbMode !== "apagada" ? <ColorRow /> : null}
      </>
    )
  }

  const removable = placed > 0

  const tabs =
    step.subs.length > 1 ? (
      <ToggleGroup
        type="single"
        value={sub}
        onValueChange={(next) => next && setSub(step.id, next as SubId)}
        aria-label={`Partes de ${step.label.toLowerCase()}`}
        className="max-w-full overflow-x-auto bg-muted no-scrollbar"
      >
        <span aria-hidden="true" className="grid h-10 w-9 shrink-0 place-items-center text-muted-foreground">
          <List weight="bold" className="size-4" />
        </span>
        {step.subs.map((s) => (
          <ToggleGroupItem key={s.id} value={s.id} className="px-3">
            {s.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    ) : null

  const plus = (
    <Button
      variant="plus"
      onClick={() => place()}
      aria-label={`Encastrar ${step.label.toLowerCase()} sobre la capa anterior`}
    >
      <Plus weight="bold" />
      Encastrar
    </Button>
  )

  const minus = (
    <Button
      variant="minus"
      disabled={!removable}
      onClick={() => {
        playLift()
        remove()
      }}
      aria-label={removable ? `Quitar ${STEPS[placed - 1].label.toLowerCase()}` : "No hay capas para quitar"}
    >
      <Minus weight="bold" />
      Quitar
    </Button>
  )

  if (variant === "mobile") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {tabs ? <div className="flex justify-center px-4">{tabs}</div> : null}
        <div className="bg-band shadow-(--band-shadow)">{content}</div>
        <div className="grid grid-cols-2 gap-2 px-4">
          {minus}
          {plus}
        </div>
        <div className="flex items-center justify-center gap-3 px-4 pt-1">
          <AssembleButton onAssemble={onAssemble} assembling={assembling} className="flex-1" />
          <ShareButton labelFrom="never" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 px-6 pb-3">
        <PriceTag badge className="justify-self-start" />
        <div className="flex items-center gap-2">
          {tabs}
          {plus}
          {minus}
        </div>
        <ShareButton className="justify-self-end" />
      </div>
      <div className="relative bg-band pb-7 shadow-(--band-shadow)">
        {content}
        <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
          <AssembleButton onAssemble={onAssemble} assembling={assembling} />
        </div>
      </div>
    </div>
  )
}

function ColorRow() {
  const color = useConfigurator((s) => s.config.rgbColor)
  const setOption = useConfigurator((s) => s.setOption)
  const preset = RGB_PRESETS.find((p) => p.hex === color)
  const inputId = useId()

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 pb-2">
      <span className="font-display text-sm font-bold tracking-wide text-foreground uppercase">Color</span>
      <ToggleGroup
        type="single"
        variant="swatch"
        size="swatch"
        value={preset?.hex ?? ""}
        onValueChange={(next) => next && setOption("rgbColor", next)}
        aria-label="Color de la retroiluminación"
        className="gap-2.5"
      >
        {RGB_PRESETS.map((p) => (
          <ToggleGroupItem key={p.hex} value={p.hex} aria-label={p.name} title={p.name} style={{ background: p.hex }} />
        ))}
      </ToggleGroup>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center gap-2 font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase hover:text-foreground"
      >
        <span
          className={cn("size-7 rounded-full ring-offset-2 ring-offset-card", !preset && "ring-2 ring-foreground")}
          style={{ background: color }}
        />
        Otro
        <input
          id={inputId}
          type="color"
          value={color}
          onChange={(e) => setOption("rgbColor", e.target.value)}
          className="sr-only"
        />
      </label>
    </div>
  )
}

function EngravingField() {
  const engraving = useConfigurator((s) => s.config.engraving)
  const setOption = useConfigurator((s) => s.setOption)
  const id = useId()
  const helpId = `${id}-ayuda`

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-4 py-4">
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
          className="pr-20 font-display text-lg tracking-wide uppercase"
        />
        <span className="pointer-events-none absolute top-1/2 right-11 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
          {engraving.length}/{ENGRAVING_MAX}
        </span>
        {engraving ? (
          <button
            type="button"
            onClick={() => setOption("engraving", "")}
            className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
            aria-label="Borrar grabado"
          >
            <X weight="bold" className="size-4" />
          </button>
        ) : null}
      </div>
      <p id={helpId} className="text-sm text-muted-foreground">
        Se graba con láser en la barra y lo ves en el modelo mientras escribís. Suma {formatPrice(ENGRAVING_PRICE)}.
      </p>
    </div>
  )
}
