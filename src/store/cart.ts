import { create } from "zustand"

import { type Config, totalPrice } from "@/data/catalog"

export interface CartItem {
  id: string
  config: Config
  /** precio unitario al momento de encargar */
  price: number
  qty: number
}

const KEY = "pulsa-carrito"

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function save(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // sin almacenamiento el carrito vive solo en esta pestaña
  }
}

const sameConfig = (a: Config, b: Config) => JSON.stringify(a) === JSON.stringify(b)

interface CartState {
  items: CartItem[]
  open: boolean
  setOpen: (open: boolean) => void
  add: (config: Config) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
}

export const MAX_QTY = 5

export const useCart = create<CartState>((set, get) => ({
  items: typeof window === "undefined" ? [] : load(),
  open: false,
  setOpen: (open) => set({ open }),
  add: (config) => {
    const items = get().items
    const existing = items.find((item) => sameConfig(item.config, config))
    const next = existing
      ? items.map((item) => (item === existing ? { ...item, qty: Math.min(MAX_QTY, item.qty + 1) } : item))
      : [...items, { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, config, price: totalPrice(config), qty: 1 }]
    save(next)
    set({ items: next, open: true })
  },
  setQty: (id, qty) => {
    const next = get().items.map((item) => (item.id === id ? { ...item, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : item))
    save(next)
    set({ items: next })
  },
  remove: (id) => {
    const next = get().items.filter((item) => item.id !== id)
    save(next)
    set({ items: next })
  },
  clear: () => {
    save([])
    set({ items: [] })
  },
}))

export const cartCount = (items: CartItem[]) => items.reduce((n, item) => n + item.qty, 0)
export const cartSubtotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.price * item.qty, 0)

/** Envío gratis desde este monto; si no, tarifa plana según zona. */
export const FREE_SHIPPING_FROM = 400000
export const SHIPPING_ZONES = [
  { id: "caba", label: "CABA (moto, 24 a 48 h)", price: 6500 },
  { id: "amba", label: "GBA (2 a 3 días hábiles)", price: 9800 },
  { id: "interior", label: "Resto del país (3 a 6 días hábiles)", price: 14500 },
  { id: "retiro", label: "Retiro en el taller (Villa Crespo)", price: 0 },
] as const
export type ShippingZone = (typeof SHIPPING_ZONES)[number]["id"]

export function shippingCost(zone: ShippingZone, subtotal: number) {
  if (zone === "retiro") return 0
  if (subtotal >= FREE_SHIPPING_FROM) return 0
  return SHIPPING_ZONES.find((z) => z.id === zone)!.price
}
