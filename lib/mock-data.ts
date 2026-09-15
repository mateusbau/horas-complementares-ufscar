// lib/mock-data.ts
//
// Seed da demonstração (ADENDO-DOMINIO.md, "Dados de demonstração"). Créditos e horas nunca
// são escritos aqui: saem do tipo e da quantidade, via lib/calculos.ts.
//
// As datas são relativas a `agora` (o momento em que o seed é criado), para a
// demonstração parecer atual em qualquer dia em que for aberta: a fila começa
// com esperas de 9, 9, 8, 3 e 1 dias — três acima de 7 dias, como diz o
// indicador da tela 06 —, e "Reiniciar demonstração" recria tudo.
//
// A fila do docente é derivada do status: toda atividade em análise, de
// qualquer discente, está na fila. As da Ana (#3 e #4) entram por isso.

import { CURSO, type TipoAtividadeId } from "./catalogo"
import type {
  Atividade,
  Comprovante,
  Confirmacoes,
  Discente,
  Docente,
  EstadoDemo,
  Parecer,
  TipoEvento,
} from "./types"

const MS_POR_HORA = 60 * 60 * 1000

export const ID_DISCENTE_DEMO = "disc-ana"
export const ID_DOCENTE_DEMO = "doc-renata"

// --- Pessoas -------------------------------------------------------------------

const DOCENTE: Docente = {
  id: ID_DOCENTE_DEMO,
  nome: "Prof.ª Renata Marques",
  departamento: "DCoMP",
  iniciais: "RM",
}

function discente(id: string, nome: string, ra: string, ano: string): Discente {
  return { id, nome, ra, curso: CURSO.sigla, ano }
}

const DISCENTES: Discente[] = [
  discente(ID_DISCENTE_DEMO, "Ana Liz Souza", "811902", "3º ano"),
  discente("disc-bruno", "Bruno Okamoto", "812345", "4º ano"),
  discente("disc-carla", "Carla Menezes", "810778", "4º ano"),
  discente("disc-diego", "Diego Ferraz", "813410", "2º ano"),
  discente("disc-elisa", "Elisa Nakamura", "812004", "3º ano"),
  discente("disc-felipe", "Felipe Antunes", "811337", "3º ano"),
  discente("disc-gabriela", "Gabriela Reis", "812560", "3º ano"),
  discente("disc-henrique", "Henrique Sato", "813021", "2º ano"),
  discente("disc-isabela", "Isabela Prado", "810945", "4º ano"),
  discente("disc-joao", "João Vitor Lima", "812871", "3º ano"),
  discente("disc-larissa", "Larissa Campos", "811580", "3º ano"),
  discente("disc-marcos", "Marcos Tavares", "813377", "2º ano"),
  discente("disc-otavio", "Otávio Ribeiro", "812219", "4º ano"),
]

// --- Auxiliares de data --------------------------------------------------------

function horasAtras(agora: Date, horas: number): Date {
  return new Date(agora.getTime() - horas * MS_POR_HORA)
}

function diasAtras(agora: Date, dias: number): Date {
  return horasAtras(agora, dias * 24)
}

/** Data local em AAAA-MM-DD. */
function dataLocal(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  return `${data.getFullYear()}-${mes}-${dia}`
}

/** Período de `inicioHaDias` até `terminoHaDias` atrás. */
function periodo(agora: Date, inicioHaDias: number, terminoHaDias: number) {
  return {
    inicio: dataLocal(diasAtras(agora, inicioHaDias)),
    termino: dataLocal(diasAtras(agora, terminoHaDias)),
  }
}

function pdf(nome: string, kb: number): Comprovante {
  return { nome, tamanhoBytes: kb * 1024, tipoMime: "application/pdf" }
}

const SEM_CONFIRMACOES: Confirmacoes = { semDuplaContagem: false, semestreCompleto: false }

// --- Construtores ------------------------------------------------------------------

type Base = {
  id: string
  discenteId: string
  titulo: string
  tipoId: TipoAtividadeId | null
  quantidade: number | null
  periodo: { inicio: string; termino: string } | null
  comprovante: Comprovante | null
  confirmacoes?: Partial<Confirmacoes>
  observacoes?: string
}

