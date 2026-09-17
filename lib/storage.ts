// lib/storage.ts
//
// ÚNICA porta de acesso a dados do sistema. Nenhum componente usa localStorage
// diretamente. Todas as funções são assíncronas e esperam ~300 ms, simulando
// uma API: isso obriga as telas a terem estado de carregando de verdade.
// Quando existir backend, basta trocar o corpo destas funções.
//
// As regras de negócio vivem em lib/calculos.ts; aqui só se lê, aplica e grava.
//
// Só funciona no navegador: chame dentro de useEffect ou de um evento, em
// componente "use client", e mostre skeleton até a resposta chegar.

import { ehTipoAtividadeId } from "./catalogo"
import { supabase } from "./supabase"
import { redimensionarImagem } from "./imagem"
import {
  ATRIBUTO_DENSIDADE,
  ATRIBUTO_TAMANHO_TEXTO,
  CLASSE_ALTO_CONTRASTE,
  CLASSE_REDUZIR_ANIMACOES,
  PREFERENCIAS_PADRAO,
  ehPreferencias,
  type Preferencias,
} from "./preferencias"
import {
  ErroDeRegra,
  aplicarParecer,
  calcularProgresso,
  creditosDaAtividade,
  diasDeEspera,
  enviarParaValidacao,
  horasDeCreditos,
  montarAtividade,
} from "./calculos"
import { criarEstadoInicial } from "./mock-data"
import { agregarTurma, resumirOrientando, type RelatorioTurma, type ResumoOrientando } from "./orientandos"
import type {
  Atividade,
  Aviso,
  Comprovante,
  Discente,
  Docente,
  EstadoDemo,
  ItemFila,
  ModoEntrada,
  NovaAtividade,
  NovoParecer,
  Perfil,
  Progresso,
  Sessao,
  StatusAtividade,
  TipoAviso,
} from "./types"

const ATRASO_MS = 300
const BUCKET_COMPROVANTES = "comprovantes"
const STATUS: readonly StatusAtividade[] = ["validada", "analise", "pendente", "recusada"]
const TIPOS_AVISO: readonly TipoAviso[] = ["validada", "recusada", "aguardando", "marco", "regra"]

// Uploads acontecem quando o arquivo é escolhido, antes de a atividade ser
// gravada. Este conjunto permite desfazer apenas uploads ainda não associados
// a um estado persistido quando a gravação seguinte falha.
const comprovantesPendentes = new Set<string>()

// --- Infraestrutura -----------------------------------------------------------------

function esperar(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ATRASO_MS))
}

function armazenamento(): Storage {
  if (typeof window === "undefined") {
    throw new Error(
      "lib/storage.ts só funciona no navegador. Chame-o dentro de useEffect ou de um evento."
    )
  }
  return window.localStorage
}

/**
 * PROCEDIMENTO OBRIGATÓRIO: toda mudança no seed (lib/mock-data.ts) exige subir
 * `versao` aqui, em `EstadoDemo` (lib/types.ts) e em `criarEstadoInicial`.
 *
 * Sem isso a mudança não aparece para ninguém que já abriu o sistema antes: o
 * estado salvo continua válido, `ler()` o devolve e `criarEstadoInicial` nunca
 * roda. Em um navegador limpo tudo funciona, o que torna a falha invisível
 * justamente em teste — daí `scripts/verificar-migracao.mjs`, que carrega um
 * estado de versão anterior antes de ler. Aconteceu na v2 → v3 (comprovantes
 * do seed): o seed mudou, a versão não, e a tela seguiu mostrando os dados
 * antigos.
 */
