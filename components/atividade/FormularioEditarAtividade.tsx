"use client"

// components/atividade/FormularioEditarAtividade.tsx — edição de uma
// atividade pendente, alcançada pela ação "Editar" do detalhe (tela 05).
//
// Reaproveita os mesmos blocos do cadastro (Campo, CampoComprovante,
// CampoConfirmacao, Select) e a mesma validação de lib/calculos.ts, mas sem
// rascunho automático: a atividade editada já é um registro salvo, não um
// formulário em andamento. Ao salvar, volta para o detalhe — o envio em si é
// uma ação separada, feita lá (HANDOFF.md, etapa 8: "editar e enviar").
// Só atividades "pendente" chegam aqui; qualquer outro status mostra um aviso
// e um link de volta, sem formulário.

import { CircleAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type FocusEvent, type FormEvent } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { Campo } from "@/components/formulario/Campo"
import { CampoComprovante } from "@/components/formulario/CampoComprovante"
import { CampoConfirmacao } from "@/components/formulario/CampoConfirmacao"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { avisosDeCadastro, validarNovaAtividade } from "@/lib/calculos"
import { CATALOGO, UNIDADES, obterTipo, type TipoAtividadeId } from "@/lib/catalogo"
import { formatarExplicacaoRequisito } from "@/lib/formatacao"
import { atualizarAtividade, obterAtividade } from "@/lib/storage"
import type { Comprovante, Confirmacoes, NovaAtividade, Periodo } from "@/lib/types"

type SelecaoTipo = TipoAtividadeId | "nenhum"

type CampoFormulario = "titulo" | "tipo" | "quantidade" | "periodo" | "comprovante" | "confirmacoes"

const SEM_CONFIRMACOES: Confirmacoes = { semDuplaContagem: false, semestreCompleto: false }
const ORDEM_CAMPOS: CampoFormulario[] = ["titulo", "tipo", "quantidade", "periodo", "comprovante", "confirmacoes"]

function ehCampoFormulario(campo: string): campo is CampoFormulario {
  return (ORDEM_CAMPOS as readonly string[]).includes(campo)
}

type Estado =
  | { status: "carregando" }
  | { status: "naoEncontrada" }
  | { status: "naoEditavel" }
  | { status: "erro" }
  | { status: "pronto" }

