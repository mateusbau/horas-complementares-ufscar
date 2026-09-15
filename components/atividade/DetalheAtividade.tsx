"use client"

// components/atividade/DetalheAtividade.tsx — Tela 05 · Detalhe da atividade
//
// Versão magra (PROXIMA-ETAPA.md, item 2, e HANDOFF.md, etapa 8): dados,
// situação e parecer. O comprovante em si é visualizado por
// VisualizadorComprovante (miniatura + modal com zoom/giro/download),
// compartilhado com a validação do docente. Régua do crédito (CLAUDE.md): nada de "Categoria" nem
// "Carga solicitada"; o tipo e os créditos vêm do catálogo e de
// creditosDaAtividade, o arredondamento é explicado por
// formatarExplicacaoRequisito (mesma função do cadastro, PROXIMA-ETAPA item 2).
//
// Ações por status: "pendente" mostra Editar (rota /editar) e Enviar para
// validação (chama enviarAtividade direto, sem navegar); "em análise" e os
// status finais não mostram ação. Id inexistente cai no EstadoErro (HC-404),
// nunca em erro cru.

import { CircleAlert, CircleCheck, CircleDashed, CircleX, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { VisualizadorComprovante } from "@/components/atividade/VisualizadorComprovante"
import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, buttonVariants } from "@/components/ui/button"
import { ErroDeRegra, MENSAGEM_TIPO_NAO_PREVISTO, creditosDaAtividade } from "@/lib/calculos"
import { medidoEmHoras, obterTipo } from "@/lib/catalogo"
import {
  formatarCreditos,
  formatarData,
  formatarDataHora,
  formatarExplicacaoRequisito,
  formatarQuantidade,
  formatarRequisito,
} from "@/lib/formatacao"
import { enviarAtividade, obterAtividade, obterDocenteAtual } from "@/lib/storage"
import type { Atividade, DecisaoParecer, Docente, EventoHistorico, TipoEvento } from "@/lib/types"
import { cn } from "@/lib/utils"

type Estado =
  | { status: "carregando" }
  | { status: "naoEncontrada" }
  | { status: "erro" }
  | { status: "pronto"; atividade: Atividade; docente: Docente }

const ROTULO_EVENTO: Record<TipoEvento, string> = {
  enviada: "Enviada para validação",
  reenviada: "Reenviada para validação",
  analisada: "Analisada pelo docente",
  validada: "Validada",
  devolvida: "Devolvida com pendência",
  recusada: "Recusada",
  reclassificada: "Reclassificada pelo docente",
}

function autorDoEvento(tipo: TipoEvento, nomeDocente: string): string {
  return tipo === "enviada" || tipo === "reenviada" ? "Você" : nomeDocente
}

