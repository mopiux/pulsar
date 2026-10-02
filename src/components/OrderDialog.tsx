import { useId, useState, type FormEvent } from "react"
import { CheckCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { configToParams, formatPrice, priceLines, totalPrice } from "@/data/catalog"
import { useConfigurator } from "@/store/configurator"

interface OrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Errors {
  name?: string
  email?: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function saveOrder(order: Record<string, string>) {
  try {
    const raw = localStorage.getItem("pulsa-pedidos")
    const list = raw ? (JSON.parse(raw) as unknown[]) : []
    list.push(order)
    localStorage.setItem("pulsa-pedidos", JSON.stringify(list))
  } catch {
    // sin almacenamiento disponible el pedido igual se confirma en pantalla
  }
}

export function OrderDialog({ open, onOpenChange }: OrderDialogProps) {
  const config = useConfigurator((s) => s.config)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const id = useId()
  const total = totalPrice(config)
  const summary = priceLines(config)
    .slice(0, 5)
    .map((l) => l.value.split(",")[0])
    .join(" / ")

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: Errors = {}
    if (name.trim().length < 2) next.name = "Decinos tu nombre para saber a quién le armamos el teclado."
    if (!EMAIL.test(email.trim())) next.email = "Revisá el mail: ahí te mandamos el pago y el seguimiento."
    setErrors(next)
    if (next.name || next.email) return
    const number = `PUL-${Date.now().toString(36).slice(-5).toUpperCase()}`
    saveOrder({
      number,
      name: name.trim(),
      email: email.trim(),
      notes: notes.trim(),
      config: configToParams(config).toString(),
      total: String(total),
      createdAt: new Date().toISOString(),
    })
    setOrderNumber(number)
  }

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setOrderNumber(null)
      setErrors({})
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {orderNumber ? (
          <>
            <DialogHeader>
              <DialogTitle>Pedido {orderNumber}</DialogTitle>
              <DialogDescription>Tu teclado ya tiene lugar en el taller.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <CheckCircle weight="fill" className="mt-0.5 size-7 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed">
                Gracias, {name.trim().split(" ")[0]}. Te escribimos a <strong>{email.trim()}</strong> con el link de
                pago por {formatPrice(total)} y la fecha de entrega. Lo armamos a mano en unas 3 semanas.
              </p>
            </div>
            <DialogFooter>
              <Button variant="primary" onClick={() => handleOpenChange(false)}>
                Listo
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit} noValidate className="contents">
            <DialogHeader>
              <DialogTitle>Encargar tu Pulsa</DialogTitle>
              <DialogDescription>
                {summary}. Total {formatPrice(total)}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-nombre`}>Nombre y apellido</Label>
                <Input
                  id={`${id}-nombre`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${id}-nombre-error` : undefined}
                />
                {errors.name ? (
                  <p id={`${id}-nombre-error`} className="text-sm text-danger">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-email`}>Email</Label>
                <Input
                  id={`${id}-email`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? `${id}-email-error` : `${id}-email-ayuda`}
                />
                {errors.email ? (
                  <p id={`${id}-email-error`} className="text-sm text-danger">
                    {errors.email}
                  </p>
                ) : (
                  <p id={`${id}-email-ayuda`} className="text-sm text-muted-foreground">
                    Ahí te llegan el link de pago y el seguimiento.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-notas`}>Algo que tengamos que saber (opcional)</Label>
                <textarea
                  id={`${id}-notas`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-ring/25 md:text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Seguir editando
              </Button>
              <Button type="submit" variant="primary">
                Confirmar pedido
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
