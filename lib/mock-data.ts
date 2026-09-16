// lib/mock-data.ts
//
// Seed da demonstração (ADENDO-DOMINIO.md, "Dados de demonstração"). Créditos e horas nunca
// são escritos aqui: saem do tipo e da quantidade, via lib/calculos.ts.
//
// As datas são relativas a `agora` (o momento em que o seed é criado), para a
// demonstração parecer atual em qualquer dia em que for aberta — "Reiniciar
// demonstração" recria tudo. O indicador "N há mais de 7 dias" da tela 06 é
// calculado de verdade (obterEstatisticasDocente, lib/storage.ts) sobre estas
// datas; não é um número fixo escrito em outro lugar.
//
// A fila do docente é derivada do status: toda atividade em análise, de
// qualquer discente, está na fila. As da Ana (#3 e #4) entram por isso.

import { CURSO, NOTA_SEMESTRE_COMPLETO, type TipoAtividadeId } from "./catalogo"
import type {
  Atividade,
  Aviso,
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

function discente(
  id: string,
  nome: string,
  ra: string,
  ano: string,
  orientadorId: string | null = null
): Discente {
  return { id, nome, ra, curso: CURSO.sigla, ano, orientadorId }
}

// 9 são orientandos da Prof.ª Renata (telas "Meus orientandos" e "Relatório
// da turma"); os outros 5 não têm orientador nesta demonstração — mostram que
// o vínculo filtra de verdade, e não "todo mundo é orientando de todo mundo".
const DISCENTES: Discente[] = [
  discente(ID_DISCENTE_DEMO, "Ana Liz Souza", "811902", "3º ano", ID_DOCENTE_DEMO),
  discente("disc-bruno", "Bruno Okamoto", "812345", "4º ano", ID_DOCENTE_DEMO),
  discente("disc-carla", "Carla Menezes", "810778", "4º ano", ID_DOCENTE_DEMO),
  discente("disc-diego", "Diego Ferraz", "813410", "2º ano", ID_DOCENTE_DEMO),
  discente("disc-elisa", "Elisa Nakamura", "812004", "3º ano", ID_DOCENTE_DEMO),
  discente("disc-felipe", "Felipe Antunes", "811337", "3º ano", ID_DOCENTE_DEMO),
  discente("disc-gabriela", "Gabriela Reis", "812560", "3º ano"),
  discente("disc-henrique", "Henrique Sato", "813021", "2º ano"),
  discente("disc-isabela", "Isabela Prado", "810945", "4º ano"),
  discente("disc-joao", "João Vitor Lima", "812871", "3º ano"),
  // Nome e RA batem com o comprovante real (public/comprovantes/02 e 05).
  discente("disc-larissa", "Larissa Prado Nakamura", "813077", "3º ano", ID_DOCENTE_DEMO),
  // Idem: comprovante público 04.
  discente("disc-marcos", "Marcos Vinícius Rocha", "811264", "2º ano", ID_DOCENTE_DEMO),
  discente("disc-otavio", "Otávio Ribeiro", "812219", "4º ano"),
  // Nova: só ela tem comprovante em PDF (public/comprovantes/06), para a
  // validação mostrar o <embed>, não só a miniatura de imagem.
  discente("disc-camila", "Camila Ferreira Antunes", "812901", "2º ano", ID_DOCENTE_DEMO),
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

// Comprovante fictício, sem arquivo por trás (a maioria do seed): o
// visualizador (VisualizadorComprovante) mostra "não foi possível carregar"
// para eles, corretamente — nunca existiu blob nenhum, no IndexedDB ou fora
// dele. O prefixo evita colidir com os ids reais gerados no upload (lib/storage.ts, novoId("comp")).
function pdf(nome: string, kb: number): Comprovante {
  return { comprovanteId: `demo-sem-arquivo-${nome}`, nome, tamanhoBytes: kb * 1024, tipoMime: "application/pdf" }
}

// Comprovante real, servido de /public/comprovantes — comprovanteId começando
// com "/" é como lib/storage.ts (obterUrlComprovante) reconhece um arquivo
// público da demonstração e não tenta buscar no IndexedDB.
function arquivoPublico(nome: string, tipoMime: string, tamanhoBytes: number): Comprovante {
  return { comprovanteId: `/comprovantes/${nome}`, nome, tamanhoBytes, tipoMime }
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
        comprovante: {
          comprovanteId: "demo-sem-arquivo-certificado-git-secot.pdf",
          nome: "certificado-git-secot.pdf",
          tamanhoBytes: 1258291,
          tipoMime: "application/pdf",
        },
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
// (remapeados para tipos da Tabela 7). Bruno, Larissa, Marcos e Camila têm
// comprovante de verdade (public/comprovantes/, servido direto — não passa
// pelo IndexedDB, ver arquivoPublico() acima): Bruno e Larissa em dois tipos
// diferentes cada um (mostra a exigência de 2 tipos da PPC 3.5.4 sendo
// cumprida); o de Marcos ("Grupo de estudos", sem tipo previsto e sem carga
// horária no documento) é o caso pensado para recusa; o de Camila é o único
// em PDF do seed, para exercitar o <embed> na validação.

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
      comprovante: arquivoPublico("01-declaracao-coordenacao-monitoria-calculo2.jpg", "image/jpeg", 86416),
    }),
    // Segundo tipo do Bruno (Extensão e eventos, não Ensino e monitoria):
    // mostra a exigência de 2 tipos diferentes (PPC 3.5.4) já cumprida assim
    // que as duas forem validadas.
    item(
      "atv-bruno-organizacao-secot-xvii",
      "disc-bruno",
      "Organização de evento — SeCoT XVII",
      "organizacao-evento",
      2,
      6 * 24, // tokens-ok: horas de espera (6 dias), não CREDITOS_EXIGIDOS
      {
        periodo: periodo(agora, 364, 361),
        comprovante: arquivoPublico("03-certificado-organizacao-evento-secot.jpg", "image/jpeg", 67769),
      }
    ),
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
    item("atv-larissa-extensao-girassol", "disc-larissa", "Extensão — Projeto Girassol", "extensao", 120, 8 * 24 + 2, {
      periodo: periodo(agora, 189, 18),
      confirmacoes: { semDuplaContagem: true },
      comprovante: arquivoPublico("02-certificado-extensao-projeto-girassol.jpg", "image/jpeg", 68629),
    }),
    // Segundo tipo da Larissa: mesma exigência de 2 tipos (PPC 3.5.4) que o
    // caso do Bruno, agora em Ensino e monitoria + Extensão e eventos.
    item("atv-larissa-monitoria-algebra", "disc-larissa", "Monitoria — Álgebra Linear", "monitoria", 180, 2 * 24 + 10, {
      confirmacoes: { semestreCompleto: true },
      comprovante: arquivoPublico("05-foto-declaracao-monitoria-algebra.jpg", "image/jpeg", 76293),
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
    // Caso destinado a recusa: o comprovante não informa carga horária
    // nenhuma (público 04), e "Grupo de estudos" não corresponde a nenhum
    // tipo da Tabela 7 — a mesma regra 1 do caso da Ana (#7), aqui para o
    // docente encontrar na fila, comprovante em mãos.
    item("atv-marcos-grupo-estudos", "disc-marcos", "Grupo de estudos", null, null, 4 * 24 + 6, { // tokens-ok: horas de espera, não CREDITOS_EXIGIDOS
      periodo: null,
      observacoes: "Participação em grupo de estudos ao longo do semestre.",
      comprovante: arquivoPublico("04-declaracao-sem-carga-horaria.jpg", "image/jpeg", 69421),
    }),
    item(
      "atv-otavio-presidencia-ca",
      "disc-otavio",
      "Presidência do Centro Acadêmico",
      "presidencia-ca-atletica",
      1,
      3
    ),
    // Único comprovante em PDF do seed: a validação mostra o <embed>, não a
    // miniatura de imagem.
    item("atv-camila-curso-python", "disc-camila", "Curso de extensão — Python", "extensao", 60, 1 * 24 + 15, { // tokens-ok: horas de espera, não HORAS_POR_CREDITO
      periodo: periodo(agora, 164, 80),
      confirmacoes: { semDuplaContagem: true },
      comprovante: arquivoPublico("06-certificado-curso-python.pdf", "application/pdf", 42760),
    }),
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

// --- Orientandos da Prof.ª Renata: casos específicos das telas do docente --------
// Somam-se ao que cada um já tinha (não altera nenhum registro existente, para
// não mexer no que as demais telas já mostram — os comprovantes de Bruno, por
// exemplo, seguem servindo a validação individual como antes). Cobre os quatro
// casos pedidos: integralizou (Bruno), créditos suficientes com um tipo só —
// o risco silencioso (Carla), pendência parada além do limiar de risco
// (Diego, DIAS_PENDENCIA_ANTIGA em lib/calculos.ts) e progresso intermediário
// com tipos variados (Larissa, Camila).

function atividadesDosOrientandos(agora: Date): Atividade[] {
  const validado = (
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
        comprovante: pdf(`comprovante-${id.replace("atv-", "")}.pdf`, 300),
      },
      enviadaHaDias,
      enviadaHaDias - 5
    )

  return [
    // Bruno: já tinha 2 créditos em 2 tipos (congresso-simposio, palestra);
    // com mais estes dois, integraliza (8 créditos, 4 tipos).
    validado("atv-bruno-extensao-cursinho", "disc-bruno", "Extensão — Cursinho popular", "extensao", 180, 150),
    validado(
      "atv-bruno-projeto-acessibilidade",
      "disc-bruno",
      "Participação no Projeto Acessibilidade Digital",
      "participacao-projeto",
      180,
      130
    ),
    // Carla: já tinha 3 créditos em disciplina-eletiva (1 tipo só); com mais
    // esta, chega aos créditos exigidos ainda num tipo só — o caso que o
    // sistema enxerga e o aluno não.
    validado(
      "atv-carla-eletiva-etica-dados",
      "disc-carla",
      "Disciplina eletiva de Ética em Dados",
      "disciplina-eletiva",
      60,
      180
    ),
    // Larissa e Camila: primeiro crédito validado de cada uma, tipos
    // diferentes entre si — progresso inicial, não integralizado.
    validado("atv-larissa-congic", "disc-larissa", "Congresso de Iniciação Científica da UFSCar", "congresso-simposio", 1, 60),
    // Camila: 60 de 180 h máximas da extensão — 1 crédito só, não os 3 do
    // teto, o mesmo arredondamento para baixo do painel do discente.
    validado("atv-camila-extensao-horta", "disc-camila", "Extensão — Horta comunitária", "extensao", 60, 40),
  ]
}

/**
 * Diego: uma atividade em análise há mais de DIAS_PENDENCIA_ANTIGA
 * (lib/calculos.ts) sem parecer do docente — o caso "pendência antiga". Fica
 * fora de atividadesDosOrientandos porque emAnalise() tem uma assinatura
 * diferente de validada() (não recebe data de decisão).
 */
function pendenciaAntigaDeDiego(agora: Date): Atividade {
  return emAnalise(
    agora,
    {
      id: "atv-diego-iniciacao-cientifica-antiga",
      discenteId: "disc-diego",
      titulo: "Iniciação científica — Processamento de linguagem natural",
      tipoId: "iniciacao-cientifica",
      quantidade: 180,
      periodo: periodo(agora, 60, 20),
      comprovante: pdf("comprovante-diego-ic-antiga.pdf", 420),
      confirmacoes: { semDuplaContagem: true },
    },
    20 * 24 // 20 dias de espera, acima do limiar de risco (DIAS_PENDENCIA_ANTIGA)
  )
}

// --- Avisos (central de avisos, perfil discente) ----------------------------------
// Cada aviso corresponde a um evento real das atividades da Ana acima — nenhuma
// data ou crédito é inventado à parte. Dois começam não lidos (os dois mais
// recentes), para o badge da sidebar aparecer já na primeira visita.

function criarAvisos(agora: Date): Aviso[] {
  return [
    {
      id: "aviso-meninas-aguardando",
      tipo: "aguardando",
      titulo: "Projeto de extensão Meninas Digitais aguarda validação",
      // Mesmo prazo de espera de atv-ana-meninas-digitais (8*24+2 horas ≈ 8 dias).
      descricao: "Em análise há 8 dias.",
      em: diasAtras(agora, 1).toISOString(),
      lido: false,
      atividadeId: "atv-ana-meninas-digitais",
    },
    {
      id: "aviso-monitoria-regra",
      tipo: "regra",
      titulo: "Lembrete: monitoria exige semestre completo",
      descricao: `${NOTA_SEMESTRE_COMPLETO} Tabela 7, nota do duplo asterisco.`,
      em: diasAtras(agora, 2).toISOString(),
      lido: false,
      atividadeId: null,
    },
    {
      id: "aviso-dois-tipos-marco",
      tipo: "marco",
      titulo: "Marco atingido: 2 tipos de atividade diferentes",
      descricao:
        "O Projeto Pedagógico (seção 3.5.4) exige atividades de pelo menos 2 tipos diferentes da Tabela 7 — você já tem isso garantido.",
      // Mesmo dia da validação de atv-ana-organizacao-semana (validadaHaDias:
      // 100), a segunda atividade validada da Ana, de um tipo diferente da
      // primeira (monitoria + organização de evento).
      em: diasAtras(agora, 100).toISOString(),
      lido: true,
      atividadeId: null,
    },
    {
      id: "aviso-monitoria-validada",
      tipo: "validada",
      titulo: "Monitoria de Algoritmos e Estruturas de Dados I foi validada",
      descricao: "3 créditos contabilizados.",
      // Mesma data de validação de atv-ana-monitoria-aed1 (validadaHaDias: 180).
      em: diasAtras(agora, 180).toISOString(),
      lido: true,
      atividadeId: "atv-ana-monitoria-aed1",
    },
    {
      id: "aviso-coursera-recusada",
      tipo: "recusada",
      titulo: "Curso online de banco de dados (Coursera) foi recusado",
      descricao:
        "Motivo: tipo de atividade não previsto na Tabela 7 do Projeto Pedagógico. Cursos em plataformas comerciais não constam entre os tipos aceitos. Envie uma nova atividade, se for o caso.",
      // Mesma data de courseraRecusada em atividadesDaAna (diasAtras(agora, 193)).
      em: diasAtras(agora, 193).toISOString(),
      lido: true,
      atividadeId: "atv-ana-coursera",
    },
  ]
}

// --- Estado inicial ----------------------------------------------------------------

export function criarEstadoInicial(agora: Date): EstadoDemo {
  return {
    versao: 5,
    discenteAtualId: ID_DISCENTE_DEMO,
    docenteAtualId: ID_DOCENTE_DEMO,
    discentes: DISCENTES.map((d) => ({ ...d })),
    docentes: [{ ...DOCENTE }],
    atividades: [
      ...atividadesDaAna(agora),
      ...filaDosDemais(agora),
      ...historicoDosDemais(agora),
      ...atividadesDosOrientandos(agora),
      pendenciaAntigaDeDiego(agora),
    ],
    avisos: criarAvisos(agora),
  }
}