export function DetalheAtividade({ id }: { id: string }) {
  const anunciar = useAnunciar()
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    setEstado({ status: "carregando" })
    Promise.all([obterAtividade(id), obterDocenteAtual()])
      .then(([atividade, docente]) => {
        if (!ativo) return
        setEstado(atividade ? { status: "pronto", atividade, docente } : { status: "naoEncontrada" })
      })
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [id, tentativa])

  function tentarNovamente() {
    setTentativa((t) => t + 1)
  }

  async function aoEnviar() {
    setEnviando(true)
    setErroEnvio(null)
    try {
      const atualizada = await enviarAtividade(id)
      setEstado((atual) => (atual.status === "pronto" ? { ...atual, atividade: atualizada } : atual))
      anunciar("Atividade enviada para validação.")
    } catch (erro) {
      setEnviando(false)
      const mensagem =
        erro instanceof ErroDeRegra ? erro.erros.join(" ") : "Não foi possível enviar agora. Tente novamente."
      setErroEnvio(mensagem)
      anunciar(mensagem)
    }
  }

  if (estado.status === "carregando") {
    return (
      <>
        <PageHeader titulo="Detalhe da atividade" voltar={{ href: "/atividades", rotulo: "Voltar para Minhas atividades" }} />
        <AreaCarregando texto="Carregando atividade…" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <Skeleton className="h-64 w-full" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </AreaCarregando>
      </>
    )
  }

  if (estado.status === "naoEncontrada") {
    return (
      <>
        <PageHeader titulo="Detalhe da atividade" voltar={{ href: "/atividades", rotulo: "Voltar para Minhas atividades" }} />
        <EstadoErro
          nivelTitulo={2}
          titulo="Atividade não encontrada"
          descricao="O endereço não corresponde a nenhuma das suas atividades. Ela pode ter sido removida, ou o link pode estar incorreto."
          codigo="HC-404"
          onTentarNovamente={tentarNovamente}
        />
      </>
    )
  }

  if (estado.status === "erro") {
    return (
      <>
        <PageHeader titulo="Detalhe da atividade" voltar={{ href: "/atividades", rotulo: "Voltar para Minhas atividades" }} />
        <EstadoErro nivelTitulo={2} titulo="Não foi possível carregar a atividade" onTentarNovamente={tentarNovamente} />
      </>
    )
  }

  const { atividade, docente } = estado
  const tipo = atividade.tipoId ? obterTipo(atividade.tipoId) : null
  const creditos = creditosDaAtividade(atividade)
  const nomeTipo = tipo ? tipo.nomeCurto : "Sem tipo previsto"
  const quando = atividade.enviadaEm ? `enviada em ${formatarDataHora(atividade.enviadaEm)}` : "ainda não enviada"

  return (
    <>
      <PageHeader
        titulo={atividade.titulo}
        subtitulo={`${nomeTipo} · ${formatarCreditos(creditos)} · ${quando}.`}
        voltar={{ href: "/atividades", rotulo: "Voltar para Minhas atividades" }}
        acao={
          atividade.status === "pendente" ? (
            <>
              <Link href={`/atividades/${atividade.id}/editar`} className={buttonVariants({ variant: "outline" })}>
                Editar
              </Link>
              <Button onClick={() => void aoEnviar()} disabled={enviando}>
                {enviando ? "Enviando…" : "Enviar para validação"}
              </Button>
            </>
          ) : undefined
        }
      />

      {erroEnvio && (
        <p className="mb-6 flex items-start gap-2 rounded-lg border border-danger bg-danger-bg p-4 text-label leading-secondary text-danger">
          <span className="flex h-[1.45em] shrink-0 items-center">
            <CircleAlert aria-hidden="true" className="size-4" />
          </span>
          {erroEnvio}
        </p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <VisualizadorComprovante comprovante={atividade.comprovante} tipoAtividadeNome={nomeTipo} />

        <div className="flex flex-col gap-6">
          <Situacao historico={atividade.historico} nomeDocente={docente.nome} />
          <DadosDaAtividade atividade={atividade} tipo={tipo} creditos={creditos} nomeDocente={docente.nome} />
          <ParecerDocente atividade={atividade} nomeDocente={docente.nome} />
        </div>
      </div>
    </>
  )
}

function Situacao({ historico, nomeDocente }: { historico: EventoHistorico[]; nomeDocente: string }) {
  return (
    <section aria-labelledby="titulo-situacao" className="flex flex-col gap-3 rounded-lg border bg-surface p-6">
      <h2 id="titulo-situacao">Situação</h2>
      {historico.length === 0 ? (
        <p className="leading-secondary text-muted-foreground">
          Nenhum evento registrado ainda. Envie a atividade para iniciar a validação.
        </p>
      ) : (
        <ol className="flex flex-col divide-y">
          {historico.map((evento, indice) => (
            <li key={indice} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
              <span className="text-body">{ROTULO_EVENTO[evento.tipo]}</span>
              <span className="tabular text-caption text-muted-foreground">
                {autorDoEvento(evento.tipo, nomeDocente)} · {formatarDataHora(evento.em)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function DadosDaAtividade({
  atividade,
  tipo,
  creditos,
  nomeDocente,
}: {
  atividade: Atividade
  tipo: ReturnType<typeof obterTipo> | null
  creditos: number
  nomeDocente: string
}) {
  return (
    <section aria-labelledby="titulo-dados" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
      <h2 id="titulo-dados">Dados da atividade</h2>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-3">
        <dt className="text-label text-muted-foreground">Tipo</dt>
        <dd className="text-body">{tipo ? tipo.nome : "Fora da Tabela 7 (tipo não previsto)"}</dd>

        {tipo && (
          <>
            <dt className="text-label text-muted-foreground">Requisito da Tabela 7</dt>
            <dd className="text-body">{formatarRequisito(tipo.id)}</dd>

            <dt className="text-label text-muted-foreground">Comprovante exigido</dt>
            <dd className="text-body">{tipo.comprovante}</dd>

            {atividade.quantidade !== null && (
              <>
                <dt className="text-label text-muted-foreground">Você informou</dt>
                <dd className="text-body">{formatarQuantidade(tipo.id, atividade.quantidade)}</dd>
              </>
            )}
          </>
        )}

        <dt className="text-label text-muted-foreground">Período</dt>
        <dd className="text-body">
          {atividade.periodo
            ? `${formatarData(atividade.periodo.inicio)} – ${formatarData(atividade.periodo.termino)}`
            : "Não informado"}
        </dd>

        {atividade.pareceres.length > 0 && (
          <>
            <dt className="text-label text-muted-foreground">Validador</dt>
            <dd className="text-body">{nomeDocente}</dd>
          </>
        )}
      </dl>

      <p className="border-t pt-4 leading-secondary text-muted-foreground">
        <strong className="font-medium text-foreground">{formatarCreditos(creditos)}</strong> nesta atividade.
        {!tipo
          ? ` ${MENSAGEM_TIPO_NAO_PREVISTO}`
          : medidoEmHoras(tipo)
            ? ` ${formatarExplicacaoRequisito(tipo.id)}`
            : ""}
      </p>
    </section>
  )
}

const ROTULO_DECISAO: Record<DecisaoParecer, { rotulo: string; icone: LucideIcon; classe: string }> = {
  aprovar: { rotulo: "Aprovada", icone: CircleCheck, classe: "bg-success-bg text-success" },
  devolver: { rotulo: "Devolvida com pendência", icone: CircleDashed, classe: "bg-pending-bg text-pending" },
  recusar: { rotulo: "Recusada", icone: CircleX, classe: "bg-danger-bg text-danger" },
}

/** Rótulo da decisão em si (não o status atual da atividade): "Parecer do docente" mostra o
 * que ele decidiu, ainda que devolver leve a atividade de volta a "pendente". */
function BadgeDecisao({ decisao }: { decisao: DecisaoParecer }) {
  const { rotulo, icone: Icone, classe } = ROTULO_DECISAO[decisao]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full px-2.5 py-1 text-caption font-medium",
        classe
      )}
    >
      <Icone aria-hidden="true" className="size-3.5 shrink-0" />
      {rotulo}
    </span>
  )
}

function ParecerDocente({ atividade, nomeDocente }: { atividade: Atividade; nomeDocente: string }) {
  const parecer = atividade.pareceres.at(-1)
  return (
    <section aria-labelledby="titulo-parecer" className="flex flex-col gap-3 rounded-lg border bg-surface p-6">
      <h2 id="titulo-parecer">Parecer do docente</h2>
      {!parecer ? (
        <p className="leading-secondary text-muted-foreground">
          {atividade.status === "analise"
            ? "Em análise: ainda não há parecer do docente."
            : "Esta atividade ainda não foi enviada para validação."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <BadgeDecisao decisao={parecer.decisao} />
          {parecer.comentario && <p className="leading-secondary text-foreground">{parecer.comentario}</p>}
          {parecer.reclassificacao && (
            <p className="rounded-lg border border-input-border bg-accent-soft p-3 text-label leading-secondary text-foreground">
              Reclassificada de{" "}
              {parecer.reclassificacao.deTipoId ? obterTipo(parecer.reclassificacao.deTipoId).nomeCurto : "fora da Tabela 7"}{" "}
              para{" "}
              {parecer.reclassificacao.paraTipoId ? obterTipo(parecer.reclassificacao.paraTipoId).nomeCurto : "fora da Tabela 7"}:{" "}
              {parecer.reclassificacao.justificativa}
            </p>
          )}
          <p className="text-caption text-muted-foreground">
            {nomeDocente} · {formatarDataHora(parecer.em)}
          </p>
        </div>
      )}
    </section>
  )
}
