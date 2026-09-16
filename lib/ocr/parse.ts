export type DadosOCR = {
  titulo: string
  horas: string
  categoria: string
  data: string
  termino: string
  instituicao: string
}

export function extrairDados(texto: string): DadosOCR {
  const linhas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const campo = (rotulo: string, exigeDoisPontos = false) => {
    const separador = exigeDoisPontos ? "\\s*:\\s*" : "(?:\\s*:\\s*|\\s+)"
    const valores = [...new Set(linhas.map((l) => l.match(new RegExp(`^(?:${rotulo})${separador}(.+)$`, "i"))?.[1]).filter(Boolean))]
    return valores.length === 1 ? valores[0]! : ""
  }
  const cargas = [...texto.matchAll(/(?:carga\s*hor[áa]ria(?:\s*total)?\s*(?:de|:)?\s*)(\d+(?:[.,]\d+)?)\s*(?:\([^\n)]*\)\s*)?(?:horas?|h)\b/gi)]
  const horas = [...new Set(cargas.map((m) => m[1].replace(",", ".")))]
  // Não confundir emissão do certificado com realização da atividade.
  function dataISO(valor: string) {
    const d = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    const iso = d ? `${d[3]}-${d[2]}-${d[1]}` : ""
    const instante = new Date(`${iso}T12:00:00Z`)
    return iso && Number.isFinite(instante.getTime()) && instante.toISOString().slice(0, 10) === iso ? iso : ""
  }
  const periodo = campo("período de (?:atuação|realização)|no período de|período").match(/^(\d{2}\/\d{2}\/\d{4})\s*(?:a|até|[-–])\s*(\d{2}\/\d{2}\/\d{4})(?:\s|$)/)
  let data = dataISO(periodo?.[1] ?? campo("data da atividade|data de realização|realizado em"))
  let termino = periodo ? dataISO(periodo[2]) : data
  if (!data || !termino || termino < data) { data = ""; termino = "" }
  const modalidadeLida = campo("modalidade")
  const modalidade = campo("categoria|tipo de atividade") || (/^(?:monitoria|iniciação científica|extensão|bolsista)\b/i.test(modalidadeLida) ? modalidadeLida : "")
  const disciplina = campo("disciplina")
  const instituicoes = [...new Set(linhas.filter((l) => /^(?:universidade|instituto federal|faculdade)\s/i.test(l)))]
  return {
    titulo: campo("nome da atividade|título|atividade|evento", true) || texto.match(/(?:participou\s+(?:do|da)|concluiu\s+(?:o|a)|realizou\s+(?:o|a))\s+(?:curso|atividade|evento|palestra)\s+[“"]([^”"\n]+)[”"]/i)?.[1] || (/^monitoria\b/i.test(modalidade) && disciplina ? `Monitoria — ${disciplina}` : ""),
    horas: horas.length === 1 ? horas[0] : "",
    categoria: modalidade,
    data,
    termino,
    instituicao: campo("instituição emissora|instituição|realização|emitido por") || (instituicoes.length === 1 ? instituicoes[0] : ""),
  }
}
