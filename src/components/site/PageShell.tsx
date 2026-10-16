import { useEffect, useRef, type ReactNode } from "react"

import { useConfigurator, type View } from "@/store/configurator"

import { SiteFooter } from "./SiteFooter"

/** Vista con scroll propio (la página nunca scrollea) y el footer al final. */
export function PageShell({ view, label, children }: { view: View; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const active = useConfigurator((s) => s.view === view)

  // al entrar a la vista se arranca desde arriba
  useEffect(() => {
    if (active) ref.current?.scrollTo({ top: 0 })
  }, [active])

  return (
    <div ref={ref} data-scroll className="h-full overflow-y-auto overscroll-contain" aria-label={label}>
      {children}
      <SiteFooter />
    </div>
  )
}

export function SectionTitle({ id, title, text }: { id?: string; title: string; text?: string }) {
  return (
    <div className="mb-6 max-w-[60ch]">
      <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {text ? <p className="mt-1.5 text-sm text-muted-foreground">{text}</p> : null}
    </div>
  )
}
