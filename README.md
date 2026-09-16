# Horas Complementares · UFSCar Sorocaba

Sistema web de gestão pessoal de horas complementares, com perfis de discente e docente.
Esta versão é **somente frontend**: não há backend, autenticação real nem chamada de IA, e
todos os dados ficam no `localStorage` do navegador.

## Requisitos

- Node.js 20.9 ou superior (testado com Node 24)
- npm 10 ou superior

## Rodar localmente

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

Outros scripts:

| Comando | O que faz |
|---|---|
| `npm run build` | Roda o verificador de tokens e gera o build de produção. Precisa passar sem erro nem warning de tipo antes de cada commit. |
| `npm run start` | Serve o build de produção em <http://localhost:3000>. |
| `npm run lint` | Roda o ESLint. |
| `npm run verificar:tokens` | Acusa classes fora da identidade visual (paleta padrão do Tailwind, sombras, pesos, supressão de foco, `dark:`, hex no código, `localStorage` fora de `lib/storage.ts`, e os números 90, 15 e 6 fora de `lib/calculos.ts`). Obrigatório depois de cada `npx shadcn add`; veja `CLAUDE.md`. |

## Deploy na Vercel

O projeto não exige variáveis de ambiente.

**Pelo painel:**

1. Envie o repositório para o GitHub, GitLab ou Bitbucket.
2. Em <https://vercel.com/new>, importe o repositório.
3. A Vercel detecta o Next.js sozinha. Mantenha as opções padrão (build `npm run build`,
   saída `.next`) e clique em **Deploy**.

A cada push na branch principal, a Vercel publica uma nova versão; outras branches geram
URLs de pré-visualização.

**Pela linha de comando:**

```bash
npm i -g vercel
vercel          # primeira vez: vincula o projeto e publica uma prévia
vercel --prod   # publica em produção
```

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4, com os tokens da identidade visual em `app/globals.css`
- shadcn/ui (estilo `base-nova`) e lucide-react
- Fonte Inter via `next/font/google` (pesos 400, 500 e 700)

## Organização

```
app/            rotas (App Router) e globals.css com os tokens
components/ui/  componentes shadcn/ui ajustados à identidade visual
lib/            domínio e acesso a dados
  catalogo.ts     Tabela 7 do Projeto Pedagógico, como dado
  calculos.ts     regras de créditos e horas (funções puras)
  storage.ts      única porta de acesso a dados
  mock-data.ts    dados de demonstração
```

Toda leitura e escrita de dados passa por `lib/storage.ts`, com funções assíncronas que
simulam uma API. Para ligar o sistema a um backend real, basta trocar o corpo dessas funções;
os componentes não acessam o `localStorage` diretamente.

As regras de atividades complementares seguem o Projeto Pedagógico do BCDIA: cada tipo da
Tabela 7 vale créditos fixos, e a exigência para integralizar é de 90 horas. Detalhes em
`ADENDO-DOMINIO.md`.

As regras de identidade visual, acessibilidade e código estão em `CLAUDE.md`. A especificação
completa está em `PROMPT-INICIAL.md`.

## OCR de comprovantes

Na tela **Nova atividade**, anexe um PDF, JPG ou PNG e clique em **Ler comprovante**.
Confira o texto e os campos reconhecidos antes de confirmar. O processamento ocorre no
navegador, com Tesseract.js em português e PDF.js; os documentos não são enviados a uma API
de OCR. Até 10 MB e 5 páginas por PDF. O preenchimento manual permanece disponível.

`npm run dev` e `npm run build` preparam automaticamente os recursos em `public/ocr/` a
partir das dependências instaladas. Essa pasta é gerada, não precisa de upload manual.
Use `npm ci` após baixar/clonar o projeto. Os verificadores requerem Node 24+.

`npm run verificar:ocr` testa a extração. A classificação no catálogo continua explícita;
instituição e categoria textual revisadas são preservadas nas observações. Consulte
`HANDOFF.md` e a entrada de 2026-09-16 em `DEV-LOG.md` para limitações e testes realizados.
