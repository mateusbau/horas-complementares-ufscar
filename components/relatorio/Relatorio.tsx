"use client"

// components/relatorio/Relatorio.tsx — Relatório (etapa 11)
//
// Requisito do edital: gerar um relatório para entrega — o documento que
// substitui o papel que a discente imprime hoje (ADENDO-DOMINIO.md, seção 8).
// Só atividades validadas entram (mesma fonte de verdade do painel e da
// listagem: calcularProgresso); o texto deixa explícito quantas ficaram de
// fora e por quê. Agrupado por tipo da Tabela 7 — não por "categoria" — com
// créditos e horas contabilizadas por linha, citando FONTE_TABELA_7 e a
// premissa do fator crédito → hora (formatarPremissaCredito). @media print (ver
// app/globals.css e components/layout/{Sidebar,MobileNav,PageHeader}) esconde
// a barra de acessibilidade, a navegação e os botões, deixando só o conteúdo
// do documento.

import { CircleCheck, CircleDashed, Download, Printer } from "lucide-react"
import { useEffect, useState } from "react"

import { EstadoErro } from "@/components/feedback/EstadoErro"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { calcularProgresso, creditosDaAtividade, horasDeCreditos } from "@/lib/calculos"
import { FONTE_TABELA_7, GRUPOS, obterTipo } from "@/lib/catalogo"
import { baixarCSV, montarCSV } from "@/lib/csv"
import {
  formatarCreditos,
  formatarData,
  formatarDataArquivo,
  formatarDataHora,
  formatarHoras,
  formatarHorasContabilizadas,
  formatarNumero,
  formatarPremissaCredito,
  formatarUnidade,
} from "@/lib/formatacao"
import { listarAtividades, obterDiscenteAtual, obterDocenteAtual } from "@/lib/storage"
import type { Atividade, Discente, Docente, Progresso, StatusAtividade } from "@/lib/types"

type Estado =
  | { status: "carregando" }
  | { status: "erro" }
  | { status: "pronto"; discente: Discente; docente: Docente; atividades: Atividade[]; progresso: Progresso }

const ROTULO_STATUS_EXCLUIDO: Record<Exclude<StatusAtividade, "validada">, { singular: string; plural: string }> = {
  analise: { singular: "em análise", plural: "em análise" },
  pendente: { singular: "pendente", plural: "pendentes" },
  recusada: { singular: "recusada", plural: "recusadas" },
}

/** Uma linha do CSV/tabela "Atividades validadas" — mesma lista para os dois, nunca calculada duas vezes. */
type LinhaAtividadeValidada = {
  atividadeId: string
  dataISO: string
  data: string
  tipo: string
  descricao: string
  cargaHoraria: string
  creditos: string
  status: string
  validadoPor: string
}

/**
 * Só atividades validadas (mesma regra do resto do relatório). "Data" é a do
 * parecer que aprovou — é o evento que este relatório documenta; sem
 * parecer de aprovação (não deveria acontecer com status "validada", mas o
 * TypeScript não sabe disso), cai para o envio ou a criação.
 */
function construirLinhasValidadas(atividades: readonly Atividade[], docente: Docente): LinhaAtividadeValidada[] {
  return atividades
    .filter((a) => a.status === "validada")
    .map((a) => {
      const parecerAprovacao = [...a.pareceres].reverse().find((p) => p.decisao === "aprovar")
      const dataISO = parecerAprovacao?.em ?? a.enviadaEm ?? a.criadaEm
      const creditos = creditosDaAtividade(a)
      return {
        atividadeId: a.id,
        dataISO,
        data: formatarData(dataISO),
        tipo: a.tipoId === null ? "Sem tipo previsto" : obterTipo(a.tipoId).nome,
        descricao: a.titulo,
        cargaHoraria: formatarHoras(horasDeCreditos(creditos)),
        creditos: formatarCreditos(creditos),
        status: "Validada",
        validadoPor: docente.nome,
      }
    })
    .sort((a, b) => a.dataISO.localeCompare(b.dataISO))
}