function ehEstadoValido(valor: unknown): valor is EstadoDemo {
  if (typeof valor !== "object" || valor === null) return false
  const e = valor as Partial<EstadoDemo>
  return (
    e.versao === 5 && // estado de versão anterior é descartado e o seed é recriado
    typeof e.discenteAtualId === "string" &&
    typeof e.docenteAtualId === "string" &&
    Array.isArray(e.discentes) &&
    e.discentes.every(
      (d) => typeof d?.id === "string" && (d.orientadorId === null || typeof d.orientadorId === "string")
    ) &&
    Array.isArray(e.docentes) &&
    Array.isArray(e.atividades) &&
    e.atividades.every(
      (a) =>
        typeof a?.id === "string" &&
        typeof a.discenteId === "string" &&
        typeof a.titulo === "string" &&
        STATUS.includes(a.status) &&
        (a.tipoId === null || ehTipoAtividadeId(a.tipoId)) &&
        Array.isArray(a.historico) &&
        Array.isArray(a.pareceres)
    ) &&
    Array.isArray(e.avisos) &&
    e.avisos.every(
      (a) =>
        typeof a?.id === "string" &&
        TIPOS_AVISO.includes(a.tipo) &&
        typeof a.titulo === "string" &&
        typeof a.descricao === "string" &&
        typeof a.em === "string" &&
        typeof a.lido === "boolean" &&
        (a.atividadeId === null || typeof a.atividadeId === "string")
    )
  )
}

/** Lê o estado do Supabase; se ainda não existir, cria a partir do seed. */
async function ler(): Promise<EstadoDemo> {
  const { data, error } = await supabase
    .from("estado_demo")
    .select("dados")
    .eq("id", "principal")
    .maybeSingle()

  if (error) {
    console.error("Erro ao ler estado do Supabase:", error)
    throw new Error("Não foi possível carregar os dados.")
  }

  if (data?.dados && ehEstadoValido(data.dados)) {
    return data.dados as EstadoDemo
  }

  const inicial = criarEstadoInicial(new Date())

  await gravar(inicial)

  return inicial
}

async function gravar(estado: EstadoDemo): Promise<void> {
  const { error } = await supabase
    .from("estado_demo")
    .upsert({
      id: "principal",
      dados: estado,
      atualizado_em: new Date().toISOString(),
    })

  if (error) {
    console.error("Erro ao gravar estado no Supabase:", error)
    throw new Error("Não foi possível salvar os dados.")
  }
}

/** Cópia profunda: quem chama nunca altera o estado guardado por referência. */
function copia<T>(valor: T): T {
  return structuredClone(valor)
}

function novoId(prefixo: string): string {
  const aleatorio =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `${prefixo}-${aleatorio}`
}

function localizar(estado: EstadoDemo, id: string): number {
  const indice = estado.atividades.findIndex((a) => a.id === id)
  if (indice === -1) throw new ErroDeRegra(["Atividade não encontrada."])
  return indice
}

// --- Pessoas ---------------------------------------------------------------------------

export async function obterDiscenteAtual(): Promise<Discente> {
  await esperar()
  const estado = await ler()
  const discente = estado.discentes.find((d) => d.id === estado.discenteAtualId)
  if (!discente) throw new ErroDeRegra(["Discente da demonstração não encontrado."])
  return copia(discente)
}

export async function obterDocenteAtual(): Promise<Docente> {
  await esperar()
  const estado = await ler()
  const docente = estado.docentes.find((d) => d.id === estado.docenteAtualId)
  if (!docente) throw new ErroDeRegra(["Docente da demonstração não encontrado."])
  return copia(docente)
}

export async function obterDiscente(id: string): Promise<Discente | null> {
  await esperar()
  const estado = await ler()
  return copia(estado.discentes.find((d) => d.id === id) ?? null)
}

// --- Atividades do discente ------------------------------------------------------------

/** Atividades do discente da demonstração, na ordem em que foram registradas. */
export async function listarAtividades(): Promise<Atividade[]> {
  await esperar()
  const estado = await ler()
  return copia(estado.atividades.filter((a) => a.discenteId === estado.discenteAtualId))
}

/** Qualquer atividade, de qualquer discente (a tela 07 do docente também usa). */
export async function obterAtividade(id: string): Promise<Atividade | null> {
  await esperar()
  const estado = await ler()
  return copia(estado.atividades.find((a) => a.id === id) ?? null)
}

