// lib/orientandos.ts
//
// Agregação compartilhada por "Meus orientandos" e "Relatório da turma"
// (lib/storage.ts chama as duas funções abaixo, nunca as telas diretamente).
// As duas telas SEMPRE concordam porque o relatório é calculado a partir dos
// mesmos ResumoOrientando que a lista mostra, não recalculado à parte — quem
// integralizou ou está em risco em "Meus orientandos" é exatamente quem entra
// no percentual e na lista de risco do relatório.
//
// Nenhum número aqui é digitado: créditos e tipos distintos vêm de
// calcularProgresso (lib/calculos.ts), a mesma função que o painel do
// discente usa.

import { CREDITOS_EXIGIDOS, DIAS_PENDENCIA_ANTIGA, TIPOS_DISTINTOS_EXIGIDOS, calcularProgresso, diasDeEspera } from "./calculos"
import { CATALOGO } from "./catalogo"
import type { Atividade, Discente, Progresso, TipoAtividadeId } from "./types"

export type FlagRisco = "tipo-unico" | "sem-validadas" | "pendencia-antiga"

export type ResumoOrientando = {
  discente: Discente
  progresso: Progresso
  /** Atividades em análise, aguardando parecer do docente. */
  pendentesAguardando: number
  /** Maior espera, em dias, entre as atividades em análise ou pendentes com envio; `null` sem nenhuma. */
  esperaMaxDias: number | null
  /** Data e hora ISO do evento mais recente do histórico de qualquer atividade; `null` sem nenhuma. */
  ultimaMovimentacaoEm: string | null
  /** Mesmos critérios em toda a tela: um aluno com mais de um risco aparece com todas as etiquetas. */
  riscos: FlagRisco[]
}

export type ItemDistribuicaoTipo = {
  tipoId: TipoAtividadeId
  nome: string
  /** Quantos orientandos têm crédito validado neste tipo (não a soma de registros). */
  quantidadeAlunos: number
}

export type RelatorioTurma = {
  totalAlunos: number
  /** 0 a 100. */
  percentualIntegralizado: number
  mediaCreditos: number
  pendentesAguardando: number
  /** Do tipo mais usado para o menos usado; só tipos com pelo menos um aluno. */
  distribuicaoPorTipo: ItemDistribuicaoTipo[]
  /** Mesma lista que alimenta as etiquetas de "Meus orientandos". */
  emRisco: ResumoOrientando[]
}

function calcularRiscos(progresso: Progresso, esperaMaxDias: number | null): FlagRisco[] {
  const riscos: FlagRisco[] = []
  if (progresso.creditosObtidos >= CREDITOS_EXIGIDOS && progresso.tiposDistintos < TIPOS_DISTINTOS_EXIGIDOS) {
    riscos.push("tipo-unico")
  }
  if (progresso.creditosObtidos === 0) {
    riscos.push("sem-validadas")
  }
  if (esperaMaxDias !== null && esperaMaxDias > DIAS_PENDENCIA_ANTIGA) {
    riscos.push("pendencia-antiga")
  }
  return riscos
}

/** Resumo de um orientando a partir só das atividades dele. */
export function resumirOrientando(discente: Discente, atividades: readonly Atividade[], agora: Date): ResumoOrientando {
  const progresso = calcularProgresso(atividades)

  const pendentesAguardando = atividades.filter((a) => a.status === "analise").length

  const esperas = atividades
    .filter((a): a is Atividade & { enviadaEm: string } => (a.status === "analise" || a.status === "pendente") && a.enviadaEm !== null)
    .map((a) => diasDeEspera(a.enviadaEm, agora))
  const esperaMaxDias = esperas.length > 0 ? Math.max(...esperas) : null

  const todosEventos = atividades.flatMap((a) => a.historico.map((h) => h.em))
  const ultimaMovimentacaoEm =
    todosEventos.length > 0 ? todosEventos.reduce((maisRecente, atual) => (atual > maisRecente ? atual : maisRecente)) : null

  return {
    discente,
    progresso,
    pendentesAguardando,
    esperaMaxDias,
    ultimaMovimentacaoEm,
    riscos: calcularRiscos(progresso, esperaMaxDias),
  }
}

/** Agrega resumos já calculados — nunca recalcula progresso a partir de atividades. */
export function agregarTurma(resumos: readonly ResumoOrientando[]): RelatorioTurma {
  const totalAlunos = resumos.length
  const integralizados = resumos.filter((r) => r.progresso.integralizado).length
  const percentualIntegralizado = totalAlunos > 0 ? (integralizados / totalAlunos) * 100 : 0
  const mediaCreditos =
    totalAlunos > 0 ? resumos.reduce((soma, r) => soma + r.progresso.creditosObtidos, 0) / totalAlunos : 0
  const pendentesAguardando = resumos.reduce((soma, r) => soma + r.pendentesAguardando, 0)

  const contagemPorTipo = new Map<TipoAtividadeId, number>()
  for (const r of resumos) {
    for (const item of r.progresso.porTipo) {
      if (item.creditos > 0) contagemPorTipo.set(item.tipoId, (contagemPorTipo.get(item.tipoId) ?? 0) + 1)
    }
  }
  const distribuicaoPorTipo: ItemDistribuicaoTipo[] = CATALOGO.filter((tipo) => contagemPorTipo.has(tipo.id))
    .map((tipo) => ({ tipoId: tipo.id, nome: tipo.nomeCurto, quantidadeAlunos: contagemPorTipo.get(tipo.id) ?? 0 }))
    .sort((a, b) => b.quantidadeAlunos - a.quantidadeAlunos)

  return {
    totalAlunos,
    percentualIntegralizado,
    mediaCreditos,
    pendentesAguardando,
    distribuicaoPorTipo,
    emRisco: resumos.filter((r) => r.riscos.length > 0),
  }
}
