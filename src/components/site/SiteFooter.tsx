import { Logo } from "./Logo"

export function SiteFooter() {
  return (
    <footer className="bg-ciruela text-crema/80">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <p className="text-sm">Teclados mecánicos armados a mano en Buenos Aires.</p>
        </div>
        <p className="font-display text-sm tracking-wide uppercase">© 2026 Pulsa</p>
      </div>
    </footer>
  )
}
