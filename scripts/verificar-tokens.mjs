// scripts/verificar-tokens.mjs
//
// Barra classes e padrões que violam a identidade visual (CLAUDE.md). O caso
// principal é o dos componentes shadcn/ui: eles chegam com classes da paleta
// padrão do Tailwind (bg-black/10, text-gray-600...) que, com a paleta
// desligada em app/globals.css, simplesmente não geram CSS — sem erro nenhum.
// Este script transforma essa falha silenciosa em erro de build.
//
// Uso:  npm run verificar:tokens                (varre app/, components/, lib/, hooks/)
//       node scripts/verificar-tokens.mjs <arquivo|pasta> ...
//
// Roda automaticamente antes de `npm run build` (script "prebuild"). Um falso
// positivo pode ser liberado com um comentário `tokens-ok: <motivo>` na mesma
// linha; o motivo é obrigatório e passa por revisão.

import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const RAIZ = process.cwd()
const PASTAS_PADRAO = ["app", "components", "lib", "hooks"]
const EXTENSOES = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"])
const IGNORAR_PASTAS = new Set(["node_modules", ".next", ".git"])
const LIBERACAO = /tokens-ok:\s*\S/

// --- Paleta padrão do Tailwind -------------------------------------------------

const PROPRIEDADES =
  "bg|text|border(?:-[xytrblse])?|divide|outline|ring(?:-offset)?|inset-ring|fill|stroke|from|via|to|shadow|inset-shadow|drop-shadow|decoration|accent|caret|placeholder"
const CORES =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white"

const NEUTROS = new Set(["slate", "gray", "zinc", "neutral", "stone"])
const FAMILIAS = [
  [["red", "rose"], "vermelho é o status recusada: danger (texto, borda, ícone) ou danger-bg (fundo)"],
  [["green", "emerald", "lime", "teal"], "verde é o status validada: success ou success-bg"],
  [["blue", "sky", "indigo", "cyan"], "azul é o status em análise: review ou review-bg"],
  [
    ["orange", "amber", "yellow"],
    "laranja/âmbar nunca é status. Ação: primary / primary-hover; texto ou link: text-accent-text; fundo suave: bg-accent-soft; gráfico ou ícone grande: brand",
  ],
  [["violet", "purple", "fuchsia", "pink"], "cor fora da identidade visual: escolha um token de CLAUDE.md"],
]

function sugestaoCor(prop, cor) {
  if (cor === "black") {
    return prop === "bg"
      ? "preto não existe na paleta: overlay de modal usa bg-foreground/{opacidade}"
      : `preto não existe na paleta: ${prop}-foreground`
  }
  if (cor === "white") {
    if (prop === "text") return "branco sobre a primária: text-primary-foreground"
    return `branco não existe na paleta: ${prop}-surface`
  }
  if (NEUTROS.has(cor)) {
    if (prop === "text") return "neutro: text-foreground (texto) ou text-muted-foreground (secundário)"
    if (prop === "bg") return "neutro: bg-surface, bg-background ou bg-muted (skeleton, fundo discreto)"
    return `neutro: ${prop}-border (separação) ou ${prop}-input-border (borda de campo)`
  }
  const familia = FAMILIAS.find(([cores]) => cores.includes(cor))
  return familia ? familia[1] : "use um token de cor de CLAUDE.md"
}

// --- Regras --------------------------------------------------------------------

