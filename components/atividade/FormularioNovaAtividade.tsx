"use client"

// components/atividade/FormularioNovaAtividade.tsx — Tela 04 · Nova atividade
//
// Acessibilidade:
// - validação ao sair do campo (onBlur), nunca a cada tecla, com as duas
//   exceções do login: campo nunca editado, e foco indo para um botão do
//   formulário (senão o erro empurraria o botão para fora do clique);
// - ao enviar com erro, foco no primeiro campo inválido e resumo anunciado;
// - a quantidade só é pedida depois de escolher o tipo (a pergunta e o
//   sufixo vêm do catálogo); a explicação da carga máxima e o comprovante
//   exigido são citações literais da Tabela 7, geradas a partir do tipo.

import { CircleAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { Campo } from "@/components/formulario/Campo"
import { CampoComprovante } from "@/components/formulario/CampoComprovante"
import { CampoConfirmacao } from "@/components/formulario/CampoConfirmacao"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { avisosDeCadastro, creditosDaAtividade, horasDeCreditos, validarNovaAtividade } from "@/lib/calculos"
import { CATALOGO, UNIDADES, obterTipo, type TipoAtividadeId } from "@/lib/catalogo"
import { formatarCreditos, formatarExplicacaoRequisito, formatarHoras, formatarRascunhoSalvo } from "@/lib/formatacao"
import { criarAtividade, limparRascunho, obterRascunho, removerComprovante, salvarRascunho } from "@/lib/storage"
import type { Comprovante, Confirmacoes, NovaAtividade, Periodo } from "@/lib/types"

/** "" = nada escolhido ainda (inválido); "nenhum" = tipoId null, de propósito. */
type SelecaoTipo = TipoAtividadeId | "nenhum" | ""

/**
 * Campos do formulário que recebem erro. Só os que de fato aparecem na tela
 * (não inclui "tipoId" nem "observacoes": o domínio nunca os retorna aqui —
 * "tipoId" some porque tipoId: null já é uma escolha válida, resolvida pelo
 * campo "tipo" desta lista; "observacoes" é opcional e não tem regra).
 */
type CampoFormulario = "titulo" | "tipo" | "quantidade" | "periodo" | "comprovante" | "confirmacoes"

const SEM_CONFIRMACOES: Confirmacoes = { semDuplaContagem: false, semestreCompleto: false }
const ORDEM_CAMPOS: CampoFormulario[] = ["titulo", "tipo", "quantidade", "periodo", "comprovante", "confirmacoes"]

/** O domínio nunca devolve "tipoId" nem "observacoes" aqui; a guarda só torna isso explícito para o TypeScript. */
function ehCampoFormulario(campo: string): campo is CampoFormulario {
  return (ORDEM_CAMPOS as readonly string[]).includes(campo)
}

export function FormularioNovaAtividade() {
  const router = useRouter()
  const anunciar = useAnunciar()

  const [carregando, setCarregando] = useState(true)
  const [titulo, setTitulo] = useState("")
  const [selecaoTipo, setSelecaoTipo] = useState<SelecaoTipo>("")
  const [quantidadeTexto, setQuantidadeTexto] = useState("")
  const [inicio, setInicio] = useState("")
  const [termino, setTermino] = useState("")
  const [comprovante, setComprovante] = useState<Comprovante | null>(null)
  const [observacoes, setObservacoes] = useState("")
  const [confirmacoes, setConfirmacoes] = useState<Confirmacoes>(SEM_CONFIRMACOES)

  const [editados, setEditados] = useState<Partial<Record<CampoFormulario, boolean>>>({})
  const [erros, setErros] = useState<Partial<Record<CampoFormulario, string>>>({})
  const [enviando, setEnviando] = useState(false)
  const [salvandoRascunho, setSalvandoRascunho] = useState(false)
  const [ultimoSalvamento, setUltimoSalvamento] = useState<string | null>(null)
  const [, forcarNovaRenderizacao] = useState(0)

  const primeiraExecucao = useRef(true)
  const refs = {
    titulo: useRef<HTMLInputElement>(null),
    tipo: useRef<HTMLSelectElement>(null),
    quantidade: useRef<HTMLInputElement>(null),
    periodoTermino: useRef<HTMLInputElement>(null),
    comprovanteBotao: useRef<HTMLButtonElement>(null),
    confirmacao: useRef<HTMLInputElement>(null),
  }

  const tipo = selecaoTipo !== "" && selecaoTipo !== "nenhum" ? obterTipo(selecaoTipo) : null
  const tipoId: TipoAtividadeId | null = selecaoTipo === "" || selecaoTipo === "nenhum" ? null : selecaoTipo
  const quantidade = quantidadeTexto.trim() === "" ? null : Number(quantidadeTexto)
  // Prévia do cálculo (régua do crédito, CLAUDE.md): o crédito é o que importa,
  // não a carga do certificado — por isso aparece assim que há tipo e
  // quantidade válidos, antes do envio, e não só depois, no detalhe (tela 05).
  const creditosPrevistos =
    tipoId !== null && quantidade !== null && Number.isInteger(quantidade) && quantidade > 0
      ? creditosDaAtividade({ tipoId, quantidade })
      : null
  const periodo: Periodo | null = inicio && termino ? { inicio, termino } : null
  const dadosAtuais: NovaAtividade = { titulo, tipoId, quantidade, periodo, observacoes, comprovante, confirmacoes }
  const avisos = avisosDeCadastro(dadosAtuais)
  // Só depois de uma escolha explícita: com tipoId derivado de "" (nada escolhido ainda) também
  // dá null, e sem essa guarda o aviso apareceria no formulário em branco, antes de qualquer interação.
  const avisoTipoNaoPrevisto = selecaoTipo === "nenhum" ? avisos.find((a) => a.regra === "tipo-nao-previsto") : undefined
  const avisoAcimaDoMaximo = avisos.find((a) => a.regra === "carga-acima-do-maximo")
  const avisoConfirmacao = avisos.find((a) => a.exigeConfirmacao)

  // Carrega um rascunho salvo, se houver — a única leitura antes de a tela ficar pronta.
  useEffect(() => {
    let ativo = true
    obterRascunho().then((rascunho) => {
      if (!ativo) return
      if (rascunho) {
        if (rascunho.titulo) setTitulo(rascunho.titulo)
        if (rascunho.tipoId !== undefined) setSelecaoTipo(rascunho.tipoId === null ? "nenhum" : rascunho.tipoId)
        if (rascunho.quantidade != null) setQuantidadeTexto(String(rascunho.quantidade))
        if (rascunho.periodo) {
          setInicio(rascunho.periodo.inicio)
          setTermino(rascunho.periodo.termino)
        }
        if (rascunho.observacoes) setObservacoes(rascunho.observacoes)
        if (rascunho.comprovante) setComprovante(rascunho.comprovante)
        if (rascunho.confirmacoes) setConfirmacoes(rascunho.confirmacoes)
        setUltimoSalvamento(rascunho.atualizadoEm)
      }
      setCarregando(false)
    })
    return () => {
      ativo = false
    }
  }, [])

  // Autosave: 1,5 s após a última mudança, ignorando a carga inicial do rascunho.
  useEffect(() => {
    if (carregando) return
    if (primeiraExecucao.current) {
      primeiraExecucao.current = false
      return
    }
    const semConteudo = !titulo && !selecaoTipo && !quantidadeTexto && !comprovante && !observacoes && !inicio && !termino
    if (semConteudo) return
    const temporizador = setTimeout(() => {
      const dados: Partial<NovaAtividade> = {
        titulo,
        tipoId: selecaoTipo === "" ? undefined : selecaoTipo === "nenhum" ? null : selecaoTipo,
        quantidade: quantidadeTexto.trim() === "" ? undefined : Number(quantidadeTexto),
        periodo: inicio && termino ? { inicio, termino } : undefined,
        observacoes,
        comprovante: comprovante ?? undefined,
        confirmacoes,
      }
      salvarRascunho(dados).then((r) => setUltimoSalvamento(r.atualizadoEm))
    }, 1500)
    return () => clearTimeout(temporizador)
  }, [titulo, selecaoTipo, quantidadeTexto, inicio, termino, comprovante, observacoes, confirmacoes, carregando])

  // Atualiza "há N min" periodicamente, sem depender de nova interação.
  useEffect(() => {
    if (!ultimoSalvamento) return
    const intervalo = setInterval(() => forcarNovaRenderizacao((n) => n + 1), 30000)
    return () => clearInterval(intervalo)
  }, [ultimoSalvamento])

  function calcularErros(): { campo: CampoFormulario; mensagem: string }[] {
    const lista: { campo: CampoFormulario; mensagem: string }[] = []
    if (selecaoTipo === "") {
      lista.push({
        campo: "tipo",
        mensagem: 'Selecione um tipo de atividade ou "Não encontrei um tipo correspondente".',
      })
    }
    lista.push(
      ...validarNovaAtividade(dadosAtuais).flatMap((e) =>
        ehCampoFormulario(e.campo) ? [{ campo: e.campo, mensagem: e.mensagem }] : []
      )
    )
    return lista
  }

  /** "periodo" foca o campo Término (onde o erro se aplica); "confirmacoes", a caixa exibida. */
  function focarCampo(campo: CampoFormulario) {
    switch (campo) {
      case "titulo":
        return refs.titulo.current?.focus()
      case "tipo":
        return refs.tipo.current?.focus()
      case "quantidade":
        return refs.quantidade.current?.focus()
      case "periodo":
        return refs.periodoTermino.current?.focus()
      case "comprovante":
        return refs.comprovanteBotao.current?.focus()
      case "confirmacoes":
        return refs.confirmacao.current?.focus()
    }
  }

  function marcarEditado(campo: CampoFormulario) {
    if (!editados[campo]) setEditados((atuais) => ({ ...atuais, [campo]: true }))
  }

  /** onBlur genérico: só recalcula se o campo já foi editado, e pula quando o foco vai para um botão do formulário. */
  function aoSairCampo(campo: CampoFormulario, evento: FocusEvent<HTMLElement>) {
    if (!editados[campo]) return
    const destino = evento.relatedTarget
    if (destino instanceof HTMLButtonElement && evento.currentTarget.closest("form")?.contains(destino)) return
    const mensagem = calcularErros().find((e) => e.campo === campo)?.mensagem
    setErros((atuais) => ({ ...atuais, [campo]: mensagem }))
  }

  function aoTrocarTipo(valor: SelecaoTipo) {
    setSelecaoTipo(valor)
    setQuantidadeTexto("") // a unidade muda com o tipo; o número anterior deixaria de fazer sentido.
    setConfirmacoes(SEM_CONFIRMACOES)
  }

  async function aoSalvarRascunho() {
    setSalvandoRascunho(true)
    const dados: Partial<NovaAtividade> = {
      titulo,
      tipoId: selecaoTipo === "" ? undefined : tipoId,
      quantidade: quantidade ?? undefined,
      periodo: periodo ?? undefined,
      observacoes,
      comprovante: comprovante ?? undefined,
      confirmacoes,
    }
    const rascunho = await salvarRascunho(dados)
    setUltimoSalvamento(rascunho.atualizadoEm)
    setSalvandoRascunho(false)
    anunciar("Rascunho salvo.")
  }

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const listaErros = calcularErros()
    if (listaErros.length) {
      setErros(Object.fromEntries(listaErros.map((e) => [e.campo, e.mensagem])))
      setEditados(Object.fromEntries(ORDEM_CAMPOS.map((c) => [c, true])))
      const primeiro = ORDEM_CAMPOS.find((c) => listaErros.some((e) => e.campo === c))
      if (primeiro) focarCampo(primeiro)
      const quantos = listaErros.length === 1 ? "1 campo precisa" : `${listaErros.length} campos precisam`
      anunciar(`Não foi possível enviar: ${quantos} de correção. ${listaErros.map((e) => e.mensagem).join(" ")}`)
      return
    }
    setEnviando(true)
    try {
      await criarAtividade(dadosAtuais)
      await limparRascunho()
      router.push("/atividades")
    } catch {
      setEnviando(false)
      anunciar("Não foi possível enviar agora. Tente novamente.")
    }
  }

  if (carregando) {
    return (
      <>
        <PageHeader titulo="Nova atividade" />
        <AreaCarregando texto="Carregando formulário…" className="flex max-w-form flex-col gap-6">
          <Skeleton className="h-target w-full" />
          <Skeleton className="h-target w-full" />
          <Skeleton className="h-32 w-full" />
        </AreaCarregando>
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo="Nova atividade"
        subtitulo="Preencha os dados e anexe o comprovante para envio ao docente validador."
        acao={
          <Link href="/catalogo" className={buttonVariants({ variant: "outline" })}>
            Ver catálogo
          </Link>
        }
      />

      <form noValidate onSubmit={aoEnviar} className="flex max-w-form flex-col gap-6">
        <Campo id="titulo" rotulo="Título da atividade" obrigatorio apoio="Use o nome que aparece no certificado." erro={erros.titulo}>
          {(aria) => (
            <Input
              {...aria}
              ref={refs.titulo}
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value)
                marcarEditado("titulo")
              }}
              onBlur={(e) => aoSairCampo("titulo", e)}
            />
          )}
        </Campo>

        <Campo
          id="tipo"
          rotulo="Tipo de atividade"
          obrigatorio
          apoio='Se nenhum corresponder exatamente, escolha "Não encontrei um tipo correspondente" ao final da lista.'
          erro={erros.tipo}
        >
          {(aria) => (
            <Select
              {...aria}
              ref={refs.tipo}
              value={selecaoTipo}
              onChange={(e) => {
                aoTrocarTipo(e.target.value as SelecaoTipo)
                marcarEditado("tipo")
              }}
              onBlur={(e) => aoSairCampo("tipo", e)}
            >
              <option value="" disabled>
                Selecione um tipo de atividade
              </option>
              {CATALOGO.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
              <option value="nenhum">Não encontrei um tipo correspondente</option>
            </Select>
          )}
        </Campo>

        {avisoTipoNaoPrevisto && <AvisoInline texto={avisoTipoNaoPrevisto.mensagem} />}

        {tipo && (
          <Campo
            id="quantidade"
            rotulo={tipo.pergunta}
            obrigatorio
            apoio={formatarExplicacaoRequisito(tipo.id)}
            erro={erros.quantidade}
          >
            {(aria) => (
              <div className="relative">
                <Input
                  {...aria}
                  ref={refs.quantidade}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  className="pr-24"
                  value={quantidadeTexto}
                  onChange={(e) => {
                    setQuantidadeTexto(e.target.value)
                    marcarEditado("quantidade")
                  }}
                  onBlur={(e) => aoSairCampo("quantidade", e)}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-label text-muted-foreground">
                  {UNIDADES[tipo.unidade].plural}
                </span>
              </div>
            )}
          </Campo>
        )}

        {/*
          Texto visível comum, não aria-live: a região ao vivo única do
          sistema é para anúncios de ação, e recalcular a cada tecla digitada
          na quantidade anunciaria o valor a cada dígito. Quem usa leitor de
          tela encontra este parágrafo na ordem natural, depois do campo.
        */}
        {creditosPrevistos !== null && (
          <p className="rounded-lg border border-input-border bg-accent-soft p-4 leading-secondary text-foreground">
            {creditosPrevistos > 0 ? (
              <>
                Pelo que você informou, isto vale{" "}
                <strong className="font-medium">{formatarCreditos(creditosPrevistos)}</strong> (
                {formatarHoras(horasDeCreditos(creditosPrevistos))} contabilizadas).
              </>
            ) : (
              "Essa quantidade ainda não completa 1 crédito neste tipo."
            )}
          </p>
        )}

        {avisoAcimaDoMaximo && <AvisoInline texto={avisoAcimaDoMaximo.mensagem} />}

        {avisoConfirmacao && (
          <CampoConfirmacao
            id="confirmacao"
            texto={avisoConfirmacao.mensagem}
            checked={avisoConfirmacao.regra === "dupla-contagem" ? confirmacoes.semDuplaContagem : confirmacoes.semestreCompleto}
            onChange={(valor) => {
              setConfirmacoes((atuais) =>
                avisoConfirmacao.regra === "dupla-contagem"
                  ? { ...atuais, semDuplaContagem: valor }
                  : { ...atuais, semestreCompleto: valor }
              )
              marcarEditado("confirmacoes")
            }}
            erro={erros.confirmacoes}
            checkboxRef={refs.confirmacao}
          />
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className="text-label text-foreground">Período de realização</legend>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="periodo-inicio" className="text-label text-foreground">
                Início
              </label>
              <Input
                id="periodo-inicio"
                type="date"
                value={inicio}
                onChange={(e) => {
                  setInicio(e.target.value)
                  marcarEditado("periodo")
                }}
                onBlur={(e) => aoSairCampo("periodo", e)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="periodo-termino" className="text-label text-foreground">
                Término
              </label>
              <Input
                id="periodo-termino"
                // eslint-disable-next-line react-hooks/refs -- .current só é lido em focarCampo, dentro do handler aoEnviar; falso positivo do lint fora do render-prop de Campo (veja título/quantidade, no mesmo padrão, sem aviso).
                ref={refs.periodoTermino}
                type="date"
                value={termino}
                aria-describedby={erros.periodo ? "periodo-erro" : undefined}
                aria-invalid={erros.periodo ? true : undefined}
                onChange={(e) => {
                  setTermino(e.target.value)
                  marcarEditado("periodo")
                }}
                onBlur={(e) => aoSairCampo("periodo", e)}
              />
            </div>
          </div>
          {erros.periodo && (
            <p id="periodo-erro" className="flex items-start gap-2 text-label text-danger">
              <span className="flex h-[1.45em] shrink-0 items-center">
                <CircleAlert aria-hidden="true" className="size-4" />
              </span>
              {erros.periodo}
            </p>
          )}
        </fieldset>

        <CampoComprovante
          id="comprovante"
          rotulo="Anexar comprovante"
          obrigatorio
          comprovante={comprovante}
          onEscolher={(c) => {
            setComprovante(c)
            marcarEditado("comprovante")
          }}
          onRemover={() => {
            if (comprovante) void removerComprovante(comprovante.comprovanteId)
            setComprovante(null)
            marcarEditado("comprovante")
          }}
          apoio={tipo ? `${tipo.comprovante}. PDF, JPG ou PNG até 10 MB.` : "PDF, JPG ou PNG até 10 MB."}
          erro={erros.comprovante}
          // eslint-disable-next-line react-hooks/refs -- .current só é lido em focarCampo, dentro do handler aoEnviar; encaminhado por CampoComprovante até o botão real.
          botaoRef={refs.comprovanteBotao}
        />

        <Campo id="observacoes" rotulo="Observações para o docente" apoio="Opcional · descreva o que foi realizado, caso o certificado não deixe claro.">
          {(aria) => (
            <textarea
              {...aria}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input-border bg-surface px-3 py-2 text-body text-foreground transition-colors placeholder:text-muted-foreground"
            />
          )}
        </Campo>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar para validação"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void aoSalvarRascunho()} disabled={salvandoRascunho}>
              {salvandoRascunho ? "Salvando…" : "Salvar rascunho"}
            </Button>
          </div>
          {ultimoSalvamento && (
            <p role="status" className="text-caption text-muted-foreground">
              {formatarRascunhoSalvo(ultimoSalvamento, new Date())}
            </p>
          )}
        </div>
      </form>
    </>
  )
}

function AvisoInline({ texto }: { texto: string }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-input-border bg-accent-soft p-4 text-label leading-secondary text-foreground">
      <span className="flex h-[1.45em] shrink-0 items-center">
        <CircleAlert aria-hidden="true" className="size-4 text-accent-text" />
      </span>
      {texto}
    </p>
  )
}
