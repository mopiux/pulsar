import { CheckCircle, Info, Warning, XCircle } from "@phosphor-icons/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CheckCircle weight="fill" className="size-5 text-turquesa" />,
        info: <Info weight="fill" className="size-5 text-mostaza" />,
        warning: <Warning weight="fill" className="size-5 text-mostaza" />,
        error: <XCircle weight="fill" className="size-5 text-rojo" />,
      }}
      toastOptions={{
        classNames: {
          toast: "font-display text-base tracking-wide",
        },
      }}
      style={
        {
          "--normal-bg": "var(--color-ciruela-profundo)",
          "--normal-text": "var(--color-crema)",
          "--normal-border": "var(--color-ciruela)",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
