// lib/catalogo.ts
//
// Tabela 7 — Atividades Complementares do Projeto Pedagógico do BCDIA (UFSCar
// Sorocaba), transcrita como dado. Os campos `nome`, `requisito` e
// `comprovante` reproduzem literalmente as colunas da tabela; `vedadaDuplaContagem`
// é o asterisco (*) e `exigeSemestreCompleto` o duplo asterisco (**).
//
// Campos acrescentados para a interface, sem regra nova:
// - `quantidadePorBloco`: quantas unidades formam um bloco de `creditos`
//   (1 em todos os tipos, 2 em Palestra: "2 palestras = 1 crédito");
// - `nomeCurto`, `pergunta` e `rotuloQuantidade`: textos de apoio para listas,
//   formulário e o bloco "o que fecha o que falta".

export type GrupoId =
  | "ensino-monitoria"
  | "pesquisa-publicacoes"
  | "extensao-eventos"
  | "representacao"

export type Unidade =
  | "semestre"
  | "evento"
  | "dia"
  | "palestra"
  | "trabalho"
  | "semestre-completo"

type TipoAtividadeBase = {
  id: string
  nome: string
  nomeCurto: string
  grupo: GrupoId
  unidade: Unidade
  /** Texto literal da coluna "Carga Horária": requisito para obter os créditos. */
  requisito: string
  /** Créditos obtidos a cada `quantidadePorBloco` unidades. */
  creditos: number
  quantidadePorBloco: number
  /** Texto literal da coluna "Tipo de comprovante". */
  comprovante: string
  /** Asterisco (*) da tabela: ver NOTA_DUPLA_CONTAGEM. */
  vedadaDuplaContagem: boolean
  /** Duplo asterisco (**) da tabela, só Monitoria: ver NOTA_SEMESTRE_COMPLETO. */
  exigeSemestreCompleto: boolean
  /** Rótulo do campo de quantidade no formulário. */
  pergunta: string
  /** "1 semestre de monitoria", "2 semestres de monitoria". */
  rotuloQuantidade: { singular: string; plural: string }
}