const REGRAS = [
  {
    id: "paleta",
    padrao: new RegExp(
      `(?<![\\w-])(${PROPRIEDADES})-(${CORES})(?:-\\d{2,3})?(?:\\/[\\w.%\\[\\]]+)?(?![\\w-])`,
      "g"
    ),
    sugestao: (m) => sugestaoCor(m[1], m[2]),
  },
  {
    id: "contorno",
    padrao: /(?<![\w-])outline-(?:none|hidden)(?![\w-])|outline\s*:\s*["']?(?:none|0)(?![\w.])/g,
    sugestao: () =>
      "proibido suprimir o contorno: remova; o foco vem da regra global de :focus-visible",
  },
  {
    id: "anel-de-foco",
    padrao: /(?<![\w-])focus(?:-visible|-within)?:ring(?:-[\w/.%[\]-]+)?/g,
    sugestao: () => "remova: o foco é o contorno global de 2 px em --ring, sem anel extra",
  },
  {
    id: "modo-escuro",
    padrao: /(?<![\w-])dark:[^\s"'`]*/g,
    sugestao: () => "remova: o projeto não tem modo escuro",
  },
  {
    id: "sombra",
    padrao: /(?<![\w-])(?:inset-shadow|drop-shadow|shadow)(?:-(?:2xs|xs|sm|md|lg|xl|2xl))?(?![\w:-])/g,
    sugestao: () =>
      "sombra só existe como shadow-overlay e só em modal, dropdown e tooltip; em card ou campo, remova (separação por borda)",
  },
  {
    id: "peso",
    padrao: /(?<![\w-])font-(?:thin|extralight|light|semibold|extrabold|black)(?![\w-])/g,
    sugestao: (m) =>
      m[0].endsWith("semibold")
        ? "font-medium (rótulo) ou font-bold (título)"
        : "pesos permitidos: font-normal, font-medium, font-bold",
  },
  {
    id: "transicao",
    padrao: /(?<![\w-])transition(?:-all)?(?![\w-])/g,
    sugestao: () =>
      "transição só de cor, opacidade ou transform: transition-colors, transition-opacity ou transition-transform",
  },
  {
    id: "cn-direto",
    padrao: /from\s+["']cn["']/g,
    sugestao: () => 'importe de "@/lib/utils", que conhece os tokens próprios (text-h1, shadow-overlay...)',
  },
  {
    id: "hex",
    arquivos: /\.(?:tsx?|jsx?|mjs)$/,
    padrao: /(?<![\w&#])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g,
    sugestao: () => "nunca escreva hex no código: use a classe do token correspondente",
  },
  {
    id: "localstorage",
    exceto: /(?:^|\/)lib\/storage\.ts$/,
    padrao: /\b(?:localStorage|sessionStorage)\b/g,
    sugestao: () => "acesse dados somente pelas funções de lib/storage.ts",
  },
]

// --- Varredura -----------------------------------------------------------------

function listarArquivos(alvo, explicito) {
  const absoluto = path.resolve(RAIZ, alvo)
  let info
  try {
    info = statSync(absoluto)
  } catch {
    return []
  }
  if (info.isFile()) return explicito || EXTENSOES.has(path.extname(absoluto)) ? [absoluto] : []
  return readdirSync(absoluto, { withFileTypes: true }).flatMap((item) => {
    if (item.isDirectory() && IGNORAR_PASTAS.has(item.name)) return []
    return listarArquivos(path.join(absoluto, item.name), false)
  })
}

const alvos = process.argv.slice(2)
const arquivos = (alvos.length ? alvos : PASTAS_PADRAO).flatMap((alvo) =>
  listarArquivos(alvo, alvos.length > 0)
)

const violacoes = []
for (const arquivo of arquivos) {
  const relativo = path.relative(RAIZ, arquivo).split(path.sep).join("/")
  const linhas = readFileSync(arquivo, "utf8").split(/\r?\n/)
  linhas.forEach((linha, i) => {
    if (LIBERACAO.test(linha)) return
    for (const regra of REGRAS) {
      if (regra.exceto?.test(relativo)) continue
      if (regra.arquivos && !regra.arquivos.test(relativo) && !alvos.length) continue
      for (const m of linha.matchAll(regra.padrao)) {
        violacoes.push({
          local: `${relativo}:${i + 1}:${m.index + 1}`,
          regra: regra.id,
          trecho: m[0],
          sugestao: regra.sugestao(m),
        })
      }
    }
  })
}

if (violacoes.length === 0) {
  console.log(`verificar-tokens: nenhuma violação em ${arquivos.length} arquivo(s).`)
  process.exit(0)
}

for (const v of violacoes) {
  console.error(`${v.local}  [${v.regra}]  ${v.trecho}\n    → ${v.sugestao}`)
}
const total = new Set(violacoes.map((v) => v.local.split(":")[0])).size
console.error(
  `\nverificar-tokens: ${violacoes.length} violação(ões) em ${total} arquivo(s).` +
    "\nCorrija antes do build. Procedimento completo em CLAUDE.md, seção" +
    ' "Procedimento obrigatório após shadcn add".'
)
process.exit(1)
