"use client"

// components/docente/ValidacaoLote.tsx — Tela 07b · Validação em lote
//
// A interação mais sensível para acessibilidade de todo o sistema. Abas pelos
// quatro grupos visuais da Tabela 7 (role="tablist" manual, sem dependência
// nova); dentro de cada aba, checkboxes reais por atividade — nunca a linha
// inteira como alvo de seleção. Monitoria (regra **) fica sempre inapta ao
// lote: a confirmação do semestre completo só existe na validação individual
// (tela 07), então esses itens exigem revisão individual, desmarcados e
// desabilitados, com o motivo visível. O lote não reclassifica: só aprova ou
// devolve os créditos já declarados — reclassificar é ação da tela 07.

import { CircleAlert, Inbox, ListChecks } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ErroDeRegra } from "@/lib/calculos"
import { GRUPOS, obterTipo, type GrupoId } from "@/lib/catalogo"
import { formatarCreditos, formatarEspera, formatarNumero } from "@/lib/formatacao"
import { listarFilaValidacao, registrarParecer } from "@/lib/storage"
import type { ItemFila } from "@/lib/types"
import { cn } from "@/lib/utils"

type Aptidao = { item: ItemFila; apto: boolean; motivo?: string }

function classificar(item: ItemFila): Aptidao {
  if (item.tipoId === null) return { item, apto: false }
  const tipo = obterTipo(item.tipoId)
  if (tipo.exigeSemestreCompleto) {
    return { item, apto: false, motivo: "Exige revisão individual: confirmação da monitoria durante o semestre completo." }
  }
  return { item, apto: true }
}

type ModalLote = "aprovar" | "devolver" | null