/** Envia uma nova atividade para validação; ela entra na fila do docente. */
export async function criarAtividade(dados: NovaAtividade): Promise<Atividade> {
  await esperar()
  const comprovanteNovo = dados.comprovante?.comprovanteId
  try {
    const estado = await ler()
    const atividade = montarAtividade(
      dados,
      { id: novoId("atv"), discenteId: estado.discenteAtualId },
      new Date()
    )
    estado.atividades.push(atividade)
    await gravar(estado)
    if (comprovanteNovo) comprovantesPendentes.delete(comprovanteNovo)
    return copia(atividade)
  } catch (erro) {
    if (comprovanteNovo) await descartarComprovantePendente(comprovanteNovo)
    throw erro
  }
}

/**
 * Edita os dados de uma atividade pendente (ex.: trocar o comprovante antes do
 * reenvio). Status, histórico e pareceres só mudam pelas regras de calculos.ts.
 */
export async function atualizarAtividade(
  id: string,
  patch: Partial<NovaAtividade>
): Promise<Atividade> {
  await esperar()
  let comprovanteAnterior: string | null = null
  const comprovanteNovo = patch.comprovante?.comprovanteId
  try {
    const estado = await ler()
    const indice = localizar(estado, id)
    const atual = estado.atividades[indice]
    comprovanteAnterior = atual.comprovante?.comprovanteId ?? null
    if (atual.discenteId !== estado.discenteAtualId) {
      throw new ErroDeRegra(["Só é possível editar as próprias atividades."])
    }
    if (atual.status !== "pendente") {
      throw new ErroDeRegra(["Só atividades pendentes podem ser editadas."])
    }
    // `null` em tipoId é uma escolha (não previsto), diferente de não informar.
    const tipoId = patch.tipoId !== undefined ? patch.tipoId : atual.tipoId
    const quantidade = patch.quantidade !== undefined ? patch.quantidade : atual.quantidade
    const atualizada: Atividade = {
      ...atual,
      ...patch,
      tipoId,
      quantidade: tipoId === null ? null : quantidade,
    }
    estado.atividades[indice] = atualizada
    await gravar(estado)

    if (comprovanteNovo) comprovantesPendentes.delete(comprovanteNovo)
    if (comprovanteAnterior && comprovanteAnterior !== comprovanteNovo) {
      await removerComprovante(comprovanteAnterior)
    }
    return copia(atualizada)
  } catch (erro) {
    if (comprovanteNovo && comprovanteNovo !== comprovanteAnterior) {
      await descartarComprovantePendente(comprovanteNovo)
    }
    throw erro
  }
}

/** Envia (ou reenvia, após devolução) uma atividade pendente. */
export async function enviarAtividade(id: string): Promise<Atividade> {
  await esperar()
  const estado = await ler()
  const indice = localizar(estado, id)
  const enviada = enviarParaValidacao(estado.atividades[indice], new Date())
  estado.atividades[indice] = enviada
  await gravar(estado)
  return copia(enviada)
}

/** Progresso do discente da demonstração ou, se informado, de outro discente. */
export async function obterProgresso(discenteId?: string): Promise<Progresso> {
  await esperar()
  const estado = await ler()
  const alvo = discenteId ?? estado.discenteAtualId
  return calcularProgresso(estado.atividades.filter((a) => a.discenteId === alvo))
}

// --- Avisos (central de avisos, perfil discente) ------------------------------------------

/** Do mais recente para o mais antigo. */
export async function listarAvisos(): Promise<Aviso[]> {
  await esperar()
  const estado = await ler()
  return copia(estado.avisos).sort((a, b) => new Date(b.em).getTime() - new Date(a.em).getTime())
}

export async function marcarAvisoComoLido(id: string): Promise<void> {
  await esperar()
  const estado = await ler()
  estado.avisos = estado.avisos.map((a) => (a.id === id ? { ...a, lido: true } : a))
  await gravar(estado)
}