const TABELA_7 = [
  {
    id: "monitoria",
    nome: "Monitoria (com ou sem bolsa)",
    nomeCurto: "Monitoria",
    grupo: "ensino-monitoria",
    unidade: "semestre",
    requisito: "180 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Relatório ou documento da PROGRAD ou declaração do docente",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: true,
    pergunta: "Quantos semestres de monitoria?",
    rotuloQuantidade: { singular: "semestre de monitoria", plural: "semestres de monitoria" },
  },
  {
    id: "bolsista-atividade",
    nome: "Bolsista Atividade",
    nomeCurto: "Bolsista Atividade",
    grupo: "ensino-monitoria",
    unidade: "semestre",
    requisito: "120 h/semestre",
    creditos: 2,
    quantidadePorBloco: 1,
    comprovante: "Relatório ou documento da PROGRAD",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres como bolsista atividade?",
    rotuloQuantidade: {
      singular: "semestre como bolsista atividade",
      plural: "semestres como bolsista atividade",
    },
  },
  {
    id: "bolsista-treinamento",
    nome: "Bolsista Treinamento",
    nomeCurto: "Bolsista Treinamento",
    grupo: "ensino-monitoria",
    unidade: "semestre",
    requisito: "180 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Relatório ou documento da PROGRAD",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres como bolsista treinamento?",
    rotuloQuantidade: {
      singular: "semestre como bolsista treinamento",
      plural: "semestres como bolsista treinamento",
    },
  },
  {
    id: "extensao",
    nome: "Atividades de Extensão (com ou sem bolsa)",
    nomeCurto: "Extensão",
    grupo: "extensao-eventos",
    unidade: "semestre",
    requisito: "180 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Relatório ou documento da PROEX/certificado",
    vedadaDuplaContagem: true,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres de atividade de extensão?",
    rotuloQuantidade: {
      singular: "semestre em atividade de extensão",
      plural: "semestres em atividades de extensão",
    },
  },
  {
    id: "iniciacao-cientifica",
    nome: "Iniciação Científica (com ou sem bolsa)",
    nomeCurto: "Iniciação Científica",
    grupo: "pesquisa-publicacoes",
    unidade: "semestre",
    requisito: "180 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Relatório e/ou documento da Comissão de IC ou declaração do docente",
    vedadaDuplaContagem: true,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres de iniciação científica?",
    rotuloQuantidade: {
      singular: "semestre de iniciação científica",
      plural: "semestres de iniciação científica",
    },
  },
  {
    id: "participacao-projeto",
    nome: "Participação em projeto (com ou sem bolsa)",
    nomeCurto: "Participação em projeto",
    grupo: "pesquisa-publicacoes",
    unidade: "semestre",
    requisito: "180 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Relatório e/ou declaração do docente responsável",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres de participação no projeto?",
    rotuloQuantidade: {
      singular: "semestre de participação em projeto",
      plural: "semestres de participação em projeto",
    },
  },
  {
    id: "palestra",
    nome: "Palestra não associada a eventos",
    nomeCurto: "Palestra",
    grupo: "extensao-eventos",
    unidade: "palestra",
    requisito: "2 palestras",
    creditos: 1,
    quantidadePorBloco: 2,
    comprovante: "Declaração do organizador",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantas palestras?",
    rotuloQuantidade: {
      singular: "palestra não associada a eventos",
      plural: "palestras não associadas a eventos",
    },
  },
  {
    id: "congresso-simposio",
    nome: "Congressos e Simpósios",
    nomeCurto: "Congresso ou simpósio",
    grupo: "extensao-eventos",
    unidade: "evento",
    requisito: "1 evento",
    creditos: 1,
    quantidadePorBloco: 1,
    comprovante: "Certificado de participação",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos eventos?",
    rotuloQuantidade: {
      singular: "participação em congresso ou simpósio",
      plural: "participações em congressos ou simpósios",
    },
  },
  {
    id: "feira",
    nome: "Feiras",
    nomeCurto: "Feira",
    grupo: "extensao-eventos",
    unidade: "evento",
    requisito: "1 evento",
    creditos: 1,
    quantidadePorBloco: 1,
    comprovante: "Certificado de participação",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantas feiras?",
    rotuloQuantidade: { singular: "participação em feira", plural: "participações em feiras" },
  },
  {
    id: "organizacao-evento",
    nome: "Organização de eventos",
    nomeCurto: "Organização de evento",
    grupo: "extensao-eventos",
    unidade: "dia",
    requisito: "1 dia de evento",
    creditos: 1,
    quantidadePorBloco: 1,
    comprovante: "Declaração emitida por órgão superior ou coordenador do evento",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos dias de evento?",
    rotuloQuantidade: {
      singular: "dia de organização de evento",
      plural: "dias de organização de evento",
    },
  },
  {
    id: "artigo-completo",
    nome: "Publicação de artigo científico completo",
    nomeCurto: "Artigo completo",
    grupo: "pesquisa-publicacoes",
    unidade: "trabalho",
    requisito: "1 trabalho",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Cópia do trabalho com comprovação de publicação",
    vedadaDuplaContagem: true,
    exigeSemestreCompleto: false,
    pergunta: "Quantos artigos completos publicados?",
    rotuloQuantidade: {
      singular: "publicação de artigo científico completo",
      plural: "publicações de artigo científico completo",
    },
  },
  {
    id: "resumo-poster",
    nome: "Publicação de trabalho científico (resumo ou pôster)",
    nomeCurto: "Resumo ou pôster",
    grupo: "pesquisa-publicacoes",
    unidade: "trabalho",
    requisito: "1 trabalho",
    creditos: 2,
    quantidadePorBloco: 1,
    comprovante: "Cópia do trabalho com comprovação de publicação",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos resumos ou pôsteres publicados?",
    rotuloQuantidade: {
      singular: "publicação de resumo ou pôster",
      plural: "publicações de resumo ou pôster",
    },
  },
  {
    id: "competicao",
    nome: "Participação em competições na área (ex.: Maratona de Programação)",
    nomeCurto: "Competição",
    grupo: "extensao-eventos",
    unidade: "dia",
    requisito: "1 dia",
    creditos: 1,
    quantidadePorBloco: 1,
    comprovante: "Certificado de Participação",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos dias de competição?",
    rotuloQuantidade: { singular: "dia de competição na área", plural: "dias de competição na área" },
  },
  {
    id: "estagio-empresa-junior",
    nome: "Estágios em empresa júnior/incubadora, entre outras (não obrigatório)",
    nomeCurto: "Estágio em empresa júnior",
    grupo: "extensao-eventos",
    unidade: "semestre",
    requisito: "180 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante:
      "Declaração emitida por órgão superior. Contrato da empresa que recebeu o serviço",
    vedadaDuplaContagem: true,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres de estágio?",
    rotuloQuantidade: {
      singular: "semestre de estágio em empresa júnior ou incubadora",
      plural: "semestres de estágio em empresa júnior ou incubadora",
    },
  },
  {
    id: "suporte-ti",
    nome: "Suporte em TI a Departamentos (ex.: Cursos da Universidade, Laboratórios de Ensino ou Pesquisa)",
    nomeCurto: "Suporte em TI",
    grupo: "ensino-monitoria",
    unidade: "semestre",
    requisito: "180 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Declaração emitida pela chefia de departamento ou coordenação do curso",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres de suporte em TI?",
    rotuloQuantidade: {
      singular: "semestre de suporte em TI a departamentos",
      plural: "semestres de suporte em TI a departamentos",
    },
  },
  {
    id: "apoio-tecnico",
    nome: "Apoio Técnico: desenvolvimento de software, material didático ou sites",
    nomeCurto: "Apoio técnico",
    grupo: "ensino-monitoria",
    unidade: "semestre",
    requisito: "180 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante:
      "Declaração emitida por um docente responsável do departamento de computação ou contrato da empresa que recebeu o serviço",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres de apoio técnico?",
    rotuloQuantidade: { singular: "semestre de apoio técnico", plural: "semestres de apoio técnico" },
  },
  {
    id: "presidencia-ca-atletica",
    nome: "Cargo de presidência em Centro Acadêmico ou Atlética",
    nomeCurto: "Presidência de CA ou Atlética",
    grupo: "representacao",
    unidade: "semestre-completo",
    requisito: "1 semestre completo",
    creditos: 1,
    quantidadePorBloco: 1,
    comprovante: "Registro de nomeação em Ata oficial",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantos semestres completos na presidência?",
    rotuloQuantidade: {
      singular: "semestre completo na presidência de Centro Acadêmico ou Atlética",
      plural: "semestres completos na presidência de Centro Acadêmico ou Atlética",
    },
  },
  {
    id: "aciepes",
    nome: "ACIEPES",
    nomeCurto: "ACIEPES",
    grupo: "ensino-monitoria",
    unidade: "semestre",
    requisito: "60 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Ser aprovado na disciplina",
    vedadaDuplaContagem: true,
    exigeSemestreCompleto: false,
    pergunta: "Quantas ACIEPES concluídas com aprovação?",
    rotuloQuantidade: {
      singular: "ACIEPES concluída com aprovação",
      plural: "ACIEPES concluídas com aprovação",
    },
  },
  {
    id: "disciplina-eletiva",
    nome: "Disciplina Eletiva",
    nomeCurto: "Disciplina eletiva",
    grupo: "ensino-monitoria",
    unidade: "semestre",
    requisito: "60 h/semestre",
    creditos: 3,
    quantidadePorBloco: 1,
    comprovante: "Ser aprovado na disciplina",
    vedadaDuplaContagem: false,
    exigeSemestreCompleto: false,
    pergunta: "Quantas disciplinas eletivas concluídas com aprovação?",
    rotuloQuantidade: {
      singular: "disciplina eletiva concluída com aprovação",
      plural: "disciplinas eletivas concluídas com aprovação",
    },
  },
] as const satisfies readonly TipoAtividadeBase[]

