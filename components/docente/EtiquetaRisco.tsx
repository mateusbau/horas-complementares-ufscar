// components/docente/EtiquetaRisco.tsx
//
// Usada por "Meus orientandos" e "Relatório da turma" — os mesmos três
// critérios de risco (lib/orientandos.ts) precisam ter a MESMA etiqueta nas
// duas telas, não duas versões que podem divergir. Ícone + cor + texto,
// nunca só cor.

import { CircleDashed, Clock, TriangleAlert, type LucideIcon } from "lucide-react"

import { DIAS_PENDENCIA_ANTIGA } from "@/lib/calculos"
import { formatarNumero } from "@/lib/formatacao"
import type { FlagRisco } from "@/lib/orientandos"
import { cn } from "@/lib/utils"

const CONFIGURACAO_RISCO: Record<FlagRisco, { texto: string; icone: LucideIcon; classe: string }> = {
  "tipo-unico": {
    texto: "Não integraliza: falta um segundo tipo de atividade (PPC 3.5.4).",
    icone: TriangleAlert,
    classe: "bg-danger-bg text-danger",
  },
  "sem-validadas": {
    texto: "Sem atividades validadas.",
    icone: CircleDashed,
    classe: "bg-pending-bg text-pending",
  },
  "pendencia-antiga": {
    texto: `Pendência antiga: sem retorno há mais de ${formatarNumero(DIAS_PENDENCIA_ANTIGA)} dias.`,
    icone: Clock,
    classe: "bg-review-bg text-review",
  },
}

export function EtiquetaRisco({ flag, className }: { flag: FlagRisco; className?: string }) {
  const config = CONFIGURACAO_RISCO[flag]
  const Icone = config.icone
  return (
    <p className={cn("flex items-start gap-1.5 rounded-lg px-2 py-1 text-caption leading-secondary", config.classe, className)}>
      <Icone aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      <span>{config.texto}</span>
    </p>
  )
}
