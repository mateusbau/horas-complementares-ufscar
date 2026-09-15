// components/feedback/EstadoVazio.tsx
//
// Estado vazio: ícone de 32 px em texto secundário, título, frase explicativa e
// a ação que resolve. O nível do título é escolhido pela tela, para não pular
// níveis (h2 logo abaixo do h1; h3 dentro de uma seção com h2).

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
  nivelTitulo = 3,
  className,
}: {
  icone: LucideIcon
  titulo: string
  descricao: ReactNode
  acao?: ReactNode
  nivelTitulo?: 2 | 3
  className?: string
}) {
  const Titulo = nivelTitulo === 2 ? "h2" : "h3"
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <Icone aria-hidden="true" className="size-8 text-muted-foreground" />
      <div className="flex max-w-form flex-col gap-2">
        <Titulo>{titulo}</Titulo>
        <p className="leading-secondary text-muted-foreground">{descricao}</p>
      </div>
      {acao && <div className="flex flex-wrap justify-center gap-2">{acao}</div>}
    </div>
  )
}