export async function marcarTodosAvisosComoLidos(): Promise<void> {
  await esperar()
  const estado = await ler()
  estado.avisos = estado.avisos.map((a) => ({ ...a, lido: true }))
  await gravar(estado)
}

// --- Comprovantes --------------------------------------------------------------------------
// O arquivo fica no Supabase Storage; o EstadoDemo guarda somente seu caminho.
// Sem os 300 ms de esperar(): o processamento e o upload já são assíncronos.

const LADO_MAIOR_COMPROVANTE = 1400
const QUALIDADE_JPEG_COMPROVANTE = 0.7

/**
 * Processa (imagem: redimensiona e recomprime; PDF: mantém como está) e envia
 * o arquivo ao Supabase Storage. Devolve somente a referência ao objeto.
 */
export async function salvarComprovante(arquivo: File): Promise<Comprovante> {
  const caminho = arquivo.type.startsWith("image/")
    ? `${novoId("comp")}.jpg`
    : `${novoId("comp")}.pdf`
  let conteudo: Blob = arquivo
  let tipoMime = arquivo.type

  if (arquivo.type.startsWith("image/")) {
    conteudo = await redimensionarImagem(arquivo, LADO_MAIOR_COMPROVANTE, QUALIDADE_JPEG_COMPROVANTE)
    tipoMime = "image/jpeg"
  }

  const { error } = await supabase.storage
    .from(BUCKET_COMPROVANTES)
    .upload(caminho, conteudo, { contentType: tipoMime, upsert: false })

  if (error) {
    console.error("Erro ao enviar comprovante ao Supabase Storage:", error)
    throw new Error("Não foi possível salvar o comprovante.")
  }

  comprovantesPendentes.add(caminho)
  return { comprovanteId: caminho, nome: arquivo.name, tamanhoBytes: conteudo.size, tipoMime }
}

/**
 * URL para exibir o comprovante — `<img src>` ou `<embed src>`. Uma
 * referência começando com "/" já é um arquivo público da demonstração
 * (lib/mock-data.ts) e volta direto. Os demais são objetos do bucket público.
 */
export async function obterUrlComprovante(comprovante: Comprovante): Promise<string | null> {
  if (comprovante.comprovanteId.startsWith("/")) return comprovante.comprovanteId
  try {
    const { data } = supabase.storage
      .from(BUCKET_COMPROVANTES)
      .getPublicUrl(comprovante.comprovanteId)
    return data.publicUrl
  } catch {
    return null
  }
}

/** Recupera o arquivo remoto para OCR, inclusive ao reabrir um rascunho. */
export async function obterArquivoComprovante(comprovante: Comprovante): Promise<File | null> {
  if (comprovante.comprovanteId.startsWith("/")) return null
  const { data, error } = await supabase.storage
    .from(BUCKET_COMPROVANTES)
    .download(comprovante.comprovanteId)
  if (error || !data) return null
  return new File([data], comprovante.nome, { type: data.type || comprovante.tipoMime })
}

async function removerObjetoComprovante(comprovanteId: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(BUCKET_COMPROVANTES)
    .remove([comprovanteId])
  if (error) {
    console.error("Erro ao remover comprovante do Supabase Storage:", error)
    return false
  }
  comprovantesPendentes.delete(comprovanteId)
  return true
}

async function descartarComprovantePendente(comprovanteId: string): Promise<void> {
  if (!comprovantesPendentes.has(comprovanteId)) return
  await removerObjetoComprovante(comprovanteId)
}

/** Best-effort: remove somente objetos remotos; arquivos públicos do seed são preservados. */
export async function removerComprovante(comprovanteId: string): Promise<void> {
  if (comprovanteId.startsWith("/")) return
  await removerObjetoComprovante(comprovanteId)
}

// --- Rascunho da tela 04 ------------------------------------------------------------------
// Autosave do formulário de nova atividade. Guarda dados parciais (nada aqui
// precisa ser válido) para o aluno não perder o que digitou; não é uma
// Atividade e não aparece em listarAtividades().

