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

import { Printer, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { EtiquetaRisco } from "@/components/docente/EtiquetaRisco"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { EnviarRelatorioPorEmail } from "@/components/relatorio/EnviarRelatorioPorEmail"
import { Button } from "@/components/ui/button"
import { CURSO } from "@/lib/catalogo"
import { formatarCreditos, formatarDataHora, formatarNumero, formatarPercentual } from "@/lib/formatacao"
import { obterDocenteAtual, obterRelatorioTurma } from "@/lib/storage"
import type { Docente } from "@/lib/types"
import type { RelatorioTurma as DadosRelatorioTurma } from "@/lib/orientandos"

type Estado =
  | { status: "carregando" }
  | { status: "erro" }
  | { status: "pronto"; docente: Docente; dados: DadosRelatorioTurma }

export function RelatorioTurma() {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)
  const [emitidoEm] = useState(() => new Date())

  useEffect(() => {
    let ativo = true
    Promise.all([obterDocenteAtual(), obterRelatorioTurma()])
      .then(([docente, dados]) => ativo && setEstado({ status: "pronto", docente, dados }))
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [tentativa])

  return (
    <>
      <PageHeader
        titulo="Relatório da turma"
        subtitulo="Créditos homologados e sinais de risco dos seus orientandos, consolidados para a coordenação."
        acao={
          estado.status === "pronto" && estado.dados.totalAlunos > 0 ? (
            <>
              <EnviarRelatorioPorEmail
                assunto={`Relatório da turma — ${CURSO.sigla}`}
                mensagem={mensagemDoRelatorioTurma(estado.docente, estado.dados, emitidoEm)}
                rotulo="Enviar por e-mail"
              />
              <Button onClick={() => window.print()}>
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

      {estado.status === "pronto" && estado.dados.totalAlunos === 0 && (
        <EstadoVazio
          nivelTitulo={2}
          icone={TrendingUp}
          titulo="Nenhum dado disponível para esta turma"
          descricao="Quando você tiver orientandos vinculados, o relatório aparece aqui."
        />
      )}

      {estado.status === "pronto" && estado.dados.totalAlunos > 0 && (
        <ConteudoRelatorio docente={estado.docente} dados={estado.dados} emitidoEm={emitidoEm} />
      )}
    </>
  )
}

function mensagemDoRelatorioTurma(docente: Docente, dados: DadosRelatorioTurma, emitidoEm: Date): string {
  const mediaArredondada = Math.round(dados.mediaCreditos * 10) / 10
  return [
    "Olá,",
    "",
    `Compartilho o relatório da turma de orientandos de ${docente.nome}.`,
    `Total de alunos: ${formatarNumero(dados.totalAlunos)}.`,
    `Já integralizaram: ${formatarPercentual(dados.percentualIntegralizado)}.`,
    `Média de créditos validados: ${formatarCreditos(mediaArredondada)}.`,
    `Aguardando validação: ${formatarNumero(dados.pendentesAguardando)}.`,
    `Data de emissão: ${formatarDataHora(emitidoEm.toISOString())}.`,
    "",
    "O PDF do relatório será anexado a esta mensagem.",
    "",
    "Atenciosamente,",
    docente.nome,
  ].join("\n")
}

function ConteudoRelatorio({
  docente,
  dados,
  emitidoEm,
}: {
  docente: Docente
  dados: DadosRelatorioTurma
  emitidoEm: Date
}) {
  const mediaArredondada = Math.round(dados.mediaCreditos * 10) / 10

  const indicadores = [
    { id: "total", rotulo: "Total de alunos", valor: formatarNumero(dados.totalAlunos) },
    { id: "integralizou", rotulo: "Já integralizaram", valor: formatarPercentual(dados.percentualIntegralizado) },
    { id: "media", rotulo: "Média de créditos validados", valor: formatarCreditos(mediaArredondada) },
    { id: "aguardando", rotulo: "Aguardando validação", valor: formatarNumero(dados.pendentesAguardando) },
  ]

  return (
    <div className="flex max-w-content flex-col gap-8 print:gap-6">
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
        aria-labelledby="titulo-risco"
        className="flex flex-col gap-3 rounded-lg border bg-surface p-6 print:break-inside-avoid print:border-0 print:p-0"
      >
        <h2 id="titulo-risco">Alunos em risco de não integralizar</h2>
        {dados.emRisco.length === 0 ? (
          <p className="leading-secondary text-muted-foreground">Nenhum orientando com sinal de risco no momento.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {dados.emRisco.map((r) => (
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
