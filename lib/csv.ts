// lib/csv.ts
//
// Exportação de relatórios em CSV — gerado inteiramente no navegador (Blob +
// URL.createObjectURL), sem biblioteca nova. Separador ";" e BOM UTF-8: é o
// que faz o Excel em português abrir o arquivo direto, sem perguntar
// codificação nem delimitador.
//
// Usado só por components/relatorio/Relatorio.tsx e
// components/docente/RelatorioTurma.tsx, sempre a partir dos mesmos dados já
// calculados para a tela (progresso, ResumoOrientando) — este módulo só
// formata e baixa o arquivo, nunca recalcula nada do domínio.

const SEPARADOR = ";"
const BOM = "﻿"

/** Aspas duplas quando o campo contém ;, aspas ou quebra de linha (RFC 4180, com ; no lugar de ,). */
function escaparCampo(valor: string): string {
  if (/[";\n\r]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

/**
 * Monta o texto do CSV a partir do cabeçalho e das linhas já formatadas para
 * exibição. `linhaMetadados`, quando informada, entra como a primeira linha
 * do arquivo (período e tipos filtrados) — para o CSV se explicar sozinho
 * fora do sistema, sem depender da tela que o gerou.
 */
export function montarCSV(
  colunas: readonly string[],
  linhas: readonly (readonly (string | number)[])[],
  linhaMetadados?: string
): string {
  const linhaCabecalho = colunas.map((coluna) => escaparCampo(coluna)).join(SEPARADOR)
  const linhasDados = linhas.map((linha) => linha.map((campo) => escaparCampo(String(campo))).join(SEPARADOR))
  const todasAsLinhas =
    linhaMetadados !== undefined
      ? [escaparCampo(linhaMetadados), linhaCabecalho, ...linhasDados]
      : [linhaCabecalho, ...linhasDados]
  return BOM + todasAsLinhas.join("\r\n")
}

/** Aciona o download do CSV como arquivo local, sem passar por servidor. */
export function baixarCSV(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
