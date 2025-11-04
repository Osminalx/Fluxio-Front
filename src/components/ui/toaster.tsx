"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:border-l-4 group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80 group-[.toast]:rounded-md",
          // Success toast - green border styled via CSS
          success:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground toast-success",
          // Error toast - red border styled via CSS
          error:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground toast-error",
          // Warning toast - gold border styled via CSS
          warning:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground toast-warning",
          // Info toast - blue border styled via CSS
          info: "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground toast-info",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
