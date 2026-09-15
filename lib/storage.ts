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
import {
  ATRIBUTO_TAMANHO_TEXTO,
  CLASSE_ALTO_CONTRASTE,
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
import type {
  Atividade,
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
} from "./types"

const CHAVE = "horas-complementares:estado"
const ATRASO_MS = 300
const STATUS: readonly StatusAtividade[] = ["validada", "analise", "pendente", "recusada"]

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

function ehEstadoValido(valor: unknown): valor is EstadoDemo {
  if (typeof valor !== "object" || valor === null) return false
  const e = valor as Partial<EstadoDemo>
  return (
    e.versao === 2 && // estado de versão anterior é descartado e o seed é recriado
    typeof e.discenteAtualId === "string" &&
    typeof e.docenteAtualId === "string" &&
    Array.isArray(e.discentes) &&
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
    )
  )
}

/** Lê o estado; na primeira visita (ou se estiver corrompido), cria o seed. */
function ler(): EstadoDemo {
  const bruto = armazenamento().getItem(CHAVE)
  if (bruto) {
    try {
      const estado: unknown = JSON.parse(bruto)
      if (ehEstadoValido(estado)) return estado
    } catch {
      // JSON inválido: recomeça do seed abaixo.
    }
  }
  const inicial = criarEstadoInicial(new Date())
  gravar(inicial)
  return inicial
}

function gravar(estado: EstadoDemo): void {
  armazenamento().setItem(CHAVE, JSON.stringify(estado))
}

/** Cópia profunda: quem chama nunca altera o estado guardado por referência. */
function copia<T>(valor: T): T {
  return structuredClone(valor)
}

function novoId(): string {
  const aleatorio =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `atv-${aleatorio}`
}

function localizar(estado: EstadoDemo, id: string): number {
  const indice = estado.atividades.findIndex((a) => a.id === id)
  if (indice === -1) throw new ErroDeRegra(["Atividade não encontrada."])
  return indice
}

// --- Pessoas ---------------------------------------------------------------------------

export async function obterDiscenteAtual(): Promise<Discente> {
  await esperar()
  const estado = ler()
  const discente = estado.discentes.find((d) => d.id === estado.discenteAtualId)
  if (!discente) throw new ErroDeRegra(["Discente da demonstração não encontrado."])
  return copia(discente)
}

export async function obterDocenteAtual(): Promise<Docente> {
  await esperar()
  const estado = ler()
  const docente = estado.docentes.find((d) => d.id === estado.docenteAtualId)
  if (!docente) throw new ErroDeRegra(["Docente da demonstração não encontrado."])
  return copia(docente)
}

export async function obterDiscente(id: string): Promise<Discente | null> {
  await esperar()
  return copia(ler().discentes.find((d) => d.id === id) ?? null)
}

// --- Atividades do discente ------------------------------------------------------------

/** Atividades do discente da demonstração, na ordem em que foram registradas. */
export async function listarAtividades(): Promise<Atividade[]> {
  await esperar()
  const estado = ler()
  return copia(estado.atividades.filter((a) => a.discenteId === estado.discenteAtualId))
}

/** Qualquer atividade, de qualquer discente (a tela 07 do docente também usa). */
export async function obterAtividade(id: string): Promise<Atividade | null> {
  await esperar()
  return copia(ler().atividades.find((a) => a.id === id) ?? null)
}

/** Envia uma nova atividade para validação; ela entra na fila do docente. */
export async function criarAtividade(dados: NovaAtividade): Promise<Atividade> {
  await esperar()
  const estado = ler()
  const atividade = montarAtividade(
    dados,
    { id: novoId(), discenteId: estado.discenteAtualId },
    new Date()
  )
  estado.atividades.push(atividade)
  gravar(estado)
  return copia(atividade)
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
  const estado = ler()
  const indice = localizar(estado, id)
  const atual = estado.atividades[indice]
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
  gravar(estado)
  return copia(atualizada)
}

/** Envia (ou reenvia, após devolução) uma atividade pendente. */
export async function enviarAtividade(id: string): Promise<Atividade> {
  await esperar()
  const estado = ler()
  const indice = localizar(estado, id)
  const enviada = enviarParaValidacao(estado.atividades[indice], new Date())
  estado.atividades[indice] = enviada
  gravar(estado)
  return copia(enviada)
}

/** Progresso do discente da demonstração ou, se informado, de outro discente. */
export async function obterProgresso(discenteId?: string): Promise<Progresso> {
  await esperar()
  const estado = ler()
  const alvo = discenteId ?? estado.discenteAtualId
  return calcularProgresso(estado.atividades.filter((a) => a.discenteId === alvo))
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
  const estado = ler()
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
  const estado = ler()
  const indice = localizar(estado, id)
  const resultado = aplicarParecer(estado.atividades[indice], parecer, estado.docenteAtualId, new Date())
  estado.atividades[indice] = resultado
  gravar(estado)
  return copia(resultado)
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
 * `aplicarPreferencias` de lib/preferencias.ts.
 */
export const SCRIPT_PREFERENCIAS = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  CHAVE_PREFERENCIAS
)})||"null");if(!p)return;var h=document.documentElement;if(p.altoContraste===true)h.classList.add(${JSON.stringify(
  CLASSE_ALTO_CONTRASTE
)});if(p.tamanhoTexto==="menor"||p.tamanhoTexto==="maior")h.setAttribute(${JSON.stringify(
  ATRIBUTO_TAMANHO_TEXTO
)},p.tamanhoTexto)}catch(e){}})()`

// --- Demonstração ------------------------------------------------------------------------

export async function exportarEstado(): Promise<string> {
  await esperar()
  return JSON.stringify(ler(), null, 2)
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
  gravar(estado)
}

/** Volta ao seed, com datas recalculadas a partir de agora. */
export async function reiniciarDemo(): Promise<void> {
  await esperar()
  gravar(criarEstadoInicial(new Date()))
}
