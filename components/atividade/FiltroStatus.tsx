"use client"

// components/atividade/FiltroStatus.tsx
//
// Grupo de chips com contagem, controlado. As contagens vêm da lista inteira
// (não da filtrada), para o número não mudar conforme se filtra.

import type { StatusAtividade } from "@/lib/types"
import { formatarNumero } from "@/lib/formatacao"
import { cn } from "@/lib/utils"

export type StatusFiltro = "todos" | StatusAtividade

const OPCOES: { valor: StatusFiltro; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "validada", rotulo: "Validadas" },
  { valor: "analise", rotulo: "Em análise" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "recusada", rotulo: "Recusadas" },
]

export function FiltroStatus({
  contagens,
  valor,
  onMudar,
}: {
  contagens: Record<StatusFiltro, number>
  valor: StatusFiltro
  onMudar: (valor: StatusFiltro) => void
}) {
  return (
    <div role="group" aria-label="Filtrar por status" className="flex flex-wrap gap-2">
      {OPCOES.map((opcao) => {
        const selecionado = valor === opcao.valor
        return (
          <button
            key={opcao.valor}
            type="button"
            aria-pressed={selecionado}
            onClick={() => onMudar(opcao.valor)}
            className={cn(
              "inline-flex min-h-target items-center gap-1.5 rounded-lg border px-3 text-label transition-colors",
              selecionado
                ? "border-primary bg-accent-soft font-medium text-accent-text"
                : "border-input-border bg-surface text-foreground hover:bg-muted"
            )}
          >
            {opcao.rotulo}
            <span className="tabular text-caption text-muted-foreground">
              {formatarNumero(contagens[opcao.valor])}
            </span>
          </button>
        )
      })}
    </div>
  )
}
