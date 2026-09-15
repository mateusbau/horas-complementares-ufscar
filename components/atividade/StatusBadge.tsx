// components/atividade/StatusBadge.tsx
//
// Status sempre com cor + ícone + texto (nunca só cor), para continuar legível
// em escala de cinza. Pílula (rounded-full): é o único lugar do sistema com
// esse raio, reservado a badge.

import { CircleCheck, CircleDashed, CircleX, Clock, type LucideIcon } from "lucide-react"

import type { StatusAtividade } from "@/lib/types"
import { cn } from "@/lib/utils"

const CONFIGURACAO: Record<StatusAtividade, { rotulo: string; icone: LucideIcon; classe: string }> = {
  validada: { rotulo: "Validada", icone: CircleCheck, classe: "bg-success-bg text-success" },
  analise: { rotulo: "Em análise", icone: Clock, classe: "bg-review-bg text-review" },
  pendente: { rotulo: "Pendente de envio", icone: CircleDashed, classe: "bg-pending-bg text-pending" },
  recusada: { rotulo: "Recusada", icone: CircleX, classe: "bg-danger-bg text-danger" },
}

export function rotuloDoStatus(status: StatusAtividade): string {
  return CONFIGURACAO[status].rotulo
}

export function StatusBadge({ status, className }: { status: StatusAtividade; className?: string }) {
  const { rotulo, icone: Icone, classe } = CONFIGURACAO[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-caption font-medium",
        classe,
        className
      )}
    >
      <Icone aria-hidden="true" className="size-3.5 shrink-0" />
      {rotulo}
    </span>
  )
}