const CHAVE_RASCUNHO = "horas-complementares:rascunho-nova-atividade"

export type Rascunho = Partial<NovaAtividade> & { atualizadoEm: string }

function ehRascunho(valor: unknown): valor is Rascunho {
  return typeof valor === "object" && valor !== null && typeof (valor as Partial<Rascunho>).atualizadoEm === "string"
}

export async function salvarRascunho(dados: Partial<NovaAtividade>): Promise<Rascunho> {
  await esperar()
  const rascunho: Rascunho = { ...dados, atualizadoEm: new Date().toISOString() }
  armazenamento().setItem(CHAVE_RASCUNHO, JSON.stringify(rascunho))
  return copia(rascunho)
}

/** `null` quando não há rascunho salvo (ou está corrompido). */
export async function obterRascunho(): Promise<Rascunho | null> {
  await esperar()
  try {
    const bruto = armazenamento().getItem(CHAVE_RASCUNHO)
    const valor: unknown = bruto ? JSON.parse(bruto) : null
    return ehRascunho(valor) ? valor : null
  } catch {
    return null
  }
}

export async function limparRascunho(): Promise<void> {
  await esperar()
  armazenamento().removeItem(CHAVE_RASCUNHO)
}

// --- Docente ------------------------------------------------------------------------------

/**
 * Fila derivada do status: toda atividade em análise, de qualquer discente,
 * da que espera há mais tempo para a mais recente.
 */
export async function listarFilaValidacao(): Promise<ItemFila[]> {
  await esperar()
  const estado = await ler()
  const agora = new Date()
  const discentes = new Map(estado.discentes.map((d) => [d.id, d]))

  return estado.atividades
    .filter((a): a is Atividade & { enviadaEm: string } => a.status === "analise" && a.enviadaEm !== null)
    .sort((a, b) => a.enviadaEm.localeCompare(b.enviadaEm))
    .map((a) => {
      const d = discentes.get(a.discenteId)
      const creditos = creditosDaAtividade(a)
      return {
        atividadeId: a.id,
        discente: { id: a.discenteId, nome: d?.nome ?? "Discente", ra: d?.ra ?? "" },
        titulo: a.titulo,
        tipoId: a.tipoId,
        quantidade: a.quantidade,
        creditos,
        horas: horasDeCreditos(creditos),
        enviadaEm: a.enviadaEm,
        esperaDias: diasDeEspera(a.enviadaEm, agora),
      }
    })
}

/** Aprova, devolve com pendência ou recusa; pode reclassificar o tipo. */
export async function registrarParecer(id: string, parecer: NovoParecer): Promise<Atividade> {
  await esperar()
  const estado = await ler()
  const indice = localizar(estado, id)
  const resultado = aplicarParecer(estado.atividades[indice], parecer, estado.docenteAtualId, new Date())
  estado.atividades[indice] = resultado
  await gravar(estado)
  return copia(resultado)
}

export type EstatisticasDocente = {
  /** Atividades em análise, de qualquer discente. */
  aguardando: number
  /** Dentre as aguardando, quantas esperam há mais de 7 dias. */
  esperandoMaisDe7Dias: number
  /** Total de atividades já validadas, de qualquer discente. */
  validadas: number
  /** Créditos homologados nas atividades validadas. */
  creditosHomologados: number
  /** Pendentes que já foram enviadas ao menos uma vez (devolvidas, aguardando o discente). */
  devolvidas: number
  /** Discentes da demonstração. */
  orientandosAtivos: number
}

/** Indicadores do painel do docente (tela 06): sempre sobre todas as atividades do sistema. */
export async function obterEstatisticasDocente(): Promise<EstatisticasDocente> {
  await esperar()
  const estado = await ler()
  const agora = new Date()

  const emAnalise = estado.atividades.filter(
    (a): a is Atividade & { enviadaEm: string } => a.status === "analise" && a.enviadaEm !== null
  )
  const validadas = estado.atividades.filter((a) => a.status === "validada")
  const devolvidas = estado.atividades.filter((a) => a.status === "pendente" && a.enviadaEm !== null)

  return {
    aguardando: emAnalise.length,
    esperandoMaisDe7Dias: emAnalise.filter((a) => diasDeEspera(a.enviadaEm, agora) > 7).length,
    validadas: validadas.length,
    creditosHomologados: validadas.reduce((soma, a) => soma + creditosDaAtividade(a), 0),
    devolvidas: devolvidas.length,
    orientandosAtivos: estado.discentes.filter((d) => d.orientadorId === estado.docenteAtualId).length,
  }
}

