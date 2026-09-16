// lib/preferencias.ts
//
// Preferências pessoais (acessibilidade, aparência e notificações), na chave
// separada CHAVE_PREFERENCIAS (lib/storage.ts) — nunca a chave de estado da
// demonstração, para "Reiniciar demonstração" e "Limpar meus dados locais"
// não apagarem o que a pessoa escolheu. Lidas e aplicadas no <html> antes da
// primeira pintura pelo script inline (SCRIPT_PREFERENCIAS); a barra superior
// (BarraAcessibilidade) e a tela de Configurações leem e gravam a mesma
// fonte, via hooks/use-preferencias.ts.
//
// `versao` segue o mesmo padrão de lib/storage.ts (EstadoDemo): se a forma
// mudar, sobe a versão aqui e no teste de `ehPreferencias`, e
// scripts/verificar-migracao.mjs cobre o caso de uma versão anterior já
// salva. Ao contrário do EstadoDemo, aqui não há como fazer merge parcial de
// forma segura sem duplicar a validação de cada campo — uma versão
// incompatível volta aos padrões, o mesmo comportamento de primeira visita.

export type TamanhoTexto = "menor" | "padrao" | "maior"
export type Densidade = "confortavel" | "compacta"

export type Preferencias = {
  versao: 1
  altoContraste: boolean
  tamanhoTexto: TamanhoTexto
  reduzirAnimacoes: boolean
  densidade: Densidade
  notificarValidacao: boolean
  notificarRecusa: boolean
  notificarPrazos: boolean
  notificarMarcos: boolean
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  versao: 1,
  altoContraste: false,
  tamanhoTexto: "padrao",
  reduzirAnimacoes: false,
  // "Compacta" (linha de 44 px) é o padrão hoje em toda tabela e lista do
  // sistema (CLAUDE.md, seção "Densidade"); "confortável" é a opção nova.
  densidade: "compacta",
  notificarValidacao: true,
  notificarRecusa: true,
  notificarPrazos: true,
  notificarMarcos: true,
}

/** Classe no <html> que ativa o alto contraste. */
export const CLASSE_ALTO_CONTRASTE = "alto-contraste"

/** Classe no <html> que reduz animações, além do prefers-reduced-motion do sistema. */
export const CLASSE_REDUZIR_ANIMACOES = "reduzir-animacoes"

/** Atributo no <html> com o tamanho do texto; ausente no tamanho padrão. */
export const ATRIBUTO_TAMANHO_TEXTO = "data-tamanho-texto"

/** Atributo no <html> com a densidade; ausente na densidade compacta (padrão). */
export const ATRIBUTO_DENSIDADE = "data-densidade"

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

export const DENSIDADES: readonly { valor: Densidade; nome: string; descricao: string }[] = [
  { valor: "confortavel", nome: "Confortável", descricao: "Linhas mais altas, mais espaço entre os itens." },
  { valor: "compacta", nome: "Compacta", descricao: "Linhas no tamanho padrão do sistema, mais itens visíveis." },
]

type ChaveNotificacao = "notificarValidacao" | "notificarRecusa" | "notificarPrazos" | "notificarMarcos"

export const NOTIFICACOES: readonly { chave: ChaveNotificacao; nome: string }[] = [
  { chave: "notificarValidacao", nome: "Atividade validada" },
  { chave: "notificarRecusa", nome: "Atividade recusada" },
  { chave: "notificarPrazos", nome: "Prazos se aproximando" },
  { chave: "notificarMarcos", nome: "Marco de créditos atingido" },
]

export function ehPreferencias(valor: unknown): valor is Preferencias {
  if (typeof valor !== "object" || valor === null) return false
  const p = valor as Partial<Preferencias>
  return (
    p.versao === 1 &&
    typeof p.altoContraste === "boolean" &&
    TAMANHOS_TEXTO.some((t) => t.valor === p.tamanhoTexto) &&
    typeof p.reduzirAnimacoes === "boolean" &&
    DENSIDADES.some((d) => d.valor === p.densidade) &&
    typeof p.notificarValidacao === "boolean" &&
    typeof p.notificarRecusa === "boolean" &&
    typeof p.notificarPrazos === "boolean" &&
    typeof p.notificarMarcos === "boolean"
  )
}

/** Reflete as preferências no <html>. Idempotente. */
export function aplicarPreferencias(preferencias: Preferencias): void {
  const html = document.documentElement
  html.classList.toggle(CLASSE_ALTO_CONTRASTE, preferencias.altoContraste)
  html.classList.toggle(CLASSE_REDUZIR_ANIMACOES, preferencias.reduzirAnimacoes)
  if (preferencias.tamanhoTexto === "padrao") html.removeAttribute(ATRIBUTO_TAMANHO_TEXTO)
  else html.setAttribute(ATRIBUTO_TAMANHO_TEXTO, preferencias.tamanhoTexto)
  if (preferencias.densidade === "compacta") html.removeAttribute(ATRIBUTO_DENSIDADE)
  else html.setAttribute(ATRIBUTO_DENSIDADE, preferencias.densidade)
}

/** Frase para a região aria-live quando uma preferência muda. */
export function anuncioDePreferencia(anterior: Preferencias, nova: Preferencias): string {
  if (anterior.altoContraste !== nova.altoContraste) {
    return nova.altoContraste ? "Alto contraste ativado." : "Alto contraste desativado."
  }
  if (anterior.tamanhoTexto !== nova.tamanhoTexto) {
    const tamanho = TAMANHOS_TEXTO.find((t) => t.valor === nova.tamanhoTexto)
    return tamanho ? `Tamanho do texto: ${tamanho.nome}, ${tamanho.escala}.` : ""
  }
  if (anterior.reduzirAnimacoes !== nova.reduzirAnimacoes) {
    return nova.reduzirAnimacoes ? "Animações reduzidas ativadas." : "Animações reduzidas desativadas."
  }
  if (anterior.densidade !== nova.densidade) {
    const densidade = DENSIDADES.find((d) => d.valor === nova.densidade)
    return densidade ? `Densidade da lista: ${densidade.nome}.` : ""
  }
  for (const notificacao of NOTIFICACOES) {
    if (anterior[notificacao.chave] !== nova[notificacao.chave]) {
      return nova[notificacao.chave]
        ? `Notificação de ${notificacao.nome.toLowerCase()} ativada.`
        : `Notificação de ${notificacao.nome.toLowerCase()} desativada.`
    }
  }
  return ""
}
