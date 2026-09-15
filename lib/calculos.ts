// lib/calculos.ts
//
// Regras de atividades complementares do BCDIA (ADENDO-DOMINIO.md). Funções
// puras: recebem dados e, quando precisam do relógio, recebem `agora`.
//
// Princípio central: a carga horária do certificado não é a que conta. Cada
// tipo da Tabela 7 vale créditos fixos; horas = créditos × HORAS_POR_CREDITO.

import {
  CATALOGO,
  GRUPOS,
  NOTA_DUPLA_CONTAGEM,
  NOTA_SEMESTRE_COMPLETO,
  UNIDADES,
  obterTipo,
  type TipoAtividade,
  type TipoAtividadeId,
} from "./catalogo"
import type {
  Atividade,
  AvisoCadastro,
  CreditosPorTipo,
  NovaAtividade,
  NovoParecer,
  OpcaoFechamento,
  Parecer,
  Progresso,
  StatusAtividade,
  TipoEvento,
} from "./types"

// Únicas fontes destes números no projeto. Nenhum outro arquivo os escreve.
export const HORAS_POR_CREDITO = 15
export const HORAS_EXIGIDAS = 90        // Tabela 2 do PPC do BCDIA
export const CREDITOS_EXIGIDOS = HORAS_EXIGIDAS / HORAS_POR_CREDITO  // 6

// Sem teto conhecido no PPC. Se a coordenação confirmar limites,
// preencher aqui — nenhuma outra parte do código muda.
// Valor em créditos, aplicado à soma validada de cada tipo.
export const TETOS_POR_TIPO: Partial<Record<TipoAtividadeId, number>> = {}

/** Erro de regra de negócio, com mensagens prontas para mostrar ao usuário. */
export class ErroDeRegra extends Error {
  constructor(readonly erros: string[]) {
    super(erros.join(" "))
    this.name = "ErroDeRegra"
  }
}

// --- Conversões ------------------------------------------------------------------

/**
 * Créditos de uma quantidade na unidade do tipo. Só blocos completos contam:
 * em Palestra (2 palestras = 1 crédito), 3 palestras valem 1 crédito.
 */
export function creditosPorQuantidade(tipo: TipoAtividade, quantidade: number): number {
  if (!Number.isInteger(quantidade) || quantidade <= 0) return 0
  return Math.floor(quantidade / tipo.quantidadePorBloco) * tipo.creditos
}

export function horasDeCreditos(creditos: number): number {
  return creditos * HORAS_POR_CREDITO
}

/** Créditos da atividade isolada, pelo tipo atual. Sem tipo previsto, zero. */
export function creditosDaAtividade(atividade: Pick<Atividade, "tipoId" | "quantidade">): number {
  if (atividade.tipoId === null || atividade.quantidade === null) return 0
  return creditosPorQuantidade(obterTipo(atividade.tipoId), atividade.quantidade)
}

/** Inativa enquanto TETOS_POR_TIPO estiver vazio. */
export function aplicarTeto(tipoId: TipoAtividadeId, creditos: number): number {
  const teto = TETOS_POR_TIPO[tipoId]
  return teto === undefined ? creditos : Math.min(creditos, teto)
}

// --- Progresso -------------------------------------------------------------------

/**
 * Só atividades validadas contam. As quantidades são somadas por tipo antes da
 * conversão, para que blocos se completem entre registros: duas palestras
 * validadas em registros separados somam 1 crédito.
 */
