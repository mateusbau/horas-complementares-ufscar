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
| `npm run verificar:tokens` | Acusa classes fora da identidade visual (paleta padrão do Tailwind, sombras, pesos, supressão de foco, `dark:`, hex no código, `localStorage` fora de `lib/storage.ts`). Obrigatório depois de cada `npx shadcn add`; veja `CLAUDE.md`. |

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
lib/            utilitários; nas próximas etapas, domínio e acesso a dados
```

Toda leitura e escrita de dados passará por `lib/storage.ts`, com funções assíncronas que
simulam uma API. Para ligar o sistema a um backend real, basta trocar o corpo dessas funções;
os componentes não acessam o `localStorage` diretamente.

As regras de identidade visual, acessibilidade e código estão em `CLAUDE.md`. A especificação
completa está em `PROMPT-INICIAL.md`.
