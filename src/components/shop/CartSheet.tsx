import { useId, useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft, CheckCircle, Minus, Plus, Trash } from "@phosphor-icons/react"

import { KeyboardPreview } from "@/components/previews/KeyboardPreview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { configToParams, formatPrice, getCase, getFormat, getKeycapSet, getSwitch } from "@/data/catalog"
import { cn } from "@/lib/utils"
import {
  cartCount,
  cartSubtotal,
  FREE_SHIPPING_FROM,
  MAX_QTY,
  SHIPPING_ZONES,
  shippingCost,
  useCart,
  type CartItem,
  type ShippingZone,
} from "@/store/cart"
import { useConfigurator } from "@/store/configurator"

type Step = "carrito" | "envio" | "pago" | "listo"

interface Shipping {
  name: string
  email: string
  phone: string
  zone: ShippingZone
  address: string
  city: string
  zip: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function saveOrder(order: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem("pulsa-pedidos")
    const list = raw ? (JSON.parse(raw) as unknown[]) : []
    list.push(order)
    localStorage.setItem("pulsa-pedidos", JSON.stringify(list))
  } catch {
    // sin almacenamiento el pedido igual se confirma en pantalla
  }
}

export function CartSheet() {
  const open = useCart((s) => s.open)
  const setOpen = useCart((s) => s.setOpen)
  const items = useCart((s) => s.items)
  const clear = useCart((s) => s.clear)
  const [step, setStep] = useState<Step>("carrito")
  const [shipping, setShipping] = useState<Shipping>({ name: "", email: "", phone: "", zone: "caba", address: "", city: "", zip: "" })
  const [order, setOrder] = useState<{ number: string; total: number; email: string } | null>(null)

  const subtotal = cartSubtotal(items)
  const shipCost = shippingCost(shipping.zone, subtotal)
  const total = subtotal + shipCost

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    // al cerrar después de comprar, el próximo carrito arranca de cero
    if (!next && step === "listo") {
      setStep("carrito")
      setOrder(null)
    }
  }

  const titles: Record<Step, { title: string; description: string }> = {
    carrito: {
      title: "Tu carrito",
      description: items.length ? `${cartCount(items)} ${cartCount(items) === 1 ? "teclado" : "teclados"} armados a mano` : "Todavía no encargaste nada",
    },
    envio: { title: "Envío", description: "A dónde te lo mandamos" },
    pago: { title: "Pago", description: "Checkout de prueba: no se cobra nada" },
    listo: { title: "Pedido confirmado", description: "Ya tiene lugar en el taller" },
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <div className="flex items-center gap-2">
            {step === "envio" || step === "pago" ? (
              <button
                type="button"
                onClick={() => setStep(step === "pago" ? "envio" : "carrito")}
                className="-ml-1.5 grid size-8 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/45"
                aria-label="Volver"
              >
                <ArrowLeft className="size-4" />
              </button>
            ) : null}
            <SheetTitle>{titles[step].title}</SheetTitle>
          </div>
          <SheetDescription>{titles[step].description}</SheetDescription>
          {step === "envio" || step === "pago" ? <Steps step={step} /> : null}
        </SheetHeader>

        {step === "carrito" ? (
          <CartStep items={items} subtotal={subtotal} onCheckout={() => setStep("envio")} onClose={() => onOpenChange(false)} />
        ) : step === "envio" ? (
          <ShippingStep value={shipping} onChange={setShipping} subtotal={subtotal} onNext={() => setStep("pago")} />
        ) : step === "pago" ? (
          <PaymentStep
            subtotal={subtotal}
            shipCost={shipCost}
            total={total}
            onPaid={() => {
              const number = `PUL-${Date.now().toString(36).slice(-5).toUpperCase()}`
              saveOrder({
                number,
                items: items.map((i) => ({ config: configToParams(i.config).toString(), qty: i.qty, price: i.price })),
                shipping,
                total,
                createdAt: new Date().toISOString(),
              })
              setOrder({ number, total, email: shipping.email })
              clear()
              setStep("listo")
            }}
          />
        ) : order ? (
          <DoneStep order={order} name={shipping.name} onClose={() => onOpenChange(false)} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Steps({ step }: { step: Step }) {
  const list: { id: Step; label: string }[] = [
    { id: "envio", label: "Envío" },
    { id: "pago", label: "Pago" },
  ]
  return (
    <ol className="mt-2 flex gap-1.5" aria-label="Pasos de la compra">
      {list.map((s) => (
        <li
          key={s.id}
          aria-current={s.id === step ? "step" : undefined}
          className={cn("h-1 flex-1 rounded-full", s.id === step || (step === "pago" && s.id === "envio") ? "bg-foreground" : "bg-muted")}
        >
          <span className="sr-only">{s.label}</span>
        </li>
      ))}
    </ol>
  )
}

function CartStep({
  items,
  subtotal,
  onCheckout,
  onClose,
}: {
  items: CartItem[]
  subtotal: number
  onCheckout: () => void
  onClose: () => void
}) {
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const loadConfig = useConfigurator((s) => s.loadConfig)
  const setView = useConfigurator((s) => s.setView)

  if (!items.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-muted-foreground">
          Armá tu teclado capa por capa y tocá Encargar: queda guardado acá hasta que decidas pagarlo.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            setView("configurador")
            onClose()
          }}
        >
          Armar mi teclado
        </Button>
      </div>
    )
  }

  const missing = FREE_SHIPPING_FROM - subtotal

  return (
    <>
      <ul data-scroll className="min-h-0 flex-1 overflow-y-auto px-5">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 border-b py-4 last:border-b-0">
            <div className="grid h-[72px] w-[104px] shrink-0 place-items-center rounded-xl bg-background px-2">
              <KeyboardPreview config={item.config} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {getFormat(item.config.format).name} {getCase(item.config.case).name}
              </p>
              <p className="truncate text-[13px] text-muted-foreground">
                {getSwitch(item.config.switches).name}, teclas {getKeycapSet(item.config.keycaps).name}
                {item.config.engraving.trim() ? `, “${item.config.engraving.trim()}”` : ""}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center rounded-full bg-muted p-0.5" role="group" aria-label="Cantidad">
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty - 1)}
                    disabled={item.qty <= 1}
                    className="grid size-7 place-items-center rounded-full outline-none hover:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:opacity-35"
                    aria-label="Uno menos"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-[13px] font-medium tabular-nums" aria-live="polite">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty + 1)}
                    disabled={item.qty >= MAX_QTY}
                    className="grid size-7 place-items-center rounded-full outline-none hover:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:opacity-35"
                    aria-label="Uno más"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <span className="text-sm font-medium tabular-nums">{formatPrice(item.price * item.qty)}</span>
              </div>
              <div className="mt-1.5 flex gap-3 text-[12px]">
                <button
                  type="button"
                  className="text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:underline"
                  onClick={() => {
                    loadConfig(item.config)
                    setView("configurador")
                    onClose()
                  }}
                >
                  Ver en 3D
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-muted-foreground outline-none hover:text-danger focus-visible:underline"
                  onClick={() => remove(item.id)}
                >
                  <Trash className="size-3.5" />
                  Quitar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <SheetFooter>
        <Row label="Subtotal" value={formatPrice(subtotal)} strong />
        <p className="text-[12px] text-muted-foreground">
          {missing > 0
            ? `Te faltan ${formatPrice(missing)} para el envío gratis. El costo se calcula en el próximo paso.`
            : "Tenés envío gratis a todo el país."}
        </p>
        <Button variant="primary" size="lg" className="mt-1 w-full" onClick={onCheckout}>
          Finalizar compra
        </Button>
      </SheetFooter>
    </>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={cn("text-sm", strong ? "font-medium" : "text-muted-foreground")}>{label}</span>
      <span className={cn("tabular-nums", strong ? "text-lg font-semibold tracking-tight" : "text-sm")}>{value}</span>
    </div>
  )
}

