// lib/ai/analise-comprovante.ts
//
// Ponto de encaixe para a análise de comprovante por IA, a ser integrada por
// outra equipe. Hoje devolve `{ disponivel: false }` e NÃO é chamada em lugar
// nenhum, nem aparece na interface.
//
// Adaptado ao modelo do ADENDO-DOMINIO.md: no lugar de `categoriaSugerida`, a
// sugestão é um tipo da Tabela 7. A carga horária detectada no certificado é
// só evidência de que o requisito do tipo foi cumprido (ex.: 180 h/semestre);
// ela não soma ao progresso, que vem sempre dos créditos do tipo.

import type { TipoAtividadeId } from "../catalogo"

export type AnaliseComprovante = {
  disponivel: boolean
  /** Carga lida no certificado; evidência do requisito, não soma ao progresso. */
  cargaHorariaDetectada?: number
  tituloDetectado?: string
  /** Tipo da Tabela 7 sugerido; `null` = não corresponde a nenhum tipo previsto. */
  tipoSugerido?: TipoAtividadeId | null
  /** Quantidade na unidade do tipo sugerido (semestres, eventos, palestras...). */
  quantidadeSugerida?: number
  /** De 0 a 1. */
  confianca?: number
  avisos?: string[]
}

export async function analisarComprovante(arquivo: File): Promise<AnaliseComprovante> {
  void arquivo
  return { disponivel: false }
}
