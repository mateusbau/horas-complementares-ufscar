// components/formulario/CampoConfirmacao.tsx
//
// Caixa de seleção condicional das regras (*) e (**) da Tabela 7: a nota
// completa é o próprio rótulo (todo o cartão é clicável e conta como alvo),
// erro com ícone ligado por aria-describedby, igual ao Campo de texto.

import { CircleAlert } from "lucide-react"
import type { FocusEvent, RefObject } from "react"

import { Checkbox } from "@/components/ui/checkbox"

export function CampoConfirmacao({
  id,
  texto,
  checked,
  onChange,
  onBlur,
  erro,
  checkboxRef,
}: {
  id: string
  texto: string
  checked: boolean
  onChange: (valor: boolean) => void
  onBlur?: (evento: FocusEvent<HTMLInputElement>) => void
  erro?: string | null
  checkboxRef?: RefObject<HTMLInputElement | null>
}) {
  const idErro = `${id}-erro`
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex min-h-target cursor-pointer items-start gap-3 rounded-lg border border-input-border bg-surface p-4"
      >
        <Checkbox
          ref={checkboxRef}
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          aria-describedby={erro ? idErro : undefined}
          aria-invalid={erro ? true : undefined}
        />
        <span className="text-label leading-secondary text-foreground">{texto}</span>
      </label>
      {erro && (
        <p id={idErro} className="flex items-start gap-2 text-label text-danger">
          <span className="flex h-[1.45em] shrink-0 items-center">
            <CircleAlert aria-hidden="true" className="size-4" />
          </span>
          {erro}
        </p>
      )}
    </div>
  )
}
