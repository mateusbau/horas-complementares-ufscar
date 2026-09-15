/*
 * Checkbox nativo, estilizado com accent-primary (cor do check nos
 * navegadores que suportam a propriedade CSS accent-color — todos os atuais).
 * Alvo de 44 px vem do wrapper que usa este campo (ver CampoConfirmacao),
 * não do quadrado em si.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn("mt-0.5 size-5 shrink-0 accent-primary", className)}
      {...props}
    />
  )
}

export { Checkbox }
