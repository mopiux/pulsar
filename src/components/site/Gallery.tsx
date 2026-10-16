import { useMemo, useState } from "react"
import { ArrowFatUp, ArrowUpRight } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import { toast } from "sonner"

import { KeyboardPreview } from "@/components/previews/KeyboardPreview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFormat, getKeycapSet, getSwitch } from "@/data/catalog"
import { COMMUNITY_BUILDS, GALLERY_FILTERS, type CommunityBuild, type GalleryFilter } from "@/data/gallery"
import { cn } from "@/lib/utils"
import { useConfigurator } from "@/store/configurator"

import { PageShell } from "./PageShell"

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
    <PageShell view="galeria" label="Galería">
      <section aria-labelledby="galeria-titulo">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as GalleryFilter)}
          className="mx-auto max-w-[1180px] gap-5 px-4 py-6 sm:px-6 lg:py-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 id="galeria-titulo" className="text-2xl font-semibold tracking-tight">
                Galería de la comunidad
              </h1>
              <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">
                Votá tus favoritos o abrí cualquiera en el configurador para hacerlo tuyo.
              </p>
            </div>
            <TabsList aria-label="Ordenar la galería">
              {GALLERY_FILTERS.map((f) => (
                <TabsTrigger key={f.id} value={f.id}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {GALLERY_FILTERS.map((f) => (
            <TabsContent key={f.id} value={f.id}>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sorted[f.id].map((build, index) => (
                  <BuildCard
                    key={build.id}
                    build={build}
                    index={index}
                    filter={f.id}
                    voted={voted.has(build.id)}
                    onVote={() => toggleVote(build.id)}
                  />
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </PageShell>
  )
}

interface BuildCardProps {
  build: CommunityBuild
  index: number
  filter: GalleryFilter
  voted: boolean
  onVote: () => void
}

function BuildCard({ build, index, filter, voted, onVote }: BuildCardProps) {
  const reduce = useReducedMotion()
  const loadConfig = useConfigurator((s) => s.loadConfig)
  const setView = useConfigurator((s) => s.setView)
  const votes = build.votes + (voted ? 1 : 0)

  const tag =
    filter === "recientes"
      ? publishedLabel(build.publishedAt)
      : filter === "tendencia"
        ? `+${build.weeklyVotes} esta semana`
        : `Puesto ${index + 1}`

  const open = () => {
    loadConfig(build.config)
    setView("configurador")
    toast.success(`Abriste “${build.name}”`, {
      description: "Está armado tal cual lo dejó su autor. Despiezalo para cambiar lo que quieras.",
    })
  }

  const specs = `${getFormat(build.config.format).name}, ${getSwitch(build.config.switches).name.toLowerCase()}, teclas ${getKeycapSet(build.config.keycaps).name}`

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 28, delay: index * 0.04 }}
      className="group flex flex-col rounded-2xl border bg-card p-3 shadow-soft"
    >
      {/* mini estudio: la misma superficie que el configurador, en chico */}
      <div className="relative grid h-[150px] place-items-center overflow-hidden rounded-xl bg-[radial-gradient(120%_100%_at_50%_20%,var(--background),var(--background-deep))] [perspective:900px]">
        <span className="absolute top-2.5 left-2.5 rounded-full bg-card/85 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {tag}
        </span>
        <div className="w-[78%] transition-transform duration-500 ease-(--ease-out-soft) [transform:rotateX(34deg)_translateY(6px)] group-hover:[transform:rotateX(26deg)_translateY(0)_scale(1.04)]">
          <KeyboardPreview config={build.config} title={`Teclado ${build.name}`} />
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 px-1 pt-3">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold tracking-tight">{build.name}</h2>
          <p className="truncate text-[13px] text-muted-foreground">
            por {build.author}, {specs}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        <motion.button
          type="button"
          onClick={onVote}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          aria-pressed={voted}
          aria-label={`${voted ? "Quitar tu voto a" : "Votar"} ${build.name}, ${votes} votos`}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium tabular-nums transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45",
            voted ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-border",
          )}
        >
          <ArrowFatUp weight={voted ? "fill" : "regular"} className="size-4" />
          {votes}
        </motion.button>
        <Button variant="secondary" size="sm" onClick={open}>
          Abrir en el configurador
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>
    </motion.li>
  )
}