function montar(
  base: Base,
  status: Atividade["status"],
  criadaEm: Date,
  enviadaEm: Date | null,
  eventos: [TipoEvento, Date][],
  pareceres: Parecer[] = []
): Atividade {
  return {
    id: base.id,
    discenteId: base.discenteId,
    titulo: base.titulo,
    tipoId: base.tipoId,
    quantidade: base.quantidade,
    periodo: base.periodo,
    observacoes: base.observacoes ?? "",
    comprovante: base.comprovante,
    confirmacoes: { ...SEM_CONFIRMACOES, ...base.confirmacoes },
    status,
    criadaEm: criadaEm.toISOString(),
    enviadaEm: enviadaEm?.toISOString() ?? null,
    historico: eventos.map(([tipo, em]) => ({ tipo, em: em.toISOString() })),
    pareceres,
  }
}

/** Atividade na fila: enviada há `horasDeEspera` horas, aguardando parecer. */
function emAnalise(agora: Date, base: Base, horasDeEspera: number): Atividade {
  const enviada = horasAtras(agora, horasDeEspera)
  return montar(base, "analise", enviada, enviada, [["enviada", enviada]])
}

/** Atividade validada no passado pela docente da demonstração. */
function validada(
  agora: Date,
  base: Base,
  enviadaHaDias: number,
  validadaHaDias: number,
  comentario = ""
): Atividade {
  const enviada = diasAtras(agora, enviadaHaDias)
  const decisao = diasAtras(agora, validadaHaDias)
  const parecer: Parecer = {
    decisao: "aprovar",
    comentario,
    docenteId: ID_DOCENTE_DEMO,
    em: decisao.toISOString(),
    ...(base.confirmacoes?.semestreCompleto ? { semestreCompletoConfirmado: true } : {}),
  }
  return montar(
    base,
    "validada",
    enviada,
    enviada,
    [
      ["enviada", enviada],
      ["analisada", decisao],
      ["validada", decisao],
    ],
    [parecer]
  )
}

// --- Atividades da Ana (discente da demonstração) ---------------------------------