export function calcularProgresso(atividades: readonly Atividade[]): Progresso {
  const quantidadePorTipo = new Map<TipoAtividadeId, number>()
  for (const a of atividades) {
    if (a.status !== "validada" || a.tipoId === null || a.quantidade === null) continue
    quantidadePorTipo.set(a.tipoId, (quantidadePorTipo.get(a.tipoId) ?? 0) + a.quantidade)
  }

  const porTipo: CreditosPorTipo[] = CATALOGO.filter((tipo) => quantidadePorTipo.has(tipo.id)).map(
    (tipo) => {
      const quantidade = quantidadePorTipo.get(tipo.id) ?? 0
      const creditos = aplicarTeto(tipo.id, creditosPorQuantidade(tipo, quantidade))
      return { tipoId: tipo.id, quantidade, creditos, horas: horasDeCreditos(creditos) }
    }
  )

  const porGrupo = GRUPOS.map((grupo) => {
    const creditos = porTipo
      .filter((item) => obterTipo(item.tipoId).grupo === grupo.id)
      .reduce((soma, item) => soma + item.creditos, 0)
    return { grupoId: grupo.id, creditos, horas: horasDeCreditos(creditos) }
  })

  const creditosObtidos = porTipo.reduce((soma, item) => soma + item.creditos, 0)
  const creditosFaltantes = Math.max(0, CREDITOS_EXIGIDOS - creditosObtidos)

  return {
    creditosObtidos,
    creditosExigidos: CREDITOS_EXIGIDOS,
    horasObtidas: horasDeCreditos(creditosObtidos),
    horasExigidas: HORAS_EXIGIDAS,
    creditosFaltantes,
    horasFaltantes: horasDeCreditos(creditosFaltantes),
    percentual: Math.min(100, (creditosObtidos / CREDITOS_EXIGIDOS) * 100),
    integralizado: creditosObtidos >= CREDITOS_EXIGIDOS,
    porTipo,
    porGrupo,
  }
}

/**
 * "O que fecha o que falta": para cada tipo, a menor quantidade que cobre os
 * créditos faltantes, considerando o que o aluno já tem daquele tipo (uma
 * palestra validada faz faltarem só 3 para 2 créditos). Ordena primeiro as
 * opções exatas, depois as que excedem; empate pela ordem da Tabela 7. A tela
 * escolhe quais exibir.
 */
export function opcoesParaFechar(progresso: Progresso): OpcaoFechamento[] {
  const faltantes = progresso.creditosFaltantes
  if (faltantes <= 0) return []

  const opcoes: OpcaoFechamento[] = []
  for (const tipo of CATALOGO) {
    const atual = progresso.porTipo.find((item) => item.tipoId === tipo.id)
    const teto = TETOS_POR_TIPO[tipo.id]
    if (teto !== undefined && (atual?.creditos ?? 0) >= teto) continue

    const quantidadeAtual = atual?.quantidade ?? 0
    const blocos = Math.ceil(faltantes / tipo.creditos)
    const blocosCompletos = Math.floor(quantidadeAtual / tipo.quantidadePorBloco)
    const quantidade = (blocosCompletos + blocos) * tipo.quantidadePorBloco - quantidadeAtual
    const creditos = blocos * tipo.creditos
    opcoes.push({
      tipoId: tipo.id,
      quantidade,
      creditos,
      horas: horasDeCreditos(creditos),
      excede: creditos > faltantes,
    })
  }

  return opcoes.sort(
    (a, b) => Number(a.excede) - Number(b.excede) || a.quantidade - b.quantidade
  )
}

// --- Cadastro (tela 04): as três validações do PPC antes do envio ----------------

export const MENSAGEM_TIPO_NAO_PREVISTO =
  "Esta atividade não corresponde a nenhum tipo da Tabela 7 do Projeto Pedagógico e, por isso, tende a ser recusada. Consulte o catálogo: se houver um tipo equivalente, escolha-o antes de enviar."

/**
 * Regra 1 (tipo não previsto) só avisa. Regras (*) e (**) exigem confirmação
 * explícita antes do envio.
 */
export function avisosDeCadastro(
  dados: Pick<NovaAtividade, "tipoId" | "confirmacoes">
): AvisoCadastro[] {
  if (dados.tipoId === null) {
    return [
      {
        regra: "tipo-nao-previsto",
        mensagem: MENSAGEM_TIPO_NAO_PREVISTO,
        exigeConfirmacao: false,
        confirmado: false,
      },
    ]
  }

  const tipo = obterTipo(dados.tipoId)
  const avisos: AvisoCadastro[] = []
  if (tipo.vedadaDuplaContagem) {
    avisos.push({
      regra: "dupla-contagem",
      mensagem: NOTA_DUPLA_CONTAGEM,
      exigeConfirmacao: true,
      confirmado: dados.confirmacoes.semDuplaContagem,
    })
  }
  if (tipo.exigeSemestreCompleto) {
    avisos.push({
      regra: "semestre-completo",
      mensagem: NOTA_SEMESTRE_COMPLETO,
      exigeConfirmacao: true,
      confirmado: dados.confirmacoes.semestreCompleto,
    })
  }
  return avisos
}

export type ErroDeCampo = {
  campo: keyof NovaAtividade
  mensagem: string
}

