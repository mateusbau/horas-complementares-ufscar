/*
 * Input shadcn/ui (base-nova, sobre Base UI) ajustado à identidade visual,
 * conforme o procedimento obrigatório após `shadcn add` (CLAUDE.md):
 * - sem supressão de contorno nem anel próprio: o foco vem da regra global;
 * - borda de campo (--input-border, 3:1 contra o fundo) e fundo de superfície;
 * - alvo de 44 px de altura e texto de 16 px (também evita o zoom automático
 *   do iOS ao focar o campo);
 * - inválido: borda --danger. A cor nunca é o único sinal: o erro vem com
 *   ícone e texto, ligado por aria-describedby (ver components/formulario/Campo).
 */

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "min-h-target w-full min-w-0 rounded-lg border border-input-border bg-surface px-3 py-2 text-body text-foreground transition-colors placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
