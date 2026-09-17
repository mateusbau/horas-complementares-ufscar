// lib/relatorio-filtros.ts
//
// Filtros de período e tipo de atividade dos dois relatórios (discente e
// turma). Puro: só filtra a lista de atividades ANTES de calcularProgresso/
// resumirOrientando — nenhuma das duas é tocada, então créditos e percentual
// continuam saindo do mesmo caminho de sempre, só que sobre um subconjunto.
// Datas no formato AAAA-MM-DD (o que os <input type="date"> já devolvem),
// comparáveis por ordem lexicográfica direta.

import { CATALOGO, type TipoAtividadeId } from "./catalogo"
import type { Atividade } from "./types"

/**
 * Data que os dois relatórios usam para uma atividade validada: a do
 * parecer que aprovou (é o evento que o relatório documenta), com
 * enviadaEm/criadaEm como fallback só para o TypeScript — uma atividade com
 * status "validada" sempre tem um parecer de aprovação. Atividade sem
 * nenhum parecer de aprovação (não validada) devolve null e fica fora do
 * filtro de período, porque calcularProgresso já a descarta de outro jeito.
 */
export function dataDeValidacao(atividade: Atividade): string | null {
  const parecerAprovacao = [...atividade.pareceres].reverse().find((p) => p.decisao === "aprovar")
  return parecerAprovacao?.em ?? (atividade.status === "validada" ? atividade.enviadaEm ?? atividade.criadaEm : null)
}

export type FiltrosRelatorio = {
  /** "" = sem limite inferior. */
  dataInicial: string
  /** "" = sem limite superior. */
  dataFinal: string
  /** Todos os tipos da Tabela 7 marcados, por padrão. */
  tiposIncluidos: ReadonlySet<TipoAtividadeId>
}

export function filtrosPadrao(): FiltrosRelatorio {
  return { dataInicial: "", dataFinal: "", tiposIncluidos: new Set(CATALOGO.map((t) => t.id)) }
}

/** Nenhum filtro de fato mudou o resultado — período aberto e todos os tipos marcados. */
export function filtrosSaoPadrao(filtros: FiltrosRelatorio): boolean {
  return filtros.dataInicial === "" && filtros.dataFinal === "" && filtros.tiposIncluidos.size === CATALOGO.length
}

/** Data final antes da inicial — a única combinação inválida (as duas vazias, ou só uma preenchida, são válidas). */
export function erroPeriodo(filtros: FiltrosRelatorio): string | null {
  if (filtros.dataInicial && filtros.dataFinal && filtros.dataFinal < filtros.dataInicial) {
    return "A data final não pode ser anterior à data inicial."
  }
  return null
}

/**
 * Filtra por tipo e pelo período de `dataDoEvento` (a data que o relatório já
 * exibe para cada atividade — no discente, o parecer de aprovação). Atividade
 * sem tipo previsto (tipoId null) não corresponde a nenhum checkbox e sai do
 * subconjunto — não há controle de filtro para ela na tela, e ela já vale 0
 * crédito em calcularProgresso.
 */
export function filtrarAtividades(
  atividades: readonly Atividade[],
  filtros: FiltrosRelatorio,
  dataDoEvento: (atividade: Atividade) => string | null
): Atividade[] {
  if (erroPeriodo(filtros)) return []
  return atividades.filter((a) => {
    if (a.tipoId === null || !filtros.tiposIncluidos.has(a.tipoId)) return false
    const data = dataDoEvento(a)
    if (data === null) return true
    const dataAAAAMMDD = data.slice(0, 10)
    if (filtros.dataInicial && dataAAAAMMDD < filtros.dataInicial) return false
    if (filtros.dataFinal && dataAAAAMMDD > filtros.dataFinal) return false
    return true
  })
}

/**
 * "validado de 01/03/2026 a 30/06/2026", "validado a partir de 01/03/2026",
 * "validado até 30/06/2026" ou null (sem limite). O critério é sempre a data
 * de validação (dataDeValidacao), nunca a data de realização da atividade —
 * por isso o texto nomeia "validado", não só "período", em todo lugar onde
 * aparece (rótulos dos campos, cabeçalho do relatório, CSV).
 */
function descreverPeriodo(filtros: FiltrosRelatorio): string | null {
  const { dataInicial, dataFinal } = filtros
  if (!dataInicial && !dataFinal) return null
  const formatarISO = (v: string) => `${v.slice(8, 10)}/${v.slice(5, 7)}/${v.slice(0, 4)}`
  if (dataInicial && dataFinal) return `validado de ${formatarISO(dataInicial)} a ${formatarISO(dataFinal)}`
  if (dataInicial) return `validado a partir de ${formatarISO(dataInicial)}`
  return `validado até ${formatarISO(dataFinal)}`
}

/**
 * Frase para o topo do relatório e para a linha de metadados do CSV — o
 * documento exportado precisa se explicar sozinho, fora do sistema. Sempre
 * diz algo, mesmo sem filtro nenhum aplicado.
 */
export function descreverFiltros(filtros: FiltrosRelatorio): string {
  if (filtrosSaoPadrao(filtros)) {
    return "Nenhum filtro aplicado: todas as atividades validadas, qualquer data de validação, todos os tipos da Tabela 7."
  }
  const periodo = descreverPeriodo(filtros)
  const tipos =
    filtros.tiposIncluidos.size === CATALOGO.length
      ? "todos os tipos"
      : CATALOGO.filter((t) => filtros.tiposIncluidos.has(t.id))
          .map((t) => t.nomeCurto)
          .join(", ")
  return `Filtros aplicados — ${periodo ?? "qualquer data de validação"}; tipos: ${tipos}.`
}
