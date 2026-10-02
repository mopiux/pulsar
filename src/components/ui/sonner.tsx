import { CheckCircle, Info, Warning, XCircle } from "@phosphor-icons/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CheckCircle weight="fill" className="size-5 text-accent" />,
        info: <Info weight="fill" className="size-5 text-muted-foreground" />,
        warning: <Warning weight="fill" className="size-5 text-muted-foreground" />,
        error: <XCircle weight="fill" className="size-5 text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "16px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
