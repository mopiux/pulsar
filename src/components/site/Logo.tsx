import { cn } from "@/lib/utils"

/** Insignia circular mostaza con cinta ciruela, como el sello de ref-1. */
export function Logo({ className, size = "lg" }: { className?: string; size?: "lg" | "sm" }) {
  const big = size === "lg"
  return (
    <span
      className={cn(
        "relative grid place-items-center rounded-full bg-mostaza shadow-medium",
        big ? "size-[68px]" : "size-9",
        className
      )}
      aria-hidden="true"
    >
      <span className={cn("absolute rounded-full border-2 border-ciruela/25", big ? "inset-1.5" : "inset-1")} />
      <span
        className={cn(
          "relative bg-ciruela font-display font-extrabold tracking-[0.14em] text-crema uppercase",
          big ? "px-3 py-0.5 text-[15px]" : "px-1 text-[9px]"
        )}
        style={{ clipPath: "polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%)" }}
      >
        Pulsa
      </span>
    </span>
  )
}
