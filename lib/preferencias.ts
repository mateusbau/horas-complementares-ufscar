// lib/preferencias.ts
//
// Preferências da barra de acessibilidade: o que existe, como se aplicam ao
// <html> e como são anunciadas. A leitura e a gravação ficam em lib/storage.ts.
// O CSS correspondente está em app/globals.css.

export type TamanhoTexto = "menor" | "padrao" | "maior"

export type Preferencias = {
  altoContraste: boolean
  tamanhoTexto: TamanhoTexto
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  altoContraste: false,
  tamanhoTexto: "padrao",
}

/** Classe no <html> que ativa o alto contraste. */
export const CLASSE_ALTO_CONTRASTE = "alto-contraste"

/** Atributo no <html> com o tamanho do texto; ausente no tamanho padrão. */
export const ATRIBUTO_TAMANHO_TEXTO = "data-tamanho-texto"

export const TAMANHOS_TEXTO: readonly {
  valor: TamanhoTexto
  simbolo: string
  nome: string
  escala: string
}[] = [
  { valor: "menor", simbolo: "A−", nome: "texto menor", escala: "87,5%" },
  { valor: "padrao", simbolo: "A", nome: "texto padrão", escala: "100%" },
  { valor: "maior", simbolo: "A+", nome: "texto maior", escala: "125%" },
]

export function ehPreferencias(valor: unknown): valor is Preferencias {
  if (typeof valor !== "object" || valor === null) return false
  const p = valor as Partial<Preferencias>
  return (
    typeof p.altoContraste === "boolean" &&
    TAMANHOS_TEXTO.some((t) => t.valor === p.tamanhoTexto)
  )
}

/** Reflete as preferências no <html>. Idempotente. */
export function aplicarPreferencias(preferencias: Preferencias): void {
  const html = document.documentElement
  html.classList.toggle(CLASSE_ALTO_CONTRASTE, preferencias.altoContraste)
  if (preferencias.tamanhoTexto === "padrao") html.removeAttribute(ATRIBUTO_TAMANHO_TEXTO)
  else html.setAttribute(ATRIBUTO_TAMANHO_TEXTO, preferencias.tamanhoTexto)
}

/** Frase para a região aria-live quando uma preferência muda. */
export function anuncioDePreferencia(anterior: Preferencias, nova: Preferencias): string {
  if (anterior.altoContraste !== nova.altoContraste) {
    return nova.altoContraste ? "Alto contraste ativado." : "Alto contraste desativado."
  }
  const tamanho = TAMANHOS_TEXTO.find((t) => t.valor === nova.tamanhoTexto)
  return tamanho ? `Tamanho do texto: ${tamanho.nome}, ${tamanho.escala}.` : ""
}