// --- Orientandos e relatório da turma (telas do docente) ------------------------------------
// As duas telas usam a mesma agregação (lib/orientandos.ts): o relatório é
// calculado em cima dos mesmos ResumoOrientando que a lista mostra, nunca
// recalculado à parte, para as duas concordarem sempre.

function construirResumosOrientandos(estado: EstadoDemo, agora: Date): ResumoOrientando[] {
  return estado.discentes
    .filter((d) => d.orientadorId === estado.docenteAtualId)
    .map((d) => resumirOrientando(d, estado.atividades.filter((a) => a.discenteId === d.id), agora))
}

export async function listarOrientandos(): Promise<ResumoOrientando[]> {
  await esperar()
  const estado = await ler()
  return copia(construirResumosOrientandos(estado, new Date()))
}

export async function obterRelatorioTurma(): Promise<RelatorioTurma> {
  await esperar()
  const estado = await ler()
  return copia(agregarTurma(construirResumosOrientandos(estado, new Date())))
}

/**
 * Atividades brutas de cada orientando do docente atual, para o relatório da
 * turma filtrar por período/tipo e reagregar (resumirOrientando + agregarTurma,
 * lib/orientandos.ts) sobre o subconjunto filtrado — sem recalcular nada,
 * só trocando o que entra na mesma agregação de sempre.
 */
export async function listarAtividadesDosOrientandos(): Promise<{ discente: Discente; atividades: Atividade[] }[]> {
  await esperar()
  const estado = ler()
  return copia(
    estado.discentes
      .filter((d) => d.orientadorId === estado.docenteAtualId)
      .map((d) => ({ discente: d, atividades: estado.atividades.filter((a) => a.discenteId === d.id) }))
  )
}

// --- Sessão simulada ------------------------------------------------------------------------
// Não há autenticação real: a sessão só guarda o perfil escolhido na entrada.
// Com backend, estas funções passam a falar com o serviço de autenticação.

const CHAVE_SESSAO = "horas-complementares:sessao"

function ehSessao(valor: unknown): valor is Sessao {
  if (typeof valor !== "object" || valor === null) return false
  const s = valor as Partial<Sessao>
  return (
    (s.perfil === "discente" || s.perfil === "docente") &&
    (s.modo === "institucional" || s.modo === "visitante") &&
    typeof s.iniciadaEm === "string"
  )
}

function lerSessao(): Sessao | null {
  try {
    const bruto = armazenamento().getItem(CHAVE_SESSAO)
    const valor: unknown = bruto ? JSON.parse(bruto) : null
    return ehSessao(valor) ? valor : null
  } catch {
    return null
  }
}

function gravarSessao(sessao: Sessao): void {
  armazenamento().setItem(CHAVE_SESSAO, JSON.stringify(sessao))
}

export async function iniciarSessao(perfil: Perfil, modo: ModoEntrada): Promise<Sessao> {
  await esperar()
  const sessao: Sessao = { perfil, modo, iniciadaEm: new Date().toISOString() }
  gravarSessao(sessao)
  return copia(sessao)
}

/** `null` quando ninguém entrou (ou depois de sair). */
export async function obterSessao(): Promise<Sessao | null> {
  await esperar()
  return copia(lerSessao())
}

