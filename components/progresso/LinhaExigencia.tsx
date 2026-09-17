// components/progresso/LinhaExigencia.tsx — Painel do discente
//
// Uma linha do checklist "Exigências do Projeto Pedagógico": grid de três
// colunas (ícone | texto | estado). O ícone muda de forma (check/relógio),
// não só de cor, e o estado ao lado está sempre escrito por extenso
// ("Cumprido"/"Pendente") — nunca só o ícone ou só a cor decidindo.

import { CircleCheck, Clock, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function LinhaExigencia({
  titulo,
  detalhe,
  cumprido,
}: {
  titulo: string
  detalhe: string
  cumprido: boolean
}) {
  const Icone: LucideIcon = cumprido ? CircleCheck : Clock
  return (
    <li className="grid grid-cols-[20px_1fr_64px] items-start gap-x-[14px]">
      <span className="flex h-[1.4em] items-center">
        <Icone aria-hidden="true" className={cn("size-5", cumprido ? "text-success" : "text-pending")} />
      </span>
      <span className="flex flex-col gap-0.5">
        <span
          className={cn(
            "text-label font-medium",
            cumprido ? "text-integralizacao-texto-item" : "text-integralizacao-texto-pendente"
          )}
        >
          {titulo}
        </span>
        <span className="text-caption text-integralizacao-texto-auxiliar">{detalhe}</span>
      </span>
      <span
        className={cn(
          "text-right text-label font-bold",
          cumprido ? "text-integralizacao-texto-titulo" : "text-integralizacao-texto-pendente"
        )}
      >
        {cumprido ? "Cumprido" : "Pendente"}
      </span>
    </li>
  )
}
