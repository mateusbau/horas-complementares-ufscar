// scripts/verificar-migracao.mjs
//
// Garante que um estado salvo de versão anterior seja descartado e o seed
// recriado. O caso que este script cobre é o que passou batido na v2 → v3: o
// seed mudou (comprovantes reais), a versão não subiu, e quem já tinha aberto
// o sistema seguiu vendo os dados antigos indefinidamente.
//
// Cobre também a mesma classe de bug na chave de preferências (aparência,
// notificações — lib/preferencias.ts): uma versão salva incompatível precisa
// voltar aos padrões, e a chave de preferências precisa sobreviver a
// reiniciarDemo()/limparDadosLocais(), que só tocam a chave de estado.
//
// O ponto central é começar com o localStorage JÁ POPULADO. Num navegador
// limpo o seed é sempre recriado e tudo parece funcionar — é exatamente por
// isso que teste com armazenamento vazio esconde esta classe de bug.
//
// Uso:  npm run verificar:migracao
//       node scripts/verificar-migracao.mjs
//
// Sem dependências: usa o strip de tipos nativo do Node (24+) para importar
// lib/storage.ts de verdade, com um localStorage de mentira na memória.

import { register } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"

// Os imports dentro de lib/ não trazem extensão (".../catalogo"), o que o
// bundler resolve e o ESM do Node não. Este gancho acrescenta o ".ts".
register(
  "data:text/javascript," +
    encodeURIComponent(`
      export async function resolve(especificador, contexto, proximo) {
        try {
          return await proximo(especificador, contexto)
        } catch (erro) {
          if (especificador.startsWith(".") && !especificador.endsWith(".ts")) {
            return await proximo(especificador + ".ts", contexto)
          }
          throw erro
        }
      }
    `)
)

// --- localStorage de mentira ----------------------------------------------------

const memoria = new Map()
const armazenamento = {
  getItem: (chave) => (memoria.has(chave) ? memoria.get(chave) : null),
  setItem: (chave, valor) => memoria.set(chave, String(valor)),
  removeItem: (chave) => memoria.delete(chave),
  clear: () => memoria.clear(),
}
globalThis.window = { localStorage: armazenamento }
globalThis.localStorage = armazenamento

const CHAVE = "horas-complementares:estado"
const CHAVE_PREFERENCIAS = "horas-complementares:preferencias"

// --- Estado da versão anterior --------------------------------------------------
// Estruturalmente válido para a v2: passaria pelo portão antigo sem reclamar.
// É esse o cenário do bug — não um estado corrompido, mas um estado legítimo
// de uma versão anterior.

const TITULO_ANTIGO = "Atividade remanescente da versão 2"

function estadoAntigo() {
  return {
    versao: 2,
    discenteAtualId: "disc-ana",
    docenteAtualId: "doc-renata",
    discentes: [{ id: "disc-ana", nome: "Ana Liz Souza", ra: "811902", curso: "BCDIA", ano: "3º ano" }],
    docentes: [{ id: "doc-renata", nome: "Prof.ª Renata Marques", departamento: "DCoMP", iniciais: "RM" }],
    atividades: [
      {
        id: "atv-antiga",
        discenteId: "disc-ana",
        titulo: TITULO_ANTIGO,
        tipoId: null,
        quantidade: null,
        periodo: null,
        observacoes: "",
        comprovante: null,
        confirmacoes: { semDuplaContagem: false, semestreCompleto: false },
        status: "analise",
        criadaEm: new Date().toISOString(),
        enviadaEm: new Date().toISOString(),
        historico: [],
        pareceres: [],
      },
    ],
  }
}

// --- Verificações ---------------------------------------------------------------

const falhas = []
let verificacoes = 0

function conferir(descricao, condicao, detalhe) {
  verificacoes += 1
  if (condicao) {
    console.log(`  ok   ${descricao}`)
  } else {
    console.log(`  FALHOU  ${descricao}`)
    falhas.push(detalhe ? `${descricao}\n    → ${detalhe}` : descricao)
  }
}

const storage = await import(pathToFileURL(path.resolve("lib/storage.ts")).href)

// 1. Estado de versão anterior, já populado: o caso que faltou.
console.log("\nEstado salvo da versão 2 (localStorage já populado):")
memoria.clear()
armazenamento.setItem(CHAVE, JSON.stringify(estadoAntigo()))

let atividades
try {
  atividades = await storage.listarAtividades()
  conferir("a leitura não lança erro", true)
} catch (erro) {
  conferir("a leitura não lança erro", false, `lançou: ${erro.message}`)
  atividades = []
}

const salvo = JSON.parse(armazenamento.getItem(CHAVE))
conferir("o estado antigo é substituído no armazenamento", salvo.versao === 3, `versão gravada: ${salvo.versao}`)
conferir(
  "a atividade da versão anterior desaparece",
  !atividades.some((a) => a.titulo === TITULO_ANTIGO),
  "o estado antigo sobreviveu à migração"
)
conferir("o seed novo é recriado", atividades.length > 0, "nenhuma atividade após a migração")

const fila = await storage.listarFilaValidacao()
conferir("a fila do docente é reconstruída", fila.length > 0, "fila vazia após a migração")