function atividadesDaAna(agora: Date): Atividade[] {
  const ana = ID_DISCENTE_DEMO

  // #5 — tela 05: enviada, analisada e devolvida com pendência sete dias depois.
  const gitEnviada = diasAtras(agora, 25)
  const gitDevolvida = diasAtras(agora, 18)
  gitDevolvida.setHours(14, 32, 0, 0)

  // #7 — exemplo didático da regra 1 (tipo não previsto na Tabela 7).
  const courseraEnviada = diasAtras(agora, 200)
  const courseraRecusada = diasAtras(agora, 193)

  return [
    // #1
    validada(
      agora,
      {
        id: "atv-ana-monitoria-aed1",
        discenteId: ana,
        titulo: "Monitoria de Algoritmos e Estruturas de Dados I",
        tipoId: "monitoria",
        quantidade: 180,
        periodo: periodo(agora, 330, 200),
        comprovante: pdf("declaracao-monitoria-aed1.pdf", 412),
        confirmacoes: { semestreCompleto: true },
      },
      190,
      180,
      "Declaração da PROGRAD confirma a atuação durante todo o semestre letivo."
    ),
    // #2
    validada(
      agora,
      {
        id: "atv-ana-organizacao-semana",
        discenteId: ana,
        titulo: "Organização da Semana de Computação",
        tipoId: "organizacao-evento",
        quantidade: 1,
        periodo: periodo(agora, 120, 120),
        comprovante: pdf("declaracao-organizacao-semana-computacao.pdf", 236),
      },
      110,
      100
    ),
    // #3
    emAnalise(
      agora,
      {
        id: "atv-ana-pibic",
        discenteId: ana,
        titulo: "Iniciação científica PIBIC · visão computacional",
        tipoId: "iniciacao-cientifica",
        quantidade: 180,
        periodo: periodo(agora, 400, 40),
        comprovante: pdf("relatorio-pibic-comissao-ic.pdf", 1840),
        confirmacoes: { semDuplaContagem: true },
      },
      28
    ),
    // #4
    emAnalise(
      agora,
      {
        id: "atv-ana-meninas-digitais",
        discenteId: ana,
        titulo: "Projeto de extensão Meninas Digitais",
        tipoId: "extensao",
        quantidade: 180,
        periodo: periodo(agora, 250, 70),
        comprovante: pdf("certificado-proex-meninas-digitais.pdf", 520),
        confirmacoes: { semDuplaContagem: true },
      },
      8 * 24 + 2
    ),
    // #5
    montar(
      {
        id: "atv-ana-git-secot",
        discenteId: ana,
        titulo: "Minicurso de Git e GitHub · SeCoT XVIII",
        tipoId: "congresso-simposio",
        quantidade: 1,
        periodo: periodo(agora, 30, 30),
        comprovante: { nome: "certificado-git-secot.pdf", tamanhoBytes: 1258291, tipoMime: "application/pdf" },
      },
      "pendente",
      gitEnviada,
      gitEnviada,
      [
        ["enviada", gitEnviada],
        ["analisada", gitDevolvida],
        ["devolvida", gitDevolvida],
      ],
      [
        {
          decisao: "devolver",
          comentario:
            "O certificado não comprova a participação no evento completo. Reenvie o certificado emitido pela organização do SeCoT.",
          docenteId: ID_DOCENTE_DEMO,
          em: gitDevolvida.toISOString(),
        },
      ]
    ),
    // #6 — pendente de envio: cadastrada, ainda sem comprovante anexado.
    montar(
      {
        id: "atv-ana-resumo-anais",
        discenteId: ana,
        titulo: "Publicação de resumo em anais de evento",
        tipoId: "resumo-poster",
        quantidade: 1,
        periodo: periodo(agora, 50, 50),
        comprovante: null,
      },
      "pendente",
      diasAtras(agora, 4),
      null,
      []
    ),
    // #7
    montar(
      {
        id: "atv-ana-coursera",
        discenteId: ana,
        titulo: "Curso online de banco de dados (Coursera)",
        tipoId: null,
        quantidade: null,
        periodo: periodo(agora, 520, 480),
        comprovante: pdf("certificado-coursera-banco-de-dados.pdf", 318),
        observacoes: "Curso de 40 horas concluído na plataforma.",
      },
      "recusada",
      courseraEnviada,
      courseraEnviada,
      [
        ["enviada", courseraEnviada],
        ["analisada", courseraRecusada],
        ["recusada", courseraRecusada],
      ],
      [
        {
          decisao: "recusar",
          comentario:
            "Tipo de atividade não previsto na Tabela 7 do Projeto Pedagógico. Cursos em plataformas comerciais não constam entre os tipos aceitos.",
          docenteId: ID_DOCENTE_DEMO,
          em: courseraRecusada.toISOString(),
        },
      ]
    ),
  ]
}

// --- Fila: atividades em análise dos demais discentes ----------------------------
// Os cinco primeiros por tempo de espera mantêm nomes e RAs do protótipo
// (remapeados para tipos da Tabela 7). Esperas: Bruno 9 dias, Carla 9 (duas
// horas a menos, para o Bruno abrir a fila), Ana 8, Diego 3, Elisa 1. Os demais
// completam 14 itens.

