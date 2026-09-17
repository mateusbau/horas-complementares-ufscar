"use client"

// components/docente/RelatorioTurma.tsx
//
// Mesmo padrão de impressão do relatório do discente
// (components/relatorio/Relatorio.tsx): @media print (app/globals.css) e as
// classes print:hidden já espalhadas pela barra de acessibilidade, sidebar e
// PageHeader escondem navegação e botões sozinhas — este componente só marca
// print:break-inside-avoid nas seções e print:border-0/p-0 para a folha não
// repetir a borda do cartão.
//
// Os quatro indicadores do topo, a distribuição por tipo e a lista de risco
// vêm todos do MESMO RelatorioTurma (lib/orientandos.ts, via
// obterRelatorioTurma em lib/storage.ts) que "Meus orientandos" usa para a
// lista — por isso as duas telas nunca divergem: quem entra no percentual de
// integralização e na lista de risco aqui é exatamente quem a outra tela já
// mostra.

import { CircleAlert, Download, Printer, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { EtiquetaRisco } from "@/components/docente/EtiquetaRisco"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { FiltrosRelatorio } from "@/components/relatorio/FiltrosRelatorio"
import { Button } from "@/components/ui/button"
import { HORAS_EXIGIDAS } from "@/lib/calculos"
import { CURSO } from "@/lib/catalogo"
import { baixarCSV, montarCSV } from "@/lib/csv"
import {
  formatarCreditos,
  formatarDataArquivo,
  formatarDataHora,
  formatarNumero,
  formatarPercentual,
} from "@/lib/formatacao"
import { agregarTurma, resumirOrientando, type RelatorioTurma as DadosRelatorioTurma, type ResumoOrientando } from "@/lib/orientandos"
import {
  dataDeValidacao,
  descreverFiltros,
  erroPeriodo,
  filtrarAtividades,
  filtrosPadrao,
  type FiltrosRelatorio as TipoFiltros,
} from "@/lib/relatorio-filtros"
import { listarAtividadesDosOrientandos, obterDocenteAtual } from "@/lib/storage"
import type { Atividade, Discente, Docente } from "@/lib/types"

type BrutoOrientando = { discente: Discente; atividades: Atividade[] }

type Estado =
  | { status: "carregando" }
  | { status: "erro" }
  | { status: "pronto"; docente: Docente; bruto: BrutoOrientando[] }

export function RelatorioTurma() {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)
  const [emitidoEm] = useState(() => new Date())
  const [filtros, setFiltros] = useState<TipoFiltros>(() => filtrosPadrao())
  const anunciar = useAnunciar()

  useEffect(() => {
    let ativo = true
    Promise.all([obterDocenteAtual(), listarAtividadesDosOrientandos()])
      .then(([docente, bruto]) => ativo && setEstado({ status: "pronto", docente, bruto }))
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [tentativa])

  // Estende a mesma agregação (resumirOrientando + agregarTurma, lib/orientandos.ts): filtra a
  // lista de atividades de cada orientando ANTES de resumirOrientando, nunca reimplementa
  // crédito/percentual. "Meus orientandos" (sem filtro) e este relatório continuam usando as
  // duas mesmas funções — só a entrada muda.
  function recalcular(bruto: BrutoOrientando[], filtrosAplicados: TipoFiltros): ResumoOrientando[] {
    return bruto.map(({ discente, atividades }) =>
      resumirOrientando(discente, filtrarAtividades(atividades, filtrosAplicados, dataDeValidacao), emitidoEm)
    )
  }

  const orientandos = estado.status === "pronto" ? recalcular(estado.bruto, filtros) : []
  const dados = agregarTurma(orientandos)
  // Risco de não integralizar é propriedade do HISTÓRICO INTEIRO do orientando, não do recorte
  // que o filtro da tela mostra — por isso usa sempre filtrosPadrao(), nunca `filtros`. Se
  // respondesse ao filtro, um docente que filtrasse por um tipo/período específico poderia achar
  // a turma em dia quando não está.
  const emRiscoTotal = estado.status === "pronto" ? agregarTurma(recalcular(estado.bruto, filtrosPadrao())).emRisco : []
  const semOrientandos = estado.status === "pronto" && estado.bruto.length === 0
  const semResultado = !semOrientandos && dados.totalAlunos > 0 && dados.mediaCreditos === 0 && dados.distribuicaoPorTipo.length === 0
  const podeExportar = estado.status === "pronto" && !semOrientandos && !semResultado && !erroPeriodo(filtros)

  function aoMudarFiltros(novosFiltros: TipoFiltros) {
    setFiltros(novosFiltros)
    if (estado.status !== "pronto" || erroPeriodo(novosFiltros)) return
    const novosOrientandos = recalcular(estado.bruto, novosFiltros)
    const novosDados = agregarTurma(novosOrientandos)
    anunciar(
      novosDados.mediaCreditos === 0 && novosDados.distribuicaoPorTipo.length === 0
        ? "Nenhuma atividade validada corresponde aos filtros selecionados."
        : `Filtro aplicado: média de ${formatarCreditos(Math.round(novosDados.mediaCreditos * 10) / 10)} por aluno, ${formatarPercentual(novosDados.percentualIntegralizado)} já integralizaram.`
    )
  }

  function aoBaixarCSV() {
    if (!podeExportar) return
    const linhas = [...orientandos]
      .sort((a, b) => a.discente.nome.localeCompare(b.discente.nome, "pt-BR"))
      .map((r) => [
        r.discente.nome,
        r.discente.ra,
        formatarCreditos(r.progresso.creditosObtidos),
        formatarCreditos(r.progresso.creditosFaltantes),
        formatarPercentual(r.progresso.percentual),
      ])
    const conteudo = montarCSV(
      ["Aluno", "RA", "Créditos reconhecidos", "Créditos pendentes", `% de conclusão dos ${formatarNumero(HORAS_EXIGIDAS)}h`],
      linhas,
      descreverFiltros(filtros)
    )
    baixarCSV(`relatorio-turma-${formatarDataArquivo(emitidoEm)}.csv`, conteudo)
  }

  return (
    <>
      <PageHeader
        titulo="Relatório da turma"
        subtitulo="Créditos homologados e sinais de risco dos seus orientandos, consolidados para a coordenação."
        acao={
          estado.status === "pronto" && !semOrientandos ? (
            <>
              <Button
                variant="outline"
                onClick={aoBaixarCSV}
                disabled={!podeExportar}
                aria-describedby={!podeExportar ? "relatorio-turma-sem-resultado" : undefined}
              >
                <Download aria-hidden="true" />
                Baixar CSV
              </Button>
              <Button
                onClick={() => window.print()}
                disabled={!podeExportar}
                aria-describedby={!podeExportar ? "relatorio-turma-sem-resultado" : undefined}
              >
                <Printer aria-hidden="true" />
                Imprimir relatório
              </Button>
            </>
          ) : undefined
        }
      />

      {estado.status === "carregando" && (
        <AreaCarregando texto="Carregando relatório da turma…" className="flex max-w-content flex-col gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </AreaCarregando>
      )}

      {estado.status === "erro" && (
        <EstadoErro nivelTitulo={2} titulo="Não foi possível carregar o relatório" onTentarNovamente={() => setTentativa((t) => t + 1)} />
      )}

      {estado.status === "pronto" && semOrientandos && (
        <EstadoVazio
          nivelTitulo={2}
          icone={TrendingUp}
          titulo="Nenhum dado disponível para esta turma"
          descricao="Quando você tiver orientandos vinculados, o relatório aparece aqui."
        />
      )}

      {estado.status === "pronto" && !semOrientandos && (
        <div className="flex flex-col gap-8">
          <div className="max-w-content">
            <FiltrosRelatorio filtros={filtros} onChange={aoMudarFiltros} />
          </div>
          <ConteudoRelatorio
            docente={estado.docente}
            dados={dados}
            orientandos={orientandos}
            emRiscoTotal={emRiscoTotal}
            filtros={filtros}
            semResultado={semResultado}
            emitidoEm={emitidoEm}
          />
        </div>
      )}
    </>
  )
}

function ConteudoRelatorio({
  docente,
  dados,
  orientandos,
  emRiscoTotal,
  filtros,
  semResultado,
  emitidoEm,
}: {
  docente: Docente
  dados: DadosRelatorioTurma
  orientandos: ResumoOrientando[]
  emRiscoTotal: ResumoOrientando[]
  filtros: TipoFiltros
  semResultado: boolean
  emitidoEm: Date
}) {
  const mediaArredondada = Math.round(dados.mediaCreditos * 10) / 10
  const orientandosOrdenados = [...orientandos].sort((a, b) => a.discente.nome.localeCompare(b.discente.nome, "pt-BR"))

  const indicadores = [
    { id: "total", rotulo: "Total de alunos", valor: formatarNumero(dados.totalAlunos) },
    { id: "integralizou", rotulo: "Já integralizaram", valor: formatarPercentual(dados.percentualIntegralizado) },
    { id: "media", rotulo: "Média de créditos validados", valor: formatarCreditos(mediaArredondada) },
    { id: "aguardando", rotulo: "Aguardando validação", valor: formatarNumero(dados.pendentesAguardando) },
  ]

  return (
    <div className="flex max-w-content flex-col gap-8 print:gap-6">
      <p className="rounded-lg border border-input-border bg-accent-soft p-4 leading-secondary text-foreground print:border-0 print:bg-transparent print:p-0">
        {descreverFiltros(filtros)}
      </p>

      {semResultado && (
        <p
          id="relatorio-turma-sem-resultado"
          className="flex items-start gap-2 rounded-lg border border-input-border bg-surface p-4 leading-secondary text-foreground print:hidden"
        >
          <span className="flex h-[1.45em] shrink-0 items-center">
            <CircleAlert aria-hidden="true" className="size-4 text-accent-text" />
          </span>
          Nenhuma atividade validada corresponde ao período de validação e aos tipos selecionados. Ajuste os
          filtros para ver e exportar o relatório.
        </p>
      )}

      <section
        aria-labelledby="titulo-identificacao"
        className="flex flex-col gap-4 rounded-lg border bg-surface p-6 print:break-inside-avoid print:border-0 print:p-0"
      >
        <h2 id="titulo-identificacao">Identificação</h2>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-3 sm:max-w-form">
          <dt className="text-label text-muted-foreground">Docente</dt>
          <dd className="text-body">{docente.nome}</dd>
          <dt className="text-label text-muted-foreground">Departamento</dt>
          <dd className="text-body">{docente.departamento}</dd>
          <dt className="text-label text-muted-foreground">Curso</dt>
          <dd className="text-body">{CURSO.nome}</dd>
          <dt className="text-label text-muted-foreground">Data de emissão</dt>
          <dd className="tabular text-body">{formatarDataHora(emitidoEm.toISOString())}</dd>
        </dl>
      </section>

      <p className="text-caption leading-secondary text-muted-foreground">
        Este relatório considera apenas atividades já validadas. Atividades pendentes não entram nos totais.
      </p>

      <section aria-labelledby="titulo-indicadores" className="flex flex-col gap-3">
        <h2 id="titulo-indicadores" className="sr-only">
          Indicadores da turma
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          {indicadores.map((indicador) => (
            <li
              key={indicador.id}
              className="flex flex-col gap-1 rounded-lg border bg-surface p-4 print:break-inside-avoid print:border print:p-2"
            >
              <span className="text-label text-muted-foreground">{indicador.rotulo}</span>
              <span className="tabular text-h2 print:text-h3">{indicador.valor}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="titulo-distribuicao"
        className="flex flex-col gap-3 rounded-lg border bg-surface p-6 print:break-inside-avoid print:border-0 print:p-0"
      >
        <h2 id="titulo-distribuicao">Distribuição por tipo de atividade</h2>
        <p className="leading-secondary text-muted-foreground">
          Quantos orientandos têm crédito validado em cada tipo da Tabela 7 — sem meta nem teto por tipo, porque o
          Projeto Pedagógico não define nenhum.
        </p>
        {dados.distribuicaoPorTipo.length === 0 ? (
          <p className="leading-secondary text-muted-foreground">Nenhuma atividade validada até o momento.</p>
        ) : (
          // A lista já é a alternativa textual do gráfico: cada item traz o
          // nome do tipo e a contagem por extenso, a barra é só reforço
          // visual (aria-hidden), não a única forma de ler a informação.
          <ul className="flex flex-col gap-2">
            {dados.distribuicaoPorTipo.map((item) => {
              const percentual = dados.totalAlunos > 0 ? (item.quantidadeAlunos / dados.totalAlunos) * 100 : 0
              return (
                <li key={item.tipoId} className="flex flex-col gap-1 print:break-inside-avoid">
                  <div className="flex items-center justify-between gap-4 text-body">
                    <span className="text-foreground">{item.nome}</span>
                    <span className="tabular text-muted-foreground">
                      {formatarNumero(item.quantidadeAlunos)} {item.quantidadeAlunos === 1 ? "aluno" : "alunos"}
                    </span>
                  </div>
                  <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-trilha print:hidden">
                    <div className="h-full bg-brand" style={{ width: `${percentual}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="titulo-orientandos"
        className="flex flex-col gap-3 rounded-lg border bg-surface p-6 print:break-inside-avoid print:border-0 print:p-0"
      >
        <h2 id="titulo-orientandos">Todos os orientandos</h2>
        <p className="leading-secondary text-muted-foreground">
          Uma linha por aluno — mesmos dados do arquivo gerado pelo botão &quot;Baixar CSV&quot;.
        </p>

        <div className="hidden overflow-x-auto md:block print:block">
          <table className="w-full">
            <caption className="mb-2 text-left text-label text-foreground">
              Créditos reconhecidos, créditos pendentes e percentual de conclusão dos {formatarNumero(HORAS_EXIGIDAS)}{" "}
              h, por aluno.
            </caption>
            <thead className="border-b bg-muted print:bg-transparent">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                  Aluno
                </th>
                <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                  RA
                </th>
                <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                  Créditos reconhecidos
                </th>
                <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                  Créditos pendentes
                </th>
                <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                  % de conclusão dos {formatarNumero(HORAS_EXIGIDAS)}h
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orientandosOrdenados.map((r) => (
                <tr key={r.discente.id} className="print:break-inside-avoid">
                  <td className="px-4 py-2 text-body">
                    <Link
                      href={`/docente/fila?discente=${r.discente.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:text-accent-text hover:underline print:no-underline"
                    >
                      {r.discente.nome}
                    </Link>
                  </td>
                  <td className="tabular px-4 py-2 text-body">{r.discente.ra}</td>
                  <td className="tabular px-4 py-2 text-body">{formatarCreditos(r.progresso.creditosObtidos)}</td>
                  <td className="tabular px-4 py-2 text-body">{formatarCreditos(r.progresso.creditosFaltantes)}</td>
                  <td className="tabular px-4 py-2 text-body">{formatarPercentual(r.progresso.percentual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="flex flex-col gap-2 md:hidden print:hidden">
          {orientandosOrdenados.map((r) => (
            <li key={r.discente.id} className="flex flex-col gap-1 rounded-lg border p-4">
              <Link
                href={`/docente/fila?discente=${r.discente.id}`}
                className="text-body font-medium text-foreground underline-offset-4 hover:text-accent-text hover:underline"
              >
                {r.discente.nome}
              </Link>
              <span className="tabular text-label text-muted-foreground">
                RA {r.discente.ra} · {formatarCreditos(r.progresso.creditosObtidos)} reconhecidos ·{" "}
                {formatarCreditos(r.progresso.creditosFaltantes)} pendentes ·{" "}
                {formatarPercentual(r.progresso.percentual)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="titulo-risco"
        className="flex flex-col gap-3 rounded-lg border bg-surface p-6 print:break-inside-avoid print:border-0 print:p-0"
      >
        <h2 id="titulo-risco">Alunos em risco de não integralizar</h2>
        <p className="text-caption leading-secondary text-muted-foreground">
          Esta lista considera o histórico completo de cada aluno, independentemente do período de validação e dos
          tipos filtrados acima — risco de não integralizar os 90h é propriedade do histórico inteiro.
        </p>
        {emRiscoTotal.length === 0 ? (
          <p className="leading-secondary text-muted-foreground">Nenhum orientando com sinal de risco no momento.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {emRiscoTotal.map((r) => (
              <li key={r.discente.id} className="flex flex-col gap-2 rounded-lg border p-4 print:break-inside-avoid">
                <Link
                  href={`/docente/fila?discente=${r.discente.id}`}
                  className="text-body font-medium text-foreground underline-offset-4 hover:text-accent-text hover:underline print:no-underline"
                >
                  {r.discente.nome}
                </Link>
                <span className="tabular text-caption text-muted-foreground">
                  RA {r.discente.ra} · {formatarCreditos(r.progresso.creditosObtidos)} de{" "}
                  {formatarNumero(r.progresso.creditosExigidos)}
                </span>
                <div className="flex flex-col gap-1">
                  {r.riscos.map((flag) => (
                    <EtiquetaRisco key={flag} flag={flag} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