export function ValidacaoLote({ grupoInicial }: { grupoInicial?: GrupoId }) {
  const anunciar = useAnunciar()
  const [fila, setFila] = useState<ItemFila[] | null>(null)
  const [erroCarregamento, setErroCarregamento] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [abaAtiva, setAbaAtiva] = useState<GrupoId>(grupoInicial ?? GRUPOS[0].id)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<ModalLote>(null)
  const [comentarioDevolver, setComentarioDevolver] = useState("")
  const [erroComentario, setErroComentario] = useState<string | null>(null)
  const [aplicando, setAplicando] = useState(false)
  const cancelarRef = useRef<HTMLButtonElement>(null)
  const abasRef = useRef<Partial<Record<GrupoId, HTMLButtonElement | null>>>({})

  useEffect(() => {
    let ativo = true
    listarFilaValidacao()
      .then((valor) => ativo && setFila(valor))
      .catch(() => ativo && setErroCarregamento(true))
    return () => {
      ativo = false
    }
  }, [tentativa])

  const porGrupo = useMemo(() => {
    const mapa = new Map<GrupoId, Aptidao[]>(GRUPOS.map((g) => [g.id, []]))
    for (const item of fila ?? []) {
      if (item.tipoId === null) continue
      const grupo = obterTipo(item.tipoId).grupo
      mapa.get(grupo)?.push(classificar(item))
    }
    return mapa
  }, [fila])

  const itensDaAba = porGrupo.get(abaAtiva) ?? []
  const aptos = itensDaAba.filter((c) => c.apto)
  const inaptos = itensDaAba.filter((c) => !c.apto)

  function trocarAba(grupo: GrupoId) {
    setAbaAtiva(grupo)
    setSelecionados(new Set())
  }

  function alternarSelecao(id: string) {
    setSelecionados((atuais) => {
      const proximo = new Set(atuais)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      anunciarSelecao(proximo)
      return proximo
    })
  }

  function alternarTodos() {
    setSelecionados((atuais) => {
      const todosMarcados = aptos.length > 0 && aptos.every((c) => atuais.has(c.item.atividadeId))
      const proximo = todosMarcados ? new Set<string>() : new Set(aptos.map((c) => c.item.atividadeId))
      anunciarSelecao(proximo)
      return proximo
    })
  }

  function anunciarSelecao(conjunto: Set<string>) {
    const creditos = aptos
      .filter((c) => conjunto.has(c.item.atividadeId))
      .reduce((soma, c) => soma + c.item.creditos, 0)
    anunciar(
      conjunto.size === 0
        ? "Nenhuma atividade selecionada."
        : `${formatarNumero(conjunto.size)} ${conjunto.size === 1 ? "atividade selecionada" : "atividades selecionadas"} · ${formatarCreditos(creditos)} a homologar.`
    )
  }

  const selecionadosItens = aptos.filter((c) => selecionados.has(c.item.atividadeId))
  const creditosSelecionados = selecionadosItens.reduce((soma, c) => soma + c.item.creditos, 0)

  async function aplicarLote(decisao: "aprovar" | "devolver") {
    if (decisao === "devolver" && !comentarioDevolver.trim()) {
      setErroComentario("Escreva um comentário: ele é obrigatório ao devolver com pendência.")
      return
    }
    setAplicando(true)
    setErroComentario(null)
    const ids = selecionadosItens.map((c) => c.item.atividadeId)
    try {
      // Sequencial, de propósito: lib/storage.ts lê e grava o estado inteiro a
      // cada chamada — em paralelo, uma chamada pisaria na escrita da outra.
      for (const id of ids) {
        await registrarParecer(id, { decisao, comentario: decisao === "devolver" ? comentarioDevolver.trim() : "" })
      }
      setModal(null)
      setComentarioDevolver("")
      setSelecionados(new Set())
      const filaAtualizada = await listarFilaValidacao()
      setFila(filaAtualizada)
      anunciar(
        decisao === "aprovar"
          ? `${formatarNumero(ids.length)} ${ids.length === 1 ? "atividade aprovada" : "atividades aprovadas"}. ${formatarCreditos(creditosSelecionados)} liberados.`
          : `${formatarNumero(ids.length)} ${ids.length === 1 ? "atividade devolvida" : "atividades devolvidas"} com pendência.`
      )
      // Um ponto estável da fila, nunca um elemento que deixou de existir: as
      // linhas selecionadas somem da tabela (não estão mais em análise). O
      // Dialog é controlado (sem trigger), então o retorno de foco do Base UI
      // não tem para onde ir; aqui a aba ativa sempre existe. O atraso espera a
      // transição de fechamento do modal (--duration, 160 ms) para não perder
      // essa corrida contra o próprio fechamento.
      window.setTimeout(() => abasRef.current[abaAtiva]?.focus(), 200)
    } catch (erro) {
      const mensagens = erro instanceof ErroDeRegra ? erro.erros.join(" ") : "Não foi possível aplicar o lote agora."
      anunciar(mensagens)
    } finally {
      setAplicando(false)
    }
  }

  function abrirModal(tipo: "aprovar" | "devolver") {
    if (selecionados.size === 0) return
    setErroComentario(null)
    setModal(tipo)
  }

  function fecharModal() {
    setModal(null)
    setErroComentario(null)
  }

  function onTeclaAba(evento: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    const total = GRUPOS.length
    let proximo: number | null = null
    if (evento.key === "ArrowRight") proximo = (indice + 1) % total
    else if (evento.key === "ArrowLeft") proximo = (indice - 1 + total) % total
    else if (evento.key === "Home") proximo = 0
    else if (evento.key === "End") proximo = total - 1
    if (proximo === null) return
    evento.preventDefault()
    const grupo = GRUPOS[proximo].id
    trocarAba(grupo)
    abasRef.current[grupo]?.focus()
  }

  if (erroCarregamento) {
    return (
      <>
        <PageHeader titulo="Validação em lote" voltar={{ href: "/docente/fila", rotulo: "Voltar para a fila" }} />
        <EstadoErro
          nivelTitulo={2}
          titulo="Não foi possível carregar a fila"
          onTentarNovamente={() => {
            setErroCarregamento(false)
            setTentativa((t) => t + 1)
          }}
        />
      </>
    )
  }

  if (fila === null) {
    return (
      <>
        <PageHeader titulo="Validação em lote" voltar={{ href: "/docente/fila", rotulo: "Voltar para a fila" }} />
        <AreaCarregando texto="Carregando fila…" className="flex flex-col gap-4">
          <Skeleton className="h-target w-full max-w-form" />
          <Skeleton className="h-48 w-full" />
        </AreaCarregando>
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo="Validação em lote"
        subtitulo="Atividades da mesma natureza, do mesmo grupo da Tabela 7, revisadas em conjunto."
        voltar={{ href: "/docente/fila", rotulo: "Voltar para a fila" }}
        acao={
          <Link href="/docente/fila" className={buttonVariants({ variant: "outline" })}>
            <ListChecks aria-hidden="true" />
            Revisar uma a uma
          </Link>
        }
      />

      <div role="tablist" aria-label="Grupos da Tabela 7" className="mb-6 flex flex-wrap gap-2">
        {GRUPOS.map((grupo, indice) => {
          const selecionada = abaAtiva === grupo.id
          const quantidade = porGrupo.get(grupo.id)?.length ?? 0
          return (
            <button
              key={grupo.id}
              ref={(el) => {
                abasRef.current[grupo.id] = el
              }}
              role="tab"
              id={`aba-${grupo.id}`}
              aria-selected={selecionada}
              aria-controls={`painel-${grupo.id}`}
              tabIndex={selecionada ? 0 : -1}
              onClick={() => trocarAba(grupo.id)}
              onKeyDown={(e) => onTeclaAba(e, indice)}
              className={cn(
                "inline-flex min-h-target items-center gap-1.5 rounded-lg border px-3 text-label transition-colors",
                selecionada
                  ? "border-primary bg-accent-soft font-medium text-accent-text"
                  : "border-input-border bg-surface text-foreground hover:bg-muted"
              )}
            >
              {grupo.nome}
              <span className="tabular text-caption text-muted-foreground">{formatarNumero(quantidade)}</span>
            </button>
          )
        })}
      </div>

      {GRUPOS.map((grupo) => {
        if (grupo.id !== abaAtiva) return null
        const nomeGrupo = grupo.nome
        return (
          <div key={grupo.id} role="tabpanel" id={`painel-${grupo.id}`} aria-labelledby={`aba-${grupo.id}`} tabIndex={0} className="flex flex-col gap-4">
            {itensDaAba.length === 0 ? (
              <EstadoVazio
                nivelTitulo={3}
                icone={Inbox}
                titulo="Nenhuma atividade deste grupo na fila"
                descricao="Quando houver atividades em análise deste grupo, elas aparecem aqui."
              />
            ) : (
              <>
                <PainelSelecao
                  aptos={aptos}
                  inaptos={inaptos}
                  selecionados={selecionados}
                  onAlternarUm={alternarSelecao}
                  onAlternarTodos={alternarTodos}
                />

                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-input-border bg-accent-soft p-4"
                  aria-live="polite"
                >
                  <p className="text-label text-foreground">
                    {selecionados.size === 0
                      ? "Nenhuma atividade selecionada"
                      : `${formatarNumero(selecionados.size)} ${selecionados.size === 1 ? "atividade selecionada" : "atividades selecionadas"} · ${formatarCreditos(creditosSelecionados)} a homologar`}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => abrirModal("aprovar")} disabled={selecionados.size === 0}>
                      Aprovar selecionadas
                    </Button>
                    <Button variant="outline" onClick={() => abrirModal("devolver")} disabled={selecionados.size === 0}>
                      Devolver com pendência
                    </Button>
                  </div>
                </div>

                <p className="text-caption leading-secondary text-muted-foreground">
                  {formatarNumero(aptos.length)} de {formatarNumero(itensDaAba.length)} atividades de {nomeGrupo} aptas
                  ao lote
                  {inaptos.length > 0 &&
                    ` · ${formatarNumero(inaptos.length)} ${inaptos.length === 1 ? "exige" : "exigem"} revisão individual`}
                  . O lote valida as atividades e libera os créditos correspondentes.
                </p>
              </>
            )}
          </div>
        )
      })}

      <Dialog open={modal !== null} onOpenChange={(aberto) => !aberto && fecharModal()}>
        <DialogContent initialFocus={cancelarRef} finalFocus={() => abasRef.current[abaAtiva] ?? undefined}>
          <DialogHeader>
            <DialogTitle>
              {modal === "aprovar" ? "Aprovar atividades selecionadas?" : "Devolver atividades selecionadas?"}
            </DialogTitle>
            <DialogDescription>
              {modal === "aprovar"
                ? `${formatarNumero(selecionados.size)} ${selecionados.size === 1 ? "atividade será aprovada" : "atividades serão aprovadas"}, liberando ${formatarCreditos(creditosSelecionados)}.`
                : `${formatarNumero(selecionados.size)} ${selecionados.size === 1 ? "atividade será devolvida" : "atividades serão devolvidas"} com pendência, aguardando o discente.`}
            </DialogDescription>
          </DialogHeader>

          {modal === "devolver" && (
            <div className="flex flex-col gap-2">
              <label htmlFor="comentario-lote" className="text-label text-foreground">
                Comentário para os discentes
                <span className="font-normal text-muted-foreground"> · obrigatório</span>
              </label>
              <textarea
                id="comentario-lote"
                value={comentarioDevolver}
                onChange={(e) => setComentarioDevolver(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input-border bg-surface px-3 py-2 text-body text-foreground transition-colors placeholder:text-muted-foreground"
              />
              <p className="text-label leading-secondary text-muted-foreground">
                O mesmo comentário é enviado a todas as atividades selecionadas.
              </p>
              {erroComentario && (
                <p className="flex items-start gap-2 text-label text-danger">
                  <span className="flex h-[1.45em] shrink-0 items-center">
                    <CircleAlert aria-hidden="true" className="size-4" />
                  </span>
                  {erroComentario}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button ref={cancelarRef} variant="outline" onClick={fecharModal} disabled={aplicando}>
              Cancelar
            </Button>
            <Button
              variant={modal === "aprovar" ? "default" : "outline"}
              onClick={() => modal && void aplicarLote(modal)}
              disabled={aplicando}
            >
              {aplicando
                ? "Aplicando…"
                : modal === "aprovar"
                  ? "Confirmar aprovação"
                  : "Confirmar devolução"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PainelSelecao({
  aptos,
  inaptos,
  selecionados,
  onAlternarUm,
  onAlternarTodos,
}: {
  aptos: Aptidao[]
  inaptos: Aptidao[]
  selecionados: Set<string>
  onAlternarUm: (id: string) => void
  onAlternarTodos: () => void
}) {
  const selecionarTodosRef = useRef<HTMLInputElement>(null)
  const todosMarcados = aptos.length > 0 && aptos.every((c) => selecionados.has(c.item.atividadeId))
  const algumMarcado = aptos.some((c) => selecionados.has(c.item.atividadeId))

  useEffect(() => {
    if (selecionarTodosRef.current) {
      selecionarTodosRef.current.indeterminate = algumMarcado && !todosMarcados
    }
  }, [algumMarcado, todosMarcados])

  const todos: Aptidao[] = [...aptos, ...inaptos]

  return (
    <>
      {/* Desktop: tabela real, a partir de 768 px. */}
      <div className="hidden overflow-x-auto rounded-lg border bg-surface md:block">
        <table className="w-full tabular">
          <thead className="border-b bg-muted">
            <tr>
              <th scope="col" className="w-12 px-4 py-2 text-left">
                <span className="sr-only">Selecionar</span>
                <Checkbox
                  ref={selecionarTodosRef}
                  checked={todosMarcados}
                  onChange={onAlternarTodos}
                  disabled={aptos.length === 0}
                  aria-label={todosMarcados ? "Limpar seleção" : "Selecionar todas as atividades aptas ao lote"}
                />
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Discente
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Atividade
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Créditos
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Espera
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {todos.map(({ item, apto, motivo }) => {
              const idCheckbox = `sel-${item.atividadeId}`
              const idMotivo = `motivo-${item.atividadeId}`
              return (
                <tr key={item.atividadeId} className={!apto ? "bg-muted" : undefined}>
                  <td className="px-4 py-2">
                    <Checkbox
                      id={idCheckbox}
                      checked={selecionados.has(item.atividadeId)}
                      onChange={() => onAlternarUm(item.atividadeId)}
                      disabled={!apto}
                      aria-describedby={!apto ? idMotivo : undefined}
                    />
                    <label htmlFor={idCheckbox} className="sr-only">
                      Selecionar {item.titulo}, de {item.discente.nome}, para o lote
                    </label>
                  </td>
                  <td className="px-4 py-2 text-body">{item.discente.nome}</td>
                  <td className="px-4 py-2 text-body">
                    {item.titulo}
                    {!apto && motivo && (
                      <span id={idMotivo} className="mt-0.5 block text-caption leading-secondary text-muted-foreground">
                        {motivo}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-body">{formatarCreditos(item.creditos)}</td>
                  <td className="px-4 py-2 text-body text-muted-foreground">{formatarEspera(item.esperaDias)}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/docente/validacao/${item.atividadeId}`}
                      className="text-label text-accent-text underline underline-offset-4 hover:decoration-2"
                    >
                      Abrir comprovante
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: lista de cards, abaixo de 768 px. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {todos.map(({ item, apto, motivo }) => {
          const idCheckbox = `sel-m-${item.atividadeId}`
          const idMotivo = `motivo-m-${item.atividadeId}`
          return (
            <li key={item.atividadeId} className="flex flex-col gap-2 rounded-lg border bg-surface p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={idCheckbox}
                  checked={selecionados.has(item.atividadeId)}
                  onChange={() => onAlternarUm(item.atividadeId)}
                  disabled={!apto}
                  aria-describedby={!apto ? idMotivo : undefined}
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <label htmlFor={idCheckbox} className="text-body font-medium">
                    {item.titulo}
                  </label>
                  <span className="tabular text-label text-muted-foreground">
                    {item.discente.nome} · {formatarCreditos(item.creditos)} · {formatarEspera(item.esperaDias)}
                  </span>
                  {!apto && motivo && (
                    <span id={idMotivo} className="text-caption leading-secondary text-muted-foreground">
                      {motivo}
                    </span>
                  )}
                  <Link
                    href={`/docente/validacao/${item.atividadeId}`}
                    className="self-start text-label text-accent-text underline underline-offset-4 hover:decoration-2"
                  >
                    Abrir comprovante
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
