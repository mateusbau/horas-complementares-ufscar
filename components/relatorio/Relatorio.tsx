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

import { CircleAlert, CircleCheck, CircleDashed, Download, Printer } from "lucide-react"
import { useEffect, useState } from "react"

import { EstadoErro } from "@/components/feedback/EstadoErro"
import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { EnviarRelatorioPorEmail } from "@/components/relatorio/EnviarRelatorioPorEmail"
import { FiltrosRelatorio } from "@/components/relatorio/FiltrosRelatorio"
import { Button } from "@/components/ui/button"
import { calcularProgresso, creditosDaAtividade } from "@/lib/calculos"
import { FONTE_TABELA_7, GRUPOS, obterTipo } from "@/lib/catalogo"
import { baixarCSV, montarCSV } from "@/lib/csv"
import { emailInstitucionalDocente } from "@/lib/email"
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
import {
  dataDeValidacao,
  descreverFiltros,
  erroPeriodo,
  filtrarAtividades,
  filtrosPadrao,
  filtrosSaoPadrao,
  type FiltrosRelatorio as TipoFiltros,
} from "@/lib/relatorio-filtros"
import { listarAtividades, obterDiscenteAtual, obterDocente, obterDocenteAtual } from "@/lib/storage"
import type { Atividade, Discente, Docente, Progresso, StatusAtividade } from "@/lib/types"

type Estado =
  | { status: "carregando" }
  | { status: "erro" }
  | {
      status: "pronto"
      discente: Discente
      /** Quem homologa créditos — vai no CSV ("Validado por"). Único docente da demo hoje, mas é
       *  um papel distinto do orientador: não dá pra colapsar os dois num só. */
      docente: Docente
      /** Vínculo do discente (discente.orientadorId) — sugestão de destinatário do e-mail. */
      orientador: Docente | null
      atividades: Atividade[]
    }

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
  cargaHorariaCertificado: string
  creditos: string
  status: string
  validadoPor: string
}

/**
 * Só atividades validadas (mesma regra do resto do relatório). "Data" é a do
 * parecer que aprovou — é o evento que este relatório documenta; sem
 * parecer de aprovação (não deveria acontecer com status "validada", mas o
 * TypeScript não sabe disso), cai para o envio ou a criação.
 *
 * "Carga horária do certificado" é o valor bruto registrado (a.quantidade,
 * na unidade do próprio tipo — horas, dias, palestras...), NUNCA
 * creditosDaAtividade() convertido de volta em horas: a Tabela 7 do PPC usa
 * a carga horária como requisito para chegar aos créditos, não o caminho
 * inverso, e HORAS_POR_CREDITO não define uma carga horária "real" a
 * partir do crédito. formatarUnidade é a mesma função que a tabela "Atividades
 * por tipo" já usa na coluna "Você registrou" — dado bruto, sem conversão.
 */