/** Tudo o que impede o envio, por campo, em linguagem comum. */
export function validarNovaAtividade(dados: NovaAtividade): ErroDeCampo[] {
  const erros: ErroDeCampo[] = []

  if (!dados.titulo.trim()) {
    erros.push({ campo: "titulo", mensagem: "Informe o título da atividade." })
  }

  if (dados.tipoId !== null) {
    const q = dados.quantidade
    if (q === null || !Number.isInteger(q) || q < 1) {
      const unidade = UNIDADES[obterTipo(dados.tipoId).unidade].plural
      erros.push({
        campo: "quantidade",
        mensagem: `Informe a quantidade em ${unidade}, com um número inteiro a partir de 1.`,
      })
    }
  }

  if (dados.periodo && dados.periodo.termino < dados.periodo.inicio) {
    erros.push({
      campo: "periodo",
      mensagem: "A data de término não pode ser anterior à data de início.",
    })
  }

  if (!dados.comprovante) {
    erros.push({ campo: "comprovante", mensagem: "Anexe o comprovante da atividade." })
  }

  for (const aviso of avisosDeCadastro(dados)) {
    if (!aviso.exigeConfirmacao || aviso.confirmado) continue
    erros.push({
      campo: "confirmacoes",
      mensagem:
        aviso.regra === "dupla-contagem"
          ? "Confirme que esta atividade não foi validada como outro componente curricular."
          : "Confirme a atuação durante todo o semestre letivo.",
    })
  }

  return erros
}

// --- Transições de status ----------------------------------------------------------

function registro(tipo: TipoEvento, agora: Date) {
  return { tipo, em: agora.toISOString() }
}

/** Nova atividade enviada para validação. */
export function montarAtividade(
  dados: NovaAtividade,
  ids: { id: string; discenteId: string },
  agora: Date
): Atividade {
  const erros = validarNovaAtividade(dados)
  if (erros.length) throw new ErroDeRegra(erros.map((e) => e.mensagem))

  return {
    ...ids,
    ...dados,
    titulo: dados.titulo.trim(),
    quantidade: dados.tipoId === null ? null : dados.quantidade,
    observacoes: dados.observacoes.trim(),
    status: "analise",
    criadaEm: agora.toISOString(),
    enviadaEm: agora.toISOString(),
    historico: [registro("enviada", agora)],
    pareceres: [],
  }
}

/** Envio (ou reenvio, após devolução) de uma atividade pendente. */
export function enviarParaValidacao(atividade: Atividade, agora: Date): Atividade {
  if (atividade.status !== "pendente") {
    throw new ErroDeRegra(["Só atividades pendentes podem ser enviadas para validação."])
  }
  const erros = validarNovaAtividade(atividade)
  if (erros.length) throw new ErroDeRegra(erros.map((e) => e.mensagem))

  const jaEnviada = atividade.enviadaEm !== null
  return {
    ...atividade,
    status: "analise",
    enviadaEm: agora.toISOString(),
    historico: [...atividade.historico, registro(jaEnviada ? "reenviada" : "enviada", agora)],
  }
}

// --- Parecer do docente (tela 07) ---------------------------------------------------

type Classificacao = {
  tipoId: TipoAtividadeId | null
  quantidade: number | null
  creditos: number
  horas: number
}

function classificar(tipoId: TipoAtividadeId | null, quantidade: number | null): Classificacao {
  const creditos = creditosDaAtividade({ tipoId, quantidade })
  return { tipoId, quantidade, creditos, horas: horasDeCreditos(creditos) }
}

/**
 * Antes e depois de uma reclassificação, para o docente conferir. A quantidade
 * pode ser ajustada porque a unidade muda com o tipo (semestres, eventos...).
 */
export function compararReclassificacao(
  atividade: Pick<Atividade, "tipoId" | "quantidade">,
  paraTipoId: TipoAtividadeId | null,
  paraQuantidade?: number
): { antes: Classificacao; depois: Classificacao; mudou: boolean } {
  const quantidade = paraTipoId === null ? null : (paraQuantidade ?? atividade.quantidade)
  const antes = classificar(atividade.tipoId, atividade.quantidade)
  const depois = classificar(paraTipoId, quantidade)
  return {
    antes,
    depois,
    mudou: antes.tipoId !== depois.tipoId || antes.quantidade !== depois.quantidade,
  }
}