function Field({ label, error, hint, children, id }: { label: string; error?: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[12px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function ShippingStep({
  value,
  onChange,
  subtotal,
  onNext,
}: {
  value: Shipping
  onChange: (v: Shipping) => void
  subtotal: number
  onNext: () => void
}) {
  const id = useId()
  const [errors, setErrors] = useState<Partial<Record<keyof Shipping, string>>>({})
  const set = <K extends keyof Shipping>(key: K, v: Shipping[K]) => onChange({ ...value, [key]: v })
  const pickup = value.zone === "retiro"

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (value.name.trim().length < 2) next.name = "Necesitamos tu nombre para el envío."
    if (!EMAIL.test(value.email.trim())) next.email = "Revisá el mail: ahí te llega el seguimiento."
    if (!pickup) {
      if (value.address.trim().length < 4) next.address = "Falta la dirección."
      if (value.city.trim().length < 2) next.city = "Falta la localidad."
      if (!/^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/.test(value.zip.trim())) next.zip = "Usá un código postal válido, por ejemplo 1414."
    }
    setErrors(next)
    if (!Object.keys(next).length) onNext()
  }

  const input = (key: keyof Shipping, props: React.ComponentProps<typeof Input> = {}) => (
    <Input
      id={`${id}-${key}`}
      value={value[key]}
      onChange={(e) => set(key, e.target.value as Shipping[typeof key])}
      aria-invalid={Boolean(errors[key])}
      aria-describedby={errors[key] ? `${id}-${key}-error` : undefined}
      {...props}
    />
  )

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div data-scroll className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
        <Field id={`${id}-name`} label="Nombre y apellido" error={errors.name}>
          {input("name", { autoComplete: "name" })}
        </Field>
        <Field id={`${id}-email`} label="Email" error={errors.email}>
          {input("email", { type: "email", autoComplete: "email", inputMode: "email" })}
        </Field>
        <Field id={`${id}-phone`} label="Teléfono (opcional)" hint="Solo para coordinar la entrega.">
          {input("phone", { type: "tel", autoComplete: "tel" })}
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium">Entrega</legend>
          {SHIPPING_ZONES.map((zone) => {
            const cost = shippingCost(zone.id, subtotal)
            return (
              <label
                key={zone.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors",
                  value.zone === zone.id ? "border-foreground" : "hover:bg-muted"
                )}
              >
                <input
                  type="radio"
                  name={`${id}-zone`}
                  value={zone.id}
                  checked={value.zone === zone.id}
                  onChange={() => set("zone", zone.id)}
                  className="accent-[var(--accent)]"
                />
                <span className="flex-1">{zone.label}</span>
                <span className="text-muted-foreground tabular-nums">{cost === 0 ? "Gratis" : formatPrice(cost)}</span>
              </label>
            )
          })}
        </fieldset>
        {pickup ? (
          <p className="rounded-xl bg-muted px-3.5 py-3 text-[13px] text-muted-foreground">
            Te avisamos por mail cuando esté listo, con la dirección del taller en Villa Crespo. Se retira de lunes a viernes de 11 a 19.
          </p>
        ) : (
          <>
            <Field id={`${id}-address`} label="Calle y número" error={errors.address}>
              {input("address", { autoComplete: "street-address" })}
            </Field>
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <Field id={`${id}-city`} label="Localidad" error={errors.city}>
                {input("city", { autoComplete: "address-level2" })}
              </Field>
              <Field id={`${id}-zip`} label="Código postal" error={errors.zip}>
                {input("zip", { autoComplete: "postal-code", inputMode: "numeric" })}
              </Field>
            </div>
          </>
        )}
      </div>
      <SheetFooter>
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Seguir al pago
        </Button>
      </SheetFooter>
    </form>
  )
}