function construirLinhasValidadas(atividades: readonly Atividade[], docente: Docente): LinhaAtividadeValidada[] {
  return atividades
    .filter((a) => a.status === "validada")
    .map((a) => {
      const dataISO = dataDeValidacao(a) ?? a.criadaEm
      return {
        atividadeId: a.id,
        dataISO,
        data: formatarData(dataISO),
        tipo: a.tipoId === null ? "Sem tipo previsto" : obterTipo(a.tipoId).nome,
        descricao: a.titulo,
        cargaHorariaCertificado:
          a.tipoId === null || a.quantidade === null ? "—" : formatarUnidade(a.tipoId, a.quantidade),
        creditos: formatarCreditos(creditosDaAtividade(a)),
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
  const [filtros, setFiltros] = useState<TipoFiltros>(() => filtrosPadrao())
  const anunciar = useAnunciar()

  useEffect(() => {
    let ativo = true
    Promise.all([obterDiscenteAtual(), obterDocenteAtual(), listarAtividades()])
      .then(async ([discente, docente, atividades]) => {
        const orientador = discente.orientadorId ? await obterDocente(discente.orientadorId) : null
        if (!ativo) return
        setEstado({ status: "pronto", discente, docente, orientador, atividades })
      })
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [tentativa])

  // Estende a mesma calcularProgresso: filtra a lista de atividades ANTES de passar para ela,
  // nunca reimplementa crédito/percentual. progresso e linhasValidadas do relatório filtrado
  // vêm dos dois únicos caminhos que já existiam (calcularProgresso / construirLinhasValidadas).
  const atividadesFiltradas =
    estado.status === "pronto" ? filtrarAtividades(estado.atividades, filtros, dataDeValidacao) : []
  const progressoFiltrado = estado.status === "pronto" ? calcularProgresso(atividadesFiltradas) : null
  const linhasValidadas =
    estado.status === "pronto" ? construirLinhasValidadas(atividadesFiltradas, estado.docente) : []
  const semResultado = estado.status === "pronto" && linhasValidadas.length === 0
  const podeExportar = estado.status === "pronto" && !semResultado && !erroPeriodo(filtros)

  function aoMudarFiltros(novosFiltros: TipoFiltros) {
    setFiltros(novosFiltros)
    if (estado.status !== "pronto" || erroPeriodo(novosFiltros)) return
    const novasAtividades = filtrarAtividades(estado.atividades, novosFiltros, dataDeValidacao)
    const novoProgresso = calcularProgresso(novasAtividades)
    const totalValidadas = novasAtividades.filter((a) => a.status === "validada").length
    anunciar(
      totalValidadas === 0
        ? "Nenhuma atividade validada corresponde aos filtros selecionados."
        : `Filtro aplicado: ${formatarCreditos(novoProgresso.creditosObtidos)} de ${formatarNumero(novoProgresso.creditosExigidos)}, ${formatarNumero(totalValidadas)} ${totalValidadas === 1 ? "atividade validada" : "atividades validadas"}.`
    )
  }

  function aoBaixarCSV() {
    if (estado.status !== "pronto" || !podeExportar) return
    const conteudo = montarCSV(
      [
        "Data",
        "Tipo de atividade (Tabela 7)",
        "Descrição",
        "Carga horária do certificado",
        "Créditos reconhecidos",
        "Status",
        "Validado por",
      ],
      linhasValidadas.map((l) => [l.data, l.tipo, l.descricao, l.cargaHorariaCertificado, l.creditos, l.status, l.validadoPor]),
      descreverFiltros(filtros)
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
              <Button
                variant="outline"
                onClick={aoBaixarCSV}
                disabled={!podeExportar}
                aria-describedby={!podeExportar ? "relatorio-sem-resultado" : undefined}
              >
                <Download aria-hidden="true" />
                Baixar CSV
              </Button>
              <EnviarRelatorioPorEmail
                destinatarioInicial={estado.orientador ? emailInstitucionalDocente(estado.orientador) : ""}
                assunto={`Relatório de horas complementares — ${estado.discente.nome}`}
                mensagem={mensagemDoRelatorio(estado.discente, progressoFiltrado!, filtros, emitidoEm)}
                rotulo="Enviar por e-mail"
                desabilitado={!podeExportar}
                ariaDescribedbyGatilho="relatorio-sem-resultado"
              />
              <Button
                onClick={() => window.print()}
                disabled={!podeExportar}
                aria-describedby={!podeExportar ? "relatorio-sem-resultado" : undefined}
              >
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

      {estado.status === "pronto" && progressoFiltrado && (
        <div className="flex flex-col gap-8">
          <div className="max-w-content">
            <FiltrosRelatorio filtros={filtros} onChange={aoMudarFiltros} />
          </div>
          <ConteudoRelatorio
            discente={estado.discente}
            atividades={estado.atividades}
            progresso={progressoFiltrado}
            filtros={filtros}
            semResultado={semResultado}
            emitidoEm={emitidoEm}
            linhasValidadas={linhasValidadas}
          />
        </div>
      )}
    </>
  )
}

/**
 * `progresso` aqui é o FILTRADO (progressoFiltrado, recalculado sobre o subconjunto do período
 * de validação e tipos marcados na tela), nunca o total sem filtro — senão o e-mail relataria
 * números diferentes da tela e do CSV que a mesma pessoa acabou de gerar. A linha de filtros
 * (descreverFiltros) é a mesma do cabeçalho e do CSV.
 */
function mensagemDoRelatorio(discente: Discente, progresso: Progresso, filtros: TipoFiltros, emitidoEm: Date): string {
  return [
    "Olá,",
    "",
    `Compartilho o relatório de horas complementares de ${discente.nome} (RA ${discente.ra}).`,
    descreverFiltros(filtros),
    `Créditos validados: ${formatarCreditos(progresso.creditosObtidos)} de ${formatarNumero(progresso.creditosExigidos)} exigidos.`,
    `Horas contabilizadas: ${formatarHoras(progresso.horasObtidas)} de ${formatarHoras(progresso.horasExigidas)} exigidas.`,
    `Data de emissão: ${formatarDataHora(emitidoEm.toISOString())}.`,
    "",
    "Vou anexar o PDF do relatório a esta mensagem antes de enviar.",
    "",
    "Atenciosamente,",
    discente.nome,
  ].join("\n")
}

function ConteudoRelatorio({
  discente,
  atividades,
  progresso,
  filtros,
  semResultado,
  emitidoEm,
  linhasValidadas,
}: {
  discente: Discente
  atividades: Atividade[]
  progresso: Progresso
  filtros: TipoFiltros
  semResultado: boolean
  emitidoEm: Date
  linhasValidadas: LinhaAtividadeValidada[]
}) {
  const validadasTotais = atividades.filter((a) => a.status === "validada")
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
  const filtroPadrao = filtrosSaoPadrao(filtros)

  return (
    <div className="flex max-w-content flex-col gap-8 print:gap-6">
      <p className="rounded-lg border border-input-border bg-accent-soft p-4 leading-secondary text-foreground print:border-0 print:bg-transparent print:p-0">
        {descreverFiltros(filtros)}
      </p>

      {semResultado && (
        <p
          id="relatorio-sem-resultado"
          className="flex items-start gap-2 rounded-lg border border-input-border bg-surface p-4 leading-secondary text-foreground print:hidden"
        >
          <span className="flex h-[1.45em] shrink-0 items-center">
            <CircleAlert aria-hidden="true" className="size-4 text-accent-text" />
          </span>
          {filtroPadrao
            ? "Você ainda não tem nenhuma atividade validada. Os botões de exportação ficam disponíveis quando houver alguma."
            : "Nenhuma atividade validada corresponde ao período de validação e aos tipos selecionados. Ajuste os filtros para ver e exportar o relatório."}
        </p>
      )}

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
          {!filtroPadrao &&
            ` Com os filtros de período de validação e tipo aplicados, ${formatarNumero(linhasValidadas.length)} de ${formatarNumero(validadasTotais.length)} atividades validadas aparecem abaixo.`}
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
                      Carga horária do certificado
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Créditos reconhecidos
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
                      <td className="tabular px-4 py-2 text-body">{linha.cargaHorariaCertificado}</td>
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