// Pelo estado inteiro: os comprovantes reais estão em atividades de vários
// discentes, e listarAtividades() só devolve as do discente atual.
const todas = JSON.parse(await storage.exportarEstado()).atividades
const comArquivoReal = todas.filter((a) => a.comprovante?.comprovanteId?.startsWith("/comprovantes/"))
conferir(
  "os comprovantes reais do seed aparecem",
  comArquivoReal.length === 6,
  `esperado 6 comprovantes em /comprovantes/, encontrado ${comArquivoReal.length}`
)

// 2. Estado da versão corrente: não pode ser descartado a cada leitura, senão a
//    migração viraria um "reinicia sempre" e apagaria o trabalho de quem usa.
console.log("\nEstado salvo da versão corrente (não deve ser descartado):")
const TITULO_DO_USUARIO = "Atividade criada pelo usuário"
const atual = JSON.parse(armazenamento.getItem(CHAVE))
atual.atividades.push({ ...estadoAntigo().atividades[0], id: "atv-do-usuario", titulo: TITULO_DO_USUARIO })
armazenamento.setItem(CHAVE, JSON.stringify(atual))

const depois = await storage.listarAtividades()
conferir(
  "o estado da versão corrente é preservado",
  depois.some((a) => a.titulo === TITULO_DO_USUARIO),
  "o estado válido foi descartado — a migração está reiniciando sempre"
)

// 3. Caminho feliz de sempre: primeira visita, armazenamento vazio.
console.log("\nArmazenamento vazio (primeira visita):")
memoria.clear()
const doZero = await storage.listarAtividades()
conferir("o seed é criado do zero", doZero.length > 0, "nenhuma atividade na primeira visita")
conferir(
  "grava a versão corrente",
  JSON.parse(armazenamento.getItem(CHAVE)).versao === 3,
  "a versão gravada não é a corrente"
)

// 4. Preferências (chave separada): mesma classe de bug, versão incompatível
//    precisa voltar aos padrões, e a chave não pode ser tocada por
//    reiniciarDemo() nem por limparDadosLocais() — são dados pessoais, não
//    dados da demonstração.
console.log("\nPreferências — versão anterior já salva (localStorage já populado):")
const preferencias = await import(pathToFileURL(path.resolve("lib/preferencias.ts")).href)

memoria.clear()
// Forma antiga completa (todos os OUTROS campos válidos, só a versão errada):
// isola o portão de versão em si, e não some com o teste por causa de campo
// novo faltando — o que passaria mesmo sem checar `versao` nenhuma.
armazenamento.setItem(
  CHAVE_PREFERENCIAS,
  JSON.stringify({
    altoContraste: true,
    tamanhoTexto: "maior",
    reduzirAnimacoes: false,
    densidade: "compacta",
    notificarValidacao: true,
    notificarRecusa: true,
    notificarPrazos: true,
    notificarMarcos: true,
  })
)
const lidasAntigas = storage.lerPreferencias()
conferir(
  "preferência de versão incompatível volta aos padrões",
  JSON.stringify(lidasAntigas) === JSON.stringify(preferencias.PREFERENCIAS_PADRAO),
  `lidas: ${JSON.stringify(lidasAntigas)}`
)

console.log("\nPreferências — versão corrente (não deve ser descartada):")
const preferenciasCustom = { ...preferencias.PREFERENCIAS_PADRAO, altoContraste: true, densidade: "confortavel" }
armazenamento.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferenciasCustom))
const lidasCustom = storage.lerPreferencias()
conferir(
  "preferência da versão corrente é preservada",
  lidasCustom.altoContraste === true && lidasCustom.densidade === "confortavel",
  `lidas: ${JSON.stringify(lidasCustom)}`
)

// limparDadosLocais() também apaga blobs do IndexedDB, que não existe neste
// script (só no navegador) — a parte dela reaproveita reiniciarDemo() por
// baixo (lib/storage.ts), então testar reiniciarDemo() aqui já cobre a
// chave de preferências para as duas ações; o IndexedDB é conferido à parte,
// no navegador real (verify/check-configuracoes.mjs).
console.log("\nPreferências — sobrevivem a reiniciarDemo():")
const antesDeReiniciar = armazenamento.getItem(CHAVE_PREFERENCIAS)
await storage.reiniciarDemo()
conferir(
  "reiniciarDemo() não toca a chave de preferências",
  armazenamento.getItem(CHAVE_PREFERENCIAS) === antesDeReiniciar,
  "a chave de preferências mudou depois de reiniciarDemo()"
)

console.log("\nPreferências — armazenamento vazio (primeira visita):")
memoria.clear()
const preferenciasDoZero = storage.lerPreferencias()
conferir(
  "preferências padrão na primeira visita",
  JSON.stringify(preferenciasDoZero) === JSON.stringify(preferencias.PREFERENCIAS_PADRAO),
  `lidas: ${JSON.stringify(preferenciasDoZero)}`
)

// --- Resultado ------------------------------------------------------------------

if (falhas.length === 0) {
  console.log(`\nverificar-migracao: ${verificacoes} verificação(ões), nenhuma falha.`)
  process.exit(0)
}

console.error(`\nverificar-migracao: ${falhas.length} falha(s) de ${verificacoes} verificação(ões):`)
for (const falha of falhas) console.error(`  - ${falha}`)
console.error(
  "\nSe o seed mudou, suba `versao` em lib/types.ts, lib/mock-data.ts e no" +
    " teste de `ehEstadoValido` em lib/storage.ts." +
    "\nSe a forma das preferências mudou, suba `versao` em lib/preferencias.ts" +
    " (tipo, PREFERENCIAS_PADRAO e `ehPreferencias`)."
)
process.exit(1)
