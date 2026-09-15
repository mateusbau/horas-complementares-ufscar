/*
 * Select nativo (não é um componente do shadcn), estilizado para seguir os
 * mesmos tokens do Input: borda de campo, alvo de 44 px, texto de 16 px.
 * O <select> nativo já é operável por teclado e lido corretamente por
 * leitores de tela, sem precisar recriar o comportamento.
 */

import { ChevronDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "min-h-target w-full appearance-none rounded-lg border border-input-border bg-surface px-3 py-2 pr-10 text-body text-foreground transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-danger",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { Select }