/** Troca o perfil mantendo o modo de entrada; sem sessão, entra como visitante. */
export async function trocarPerfil(perfil: Perfil): Promise<Sessao> {
  await esperar()
  const atual = lerSessao()
  const sessao: Sessao = {
    perfil,
    modo: atual?.modo ?? "visitante",
    iniciadaEm: atual?.iniciadaEm ?? new Date().toISOString(),
  }
  gravarSessao(sessao)
  return copia(sessao)
}

export async function encerrarSessao(): Promise<void> {
  await esperar()
  armazenamento().removeItem(CHAVE_SESSAO)
}

// --- Preferências de acessibilidade ------------------------------------------------------
// Exceção deliberada à regra "tudo assíncrono com atraso": preferências de
// exibição são locais por natureza (continuariam no navegador mesmo com uma API
// real) e precisam valer antes da primeira pintura, senão a tela piscaria em
// 100 % antes de ir para 125 %.

const CHAVE_PREFERENCIAS = "horas-complementares:preferencias"

/** Síncrona. Em caso de erro ou valor inválido, devolve o padrão. */
export function lerPreferencias(): Preferencias {
  try {
    const bruto = armazenamento().getItem(CHAVE_PREFERENCIAS)
    const valor: unknown = bruto ? JSON.parse(bruto) : null
    return ehPreferencias(valor) ? valor : { ...PREFERENCIAS_PADRAO }
  } catch {
    return { ...PREFERENCIAS_PADRAO }
  }
}

/** Síncrona. Falha silenciosamente (ex.: navegação privada): a preferência vale até recarregar. */
export function salvarPreferencias(preferencias: Preferencias): void {
  try {
    armazenamento().setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias))
  } catch {
    // Sem armazenamento disponível.
  }
}

/**
 * Script inline para o <head> do layout raiz: aplica as preferências no <html>
 * durante a leitura do HTML, antes da primeira pintura. Deve espelhar
 * `aplicarPreferencias` de lib/preferencias.ts — inclusive o portão de versão:
 * sem ele, uma preferência salva por uma versão anterior ainda seria aplicada
 * aqui (antes da pintura) e depois desfeita pelo React ao montar (que já
 * rejeita a versão errada e usa os padrões), piscando a configuração errada
 * por um instante.
 */
export const SCRIPT_PREFERENCIAS = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  CHAVE_PREFERENCIAS
)})||"null");if(!p||p.versao!==1)return;var h=document.documentElement;if(p.altoContraste===true)h.classList.add(${JSON.stringify(
  CLASSE_ALTO_CONTRASTE
)});if(p.reduzirAnimacoes===true)h.classList.add(${JSON.stringify(
  CLASSE_REDUZIR_ANIMACOES
)});if(p.tamanhoTexto==="menor"||p.tamanhoTexto==="maior")h.setAttribute(${JSON.stringify(
  ATRIBUTO_TAMANHO_TEXTO
)},p.tamanhoTexto);if(p.densidade==="confortavel")h.setAttribute(${JSON.stringify(
  ATRIBUTO_DENSIDADE
)},p.densidade)}catch(e){}})()`

// --- Demonstração ------------------------------------------------------------------------

export async function exportarEstado(): Promise<string> {
  await esperar()
  return JSON.stringify(await ler(), null, 2)
}

export async function importarEstado(json: string): Promise<void> {
  await esperar()
  let estado: unknown
  try {
    estado = JSON.parse(json)
  } catch {
    throw new ErroDeRegra(["O arquivo não contém um JSON válido."])
  }
  if (!ehEstadoValido(estado)) {
    throw new ErroDeRegra(["O arquivo não é um estado exportado por este sistema."])
  }
  await gravar(estado)
}

/** Volta ao seed, com datas recalculadas a partir de agora. */
export async function reiniciarDemo(): Promise<void> {
  await esperar()
  await gravar(criarEstadoInicial(new Date()))
}

/**
 * Reinicia o estado da demonstração. Comprovantes remotos não são apagados em
 * massa, pois o bucket é compartilhado entre navegadores; trocas e remoções
 * individuais fazem sua própria limpeza best-effort.
 */
export async function limparDadosLocais(): Promise<void> {
  await reiniciarDemo()
}