export function Relatorio() {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)
  const [emitidoEm] = useState(() => new Date())

  useEffect(() => {
    let ativo = true
    Promise.all([obterDiscenteAtual(), obterDocenteAtual(), listarAtividades()])
      .then(([discente, docente, atividades]) => {
        if (!ativo) return
        setEstado({ status: "pronto", discente, docente, atividades, progresso: calcularProgresso(atividades) })
      })
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [tentativa])

  const linhasValidadas = estado.status === "pronto" ? construirLinhasValidadas(estado.atividades, estado.docente) : []

  function aoBaixarCSV() {
    if (estado.status !== "pronto") return
    const conteudo = montarCSV(
      ["Data", "Tipo de atividade (Tabela 7)", "Descrição", "Carga horária", "Créditos reconhecidos", "Status", "Validado por"],
      linhasValidadas.map((l) => [l.data, l.tipo, l.descricao, l.cargaHoraria, l.creditos, l.status, l.validadoPor])
    )
    baixarCSV(`relatorio-${estado.discente.ra}-${formatarDataArquivo(emitidoEm)}.csv`, conteudo)
  }

  return (
    <>
      <PageHeader
        titulo="Relatório de horas complementares"
        subtitulo="Documento consolidado das suas atividades validadas, pronto para impressão ou PDF."
        acao={
          estado.status === "pronto" ? (
            <>
              <Button variant="outline" onClick={aoBaixarCSV}>
                <Download aria-hidden="true" />
                Baixar CSV
              </Button>
              <Button onClick={() => window.print()}>
                <Printer aria-hidden="true" />
                Imprimir ou salvar em PDF
              </Button>
            </>
          ) : undefined
        }
      />

      {estado.status === "carregando" && (
        <AreaCarregando texto="Carregando relatório…" className="flex max-w-content flex-col gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </AreaCarregando>
      )}

      {estado.status === "erro" && (
        <EstadoErro nivelTitulo={2} titulo="Não foi possível carregar o relatório" onTentarNovamente={() => setTentativa((t) => t + 1)} />
      )}

      {estado.status === "pronto" && (
        <ConteudoRelatorio
          discente={estado.discente}
          atividades={estado.atividades}
          progresso={estado.progresso}
          emitidoEm={emitidoEm}
          linhasValidadas={linhasValidadas}
        />
      )}
    </>
  )
}

