// components/avisos/ItemAviso.tsx
//
// Um aviso da lista: tipo com ícone + cor + texto (nunca só cor, igual ao
// StatusBadge de atividade), não lida com fundo diferente E um marcador
// (dupla pista, não só cor). Título como heading — link para a atividade
// quando há uma, texto simples quando não há (marco, regra).

import { CircleCheck, CircleX, Clock, Info, Trophy, type LucideIcon } from "lucide-react"
import Link from "next/link"

import { formatarDataHora, formatarRelativo } from "@/lib/formatacao"
import type { Aviso, TipoAviso } from "@/lib/types"
import { cn } from "@/lib/utils"

const CONFIGURACAO_TIPO: Record<TipoAviso, { rotulo: string; icone: LucideIcon; classe: string }> = {
  validada: { rotulo: "Validada", icone: CircleCheck, classe: "bg-success-bg text-success" },
  recusada: { rotulo: "Recusada", icone: CircleX, classe: "bg-danger-bg text-danger" },
  aguardando: { rotulo: "Aguardando validação", icone: Clock, classe: "bg-review-bg text-review" },
  marco: { rotulo: "Marco atingido", icone: Trophy, classe: "bg-success-bg text-success" },
  regra: { rotulo: "Lembrete de regra", icone: Info, classe: "bg-pending-bg text-pending" },
}

export function ItemAviso({
  aviso,
  agora,
  onClicar,
}: {
  aviso: Aviso
  agora: Date
  /** Chamado ao clicar no título, quando ele é um link (marca como lido). */
  onClicar: () => void
}) {
  const config = CONFIGURACAO_TIPO[aviso.tipo]
  const Icone = config.icone

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-4",
        aviso.lido ? "border-border bg-surface" : "border-input-border bg-accent-soft"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium", config.classe)}>
          <Icone aria-hidden="true" className="size-3.5" />
          {config.rotulo}
        </span>
        {!aviso.lido && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-caption font-medium text-accent-text ring-1 ring-inset ring-accent-text">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent-text" />
            Não lida
          </span>
        )}
      </div>

      <h3 className="text-body">
        {aviso.atividadeId ? (
          <Link
            href={`/atividades/${aviso.atividadeId}`}
            onClick={onClicar}
            className="font-medium text-foreground underline-offset-4 hover:text-accent-text hover:underline"
          >
            {aviso.titulo}
          </Link>
        ) : (
          <span className="font-medium text-foreground">{aviso.titulo}</span>
        )}
      </h3>

      <p className="leading-secondary text-muted-foreground">{aviso.descricao}</p>

      <time dateTime={aviso.em} title={formatarDataHora(aviso.em)} className="text-caption text-muted-foreground">
        {formatarRelativo(aviso.em, agora)}
      </time>
    </li>
  )
}
