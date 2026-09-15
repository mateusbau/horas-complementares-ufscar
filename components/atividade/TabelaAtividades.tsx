"use client"

// components/atividade/TabelaAtividades.tsx
//
// Tabela em 768 px+ (mesmo ponto de corte da sidebar), lista de cards abaixo
// disso — nunca as duas, nunca rolagem horizontal. A linha inteira é clicável
// (onClick no <tr>, cursor-pointer); o título é um link real, então a
// navegação continua inteiramente operável por teclado (Tab alcança o link,
// Enter ativa) mesmo sem cada célula ser focável — o resto da linha é
// conveniência de mouse, não a única forma de chegar ao detalhe.

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { StatusBadge } from "@/components/atividade/StatusBadge"
import { obterTipo, type TipoAtividadeId } from "@/lib/catalogo"
import { creditosDaAtividade } from "@/lib/calculos"
import { formatarCreditos, formatarData } from "@/lib/formatacao"
import type { Atividade } from "@/lib/types"

export type CampoOrdenacao = "creditos" | "periodo"
export type Ordenacao = { campo: CampoOrdenacao; direcao: "asc" | "desc" }

function nomeDoTipo(tipoId: TipoAtividadeId | null): string {
  return tipoId === null ? "Sem tipo previsto" : obterTipo(tipoId).nomeCurto
}

function textoDoPeriodo(atividade: Atividade): string {
  if (!atividade.periodo) return "Não informado"
  return `${formatarData(atividade.periodo.inicio)} – ${formatarData(atividade.periodo.termino)}`
}

function CabecalhoOrdenavel({
  campo,
  rotulo,
  ordenacao,
  onOrdenar,
}: {
  campo: CampoOrdenacao
  rotulo: string
  ordenacao: Ordenacao | null
  onOrdenar: (campo: CampoOrdenacao) => void
}) {
  const ativo = ordenacao?.campo === campo
  const Icone = ativo ? (ordenacao.direcao === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <th
      scope="col"
      aria-sort={ativo ? (ordenacao.direcao === "asc" ? "ascending" : "descending") : "none"}
      className="px-4 text-left"
    >
      <button
        type="button"
        onClick={() => onOrdenar(campo)}
        className="inline-flex min-h-target items-center gap-1.5 text-label text-foreground hover:text-accent-text"
      >
        {rotulo}
        <Icone aria-hidden="true" className="size-3.5" />
      </button>
    </th>
  )
}

export function TabelaAtividades({
  atividades,
  ordenacao,
  onOrdenar,
}: {
  atividades: Atividade[]
  ordenacao: Ordenacao | null
  onOrdenar: (campo: CampoOrdenacao) => void
}) {
  const router = useRouter()

  return (
    <>
      {/* Desktop: tabela real, a partir de 768 px. */}
      <div className="hidden overflow-x-auto rounded-lg border bg-surface md:block">
        <table className="w-full tabular">
          <thead className="border-b bg-muted">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Atividade
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Tipo
              </th>
              <CabecalhoOrdenavel campo="creditos" rotulo="Créditos" ordenacao={ordenacao} onOrdenar={onOrdenar} />
              <CabecalhoOrdenavel campo="periodo" rotulo="Período" ordenacao={ordenacao} onOrdenar={onOrdenar} />
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {atividades.map((atividade) => (
              <tr
                key={atividade.id}
                onClick={() => router.push(`/atividades/${atividade.id}`)}
                className="h-row cursor-pointer transition-colors hover:bg-muted"
              >
                <td className="px-4 py-2">
                  <Link
                    href={`/atividades/${atividade.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-body text-foreground underline-offset-4 hover:text-accent-text hover:underline"
                  >
                    {atividade.titulo}
                  </Link>
                </td>
                <td className="px-4 py-2 text-body text-muted-foreground">{nomeDoTipo(atividade.tipoId)}</td>
                <td className="px-4 py-2 text-body">{formatarCreditos(creditosDaAtividade(atividade))}</td>
                <td className="px-4 py-2 text-body text-muted-foreground">{textoDoPeriodo(atividade)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={atividade.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: lista de cards, abaixo de 768 px. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {atividades.map((atividade) => (
          <li key={atividade.id}>
            <Link
              href={`/atividades/${atividade.id}`}
              className="flex flex-col gap-2 rounded-lg border bg-surface p-4 transition-colors hover:bg-muted"
            >
              <span className="text-body font-medium">{atividade.titulo}</span>
              <span className="tabular text-label text-muted-foreground">
                {nomeDoTipo(atividade.tipoId)} · {formatarCreditos(creditosDaAtividade(atividade))} ·{" "}
                {textoDoPeriodo(atividade)}
              </span>
              <StatusBadge status={atividade.status} className="self-start" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export function ordenarAtividades(atividades: Atividade[], ordenacao: Ordenacao | null): Atividade[] {
  if (!ordenacao) return atividades
  const fator = ordenacao.direcao === "asc" ? 1 : -1
  return [...atividades].sort((a, b) => {
    if (ordenacao.campo === "creditos") {
      return (creditosDaAtividade(a) - creditosDaAtividade(b)) * fator
    }
    const dataA = a.periodo?.inicio ?? ""
    const dataB = b.periodo?.inicio ?? ""
    return dataA.localeCompare(dataB) * fator
  })
}
