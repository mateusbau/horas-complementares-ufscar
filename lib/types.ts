// lib/types.ts
//
// Tipos do domínio. O catálogo de tipos de atividade (Tabela 7) vive em
// lib/catalogo.ts; as regras de cálculo, em lib/calculos.ts.

import type { GrupoId, TipoAtividadeId } from "./catalogo"

export type { GrupoId, TipoAtividadeId } from "./catalogo"

// --- Pessoas -------------------------------------------------------------------

/** Perfil de acesso: define a navegação (sidebar) após a entrada. */
export type Perfil = "discente" | "docente"

export type Discente = {
  id: string
  nome: string
  ra: string
  curso: string
  /** Ex.: "3º ano". */
  ano: string
}

export type Docente = {
  id: string
  nome: string
  departamento: string
  iniciais: string
}

// --- Atividade -----------------------------------------------------------------

/**
 * `pendente` cobre dois momentos com o mesmo significado para o aluno — "a
 * bola está com ele": a atividade ainda não enviada e a devolvida com pendência.
 */
export type StatusAtividade = "validada" | "analise" | "pendente" | "recusada"

export type Periodo = {
  /** Data ISO (AAAA-MM-DD). */
  inicio: string
  /** Data ISO (AAAA-MM-DD). */
  termino: string
}

/** Metadados do arquivo; o conteúdo não é guardado no navegador. */
export type Comprovante = {
  nome: string
  tamanhoBytes: number
  tipoMime: string
}

/** Confirmações exigidas no cadastro pelas regras (*) e (**) da Tabela 7. */
export type Confirmacoes = {
  /** Regra (*): a atividade não foi validada como outro componente curricular. */
  semDuplaContagem: boolean
  /** Regra (**): atuação durante todo o semestre letivo (Monitoria). */
  semestreCompleto: boolean
}

export type DecisaoParecer = "aprovar" | "devolver" | "recusar"

export type Parecer = {
  decisao: DecisaoParecer
  /** Obrigatório ao devolver ou recusar. */
  comentario: string
  /** Presente quando o docente reclassificou o tipo; `null` = não previsto na Tabela 7. */
  reclassificacao?: {
    deTipoId: TipoAtividadeId | null
    paraTipoId: TipoAtividadeId | null
    deQuantidade: number | null
    paraQuantidade: number | null
    justificativa: string
  }
  /** Regra (**): confirmação do docente de atuação no semestre completo. */
  semestreCompletoConfirmado?: boolean
  docenteId: string
  /** Data e hora ISO. */
  em: string
}

/** O que o docente envia; `docenteId` e `em` são preenchidos pelo storage. */
export type NovoParecer = {
  decisao: DecisaoParecer
  comentario: string
  /** Informe só quando reclassificar; `null` = não previsto na Tabela 7. */
  paraTipoId?: TipoAtividadeId | null
  /** Quantidade na unidade do novo tipo; se omitida, mantém a declarada. */
  paraQuantidade?: number
  /** Obrigatória quando o tipo ou a quantidade mudam. */
  justificativaReclassificacao?: string
  semestreCompletoConfirmado?: boolean
}

export type TipoEvento =
  | "enviada"
  | "reenviada"
  | "analisada"
  | "validada"
  | "devolvida"
  | "recusada"
  | "reclassificada"

export type EventoHistorico = {
  tipo: TipoEvento
  /** Data e hora ISO. */
  em: string
}

export type Atividade = {
  id: string
  discenteId: string
  titulo: string
  /** `null` = o aluno declarou algo que não corresponde a nenhum tipo da Tabela 7. */
  tipoId: TipoAtividadeId | null
  /** Na unidade do tipo: horas do comprovante (tipos em horas, um registro por semestre), eventos, palestras...; `null` sem tipo. */
  quantidade: number | null
  /** Opcional na tela 04. */
  periodo: Periodo | null
  observacoes: string
  comprovante: Comprovante | null
  confirmacoes: Confirmacoes
  status: StatusAtividade
  /** Data e hora ISO. */
  criadaEm: string
  /** Data e hora ISO do envio mais recente; `null` se nunca foi enviada. */
  enviadaEm: string | null
  historico: EventoHistorico[]
  /** Do mais antigo para o mais recente. */
  pareceres: Parecer[]
}

/** Dados do formulário de envio (tela 04). */
export type NovaAtividade = Pick<
  Atividade,
  "titulo" | "tipoId" | "quantidade" | "periodo" | "observacoes" | "comprovante" | "confirmacoes"
>

// --- Validações do cadastro ------------------------------------------------------

export type RegraCadastro =
  | "tipo-nao-previsto"
  | "dupla-contagem"
  | "semestre-completo"
  | "carga-acima-do-maximo"

export type AvisoCadastro = {
  regra: RegraCadastro
  /** Texto a exibir; nas regras (*) e (**), a nota literal da Tabela 7. */
  mensagem: string
  /** Se verdadeiro, o envio só é permitido depois da confirmação explícita. */
  exigeConfirmacao: boolean
  confirmado: boolean
}

// --- Progresso -----------------------------------------------------------------

export type CreditosPorTipo = {
  tipoId: TipoAtividadeId
  /** Soma das quantidades validadas deste tipo. */
  quantidade: number
  creditos: number
  horas: number
}

export type CreditosPorGrupo = {
  grupoId: GrupoId
  creditos: number
  horas: number
}

export type Progresso = {
  creditosObtidos: number
  creditosExigidos: number
  horasObtidas: number
  horasExigidas: number
  /** Nunca negativo. */
  creditosFaltantes: number
  horasFaltantes: number
  /** 0 a 100, sem arredondamento; limitado a 100. */
  percentual: number
  /** Tipos da Tabela 7 com crédito validado. */
  tiposDistintos: number
  /** PPC, 3.5.4: pelo menos dois tipos diferentes. */
  tiposExigidos: number
  /** Créditos exigidos E tipos distintos exigidos. */
  integralizado: boolean
  porTipo: CreditosPorTipo[]
  /** Organização visual: não há mínimo nem teto por grupo. */
  porGrupo: CreditosPorGrupo[]
}

/** Uma linha do bloco "o que fecha o que falta" (painel e simulador). */
export type OpcaoFechamento = {
  tipoId: TipoAtividadeId
  /** Quantidade a registrar, na unidade do tipo (horas, eventos, palestras...). */
  quantidade: number
  /** Tipos em horas: em quantos semestres (registros) as horas se distribuem. Demais: null. */
  semestres: number | null
  creditos: number
  horas: number
  /** Gera mais créditos do que faltam. */
  excede: boolean
  /** Com esta opção, o aluno passa a ter os dois tipos diferentes exigidos. */
  atendeTiposDistintos: boolean
}

// --- Fila do docente -------------------------------------------------------------

export type ItemFila = {
  atividadeId: string
  discente: Pick<Discente, "id" | "nome" | "ra">
  titulo: string
  tipoId: TipoAtividadeId | null
  quantidade: number | null
  /** Créditos desta atividade isolada, pelo tipo declarado. */
  creditos: number
  horas: number
  /** Data e hora ISO. */
  enviadaEm: string
  /** Dias inteiros desde o envio. */
  esperaDias: number
}

// --- Estado da demonstração -------------------------------------------------------

export type EstadoDemo = {
  /** 2: quantidade em horas nos tipos "h/semestre" (leitura da seção 3.5.4 do PPC). */
  versao: 2
  /** Quem está usando o sistema na demonstração. */
  discenteAtualId: string
  docenteAtualId: string
  discentes: Discente[]
  docentes: Docente[]
  atividades: Atividade[]
}
