// lib/formatacao.ts
//
// Formatação em pt-BR dos valores do domínio para a interface.

import { UNIDADES, obterTipo, type TipoAtividadeId } from "./catalogo"

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

/** 60 → "60 h". */
export function formatarHoras(horas: number): string {
  return `${numero.format(horas)} h`
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
