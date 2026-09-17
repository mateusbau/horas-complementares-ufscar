import type { Discente, Docente } from "./types"

function removerAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "")
}

export function emailInstitucionalDiscente(discente: Pick<Discente, "ra">): string {
  return `${discente.ra}@estudante.ufscar.br`
}

export function emailInstitucionalDocente(docente: Pick<Docente, "nome">): string {
  const semTitulo = docente.nome.replace(/^Prof\.ª?\s+/i, "")
  const usuario = removerAcentos(semTitulo).toLowerCase().trim().split(/\s+/).join(".")
  return `${usuario}@ufscar.br`
}

export function criarLinkDeEmail(destinatario: string, assunto: string, mensagem: string): string {
  return `mailto:${encodeURIComponent(destinatario)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`
}
