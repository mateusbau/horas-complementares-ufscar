// lib/formatacao.ts
//
// Formatação em pt-BR dos valores do domínio para a interface.

import { creditosPorQuantidade, diasDeEspera, HORAS_POR_CREDITO } from "./calculos"
import { medidoEmHoras, UNIDADES, obterTipo, type TipoAtividadeId } from "./catalogo"

const numero = new Intl.NumberFormat("pt-BR")
const percentual = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 })
const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
const diaMes = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" })

export function formatarNumero(valor: number): string {
  return numero.format(valor)
}

/** 66.666… → "66,7%". */
export function formatarPercentual(valor: number): string {
  return percentual.format(valor / 100)
}

/** 1 → "1 hora"; 60 → "60 horas". Por extenso, sem abreviação. */
export function formatarHoras(horas: number): string {
  return `${numero.format(horas)} ${horas === 1 ? "hora" : "horas"}`
}

/** 1 → "1 crédito"; 4 → "4 créditos". */
export function formatarCreditos(creditos: number): string {
  return `${numero.format(creditos)} ${creditos === 1 ? "crédito" : "créditos"}`
}

/** Na unidade do tipo: "1 semestre", "2 palestras". */
export function formatarUnidade(tipoId: TipoAtividadeId, quantidade: number): string {
  const unidade = UNIDADES[obterTipo(tipoId).unidade]
  return `${numero.format(quantidade)} ${quantidade === 1 ? unidade.singular : unidade.plural}`
}

/** Frase completa: "1 semestre de monitoria", "2 participações em congressos ou simpósios". */
export function formatarQuantidade(tipoId: TipoAtividadeId, quantidade: number): string {
  const rotulo = obterTipo(tipoId).rotuloQuantidade
  return `${numero.format(quantidade)} ${quantidade === 1 ? rotulo.singular : rotulo.plural}`
}

/**
 * Requisito do tipo como citação da Tabela 7: "180 h/semestre valem 3 créditos",
 * "1 trabalho vale 2 créditos". É o único lugar em que a hora aparece como
 * requisito (régua do crédito, CLAUDE.md); a abreviação "h" é da tabela.
 */
export function formatarRequisito(tipoId: TipoAtividadeId): string {
  const tipo = obterTipo(tipoId)
  const verbo = tipo.requisito.startsWith("1 ") ? "vale" : "valem"
  return `${tipo.requisito} ${verbo} ${formatarCreditos(tipo.creditos)}`
}

/** Total secundário, sempre rotulado sem ambiguidade: "N de M horas contabilizadas". */
export function formatarHorasContabilizadas(obtidas: number, exigidas: number): string {
  return `${numero.format(obtidas)} de ${numero.format(exigidas)} horas contabilizadas`
}

/**
 * Premissa do fator crédito → hora, citando a fonte, para todo lugar onde o
 * total em horas aparecer (painel, relatório). O número vem de
 * HORAS_POR_CREDITO, nunca escrito aqui: o verificador reprova o valor da
 * constante fora de lib/calculos.ts.
 */
export function formatarPremissaCredito(): string {
  return `Horas contabilizadas = créditos × ${formatarHoras(HORAS_POR_CREDITO)}, pela definição de crédito da matriz curricular do Projeto Pedagógico (Tabela 4).`
}

/**
 * Explica, em linguagem comum e a partir do próprio tipo, a regra da seção
 * 3.5.4 do PPC para os tipos medidos em horas: a carga da Tabela 7 é o máximo
 * reconhecido por semestre, e menos horas valem proporcionalmente, sempre
 * arredondando para baixo. O exemplo (metade do máximo) é calculado, nunca
 * escrito à mão, para não fixar um número errado se a tabela mudar.
 */
export function formatarExplicacaoRequisito(tipoId: TipoAtividadeId): string {
  const tipo = obterTipo(tipoId)
  if (!medidoEmHoras(tipo)) return formatarRequisito(tipoId)
  const metade = Math.round(tipo.cargaMaxima / 2)
  const creditosNaMetade = creditosPorQuantidade(tipo, metade)
  return (
    `Este tipo reconhece até ${formatarHoras(tipo.cargaMaxima)} por semestre, que valem ` +
    `${formatarCreditos(tipo.creditos)}. Menos horas valem proporcionalmente, sempre arredondando ` +
    `para baixo — por exemplo, ${formatarHoras(metade)} valem ${formatarCreditos(creditosNaMetade)}.`
  )
}

/** Aceita data (AAAA-MM-DD, lida como data local) ou data e hora ISO. */
function paraData(valor: string): Date {
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (soData) return new Date(Number(soData[1]), Number(soData[2]) - 1, Number(soData[3]))
  return new Date(valor)
}

/** "20/08/2025". */
export function formatarData(valor: string): string {
  return data.format(paraData(valor))
}

/** "20/08". */
export function formatarDiaMes(valor: string): string {
  return diaMes.format(paraData(valor))
}

/** "27/08/2025, 14h32". */
export function formatarDataHora(valor: string): string {
  const d = paraData(valor)
  const minutos = String(d.getMinutes()).padStart(2, "0")
  return `${data.format(d)}, ${d.getHours()}h${minutos}`
}

/** Tempo na fila: "menos de 1 dia", "1 dia", "9 dias". */
export function formatarEspera(dias: number): string {
  if (dias < 1) return "menos de 1 dia"
  return dias === 1 ? "1 dia" : `${numero.format(dias)} dias`
}

/** Indicador de autosave: "Rascunho salvo agora", "Rascunho salvo há 2 min". */
export function formatarRascunhoSalvo(desde: string, agora: Date): string {
  const minutos = Math.floor((agora.getTime() - new Date(desde).getTime()) / 60000)
  if (minutos < 1) return "Rascunho salvo agora"
  if (minutos < 60) return `Rascunho salvo há ${numero.format(minutos)} min`
  const horas = Math.floor(minutos / 60)
  return `Rascunho salvo há ${numero.format(horas)} ${horas === 1 ? "hora" : "horas"}`
}

/** "hoje", "há 1 dia", "há 9 dias" — mesmo cálculo de dias inteiros de diasDeEspera. */
export function formatarRelativo(em: string, agora: Date): string {
  const dias = diasDeEspera(em, agora)
  if (dias === 0) return "hoje"
  return dias === 1 ? "há 1 dia" : `há ${numero.format(dias)} dias`
}

/** "certificado-git-secot.pdf · 1,2 MB" (só o tamanho, sem o nome). */
export function formatarTamanhoArquivo(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 0.1) return `${numero.format(Math.round(mb * 10) / 10)} MB`
  return `${numero.format(Math.max(1, Math.round(bytes / 1024)))} KB`
}
