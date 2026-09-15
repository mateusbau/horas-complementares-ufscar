"use client"

// components/docente/ValidacaoAtividade.tsx — Tela 07 · Validação da atividade
//
// O docente não digita carga horária livre (ADENDO-DOMINIO.md, seção 7): a
// carga vem do tipo. O que ele faz: confere o comprovante contra o tipo
// declarado, pode reclassificar (compararReclassificacao mostra antes e
// depois, com justificativa obrigatória quando muda), confirma a atuação no
// semestre completo quando o tipo final exige (regra **), e decide — aprovar,
// devolver com pendência ou recusar, sempre com o parecer que lib/calculos.ts
// exige. Atividade sem tipo previsto (tipoId null) não pode ser aprovada: só
// reclassificar ou recusar (a UI não bloqueia o clique, mas validarParecer
// bloqueia o envio, com a mensagem certa).

import { CircleAlert, ListChecks, Repeat, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { CampoConfirmacao } from "@/components/formulario/CampoConfirmacao"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ErroDeRegra, compararReclassificacao, validarParecer } from "@/lib/calculos"
import {
  CATALOGO,
  NOTA_DUPLA_CONTAGEM,
  NOTA_SEMESTRE_COMPLETO,
  UNIDADES,
  medidoEmHoras,
  obterTipo,
  type TipoAtividadeId,
} from "@/lib/catalogo"
import {
  formatarCreditos,
  formatarData,
  formatarEspera,
  formatarExplicacaoRequisito,
  formatarHorasContabilizadas,
  formatarNumero,
  formatarQuantidade,
  formatarRequisito,
} from "@/lib/formatacao"
import { listarFilaValidacao, obterAtividade, obterDiscente, obterProgresso, registrarParecer } from "@/lib/storage"
import type { Atividade, Comprovante, DecisaoParecer, Discente, ItemFila, NovoParecer, Progresso } from "@/lib/types"

type SelecaoTipo = TipoAtividadeId | "sem-tipo"

type Estado =
  | { status: "carregando" }
  | { status: "naoEncontrada" }
  | { status: "erro" }
  | {
      status: "pronto"
      atividade: Atividade
      discente: Discente
      progressoDiscente: Progresso
      fila: ItemFila[]
    }

export function ValidacaoAtividade({ id }: { id: string }) {
  const anunciar = useAnunciar()
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    setEstado({ status: "carregando" })
    Promise.all([obterAtividade(id), listarFilaValidacao()])
      .then(async ([atividade, fila]) => {
        if (!ativo || !atividade) {
          if (ativo) setEstado({ status: "naoEncontrada" })
          return
        }
        const [discente, progressoDiscente] = await Promise.all([
          obterDiscente(atividade.discenteId),
          obterProgresso(atividade.discenteId),
        ])
        if (!ativo) return
        if (!discente) {
          setEstado({ status: "erro" })
          return
        }
        setEstado({ status: "pronto", atividade, discente, progressoDiscente, fila })
      })
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [id, tentativa])

  function tentarNovamente() {
    setTentativa((t) => t + 1)
  }

  if (estado.status === "carregando") {
    return (
      <>
        <PageHeader titulo="Validação da atividade" voltar={{ href: "/docente/fila", rotulo: "Voltar para a fila" }} />
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
        <PageHeader titulo="Validação da atividade" voltar={{ href: "/docente/fila", rotulo: "Voltar para a fila" }} />
        <EstadoErro
          nivelTitulo={2}
          titulo="Atividade não encontrada"
          descricao="O endereço não corresponde a nenhuma atividade registrada. Ela pode ter sido removida, ou o link pode estar incorreto."
          codigo="HC-404"
          onTentarNovamente={tentarNovamente}
        />
      </>
    )
  }

  if (estado.status === "erro") {
    return (
      <>
        <PageHeader titulo="Validação da atividade" voltar={{ href: "/docente/fila", rotulo: "Voltar para a fila" }} />
        <EstadoErro nivelTitulo={2} titulo="Não foi possível carregar a atividade" onTentarNovamente={tentarNovamente} />
      </>
    )
  }

  return <ConteudoValidacao estadoInicial={estado} />
}