export function validarParecer(atividade: Atividade, parecer: NovoParecer): string[] {
  const erros: string[] = []

  if (atividade.status !== "analise") {
    erros.push("Só atividades em análise recebem parecer.")
  }

  if (parecer.decisao !== "aprovar" && !parecer.comentario.trim()) {
    erros.push("Escreva um comentário para o discente: ele é obrigatório ao devolver ou recusar.")
  }

  const reclassifica =
    parecer.paraTipoId !== undefined &&
    compararReclassificacao(atividade, parecer.paraTipoId, parecer.paraQuantidade).mudou
  if (reclassifica && !parecer.justificativaReclassificacao?.trim()) {
    erros.push("Justifique a reclassificação do tipo da atividade.")
  }

  if (parecer.decisao === "aprovar") {
    const tipoFinal = reclassifica ? (parecer.paraTipoId ?? null) : atividade.tipoId
    const quantidadeFinal = reclassifica
      ? (parecer.paraQuantidade ?? atividade.quantidade)
      : atividade.quantidade

    if (tipoFinal === null) {
      erros.push(
        "Uma atividade sem tipo da Tabela 7 não pode ser aprovada. Reclassifique-a para um tipo previsto ou recuse-a."
      )
    } else {
      if (quantidadeFinal === null || !Number.isInteger(quantidadeFinal) || quantidadeFinal < 1) {
        erros.push("Informe a quantidade na unidade do tipo, com um número inteiro a partir de 1.")
      }
      if (obterTipo(tipoFinal).exigeSemestreCompleto && !parecer.semestreCompletoConfirmado) {
        erros.push(
          "Confirme a atuação durante todo o semestre letivo: sem isso a monitoria não é validada."
        )
      }
    }
  }

  return erros
}

const STATUS_POR_DECISAO: Record<NovoParecer["decisao"], StatusAtividade> = {
  aprovar: "validada",
  devolver: "pendente",
  recusar: "recusada",
}

const EVENTO_POR_DECISAO: Record<NovoParecer["decisao"], TipoEvento> = {
  aprovar: "validada",
  devolver: "devolvida",
  recusar: "recusada",
}

export function aplicarParecer(
  atividade: Atividade,
  novo: NovoParecer,
  docenteId: string,
  agora: Date
): Atividade {
  const erros = validarParecer(atividade, novo)
  if (erros.length) throw new ErroDeRegra(erros)

  const comparacao =
    novo.paraTipoId === undefined
      ? null
      : compararReclassificacao(atividade, novo.paraTipoId, novo.paraQuantidade)
  const reclassificou = comparacao?.mudou ?? false

  const parecer: Parecer = {
    decisao: novo.decisao,
    comentario: novo.comentario.trim(),
    docenteId,
    em: agora.toISOString(),
    ...(reclassificou && comparacao
      ? {
          reclassificacao: {
            deTipoId: comparacao.antes.tipoId,
            paraTipoId: comparacao.depois.tipoId,
            deQuantidade: comparacao.antes.quantidade,
            paraQuantidade: comparacao.depois.quantidade,
            justificativa: novo.justificativaReclassificacao?.trim() ?? "",
          },
        }
      : {}),
    ...(novo.semestreCompletoConfirmado !== undefined
      ? { semestreCompletoConfirmado: novo.semestreCompletoConfirmado }
      : {}),
  }

  return {
    ...atividade,
    tipoId: reclassificou && comparacao ? comparacao.depois.tipoId : atividade.tipoId,
    quantidade: reclassificou && comparacao ? comparacao.depois.quantidade : atividade.quantidade,
    status: STATUS_POR_DECISAO[novo.decisao],
    historico: [
      ...atividade.historico,
      registro("analisada", agora),
      ...(reclassificou ? [registro("reclassificada", agora)] : []),
      registro(EVENTO_POR_DECISAO[novo.decisao], agora),
    ],
    pareceres: [...atividade.pareceres, parecer],
  }
}

// --- Fila -------------------------------------------------------------------------

const MS_POR_DIA = 24 * 60 * 60 * 1000

/** Dias inteiros desde o envio; nunca negativo. */
export function diasDeEspera(enviadaEm: string, agora: Date): number {
  return Math.max(0, Math.floor((agora.getTime() - new Date(enviadaEm).getTime()) / MS_POR_DIA))
}
