// lib/calculos.ts
//
// Regras de atividades complementares do BCDIA (ADENDO-DOMINIO.md). Funções
// puras: recebem dados e, quando precisam do relógio, recebem `agora`.
//
// Princípio central: a carga horária do certificado não é a que conta. O que
// conta são os créditos que o tipo da Tabela 7 reconhece; horas contabilizadas
// = créditos × HORAS_POR_CREDITO. Ex.: uma eletiva de 40 h vale 2 créditos, ou
// seja, 30 horas contabilizadas.
//
// Regras da seção 3.5.4 do PPC aplicadas aqui:
// - a carga da Tabela 7 é a MÁXIMA reconhecida; créditos excedentes não valem;
// - a validação pode ser fracionada, com arredondamento para baixo;
// - as 90 h exigem pelo menos dois tipos de atividade diferentes.

import {
  CATALOGO,
  GRUPOS,
  NOTA_DUPLA_CONTAGEM,
  NOTA_SEMESTRE_COMPLETO,
  UNIDADES,
  esforcoDe,
  medidoEmHoras,
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
// 15 h por crédito: definição de crédito da matriz curricular (PPC, Tabela 4,
// H = 15 × C em todas as linhas). A seção 3.5.4 não converte as horas
// complementares em créditos; confirmação com a coordenação segue pendente.
export const HORAS_POR_CREDITO = 15
export const HORAS_EXIGIDAS = 90        // Tabela 2 do PPC do BCDIA
export const CREDITOS_EXIGIDOS = HORAS_EXIGIDAS / HORAS_POR_CREDITO  // 6
// PPC, seção 3.5.4: "em pelo menos dois tipos de atividades diferentes".
export const TIPOS_DISTINTOS_EXIGIDOS = 2

// Sem teto conhecido no PPC. Se a coordenação confirmar limites,
// preencher aqui — nenhuma outra parte do código muda.
// Valor em créditos, aplicado à soma validada de cada tipo.
export const TETOS_POR_TIPO: Partial<Record<TipoAtividadeId, number>> = {}

// Não vem do PPC (ao contrário das constantes acima): é o limiar escolhido
// para o sinal de risco "pendência antiga" na visão do docente (telas de
// orientandos e relatório da turma) — quanto tempo sem retorno já é motivo de
// atenção. Centralizado aqui pela mesma regra dos outros números do domínio:
// o verificador de tokens só permite os literais 90/15/6 neste arquivo.
export const DIAS_PENDENCIA_ANTIGA = 15

/** Erro de regra de negócio, com mensagens prontas para mostrar ao usuário. */
export class ErroDeRegra extends Error {
  // Campo explícito em vez de `constructor(readonly erros)`: parameter property
  // é sintaxe que o Node não consegue apagar sozinho, e scripts/verificar-migracao.mjs
  // importa este módulo direto, sem bundler.
  readonly erros: string[]

  constructor(erros: string[]) {
    super(erros.join(" "))
    this.erros = erros
    this.name = "ErroDeRegra"
  }
}

// --- Conversões ------------------------------------------------------------------

/**
 * Créditos de uma quantidade na unidade do tipo, sempre arredondados para baixo.
 * - Em horas (um registro por semestre): proporcionais à carga máxima e
 *   limitados a ela. IC de 90 h (máx. 180 h = 3 créditos) vale 1 crédito.
 * - Por unidade: só blocos completos. 3 palestras (2 = 1 crédito) valem 1.
 */
export function creditosPorQuantidade(tipo: TipoAtividade, quantidade: number): number {
  if (!Number.isInteger(quantidade) || quantidade <= 0) return 0
  if (medidoEmHoras(tipo)) {
    return Math.min(tipo.creditos, Math.floor((quantidade * tipo.creditos) / tipo.cargaMaxima))
  }
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
 * Só atividades validadas contam.
 * - Tipos em horas: cada registro é um semestre, com seu próprio teto; os
 *   créditos de cada registro são somados.
 * - Tipos por unidade: as quantidades são somadas antes da conversão, para que
 *   blocos se completem entre registros (duas palestras em registros separados
 *   somam 1 crédito).
 * Integralizar exige os créditos E pelo menos dois tipos diferentes com crédito.
 */
export function calcularProgresso(atividades: readonly Atividade[]): Progresso {
  const quantidadePorTipo = new Map<TipoAtividadeId, number>()
  const creditosEmHoras = new Map<TipoAtividadeId, number>()
  for (const a of atividades) {
    if (a.status !== "validada" || a.tipoId === null || a.quantidade === null) continue
    quantidadePorTipo.set(a.tipoId, (quantidadePorTipo.get(a.tipoId) ?? 0) + a.quantidade)
    const tipo = obterTipo(a.tipoId)
    if (medidoEmHoras(tipo)) {
      creditosEmHoras.set(tipo.id, (creditosEmHoras.get(tipo.id) ?? 0) + creditosPorQuantidade(tipo, a.quantidade))
    }
  }

  const porTipo: CreditosPorTipo[] = CATALOGO.filter((tipo) => quantidadePorTipo.has(tipo.id)).map(
    (tipo) => {
      const quantidade = quantidadePorTipo.get(tipo.id) ?? 0
      const bruto = medidoEmHoras(tipo)
        ? (creditosEmHoras.get(tipo.id) ?? 0)
        : creditosPorQuantidade(tipo, quantidade)
      const creditos = aplicarTeto(tipo.id, bruto)
      return { tipoId: tipo.id, quantidade, creditos, horas: horasDeCreditos(creditos) }
    }
  )
  const tiposDistintos = porTipo.filter((item) => item.creditos > 0).length

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
    tiposDistintos,
    tiposExigidos: TIPOS_DISTINTOS_EXIGIDOS,
    integralizado:
      creditosObtidos >= CREDITOS_EXIGIDOS && tiposDistintos >= TIPOS_DISTINTOS_EXIGIDOS,
    porTipo,
    porGrupo,
  }
}

/**
 * "O que fecha o que falta": para cada tipo, a menor quantidade que cobre os
 * créditos faltantes.
 * - Em horas: a validação fracionada permite fechar exatamente; acima do teto
 *   de um semestre, a opção indica quantos semestres (registros) são precisos.
 * - Por unidade: considera o que o aluno já tem do tipo (uma palestra validada
 *   faz faltarem só 3 para 2 créditos) e pode exceder o que falta.
 * Se os créditos já bastam mas falta o segundo tipo diferente, só tipos novos
 * entram, com a meta de 1 crédito. Ordem: esforço de obtenção, do mais simples
 * ao mais difícil (NIVEIS_ESFORCO, classificação nossa em lib/catalogo.ts).
 */
export function opcoesParaFechar(progresso: Progresso): OpcaoFechamento[] {
  const faltaTipo = progresso.tiposDistintos < TIPOS_DISTINTOS_EXIGIDOS
  const faltantes = progresso.creditosFaltantes
  if (faltantes <= 0 && !faltaTipo) return []

  const meta = Math.max(faltantes, 1)
  const comCredito = new Set(progresso.porTipo.filter((item) => item.creditos > 0).map((item) => item.tipoId))

  const opcoes: OpcaoFechamento[] = []
  for (const tipo of CATALOGO) {
    const atual = progresso.porTipo.find((item) => item.tipoId === tipo.id)
    const teto = TETOS_POR_TIPO[tipo.id]
    if (teto !== undefined && (atual?.creditos ?? 0) >= teto) continue
    const tipoNovo = !comCredito.has(tipo.id)
    if (faltantes <= 0 && !tipoNovo) continue

    let quantidade: number
    let creditos: number
    let semestres: number | null = null
    if (medidoEmHoras(tipo)) {
      semestres = Math.ceil(meta / tipo.creditos)
      const noUltimo = meta - (semestres - 1) * tipo.creditos
      quantidade = (semestres - 1) * tipo.cargaMaxima + Math.ceil((noUltimo * tipo.cargaMaxima) / tipo.creditos)
      creditos = meta
    } else {
      const quantidadeAtual = atual?.quantidade ?? 0
      const blocos = Math.ceil(meta / tipo.creditos)
      const blocosCompletos = Math.floor(quantidadeAtual / tipo.quantidadePorBloco)
      quantidade = (blocosCompletos + blocos) * tipo.quantidadePorBloco - quantidadeAtual
      creditos = blocos * tipo.creditos
    }

    opcoes.push({
      tipoId: tipo.id,
      quantidade,
      semestres,
      creditos,
      horas: horasDeCreditos(creditos),
      excede: creditos > meta,
      atendeTiposDistintos:
        progresso.tiposDistintos + (tipoNovo ? 1 : 0) >= TIPOS_DISTINTOS_EXIGIDOS,
      nivelEsforco: esforcoDe(tipo.id).nivel,
    })
  }

  return opcoes.sort((a, b) => {
    const ea = esforcoDe(a.tipoId)
    const eb = esforcoDe(b.tipoId)
    return ea.nivel - eb.nivel || ea.posicao - eb.posicao
  })
}

/**
 * O que o painel mostra: a opção mais simples de cada nível de esforço, até o
 * nível indicado (por padrão, os quatro primeiros — cargo eletivo não é uma
 * sugestão prática). Uma por nível dá variedade real ao "por exemplo".
 */
export function sugestoesParaFechar(progresso: Progresso, ateNivel = 4): OpcaoFechamento[] {
  const vistas = new Set<number>()
  return opcoesParaFechar(progresso).filter((opcao) => {
    if (opcao.nivelEsforco > ateNivel || vistas.has(opcao.nivelEsforco)) return false
    vistas.add(opcao.nivelEsforco)
    return true
  })
}

// --- Cadastro (tela 04): as três validações do PPC antes do envio ----------------

export const MENSAGEM_TIPO_NAO_PREVISTO =
  "Esta atividade não corresponde a nenhum tipo da Tabela 7 do Projeto Pedagógico. Pelo Projeto Pedagógico, atividades fora da tabela só são validadas com aprovação do conselho do curso. Consulte o catálogo: se houver um tipo equivalente, escolha-o antes de enviar."

/** Aviso para horas acima do máximo reconhecido por semestre (PPC, 3.5.4). */
export function mensagemAcimaDoMaximo(tipo: TipoAtividade & { cargaMaxima: number }): string {
  return `Este tipo reconhece no máximo ${tipo.cargaMaxima} horas por semestre, que valem ${tipo.creditos} créditos. Horas acima disso não são validadas. Se a atividade durou mais de um semestre, registre cada semestre separadamente.`
}

/**
 * Regra 1 (tipo não previsto) e horas acima do máximo só avisam. Regras (*) e
 * (**) exigem confirmação explícita antes do envio.
 */
export function avisosDeCadastro(
  dados: Pick<NovaAtividade, "tipoId" | "quantidade" | "confirmacoes">
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
  if (medidoEmHoras(tipo) && dados.quantidade !== null && dados.quantidade > tipo.cargaMaxima) {
    avisos.push({
      regra: "carga-acima-do-maximo",
      mensagem: mensagemAcimaDoMaximo(tipo),
      exigeConfirmacao: false,
      confirmado: false,
    })
  }
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
      const tipo = obterTipo(dados.tipoId)
      erros.push({
        campo: "quantidade",
        mensagem: medidoEmHoras(tipo)
          ? "Informe as horas que constam no comprovante, com um número inteiro a partir de 1."
          : `Informe a quantidade em ${UNIDADES[tipo.unidade].plural}, com um número inteiro a partir de 1.`,
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
 * pode ser ajustada porque a unidade muda com o tipo (horas, eventos...).
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
