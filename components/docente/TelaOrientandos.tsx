"use client"

// components/docente/TelaOrientandos.tsx
//
// Diferente de components/atividade/TabelaAtividades.tsx, a linha aqui NÃO
// tem onClick: só o nome (um <Link> real dentro da célula) leva à fila
// filtrada por aquele aluno, para o alvo por teclado ser sempre o mesmo
// elemento focável, nunca um onClick de linha que só o mouse alcança.
//
// Progresso, tipos distintos e as etiquetas de risco vêm de ResumoOrientando
// (lib/orientandos.ts) — nada aqui recalcula crédito: calcularProgresso já
// fez isso em lib/storage.ts (listarOrientandos).

import { ArrowDown, ArrowUp, ArrowUpDown, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { EtiquetaRisco } from "@/components/docente/EtiquetaRisco"
import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/layout/PageHeader"
import { formatarNumero, formatarRelativo } from "@/lib/formatacao"
import { listarOrientandos } from "@/lib/storage"
import type { ResumoOrientando } from "@/lib/orientandos"
import type { Progresso } from "@/lib/types"

type CampoOrdenacao = "nome" | "creditos"
type Ordenacao = { campo: CampoOrdenacao; direcao: "asc" | "desc" }

type Estado = { status: "carregando" } | { status: "erro" } | { status: "pronto"; resumos: ResumoOrientando[] }

function BarraProgresso({ progresso }: { progresso: Progresso }) {
  return (
    <div className="flex flex-col gap-1">
      <div aria-hidden="true" className="h-1.5 w-20 overflow-hidden rounded-full bg-trilha">
        <div className="h-full bg-brand" style={{ width: `${Math.min(100, progresso.percentual)}%` }} />
      </div>
      <span className="tabular text-caption text-muted-foreground">
        {formatarNumero(progresso.creditosObtidos)} de {formatarNumero(progresso.creditosExigidos)} créditos
      </span>
    </div>
  )
}

function ordenarOrientandos(resumos: ResumoOrientando[], ordenacao: Ordenacao | null): ResumoOrientando[] {
  if (!ordenacao) {
    // Padrão: mais pendências aguardando primeiro.
    return [...resumos].sort((a, b) => b.pendentesAguardando - a.pendentesAguardando)
  }
  const fator = ordenacao.direcao === "asc" ? 1 : -1
  return [...resumos].sort((a, b) => {
    if (ordenacao.campo === "nome") return a.discente.nome.localeCompare(b.discente.nome, "pt-BR") * fator
    return (a.progresso.creditosObtidos - b.progresso.creditosObtidos) * fator
  })
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
    <th scope="col" aria-sort={ativo ? (ordenacao.direcao === "asc" ? "ascending" : "descending") : "none"} className="px-4 text-left">
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

export function TelaOrientandos() {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)
  const [busca, setBusca] = useState("")
  const [ordenacao, setOrdenacao] = useState<Ordenacao | null>(null)
  const anunciar = useAnunciar()

  useEffect(() => {
    let ativo = true
    listarOrientandos()
      .then((resumos) => ativo && setEstado({ status: "pronto", resumos }))
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [tentativa])

  const resumos = estado.status === "pronto" ? estado.resumos : []

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return resumos
    return resumos.filter(
      (r) => r.discente.nome.toLowerCase().includes(termo) || r.discente.ra.toLowerCase().includes(termo)
    )
  }, [resumos, busca])

  const visiveis = useMemo(() => ordenarOrientandos(filtrados, ordenacao), [filtrados, ordenacao])

  // Anuncia o resultado da busca (não da ordenação: aria-sort já cobre essa).
  useEffect(() => {
    if (estado.status !== "pronto" || busca.trim() === "") return
    const identificador = window.setTimeout(() => {
      anunciar(`${formatarNumero(filtrados.length)} ${filtrados.length === 1 ? "orientando encontrado" : "orientandos encontrados"}.`)
    }, 400)
    return () => window.clearTimeout(identificador)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só a busca deve reagendar o anúncio
  }, [busca, estado.status])

  function tentarNovamente() {
    setEstado({ status: "carregando" })
    setTentativa((t) => t + 1)
  }

  function ordenarPor(campo: CampoOrdenacao) {
    setOrdenacao((atual) => {
      if (atual?.campo !== campo) return { campo, direcao: campo === "nome" ? "asc" : "desc" }
      return { campo, direcao: atual.direcao === "asc" ? "desc" : "asc" }
    })
  }

  return (
    <div>
      <PageHeader
        titulo="Meus orientandos"
        subtitulo="Progresso de cada discente sob sua orientação, com os sinais de risco que o Projeto Pedagógico prevê."
      />

      {estado.status !== "erro" && resumos.length > 0 && (
        <div className="mb-6 max-w-form">
          <label htmlFor="busca-orientandos" className="mb-2 block text-label text-foreground">
            Buscar por nome ou RA
          </label>
          <Input
            type="search"
            id="busca-orientandos"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: Ana ou 811902"
          />
        </div>
      )}

      {estado.status === "carregando" && (
        <AreaCarregando texto="Carregando orientandos…" className="flex flex-col gap-2">
          <Skeleton className="h-row" />
          <Skeleton className="h-row" />
          <Skeleton className="h-row" />
          <Skeleton className="h-row" />
        </AreaCarregando>
      )}

      {estado.status === "erro" && (
        <EstadoErro nivelTitulo={2} titulo="Não foi possível carregar os orientandos" onTentarNovamente={tentarNovamente} />
      )}

      {estado.status === "pronto" && resumos.length === 0 && (
        <EstadoVazio
          nivelTitulo={2}
          icone={Users}
          titulo="Você ainda não tem orientandos vinculados"
          descricao="Quando um discente for vinculado a você, ele aparece aqui."
        />
      )}

      {estado.status === "pronto" && resumos.length > 0 && visiveis.length === 0 && (
        <EstadoVazio
          nivelTitulo={2}
          icone={Users}
          titulo="Nenhum orientando encontrado"
          descricao={`Nada bate com "${busca}". Tente outro nome ou RA.`}
        />
      )}

      {estado.status === "pronto" && visiveis.length > 0 && (
        <>
          {/* Desktop: tabela real, a partir de 768 px. */}
          <div className="hidden overflow-x-auto rounded-lg border bg-surface md:block">
            <table className="w-full tabular">
              <caption className="sr-only">
                Meus orientandos: progresso, tipos distintos, pendências e sinais de risco de cada discente.
              </caption>
              <thead className="border-b bg-muted">
                <tr>
                  <CabecalhoOrdenavel campo="nome" rotulo="Nome" ordenacao={ordenacao} onOrdenar={ordenarPor} />
                  <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                    RA
                  </th>
                  <CabecalhoOrdenavel campo="creditos" rotulo="Créditos validados" ordenacao={ordenacao} onOrdenar={ordenarPor} />
                  <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                    Tipos distintos
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                    Pendências
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                    Última movimentação
                  </th>
                  {/* min-w: sem isto, a coluna fica espremida pelas outras seis e o texto
                      da etiqueta (a parte mais importante da tela) quebra palavra por
                      palavra em A+ — continua tudo presente (overflow visível), só ilegível. */}
                  <th scope="col" className="min-w-48 px-4 py-2 text-left text-label text-foreground">
                    Risco
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visiveis.map((r) => (
                  <tr key={r.discente.id} className="align-top">
                    <td className="celula-densidade px-4">
                      <Link
                        href={`/docente/fila?discente=${r.discente.id}`}
                        className="text-body text-foreground underline-offset-4 hover:text-accent-text hover:underline"
                      >
                        {r.discente.nome}
                      </Link>
                    </td>
                    <td className="celula-densidade px-4 text-body text-muted-foreground">{r.discente.ra}</td>
                    <td className="celula-densidade px-4">
                      <BarraProgresso progresso={r.progresso} />
                    </td>
                    <td className="celula-densidade px-4 text-body">
                      {formatarNumero(r.progresso.tiposDistintos)} de {formatarNumero(r.progresso.tiposExigidos)}
                    </td>
                    <td className="celula-densidade px-4 text-body">
                      {r.pendentesAguardando === 0 ? "Nenhuma" : formatarNumero(r.pendentesAguardando)}
                    </td>
                    <td className="celula-densidade px-4 text-body text-muted-foreground">
                      {r.ultimaMovimentacaoEm ? formatarRelativo(r.ultimaMovimentacaoEm, new Date()) : "Sem movimentação"}
                    </td>
                    <td className="celula-densidade px-4">
                      {r.riscos.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {r.riscos.map((flag) => (
                            <EtiquetaRisco key={flag} flag={flag} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-caption text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: lista de cards, abaixo de 768 px. */}
          <ul className="flex flex-col gap-3 md:hidden">
            {visiveis.map((r) => (
              <li key={r.discente.id} className="flex flex-col gap-2 rounded-lg border bg-surface p-4">
                <Link
                  href={`/docente/fila?discente=${r.discente.id}`}
                  className="text-body font-medium text-foreground underline-offset-4 hover:text-accent-text hover:underline"
                >
                  {r.discente.nome}
                </Link>
                <span className="tabular text-label text-muted-foreground">RA {r.discente.ra}</span>
                <BarraProgresso progresso={r.progresso} />
                <span className="tabular text-label text-muted-foreground">
                  {formatarNumero(r.progresso.tiposDistintos)} de {formatarNumero(r.progresso.tiposExigidos)} tipos ·{" "}
                  {r.pendentesAguardando === 0 ? "sem pendências" : `${formatarNumero(r.pendentesAguardando)} pendente${r.pendentesAguardando === 1 ? "" : "s"}`}
                </span>
                <span className="text-label text-muted-foreground">
                  Última movimentação:{" "}
                  {r.ultimaMovimentacaoEm ? formatarRelativo(r.ultimaMovimentacaoEm, new Date()) : "sem movimentação"}
                </span>
                {r.riscos.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {r.riscos.map((flag) => (
                      <EtiquetaRisco key={flag} flag={flag} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-caption text-muted-foreground">
            Mostrando {formatarNumero(visiveis.length)} de {formatarNumero(resumos.length)}{" "}
            {resumos.length === 1 ? "orientando" : "orientandos"}.
          </p>
        </>
      )}
    </div>
  )
}