function filaDosDemais(agora: Date): Atividade[] {
  const item = (
    id: string,
    discenteId: string,
    titulo: string,
    tipoId: TipoAtividadeId | null,
    quantidade: number | null,
    horasDeEspera: number,
    extras: Partial<Base> = {}
  ) =>
    emAnalise(
      agora,
      {
        id,
        discenteId,
        titulo,
        tipoId,
        quantidade,
        periodo: periodo(agora, 200, 20),
        comprovante: pdf(`comprovante-${id.replace("atv-", "")}.pdf`, 380),
        ...extras,
      },
      horasDeEspera
    )

  return [
    item("atv-bruno-monitoria-calculo2", "disc-bruno", "Monitoria de Cálculo II", "monitoria", 180, 9 * 24 + 3, {
      confirmacoes: { semestreCompleto: true },
      comprovante: pdf("declaracao-coordenacao-monitoria-calculo2.pdf", 640),
    }),
    item("atv-carla-meninas-digitais", "disc-carla", "Projeto Meninas Digitais", "extensao", 180, 9 * 24 + 1, {
      confirmacoes: { semDuplaContagem: true },
    }),
    item("atv-diego-pibic", "disc-diego", "Iniciação científica PIBIC", "iniciacao-cientifica", 180, 3 * 24 + 1, {
      confirmacoes: { semDuplaContagem: true },
    }),
    item("atv-elisa-organizacao-secot", "disc-elisa", "Organização da SeCoT XVIII", "organizacao-evento", 2, 32, {
      periodo: periodo(agora, 40, 38),
    }),
    item("atv-felipe-monitoria-alg1", "disc-felipe", "Monitoria de Algoritmos I", "monitoria", 180, 26, {
      confirmacoes: { semestreCompleto: true },
    }),
    item("atv-gabriela-python", "disc-gabriela", "Minicurso de Python para dados", null, null, 22, {
      observacoes: "Minicurso online de 12 horas.",
    }),
    item(
      "atv-henrique-palestras-ia",
      "disc-henrique",
      "Palestras sobre IA responsável e dados abertos",
      "palestra",
      2,
      20
    ),
    item("atv-isabela-maratona", "disc-isabela", "Maratona de Programação SBC · fase regional", "competicao", 1, 17, {
      periodo: periodo(agora, 45, 45),
    }),
    item("atv-joao-artigo-bracis", "disc-joao", "Artigo completo publicado no BRACIS", "artigo-completo", 1, 12, {
      confirmacoes: { semDuplaContagem: true },
    }),
    item("atv-larissa-aciepes", "disc-larissa", "ACIEPES Computação e Sociedade", "aciepes", 60, 9, {
      confirmacoes: { semDuplaContagem: true },
    }),
    // Validação fracionada (PPC, 3.5.4): 120 h de um máximo de 180 h/semestre
    // (3 créditos) valem 2 créditos. Mostra ao docente a diferença entre a
    // carga do comprovante e o que é contabilizado.
    item(
      "atv-marcos-suporte-lab",
      "disc-marcos",
      "Suporte em TI ao Laboratório de Ensino de Computação",
      "suporte-ti",
      120,
      5
    ),
    item(
      "atv-otavio-presidencia-ca",
      "disc-otavio",
      "Presidência do Centro Acadêmico",
      "presidencia-ca-atletica",
      1,
      3
    ),
  ]
}

// --- Histórico validado dos demais (dá contexto ao "progresso do discente") ------

function historicoDosDemais(agora: Date): Atividade[] {
  const item = (
    id: string,
    discenteId: string,
    titulo: string,
    tipoId: TipoAtividadeId,
    quantidade: number,
    enviadaHaDias: number
  ) =>
    validada(
      agora,
      {
        id,
        discenteId,
        titulo,
        tipoId,
        quantidade,
        periodo: periodo(agora, enviadaHaDias + 30, enviadaHaDias + 10),
        comprovante: pdf(`comprovante-${id.replace("atv-", "")}.pdf`, 290),
      },
      enviadaHaDias,
      enviadaHaDias - 7
    )

  return [
    item("atv-bruno-sbbd", "disc-bruno", "Participação no Simpósio Brasileiro de Banco de Dados", "congresso-simposio", 1, 160),
    item("atv-bruno-ciclo-ia", "disc-bruno", "Palestras do Ciclo de Inteligência Artificial", "palestra", 2, 120),
    item("atv-carla-eletiva-visualizacao", "disc-carla", "Disciplina eletiva de Visualização de Dados", "disciplina-eletiva", 60, 200),
    item("atv-diego-feira-profissoes", "disc-diego", "Feira de Profissões UFSCar", "feira", 1, 140),
    item("atv-elisa-bolsa-biblioteca", "disc-elisa", "Bolsa atividade na Biblioteca Comunitária", "bolsista-atividade", 120, 230),
    item("atv-elisa-congic", "disc-elisa", "Congresso de Iniciação Científica da UFSCar", "congresso-simposio", 1, 170),
  ]
}

// --- Estado inicial ----------------------------------------------------------------

export function criarEstadoInicial(agora: Date): EstadoDemo {
  return {
    versao: 2,
    discenteAtualId: ID_DISCENTE_DEMO,
    docenteAtualId: ID_DOCENTE_DEMO,
    discentes: DISCENTES.map((d) => ({ ...d })),
    docentes: [{ ...DOCENTE }],
    atividades: [...atividadesDaAna(agora), ...filaDosDemais(agora), ...historicoDosDemais(agora)],
  }
}