function ConteudoValidacao({ estadoInicial }: { estadoInicial: Estado & { status: "pronto" } }) {
  const anunciar = useAnunciar()
  const router = useRouter()
  const { atividade, discente, progressoDiscente, fila } = estadoInicial

  const [selecaoTipo, setSelecaoTipo] = useState<SelecaoTipo>(atividade.tipoId ?? "sem-tipo")
  const [quantidadeTexto, setQuantidadeTexto] = useState(
    atividade.quantidade !== null ? String(atividade.quantidade) : ""
  )
  const [justificativa, setJustificativa] = useState("")
  const [semestreCompletoConfirmado, setSemestreCompletoConfirmado] = useState(false)
  const [comentario, setComentario] = useState("")
  const [erros, setErros] = useState<string[]>([])
  const [decidindo, setDecidindo] = useState<DecisaoParecer | null>(null)
  const [pendenteRecusa, setPendenteRecusa] = useState<NovoParecer | null>(null)
  const cancelarRecusaRef = useRef<HTMLButtonElement>(null)

  const tipoSelecionado: TipoAtividadeId | null = selecaoTipo === "sem-tipo" ? null : selecaoTipo
  const quantidade = quantidadeTexto.trim() === "" ? null : Number(quantidadeTexto)
  const tipoOriginal = atividade.tipoId ? obterTipo(atividade.tipoId) : null
  const tipoFinal = tipoSelecionado ? obterTipo(tipoSelecionado) : null

  const comparacao = useMemo(
    () => compararReclassificacao(atividade, tipoSelecionado, quantidade ?? undefined),
    [atividade, tipoSelecionado, quantidade]
  )

  const indiceNaFila = fila.findIndex((item) => item.atividadeId === atividade.id)
  const proximaDaFila = indiceNaFila !== -1 ? fila[indiceNaFila + 1] : undefined

  function montarNovoParecer(decisao: DecisaoParecer): NovoParecer {
    return {
      decisao,
      comentario,
      paraTipoId: tipoSelecionado,
      paraQuantidade: quantidade ?? undefined,
      justificativaReclassificacao: justificativa,
      ...(tipoFinal?.exigeSemestreCompleto ? { semestreCompletoConfirmado } : {}),
    }
  }

  async function aplicar(decisao: DecisaoParecer, novo: NovoParecer) {
    setDecidindo(decisao)
    setErros([])
    try {
      await registrarParecer(atividade.id, novo)
      const mensagem =
        decisao === "aprovar"
          ? `Atividade aprovada: ${formatarCreditos(comparacao.depois.creditos)} liberados para ${discente.nome}.`
          : decisao === "devolver"
            ? `Atividade devolvida com pendência a ${discente.nome}.`
            : `Atividade recusada.`
      anunciar(`${mensagem} ${proximaDaFila ? "Abrindo a próxima da fila." : "Voltando para a fila."}`)
      router.push(proximaDaFila ? `/docente/validacao/${proximaDaFila.atividadeId}` : "/docente/fila")
    } catch (erro) {
      setDecidindo(null)
      const mensagens = erro instanceof ErroDeRegra ? erro.erros : ["Não foi possível registrar o parecer agora. Tente novamente."]
      setErros(mensagens)
      anunciar(mensagens.join(" "))
    }
  }

  function decidir(decisao: DecisaoParecer) {
    const novo = montarNovoParecer(decisao)
    const mensagens = validarParecer(atividade, novo)
    if (mensagens.length) {
      setErros(mensagens)
      anunciar(`Não foi possível registrar o parecer. ${mensagens.join(" ")}`)
      return
    }
    if (decisao === "recusar") {
      setPendenteRecusa(novo)
      return
    }
    void aplicar(decisao, novo)
  }

  function confirmarRecusa() {
    if (!pendenteRecusa) return
    const novo = pendenteRecusa
    setPendenteRecusa(null)
    void aplicar("recusar", novo)
  }

  const grupoDoTipoAtual = atividade.tipoId ? obterTipo(atividade.tipoId).grupo : null

  return (
    <>
      <PageHeader
        titulo={atividade.titulo}
        subtitulo={`${discente.nome} · RA ${discente.ra} · ${tipoOriginal ? tipoOriginal.nomeCurto : "Sem tipo previsto"} · espera há ${formatarEspera(fila[indiceNaFila]?.esperaDias ?? 0)}.`}
        voltar={{
          href: "/docente/fila",
          rotulo: `Voltar para a fila · ${formatarNumero(fila.length)} ${fila.length === 1 ? "pendente" : "pendentes"}`,
        }}
        acao={
          <>
            <Link
              href={`/docente/validacao/lote${grupoDoTipoAtual ? `?grupo=${grupoDoTipoAtual}` : ""}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <ListChecks aria-hidden="true" />
              Validar em lote
            </Link>
            {proximaDaFila && (
              <Link href={`/docente/validacao/${proximaDaFila.atividadeId}`} className={buttonVariants({ variant: "outline" })}>
                Próxima da fila
              </Link>
            )}
          </>
        }
      />

      {erros.length > 0 && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-1 rounded-lg border border-danger bg-danger-bg p-4 text-label leading-secondary text-danger"
        >
          {erros.map((mensagem, indice) => (
            <p key={indice} className="flex items-start gap-2">
              <span className="flex h-[1.45em] shrink-0 items-center">
                <CircleAlert aria-hidden="true" className="size-4" />
              </span>
              {mensagem}
            </p>
          ))}
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <PreviaComprovante comprovante={atividade.comprovante} />

        <div className="flex flex-col gap-6">
          <DadosEnviados atividade={atividade} tipo={tipoOriginal} progressoDiscente={progressoDiscente} />

          <ReclassificacaoTipo
            selecaoTipo={selecaoTipo}
            onMudarTipo={(valor) => {
              setSelecaoTipo(valor)
              setQuantidadeTexto("")
            }}
            quantidadeTexto={quantidadeTexto}
            onMudarQuantidade={setQuantidadeTexto}
            tipoFinal={tipoFinal}
            comparacao={comparacao}
            justificativa={justificativa}
            onMudarJustificativa={setJustificativa}
          />

          {tipoFinal?.exigeSemestreCompleto && (
            <CampoConfirmacao
              id="semestre-completo"
              texto={NOTA_SEMESTRE_COMPLETO}
              checked={semestreCompletoConfirmado}
              onChange={setSemestreCompletoConfirmado}
            />
          )}

          {tipoFinal?.vedadaDuplaContagem && (
            <p className="flex items-start gap-2 rounded-lg border border-input-border bg-accent-soft p-4 text-label leading-secondary text-foreground">
              <span className="flex h-[1.45em] shrink-0 items-center">
                <CircleAlert aria-hidden="true" className="size-4 text-accent-text" />
              </span>
              {NOTA_DUPLA_CONTAGEM}
            </p>
          )}

          <section aria-labelledby="titulo-parecer" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
            <h2 id="titulo-parecer">Parecer do docente</h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="comentario" className="text-label text-foreground">
                Comentário para o discente
                <span className="font-normal text-muted-foreground"> · obrigatório ao devolver ou recusar</span>
              </label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input-border bg-surface px-3 py-2 text-body text-foreground transition-colors placeholder:text-muted-foreground"
              />
              <p className="text-label leading-secondary text-muted-foreground">
                Explique o que precisa ser corrigido ou o motivo da recusa.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 border-t pt-4">
              <Button onClick={() => decidir("aprovar")} disabled={decidindo !== null}>
                {decidindo === "aprovar" ? "Aprovando…" : `Aprovar ${formatarCreditos(Math.max(0, comparacao.depois.creditos))}`}
              </Button>
              <Button variant="outline" onClick={() => decidir("devolver")} disabled={decidindo !== null}>
                {decidindo === "devolver" ? "Devolvendo…" : "Devolver com pendência"}
              </Button>
              <Button variant="destructive" onClick={() => decidir("recusar")} disabled={decidindo !== null}>
                <XCircle aria-hidden="true" />
                {decidindo === "recusar" ? "Recusando…" : "Recusar atividade"}
              </Button>
            </div>
            <p className="text-caption leading-secondary text-muted-foreground">
              A recusa exige justificativa e não pode ser desfeita pelo discente.
            </p>
          </section>
        </div>
      </div>

      <Dialog open={pendenteRecusa !== null} onOpenChange={(aberto) => !aberto && setPendenteRecusa(null)}>
        <DialogContent initialFocus={cancelarRecusaRef}>
          <DialogHeader>
            <DialogTitle>Recusar esta atividade?</DialogTitle>
            <DialogDescription>
              A recusa exige justificativa e não pode ser desfeita pelo discente. {discente.nome} verá o comentário
              registrado abaixo e precisará enviar uma nova atividade, se for o caso.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button ref={cancelarRecusaRef} variant="outline" onClick={() => setPendenteRecusa(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarRecusa}>
              Confirmar recusa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PreviaComprovante({ comprovante }: { comprovante: Comprovante | null }) {
  return (
    <section aria-labelledby="titulo-comprovante" className="flex flex-col gap-3 rounded-lg border bg-surface p-6">
      <h2 id="titulo-comprovante">Comprovante</h2>
      {comprovante ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-input-border bg-muted p-8 text-center">
          <p className="max-w-full truncate text-body">{comprovante.nome}</p>
          <p className="text-caption text-muted-foreground">
            O sistema guarda só o nome do arquivo enviado; não há visualização do documento em si.
          </p>
        </div>
      ) : (
        <p className="leading-secondary text-muted-foreground">Nenhum comprovante anexado.</p>
      )}
    </section>
  )
}

function DadosEnviados({
  atividade,
  tipo,
  progressoDiscente,
}: {
  atividade: Atividade
  tipo: ReturnType<typeof obterTipo> | null
  progressoDiscente: Progresso
}) {
  return (
    <section aria-labelledby="titulo-dados" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
      <h2 id="titulo-dados">Dados enviados</h2>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-3">
        <dt className="text-label text-muted-foreground">Tipo declarado</dt>
        <dd className="text-body">{tipo ? tipo.nome : "Fora da Tabela 7 (tipo não previsto)"}</dd>

        {tipo && (
          <>
            <dt className="text-label text-muted-foreground">Requisito da Tabela 7</dt>
            <dd className="text-body">{formatarRequisito(tipo.id)}</dd>

            <dt className="text-label text-muted-foreground">Comprovante exigido</dt>
            <dd className="text-body">{tipo.comprovante}</dd>

            {atividade.quantidade !== null && (
              <>
                <dt className="text-label text-muted-foreground">Discente informou</dt>
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

        <dt className="text-label text-muted-foreground">Progresso do discente</dt>
        <dd className="tabular text-body">
          {formatarCreditos(progressoDiscente.creditosObtidos)} de{" "}
          {formatarNumero(progressoDiscente.creditosExigidos)} ·{" "}
          {formatarHorasContabilizadas(progressoDiscente.horasObtidas, progressoDiscente.horasExigidas)}
        </dd>
      </dl>
    </section>
  )
}

function ReclassificacaoTipo({
  selecaoTipo,
  onMudarTipo,
  quantidadeTexto,
  onMudarQuantidade,
  tipoFinal,
  comparacao,
  justificativa,
  onMudarJustificativa,
}: {
  selecaoTipo: SelecaoTipo
  onMudarTipo: (valor: SelecaoTipo) => void
  quantidadeTexto: string
  onMudarQuantidade: (valor: string) => void
  tipoFinal: ReturnType<typeof obterTipo> | null
  comparacao: ReturnType<typeof compararReclassificacao>
  justificativa: string
  onMudarJustificativa: (valor: string) => void
}) {
  return (
    <section aria-labelledby="titulo-reclassificacao" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 id="titulo-reclassificacao" className="flex items-center gap-2">
          <Repeat aria-hidden="true" className="size-5 text-accent-text" />
          Reclassificação
        </h2>
        <p className="text-label leading-secondary text-muted-foreground">
          Mantenha o tipo declarado ou escolha outro da Tabela 7 — a unidade e os créditos mudam com o tipo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="reclassificar-tipo" className="text-label text-foreground">
            Tipo da Tabela 7
          </label>
          <Select id="reclassificar-tipo" value={selecaoTipo} onChange={(e) => onMudarTipo(e.target.value as SelecaoTipo)}>
            {CATALOGO.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
            <option value="sem-tipo">Não corresponde a nenhum tipo da Tabela 7</option>
          </Select>
        </div>

        {tipoFinal && (
          <div className="flex flex-col gap-2">
            <label htmlFor="reclassificar-quantidade" className="text-label text-foreground">
              {tipoFinal.pergunta}
            </label>
            <div className="relative">
              <Input
                id="reclassificar-quantidade"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                className="pr-24"
                value={quantidadeTexto}
                onChange={(e) => onMudarQuantidade(e.target.value)}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-label text-muted-foreground">
                {UNIDADES[tipoFinal.unidade].plural}
              </span>
            </div>
            {medidoEmHoras(tipoFinal) && (
              <p className="text-caption leading-secondary text-muted-foreground">
                {formatarExplicacaoRequisito(tipoFinal.id)}
              </p>
            )}
          </div>
        )}
      </div>

      {comparacao.mudou && (
        <div className="flex flex-col gap-3 rounded-lg border border-input-border bg-accent-soft p-4">
          <p className="text-label font-medium text-foreground">Antes e depois da reclassificação</p>
          <div className="grid grid-cols-2 gap-4 tabular text-body">
            <div className="flex flex-col gap-1">
              <span className="text-caption text-muted-foreground">Antes</span>
              <span>{formatarCreditos(comparacao.antes.creditos)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-caption text-muted-foreground">Depois</span>
              <span className="font-medium">{formatarCreditos(comparacao.depois.creditos)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="justificativa-reclassificacao" className="text-label text-foreground">
              Justificativa da reclassificação
              <span className="font-normal text-muted-foreground"> · obrigatório</span>
            </label>
            <textarea
              id="justificativa-reclassificacao"
              value={justificativa}
              onChange={(e) => onMudarJustificativa(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input-border bg-surface px-3 py-2 text-body text-foreground transition-colors placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}
    </section>
  )
}