export function FormularioEditarAtividade({ id }: { id: string }) {
  const router = useRouter()
  const anunciar = useAnunciar()

  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)

  const [titulo, setTitulo] = useState("")
  const [selecaoTipo, setSelecaoTipo] = useState<SelecaoTipo>("nenhum")
  const [quantidadeTexto, setQuantidadeTexto] = useState("")
  const [inicio, setInicio] = useState("")
  const [termino, setTermino] = useState("")
  const [comprovante, setComprovante] = useState<Comprovante | null>(null)
  const [observacoes, setObservacoes] = useState("")
  const [confirmacoes, setConfirmacoes] = useState<Confirmacoes>(SEM_CONFIRMACOES)

  const [editados, setEditados] = useState<Partial<Record<CampoFormulario, boolean>>>({})
  const [erros, setErros] = useState<Partial<Record<CampoFormulario, string>>>({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let ativo = true
    setEstado({ status: "carregando" })
    obterAtividade(id)
      .then((atividade) => {
        if (!ativo) return
        if (!atividade) {
          setEstado({ status: "naoEncontrada" })
          return
        }
        if (atividade.status !== "pendente") {
          setEstado({ status: "naoEditavel" })
          return
        }
        setTitulo(atividade.titulo)
        setSelecaoTipo(atividade.tipoId ?? "nenhum")
        setQuantidadeTexto(atividade.quantidade !== null ? String(atividade.quantidade) : "")
        setInicio(atividade.periodo?.inicio ?? "")
        setTermino(atividade.periodo?.termino ?? "")
        setComprovante(atividade.comprovante)
        setObservacoes(atividade.observacoes)
        setConfirmacoes(atividade.confirmacoes)
        setEstado({ status: "pronto" })
      })
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [id, tentativa])

  const tipo = selecaoTipo !== "nenhum" ? obterTipo(selecaoTipo) : null
  const tipoId: TipoAtividadeId | null = selecaoTipo === "nenhum" ? null : selecaoTipo
  const quantidade = quantidadeTexto.trim() === "" ? null : Number(quantidadeTexto)
  const periodo: Periodo | null = inicio && termino ? { inicio, termino } : null
  const dadosAtuais: NovaAtividade = { titulo, tipoId, quantidade, periodo, observacoes, comprovante, confirmacoes }
  const avisos = avisosDeCadastro(dadosAtuais)
  const avisoTipoNaoPrevisto = selecaoTipo === "nenhum" ? avisos.find((a) => a.regra === "tipo-nao-previsto") : undefined
  const avisoAcimaDoMaximo = avisos.find((a) => a.regra === "carga-acima-do-maximo")
  const avisoConfirmacao = avisos.find((a) => a.exigeConfirmacao)

  function calcularErros(): { campo: CampoFormulario; mensagem: string }[] {
    return validarNovaAtividade(dadosAtuais).flatMap((e) =>
      ehCampoFormulario(e.campo) ? [{ campo: e.campo, mensagem: e.mensagem }] : []
    )
  }

  function marcarEditado(campo: CampoFormulario) {
    if (!editados[campo]) setEditados((atuais) => ({ ...atuais, [campo]: true }))
  }

  function aoSairCampo(campo: CampoFormulario, evento: FocusEvent<HTMLElement>) {
    if (!editados[campo]) return
    const destino = evento.relatedTarget
    if (destino instanceof HTMLButtonElement && evento.currentTarget.closest("form")?.contains(destino)) return
    const mensagem = calcularErros().find((e) => e.campo === campo)?.mensagem
    setErros((atuais) => ({ ...atuais, [campo]: mensagem }))
  }

  function aoTrocarTipo(valor: SelecaoTipo) {
    setSelecaoTipo(valor)
    setQuantidadeTexto("")
    setConfirmacoes(SEM_CONFIRMACOES)
  }

  async function aoSalvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const listaErros = calcularErros()
    if (listaErros.length) {
      setErros(Object.fromEntries(listaErros.map((e) => [e.campo, e.mensagem])))
      setEditados(Object.fromEntries(ORDEM_CAMPOS.map((c) => [c, true])))
      const quantos = listaErros.length === 1 ? "1 campo precisa" : `${listaErros.length} campos precisam`
      anunciar(`Não foi possível salvar: ${quantos} de correção. ${listaErros.map((e) => e.mensagem).join(" ")}`)
      return
    }
    setSalvando(true)
    try {
      await atualizarAtividade(id, dadosAtuais)
      router.push(`/atividades/${id}`)
    } catch {
      setSalvando(false)
      anunciar("Não foi possível salvar agora. Tente novamente.")
    }
  }

  if (estado.status === "carregando") {
    return (
      <>
        <PageHeader titulo="Editar atividade" voltar={{ href: `/atividades/${id}`, rotulo: "Voltar para a atividade" }} />
        <AreaCarregando texto="Carregando formulário…" className="flex max-w-form flex-col gap-6">
          <Skeleton className="h-target w-full" />
          <Skeleton className="h-target w-full" />
          <Skeleton className="h-32 w-full" />
        </AreaCarregando>
      </>
    )
  }

  if (estado.status === "naoEncontrada") {
    return (
      <>
        <PageHeader titulo="Editar atividade" voltar={{ href: "/atividades", rotulo: "Voltar para Minhas atividades" }} />
        <EstadoErro
          nivelTitulo={2}
          titulo="Atividade não encontrada"
          descricao="O endereço não corresponde a nenhuma das suas atividades. Ela pode ter sido removida, ou o link pode estar incorreto."
          codigo="HC-404"
          onTentarNovamente={() => setTentativa((t) => t + 1)}
        />
      </>
    )
  }

  if (estado.status === "erro") {
    return (
      <>
        <PageHeader titulo="Editar atividade" voltar={{ href: `/atividades/${id}`, rotulo: "Voltar para a atividade" }} />
        <EstadoErro nivelTitulo={2} titulo="Não foi possível carregar a atividade" onTentarNovamente={() => setTentativa((t) => t + 1)} />
      </>
    )
  }

  if (estado.status === "naoEditavel") {
    return (
      <>
        <PageHeader titulo="Editar atividade" voltar={{ href: `/atividades/${id}`, rotulo: "Voltar para a atividade" }} />
        <p className="max-w-form leading-secondary text-muted-foreground">
          Esta atividade não pode ser editada porque já foi enviada para validação. Volte para o detalhe para acompanhar a
          situação dela.
        </p>
        <Link href={`/atividades/${id}`} className={buttonVariants({ variant: "outline", className: "mt-6" })}>
          Voltar para a atividade
        </Link>
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo="Editar atividade"
        subtitulo="Ajuste os dados e envie novamente para validação, na tela da atividade."
        voltar={{ href: `/atividades/${id}`, rotulo: "Voltar para a atividade" }}
      />

      <form noValidate onSubmit={aoSalvar} className="flex max-w-form flex-col gap-6">
        <Campo id="titulo" rotulo="Título da atividade" obrigatorio apoio="Use o nome que aparece no certificado." erro={erros.titulo}>
          {(aria) => (
            <Input
              {...aria}
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
              value={selecaoTipo}
              onChange={(e) => {
                aoTrocarTipo(e.target.value as SelecaoTipo)
                marcarEditado("tipo")
              }}
              onBlur={(e) => aoSairCampo("tipo", e)}
            >
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
          <Campo id="quantidade" rotulo={tipo.pergunta} obrigatorio apoio={formatarExplicacaoRequisito(tipo.id)} erro={erros.quantidade}>
            {(aria) => (
              <div className="relative">
                <Input
                  {...aria}
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
            setComprovante(null)
            marcarEditado("comprovante")
          }}
          apoio={tipo ? `${tipo.comprovante}. PDF, JPG ou PNG até 10 MB.` : "PDF, JPG ou PNG até 10 MB."}
          erro={erros.comprovante}
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

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </Button>
          <Link href={`/atividades/${id}`} className={buttonVariants({ variant: "outline" })}>
            Cancelar
          </Link>
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
