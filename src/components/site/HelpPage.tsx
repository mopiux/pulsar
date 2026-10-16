import { useId, useState, type FormEvent } from "react"
import { CheckCircle, Clock, EnvelopeSimple, MapPin, WhatsappLogo } from "@phosphor-icons/react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CONTACT, FAQS, RETURNS, SHIPPING_INFO, WARRANTY } from "@/data/content"
import { cn } from "@/lib/utils"

import { PageShell, SectionTitle } from "./PageShell"

const SECTIONS = [
  { id: "ayuda-preguntas", label: "Preguntas frecuentes" },
  { id: "ayuda-envios", label: "Envíos" },
  { id: "ayuda-garantia", label: "Garantía y devoluciones" },
  { id: "ayuda-contacto", label: "Contacto" },
]

export function HelpPage() {
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <PageShell view="ayuda" label="Ayuda">
      <div className="mx-auto max-w-[1180px] px-4 pt-8 sm:px-6 lg:pt-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ayuda</h1>
        <p className="mt-2 max-w-[56ch] text-[15px] text-muted-foreground">
          Lo que más nos preguntan, cómo enviamos y qué pasa si algo no anda. Si no está acá, escribinos.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="Secciones de ayuda" className="min-w-0 lg:sticky lg:top-4 lg:self-start">
            <ul className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goTo(s.id)}
                    className="rounded-full px-3 py-1.5 text-left text-sm whitespace-nowrap text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/45"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-14">
            <section aria-labelledby="ayuda-preguntas" className="scroll-mt-6">
              <SectionTitle id="ayuda-preguntas" title="Preguntas frecuentes" />
              <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={faq.q} value={`faq-${i}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <section aria-labelledby="ayuda-envios" className="scroll-mt-6">
              <SectionTitle
                id="ayuda-envios"
                title="Envíos"
                text="Enviamos a todo el país cuando el teclado sale del taller. Desde $ 400.000 el envío es gratis."
              />
              <dl className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
                {SHIPPING_INFO.map((item) => (
                  <div key={item.title} className="bg-card p-5">
                    <dt className="text-[15px] font-medium">{item.title}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{item.text}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="ayuda-garantia" className="scroll-mt-6">
              <SectionTitle id="ayuda-garantia" title="Garantía y devoluciones" />
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-[15px] font-medium">Garantía de 12 meses</h3>
                  <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                    {WARRANTY.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-[15px] font-medium">Devoluciones</h3>
                  <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                    {RETURNS.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="ayuda-contacto" className="scroll-mt-6">
              <SectionTitle id="ayuda-contacto" title="Contacto" text="Respondemos en el día hábil. Para elegir switch o placa, lo más rápido es WhatsApp." />
              <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
                <ContactForm />
                <ul className="flex flex-col gap-4 rounded-2xl bg-muted p-5 text-sm">
                  <li className="flex gap-3">
                    <WhatsappLogo className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-muted-foreground">WhatsApp</span>
                      {CONTACT.whatsapp}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <EnvelopeSimple className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-muted-foreground">Mail</span>
                      {CONTACT.email}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-muted-foreground">Horario</span>
                      {CONTACT.hours}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-muted-foreground">Taller</span>
                      {CONTACT.area}, con turno
                    </span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function ContactForm() {
  const id = useId()
  const [form, setForm] = useState({ name: "", email: "", topic: "consulta", message: "" })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const [sent, setSent] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (form.name.trim().length < 2) next.name = "Decinos cómo te llamás."
    if (!EMAIL.test(form.email.trim())) next.email = "Revisá el mail: te respondemos ahí."
    if (form.message.trim().length < 10) next.message = "Contanos un poco más, al menos una oración."
    setErrors(next)
    if (!Object.keys(next).length) setSent(true)
  }

  if (sent) {
    return (
      <div className="flex gap-3 rounded-2xl border bg-card p-5" role="status">
        <CheckCircle weight="fill" className="size-6 shrink-0 text-accent" />
        <div className="text-sm leading-relaxed">
          <p className="font-medium">Mensaje enviado</p>
          <p className="text-muted-foreground">
            Gracias, {form.name.trim().split(" ")[0]}. Te respondemos a {form.email.trim()} en el día hábil.
          </p>
          <button
            type="button"
            className="mt-2 text-[13px] underline-offset-4 outline-none hover:underline focus-visible:underline"
            onClick={() => {
              setForm({ name: "", email: "", topic: "consulta", message: "" })
              setSent(false)
            }}
          >
            Escribir otro mensaje
          </button>
        </div>
      </div>
    )
  }

  const err = (key: keyof typeof form) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="text-[12px] text-danger">
        {errors[key]}
      </p>
    ) : null

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-name`}>Nombre</Label>
          <Input
            id={`${id}-name`}
            value={form.name}
            autoComplete="name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
          />
          {err("name")}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-email`}>Email</Label>
          <Input
            id={`${id}-email`}
            type="email"
            value={form.email}
            autoComplete="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
          />
          {err("email")}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-topic`}>Motivo</Label>
        <select
          id={`${id}-topic`}
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          className="h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-ring/25"
        >
          <option value="consulta">Quiero elegir mi teclado</option>
          <option value="pedido">Tengo un pedido en curso</option>
          <option value="garantia">Garantía o reparación</option>
          <option value="otro">Otro tema</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-message`}>Mensaje</Label>
        <textarea
          id={`${id}-message`}
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={cn(
            "w-full resize-none rounded-xl border border-input bg-card px-3.5 py-2.5 text-base outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-ring/25 md:text-sm",
            errors.message && "border-danger"
          )}
        />
        {err("message")}
      </div>
      <Button type="submit" variant="primary" className="self-start">
        Enviar mensaje
      </Button>
    </form>
  )
}