const digits = (v: string) => v.replace(/\D/g, "")

function PaymentStep({ subtotal, shipCost, total, onPaid }: { subtotal: number; shipCost: number; total: number; onPaid: () => void }) {
  const id = useId()
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "", installments: "1" })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof card, string>>>({})
  const [paying, setPaying] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (digits(card.number).length < 15) next.number = "El número de tarjeta tiene 15 o 16 dígitos."
    if (card.holder.trim().length < 3) next.holder = "Escribí el nombre como figura en la tarjeta."
    const [mm, yy] = card.expiry.split("/")
    const month = Number(mm)
    if (!(month >= 1 && month <= 12 && /^\d{2}$/.test(yy ?? ""))) next.expiry = "Usá el formato MM/AA."
    if (!/^\d{3,4}$/.test(card.cvv)) next.cvv = "3 o 4 dígitos."
    setErrors(next)
    if (Object.keys(next).length) return
    setPaying(true)
    window.setTimeout(onPaid, 900)
  }

  const field = (key: keyof typeof card, label: string, props: React.ComponentProps<typeof Input>, format?: (v: string) => string) => (
    <Field id={`${id}-${key}`} label={label} error={errors[key]}>
      <Input
        id={`${id}-${key}`}
        value={card[key]}
        onChange={(e) => setCard({ ...card, [key]: format ? format(e.target.value) : e.target.value })}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${id}-${key}-error` : undefined}
        {...props}
      />
    </Field>
  )

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div data-scroll className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
        <p className="rounded-xl bg-muted px-3.5 py-3 text-[13px] text-muted-foreground">
          Este checkout es una demostración. Podés usar cualquier número de prueba, por ejemplo 4242 4242 4242 4242.
        </p>
        {field("number", "Número de tarjeta", { inputMode: "numeric", autoComplete: "cc-number", placeholder: "0000 0000 0000 0000" }, (v) =>
          digits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")
        )}
        {field("holder", "Nombre en la tarjeta", { autoComplete: "cc-name" })}
        <div className="grid grid-cols-2 gap-3">
          {field("expiry", "Vencimiento", { inputMode: "numeric", autoComplete: "cc-exp", placeholder: "MM/AA" }, (v) => {
            const d = digits(v).slice(0, 4)
            return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
          })}
          {field("cvv", "Código de seguridad", { inputMode: "numeric", autoComplete: "cc-csc" }, (v) => digits(v).slice(0, 4))}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-cuotas`}>Cuotas</Label>
          <select
            id={`${id}-cuotas`}
            value={card.installments}
            onChange={(e) => setCard({ ...card, installments: e.target.value })}
            className="h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-ring/25"
          >
            <option value="1">1 pago de {formatPrice(total)}</option>
            <option value="3">3 cuotas sin interés de {formatPrice(total / 3)}</option>
            <option value="6">6 cuotas sin interés de {formatPrice(total / 6)}</option>
          </select>
        </div>
      </div>
      <SheetFooter>
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Envío" value={shipCost === 0 ? "Gratis" : formatPrice(shipCost)} />
        <Row label="Total" value={formatPrice(total)} strong />
        <Button type="submit" variant="primary" size="lg" className="mt-1 w-full" disabled={paying}>
          {paying ? "Procesando…" : `Pagar ${formatPrice(total)}`}
        </Button>
      </SheetFooter>
    </form>
  )
}

function DoneStep({ order, name, onClose }: { order: { number: string; total: number; email: string }; name: string; onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-4 px-5">
      <div className="flex gap-3 rounded-2xl bg-muted p-4">
        <CheckCircle weight="fill" className="size-6 shrink-0 text-accent" />
        <div className="text-sm leading-relaxed">
          <p className="font-medium">Pedido {order.number}</p>
          <p className="text-muted-foreground">
            Gracias, {name.trim().split(" ")[0]}. Te mandamos el comprobante por {formatPrice(order.total)} a {order.email}. Lo armamos
            a mano en unas 3 semanas y te avisamos cuando salga del taller.
          </p>
        </div>
      </div>
      <Button variant="secondary" onClick={onClose}>
        Seguir mirando
      </Button>
    </div>
  )
}
