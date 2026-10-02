import { useMemo, useState } from "react"
import { ArrowFatUp, ArrowSquareOut } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import { toast } from "sonner"

import { KeyboardPreview } from "@/components/previews/KeyboardPreview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFormat, getKeycapSet, getSwitch } from "@/data/catalog"
import { COMMUNITY_BUILDS, GALLERY_FILTERS, type CommunityBuild, type GalleryFilter } from "@/data/gallery"
import { cn } from "@/lib/utils"
import { useConfigurator } from "@/store/configurator"

const VOTES_KEY = "pulsa-votos"

function loadVotes(): Set<string> {
  try {
    const raw = localStorage.getItem(VOTES_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function saveVotes(votes: Set<string>) {
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify([...votes]))
  } catch {
    // los votos quedan en memoria si el navegador bloquea el almacenamiento
  }
}

const relative = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" })

function publishedLabel(iso: string) {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)
  if (days > -1) return "Hoy"
  if (days > -30) return relative.format(days, "day")
  return relative.format(Math.round(days / 30), "month")
}

export function Gallery() {
  const [filter, setFilter] = useState<GalleryFilter>("recientes")
  const [voted, setVoted] = useState<Set<string>>(loadVotes)

  const toggleVote = (id: string) => {
    setVoted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveVotes(next)
      return next
    })
  }

  const sorted = useMemo(() => {
    const votes = (b: CommunityBuild) => b.votes + (voted.has(b.id) ? 1 : 0)
    return {
      recientes: [...COMMUNITY_BUILDS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
      tendencia: [...COMMUNITY_BUILDS].sort((a, b) => b.weeklyVotes - a.weeklyVotes),
      votados: [...COMMUNITY_BUILDS].sort((a, b) => votes(b) - votes(a)),
    } satisfies Record<GalleryFilter, CommunityBuild[]>
  }, [voted])

  return (
    <section id="galeria" aria-labelledby="galeria-titulo" className="scroll-mt-14 bg-ciruela-profundo text-crema">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 id="galeria-titulo" className="display-inline text-[clamp(3.5rem,10vw,6.5rem)] text-turquesa">
            Votá
          </h2>
          <p className="max-w-[46ch] text-lg text-crema/80">
            Teclados que armó la comunidad. Votá tus favoritos o abrí cualquiera en el configurador para hacerlo tuyo.
          </p>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as GalleryFilter)} className="mt-8 items-center">
          <TabsList aria-label="Ordenar la galería">
            {GALLERY_FILTERS.map((f) => (
              <TabsTrigger key={f.id} value={f.id} style={{ "--tab-color": f.color, "--tab-ink": f.ink }}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {GALLERY_FILTERS.map((f) => (
            <TabsContent key={f.id} value={f.id} className="mt-2 w-full">
              <ul className="grid gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
                {sorted[f.id].map((build, index) => (
                  <PosterCard
                    key={build.id}
                    build={build}
                    index={index}
                    filter={f}
                    voted={voted.has(build.id)}
                    onVote={() => toggleVote(build.id)}
                  />
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

interface PosterCardProps {
  build: CommunityBuild
  index: number
  filter: (typeof GALLERY_FILTERS)[number]
  voted: boolean
  onVote: () => void
}

function PosterCard({ build, index, filter, voted, onVote }: PosterCardProps) {
  const reduce = useReducedMotion()
  const loadConfig = useConfigurator((s) => s.loadConfig)
  const dark = build.ink === "dark"
  const votes = build.votes + (voted ? 1 : 0)

  const tag =
    filter.id === "recientes"
      ? publishedLabel(build.publishedAt)
      : filter.id === "tendencia"
        ? `+${build.weeklyVotes} esta semana`
        : `Puesto ${index + 1}`

  const open = () => {
    loadConfig(build.config)
    document.getElementById("configurador")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
    toast.success(`Abriste “${build.name}”`, {
      description: "Está armado tal cual lo dejó su autor. Despiezalo para cambiar lo que quieras.",
    })
  }

  const specs = `${getFormat(build.config.format).name}, ${getSwitch(build.config.switches).name.toLowerCase()}, teclas ${getKeycapSet(build.config.keycaps).name}`

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26, delay: index * 0.05 }}
      className={cn("group relative flex min-h-[440px] flex-col overflow-hidden", dark ? "text-ciruela-profundo" : "text-crema")}
      style={{ background: build.poster }}
    >
      <span
        className="absolute top-0 left-4 px-3 py-1.5 font-display text-xs font-bold tracking-[0.12em] uppercase"
        style={{ background: filter.color, color: filter.ink }}
      >
        {tag}
      </span>

      <div className="flex flex-col items-center px-6 pt-14 text-center">
        <h3 className="font-display text-[clamp(2rem,3.4vw,2.6rem)] leading-[0.95] font-extrabold uppercase">{build.name}</h3>
        <p className="mt-2 text-[15px] italic opacity-85">por {build.author}</p>
        <p className="mt-1 text-sm opacity-70">{specs}</p>
      </div>

      <div className="relative mt-6 px-8 [perspective:900px]">
        <div className="origin-bottom transition-transform duration-500 ease-(--ease-viaje) [transform:rotateX(38deg)] group-hover:[transform:rotateX(28deg)_translateY(-6px)_scale(1.04)]">
          <KeyboardPreview config={build.config} title={`Teclado ${build.name}`} />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 px-4 pt-6 pb-4">
        <motion.button
          type="button"
          onClick={onVote}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          aria-pressed={voted}
          aria-label={`${voted ? "Quitar tu voto a" : "Votar"} ${build.name}, ${votes} votos`}
          className={cn(
            "flex h-10 items-center gap-2 px-3 font-display text-lg font-bold tabular-nums transition-colors outline-none focus-visible:ring-[3px]",
            dark ? "focus-visible:ring-ciruela/50" : "focus-visible:ring-crema/60",
            voted
              ? dark
                ? "bg-ciruela-profundo text-mostaza"
                : "bg-crema text-ciruela"
              : dark
                ? "bg-ciruela-profundo/10 hover:bg-ciruela-profundo/20"
                : "bg-black/20 hover:bg-black/30"
          )}
        >
          <ArrowFatUp weight={voted ? "fill" : "bold"} className="size-5" />
          {votes}
        </motion.button>
        <Button
          size="sm"
          onClick={open}
          className={cn(
            "h-10",
            dark ? "bg-ciruela-profundo text-crema hover:bg-ciruela" : "bg-crema text-ciruela-profundo hover:bg-white"
          )}
        >
          <ArrowSquareOut weight="bold" className="size-4" />
          Abrir en el configurador
        </Button>
      </div>
    </motion.li>
  )
}