export type TipoAtividadeId = (typeof TABELA_7)[number]["id"]

export type TipoAtividade = Omit<TipoAtividadeBase, "id"> & { id: TipoAtividadeId }

/** Os 19 tipos, na ordem da Tabela 7. */
export const CATALOGO: readonly TipoAtividade[] = TABELA_7

const POR_ID = new Map<TipoAtividadeId, TipoAtividade>(CATALOGO.map((tipo) => [tipo.id, tipo]))

export function obterTipo(id: TipoAtividadeId): TipoAtividade {
  const tipo = POR_ID.get(id)
  if (!tipo) throw new Error(`Tipo de atividade desconhecido: ${id}`)
  return tipo
}

export function ehTipoAtividadeId(valor: unknown): valor is TipoAtividadeId {
  return typeof valor === "string" && POR_ID.has(valor as TipoAtividadeId)
}

// --- Grupos --------------------------------------------------------------------

export const GRUPOS: readonly { id: GrupoId; nome: string }[] = [
  { id: "ensino-monitoria", nome: "Ensino e monitoria" },
  { id: "pesquisa-publicacoes", nome: "Pesquisa e publicações" },
  { id: "extensao-eventos", nome: "Extensão e eventos" },
  { id: "representacao", nome: "Representação estudantil" },
]

/**
 * Deve acompanhar o agrupamento em qualquer tela onde ele apareça: o PPC não
 * define mínimo nem teto por grupo.
 */
export const AVISO_AGRUPAMENTO =
  "Agrupamento por natureza da atividade, apenas para facilitar a leitura. O Projeto Pedagógico não exige mínimo nem define teto por grupo."

export function tiposDoGrupo(grupo: GrupoId): TipoAtividade[] {
  return CATALOGO.filter((tipo) => tipo.grupo === grupo)
}

// --- Unidades ------------------------------------------------------------------

export const UNIDADES: Record<Unidade, { singular: string; plural: string }> = {
  semestre: { singular: "semestre", plural: "semestres" },
  evento: { singular: "evento", plural: "eventos" },
  dia: { singular: "dia", plural: "dias" },
  palestra: { singular: "palestra", plural: "palestras" },
  trabalho: { singular: "trabalho", plural: "trabalhos" },
  "semestre-completo": { singular: "semestre completo", plural: "semestres completos" },
}

// --- Notas de rodapé da Tabela 7 (texto literal) -------------------------------

/** Nota do asterisco (*). */
export const NOTA_DUPLA_CONTAGEM =
  "Atividades já validadas como outro tipo de atividade curricular não poderão ser validadas como Atividade complementar, sob pena de impedimento de validação em ambos."

/** Nota do duplo asterisco (**). */
export const NOTA_SEMESTRE_COMPLETO =
  "A atividade de monitoria somente será validada se o monitor atuar durante todo o semestre letivo."

export const CURSO = {
  sigla: "BCDIA",
  nome: "Bacharelado em Ciência de Dados e Inteligência Artificial",
  campus: "UFSCar Sorocaba",
} as const

/** Fonte citada no catálogo e no relatório entregue à secretaria. */
export const FONTE_TABELA_7 = `Tabela 7 — Atividades Complementares, Projeto Pedagógico do ${CURSO.nome} (${CURSO.sigla}), ${CURSO.campus}`
