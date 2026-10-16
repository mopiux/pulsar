import { useState } from "react"
import { InstagramLogo, TiktokLogo, YoutubeLogo } from "@phosphor-icons/react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CONTACT, LEGAL, SOCIALS, type LegalDoc } from "@/data/content"
import { useConfigurator } from "@/store/configurator"

const SOCIAL_ICON = { instagram: InstagramLogo, youtube: YoutubeLogo, tiktok: TiktokLogo } as const

export function SiteFooter() {
  const [doc, setDoc] = useState<LegalDoc | null>(null)
  const setView = useConfigurator((s) => s.setView)

  return (
    <footer className="mt-16 border-t bg-card/60">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-[17px] font-semibold tracking-tight">Pulsa</p>
          <p className="mt-2 max-w-[34ch] text-sm text-muted-foreground">
            Teclados mecánicos armados a mano en Buenos Aires, capa por capa.
          </p>
          <button
            type="button"
            onClick={() => setView("configurador")}
            className="mt-4 text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:underline"
          >
            Armá el tuyo
          </button>
        </div>

        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground">Contacto</h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            <li>{CONTACT.email}</li>
            <li>WhatsApp {CONTACT.whatsapp}</li>
            <li className="text-muted-foreground">{CONTACT.hours}</li>
            <li className="text-muted-foreground">{CONTACT.area}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground">Redes</h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            {SOCIALS.map((s) => {
              const Icon = SOCIAL_ICON[s.id]
              return (
                <li key={s.id} className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>
                    <span className="sr-only">{s.label}: </span>
                    {s.handle}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground">Legales</h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            {LEGAL.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setDoc(d)}
                  className="text-left underline-offset-4 outline-none hover:underline focus-visible:underline"
                >
                  {d.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-[1180px] px-4 py-4 text-[12px] text-muted-foreground sm:px-6">
          © 2026 Pulsa. Tienda de demostración: los productos, el equipo y las reseñas son ficticios.
        </p>
      </div>

      <Dialog open={doc !== null} onOpenChange={(open) => !open && setDoc(null)}>
        <DialogContent>
          {doc ? (
            <>
              <DialogHeader>
                <DialogTitle>{doc.title}</DialogTitle>
                <DialogDescription>Pulsa, teclados mecánicos</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 text-sm leading-relaxed">
                {doc.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </footer>
  )
}
