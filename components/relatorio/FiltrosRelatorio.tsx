"use client"

// components/relatorio/FiltrosRelatorio.tsx
//
// Bloco de filtros compartilhado pelos dois relatórios (discente e turma):
// período (opcional, "" = sem limite) e tipos de atividade da Tabela 7
// (checkboxes, todos marcados por padrão). Só filtra a lista de atividades
// que entra em calcularProgresso/resumirOrientando — não recalcula nada,
// não duplica lógica de crédito (lib/relatorio-filtros.ts).
//
// Acessibilidade: cada campo de data tem <label> associado; os tipos ficam
// num <fieldset><legend>; erro de período (final antes da inicial) aparece
// no campo, com aria-describedby/aria-invalid, sem bloquear silenciosamente.
// Quem anuncia a mudança na região aria-live é a tela que usa este
// componente (ela é quem sabe o novo total recalculado).

import { CircleAlert } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CATALOGO } from "@/lib/catalogo"
import { erroPeriodo, type FiltrosRelatorio as TipoFiltros } from "@/lib/relatorio-filtros"
import { cn } from "@/lib/utils"

export function FiltrosRelatorio({
  filtros,
  onChange,
}: {
  filtros: TipoFiltros
  onChange: (filtros: TipoFiltros) => void
}) {
  const erro = erroPeriodo(filtros)
  const todosMarcados = filtros.tiposIncluidos.size === CATALOGO.length
  const nenhumMarcado = filtros.tiposIncluidos.size === 0

  function alternarTipo(id: (typeof CATALOGO)[number]["id"], marcado: boolean) {
    const novoConjunto = new Set(filtros.tiposIncluidos)
    if (marcado) novoConjunto.add(id)
    else novoConjunto.delete(id)
    onChange({ ...filtros, tiposIncluidos: novoConjunto })
  }

  return (
    <section
      aria-labelledby="titulo-filtros"
      className="flex flex-col gap-4 rounded-lg border bg-surface p-6 print:hidden"
    >
      <div className="flex flex-col gap-1">
        <h2 id="titulo-filtros">Filtros</h2>
        <p className="leading-secondary text-muted-foreground">
          Os totais, a tabela, a impressão e o CSV recalculam sobre o que ficar marcado aqui.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-label text-foreground">Período de validação</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-form">
          <div className="flex flex-col gap-2">
            <label htmlFor="filtro-data-inicial" className="text-label text-foreground">
              Validado a partir de
            </label>
            <Input
              id="filtro-data-inicial"
              type="date"
              value={filtros.dataInicial}
              onChange={(e) => onChange({ ...filtros, dataInicial: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="filtro-data-final" className="text-label text-foreground">
              Validado até
            </label>
            <Input
              id="filtro-data-final"
              type="date"
              value={filtros.dataFinal}
              aria-describedby={erro ? "filtro-periodo-erro" : undefined}
              aria-invalid={erro ? true : undefined}
              onChange={(e) => onChange({ ...filtros, dataFinal: e.target.value })}
            />
          </div>
        </div>
        {erro && (
          <p id="filtro-periodo-erro" className="flex items-start gap-2 text-label text-danger">
            <span className="flex h-[1.45em] shrink-0 items-center">
              <CircleAlert aria-hidden="true" className="size-4" />
            </span>
            {erro}
          </p>
        )}
        <p className="text-caption leading-secondary text-muted-foreground">
          Datas vazias não limitam o período. O critério é a data em que a atividade foi validada pelo docente, não
          a data em que foi realizada.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <legend className="text-label text-foreground">Tipos de atividade (Tabela 7)</legend>
          <button
            type="button"
            className="min-h-target text-label text-accent-text underline underline-offset-4 hover:decoration-2"
            onClick={() =>
              onChange({
                ...filtros,
                tiposIncluidos: todosMarcados ? new Set() : new Set(CATALOGO.map((t) => t.id)),
              })
            }
          >
            {todosMarcados ? "Desmarcar todos" : "Marcar todos"}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOGO.map((tipo) => (
            <label
              key={tipo.id}
              className="flex min-h-target cursor-pointer items-center gap-3 rounded-lg border border-input-border bg-surface p-3"
            >
              <Checkbox
                checked={filtros.tiposIncluidos.has(tipo.id)}
                onChange={(e) => alternarTipo(tipo.id, e.target.checked)}
              />
              <span className="text-body text-foreground">{tipo.nomeCurto}</span>
            </label>
          ))}
        </div>
        {nenhumMarcado && (
          <p className={cn("flex items-start gap-2 text-label text-muted-foreground")}>
            <span className="flex h-[1.45em] shrink-0 items-center">
              <CircleAlert aria-hidden="true" className="size-4" />
            </span>
            Nenhum tipo marcado — o relatório não vai encontrar atividades.
          </p>
        )}
      </fieldset>
    </section>
  )
}