function ConteudoRelatorio({
  discente,
  atividades,
  progresso,
  emitidoEm,
  linhasValidadas,
}: {
  discente: Discente
  atividades: Atividade[]
  progresso: Progresso
  emitidoEm: Date
  linhasValidadas: LinhaAtividadeValidada[]
}) {
  const naoValidadas = atividades.filter((a) => a.status !== "validada")
  const contagemExcluidas = naoValidadas.reduce(
    (contagem, a) => {
      contagem[a.status as Exclude<StatusAtividade, "validada">]++
      return contagem
    },
    { analise: 0, pendente: 0, recusada: 0 } as Record<Exclude<StatusAtividade, "validada">, number>
  )
  const partesExcluidas = (Object.keys(contagemExcluidas) as Exclude<StatusAtividade, "validada">[])
    .filter((chave) => contagemExcluidas[chave] > 0)
    .map((chave) => {
      const quantidade = contagemExcluidas[chave]
      const rotulo = ROTULO_STATUS_EXCLUIDO[chave]
      return `${formatarNumero(quantidade)} ${quantidade === 1 ? rotulo.singular : rotulo.plural}`
    })

  const tiposOk = progresso.tiposDistintos >= progresso.tiposExigidos

  return (
    <div className="flex max-w-content flex-col gap-8 print:gap-6">
      <section
        aria-labelledby="titulo-identificacao"
        className="flex flex-col gap-4 rounded-lg border bg-surface p-6 print:break-inside-avoid print:border-0 print:p-0"
      >
        <h2 id="titulo-identificacao">Identificação</h2>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-3 sm:max-w-form">
          <dt className="text-label text-muted-foreground">Discente</dt>
          <dd className="text-body">{discente.nome}</dd>
          <dt className="text-label text-muted-foreground">RA</dt>
          <dd className="tabular text-body">{discente.ra}</dd>
          <dt className="text-label text-muted-foreground">Curso</dt>
          <dd className="text-body">{discente.curso}</dd>
          <dt className="text-label text-muted-foreground">Data de emissão</dt>
          <dd className="tabular text-body">{formatarDataHora(emitidoEm.toISOString())}</dd>
        </dl>
      </section>

      <section
        aria-labelledby="titulo-total"
        className="flex flex-col gap-3 rounded-lg border bg-surface p-6 print:break-inside-avoid print:border-0 print:p-0"
      >
        <h2 id="titulo-total">Total consolidado</h2>
        <p className="leading-secondary text-foreground">
          <strong className="font-medium">
            {formatarCreditos(progresso.creditosObtidos)} de {formatarNumero(progresso.creditosExigidos)}
          </strong>{" "}
          exigidos para a integralização —{" "}
          {formatarHorasContabilizadas(progresso.horasObtidas, progresso.horasExigidas)}.
        </p>
        <p className="text-caption leading-secondary text-muted-foreground">{formatarPremissaCredito()}</p>
        <p className="flex items-start gap-2 border-t pt-3">
          <span className="flex h-6 shrink-0 items-center">
            {tiposOk ? (
              <CircleCheck aria-hidden="true" className="size-5 text-success" />
            ) : (
              <CircleDashed aria-hidden="true" className="size-5 text-pending" />
            )}
          </span>
          <span>
            Tipos de atividade diferentes:{" "}
            <strong className="font-medium tabular">
              {formatarNumero(Math.min(progresso.tiposDistintos, progresso.tiposExigidos))} de{" "}
              {formatarNumero(progresso.tiposExigidos)}
            </strong>
            {tiposOk ? " — exigência cumprida." : " — exigência não cumprida."} O Projeto Pedagógico (seção 3.5.4)
            exige pelo menos {formatarNumero(progresso.tiposExigidos)} tipos de atividade diferentes para a
            integralização.
          </span>
        </p>
      </section>

      <section aria-labelledby="titulo-tabela" className="flex flex-col gap-3 rounded-lg border bg-surface p-6 print:border-0 print:p-0">
        <h2 id="titulo-tabela">Atividades por tipo</h2>
        <p className="leading-secondary text-muted-foreground">
          Somente atividades <strong className="font-medium text-foreground">validadas</strong> entram neste
          relatório.{" "}
          {naoValidadas.length === 0
            ? `Todas as ${formatarNumero(atividades.length)} atividades registradas foram validadas.`
            : `${formatarNumero(naoValidadas.length)} de ${formatarNumero(atividades.length)} atividades registradas não entram, porque ainda não foram validadas (${partesExcluidas.join(", ")}).`}
        </p>

        {progresso.porTipo.length === 0 ? (
          <p className="leading-secondary text-muted-foreground">Nenhuma atividade validada até o momento.</p>
        ) : (
          <>
            {/* Desktop e impressão: tabela real, a partir de 768 px (mesmo ponto de corte da
                listagem, tela 03). A impressão força a tabela mesmo se a página nasceu no
                celular — é o formato que cabe legível em A4. */}
            <div className="hidden overflow-x-auto md:block print:block">
              <table className="w-full">
                <caption className="mb-2 text-left text-label text-foreground">
                  Créditos e horas contabilizadas por tipo de atividade validado, conforme a Tabela 7 do Projeto
                  Pedagógico.
                </caption>
                <thead className="border-b bg-muted print:bg-transparent">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Tipo (Tabela 7)
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Você registrou
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Créditos
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Horas contabilizadas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {progresso.porTipo.map((item) => {
                    const tipo = obterTipo(item.tipoId)
                    return (
                      <tr key={item.tipoId} className="print:break-inside-avoid">
                        <td className="px-4 py-2 text-body">{tipo.nome}</td>
                        <td className="px-4 py-2 text-body">{formatarUnidade(item.tipoId, item.quantidade)}</td>
                        <td className="px-4 py-2 text-body">{formatarCreditos(item.creditos)}</td>
                        <td className="px-4 py-2 text-body">{formatarHoras(item.horas)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="border-t-2">
                  <tr className="print:break-inside-avoid">
                    <th scope="row" className="px-4 py-2 text-left text-label text-foreground">
                      Total
                    </th>
                    <td className="px-4 py-2" aria-hidden="true"></td>
                    <td className="px-4 py-2 text-body font-medium">{formatarCreditos(progresso.creditosObtidos)}</td>
                    <td className="px-4 py-2 text-body font-medium">{formatarHoras(progresso.horasObtidas)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile: lista de cards, abaixo de 768 px — nunca rolagem horizontal na tela. */}
            <ul className="flex flex-col gap-2 md:hidden print:hidden">
              {progresso.porTipo.map((item) => {
                const tipo = obterTipo(item.tipoId)
                return (
                  <li key={item.tipoId} className="flex flex-col gap-1 rounded-lg border p-4">
                    <span className="text-body font-medium">{tipo.nome}</span>
                    <span className="tabular text-label text-muted-foreground">
                      {formatarUnidade(item.tipoId, item.quantidade)} · {formatarCreditos(item.creditos)} ·{" "}
                      {formatarHoras(item.horas)}
                    </span>
                  </li>
                )
              })}
              <li className="flex items-baseline justify-between gap-4 rounded-lg border bg-muted p-4">
                <span className="text-body font-medium">Total</span>
                <span className="tabular text-body font-medium">
                  {formatarCreditos(progresso.creditosObtidos)} · {formatarHoras(progresso.horasObtidas)}
                </span>
              </li>
            </ul>
          </>
        )}

        <p className="text-caption leading-secondary text-muted-foreground">
          Os quatro grupos ({GRUPOS.map((g) => g.nome).join(", ")}) são só organização visual; a tabela acima
          agrupa pelo tipo de atividade, que é o que a Tabela 7 reconhece.
        </p>
      </section>

      <section
        aria-labelledby="titulo-atividades-validadas"
        className="flex flex-col gap-3 rounded-lg border bg-surface p-6 print:break-inside-avoid print:border-0 print:p-0"
      >
        <h2 id="titulo-atividades-validadas">Atividades validadas</h2>
        <p className="leading-secondary text-muted-foreground">
          Uma linha por atividade — mesmos dados do arquivo gerado pelo botão &quot;Baixar CSV&quot;.
        </p>

        {linhasValidadas.length === 0 ? (
          <p className="leading-secondary text-muted-foreground">Nenhuma atividade validada até o momento.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block print:block">
              <table className="w-full">
                <caption className="mb-2 text-left text-label text-foreground">
                  Atividades validadas, uma linha por atividade, com data, tipo, créditos reconhecidos e quem
                  validou.
                </caption>
                <thead className="border-b bg-muted print:bg-transparent">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Data
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Tipo (Tabela 7)
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Descrição
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Carga horária
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Créditos
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Validado por
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {linhasValidadas.map((linha) => (
                    <tr key={linha.atividadeId} className="print:break-inside-avoid">
                      <td className="tabular px-4 py-2 text-body">{linha.data}</td>
                      <td className="px-4 py-2 text-body">{linha.tipo}</td>
                      <td className="px-4 py-2 text-body">{linha.descricao}</td>
                      <td className="tabular px-4 py-2 text-body">{linha.cargaHoraria}</td>
                      <td className="tabular px-4 py-2 text-body">{linha.creditos}</td>
                      <td className="px-4 py-2 text-body">{linha.status}</td>
                      <td className="px-4 py-2 text-body">{linha.validadoPor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="flex flex-col gap-2 md:hidden print:hidden">
              {linhasValidadas.map((linha) => (
                <li key={linha.atividadeId} className="flex flex-col gap-1 rounded-lg border p-4">
                  <span className="text-body font-medium">{linha.descricao}</span>
                  <span className="tabular text-label text-muted-foreground">
                    {linha.data} · {linha.tipo} · {linha.creditos}
                  </span>
                  <span className="text-label text-muted-foreground">Validado por {linha.validadoPor}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <footer className="border-t pt-4 text-caption leading-secondary text-muted-foreground">
        Fonte: {FONTE_TABELA_7}.
      </footer>
    </div>
  )
}
