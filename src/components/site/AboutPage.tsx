import { ArrowUpRight, Star } from "@phosphor-icons/react"
import { toast } from "sonner"

import { KeyboardPreview } from "@/components/previews/KeyboardPreview"
import { Button } from "@/components/ui/button"
import { getCase, getFormat, getKeycapSet, getSwitch, type Config } from "@/data/catalog"
import { HISTORY, PROCESS, REVIEWS, TEAM } from "@/data/content"
import { useConfigurator } from "@/store/configurator"

import { PageShell, SectionTitle } from "./PageShell"

const studio = "bg-[radial-gradient(120%_100%_at_50%_20%,var(--background),var(--background-deep))]"

function Render({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`grid place-items-center overflow-hidden rounded-2xl ${studio} ${className ?? ""}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" width={960} height={600} className="h-full w-full object-contain p-4" />
    </div>
  )
}

function specLine(config: Config) {
  return `${getFormat(config.format).name} ${getCase(config.case).name}, ${getSwitch(config.switches).name.toLowerCase()}, teclas ${getKeycapSet(config.keycaps).name}`
}

export function AboutPage() {
  const loadConfig = useConfigurator((s) => s.loadConfig)
  const setView = useConfigurator((s) => s.setView)

  const open = (config: Config, who: string) => {
    loadConfig(config)
    setView("configurador")
    toast.success(`Abriste el teclado de ${who}`, { description: "Despiezalo para cambiar lo que quieras." })
  }

  return (
    <PageShell view="nosotros" label="Nosotros">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-16 px-4 pt-8 sm:px-6 lg:gap-20 lg:pt-12">
        {/* historia */}
        <section aria-labelledby="historia" className="grid items-center gap-8 md:grid-cols-[1fr_1.15fr]">
          <div className="max-w-[54ch]">
            <h1 id="historia" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Un taller chico en Villa Crespo
            </h1>
            {HISTORY.map((p) => (
              <p key={p} className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
          <Render src="/renders/taller.webp" alt="Pulsa 75% en aluminio Noche con teclas Río de la Plata" className="aspect-[16/10]" />
        </section>

        {/* proceso */}
        <section aria-labelledby="proceso">
          <SectionTitle id="proceso" title="Cómo armamos un Pulsa" text="De abajo hacia arriba, igual que en el configurador. Estas son las cinco capas, renderizadas con el mismo modelo." />
          <ol className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
            {PROCESS.map((step, i) => (
              <li key={step.id} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
                <Render src={step.image} alt={i === 0 ? "La carcasa sola, sin placa" : `El teclado con ${i + 1} de 5 capas encastradas`} className="aspect-[4/3]" />
                <h3 className="mt-3 text-[15px] font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* equipo */}
        <section aria-labelledby="equipo" className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionTitle id="equipo" title="Quiénes lo arman" text="Somos tres. Cada uno tiene su teclado, y sí, lo armamos nosotros." />
          </div>
          <ul className="flex flex-col divide-y rounded-2xl border bg-card">
            {TEAM.map((member) => (
              <li key={member.name} className="grid grid-cols-[112px_1fr] items-center gap-4 p-4 sm:grid-cols-[168px_1fr]">
                <Render src={member.image} alt={member.build} className="aspect-[4/3]" />
                <div>
                  <p className="text-[15px] font-semibold tracking-tight">{member.name}</p>
                  <p className="text-[13px] text-muted-foreground">{member.role}</p>
                  <p className="mt-2 text-sm leading-relaxed">{member.bio}</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">{member.build}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* reseñas */}
        <section aria-labelledby="resenas">
          <SectionTitle id="resenas" title="Lo que dicen quienes ya tipean en uno" text="Reseñas de clientes con el teclado que encargaron." />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((review) => (
              <li key={review.name} className="flex flex-col rounded-2xl border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-0.5" role="img" aria-label={`${review.rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} weight="fill" className={i < review.rating ? "size-4 text-foreground" : "size-4 text-border"} />
                  ))}
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed">“{review.text}”</p>
                <p className="mt-3 text-[13px] text-muted-foreground">
                  {review.name}, {review.city}
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-background p-2.5">
                  <div className="w-[96px] shrink-0">
                    <KeyboardPreview config={review.config} title={`Teclado de ${review.name}`} />
                  </div>
                  <p className="min-w-0 flex-1 text-[12px] leading-snug text-muted-foreground">{specLine(review.config)}</p>
                </div>
                <Button variant="secondary" size="sm" className="mt-3 self-start" onClick={() => open(review.config, review.name.split(" ")[0])}>
                  Abrir en el configurador
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  )
}
