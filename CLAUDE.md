@AGENTS.md

# Horas Complementares · SeCoT XVIII

Sistema web de gestão pessoal de horas complementares para a UFSCar Sorocaba. Frontend
apenas, persistência local. A especificação completa (arquitetura, regras de domínio, telas,
dados de demonstração e ordem de execução) está em `PROMPT-INICIAL.md` — leia antes de
qualquer mudança. As seções abaixo são reproduzidas na íntegra daquele documento e valem para
todo prompt deste projeto.

A avaliação é anônima: nenhum nome de equipe ou de integrante pode aparecer na interface.

---

## 2. Stack — fechada, não sugerir alternativas

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS**
- **shadcn/ui** — inicializar em modo não interativo (`npx shadcn@latest init -d`)
- **lucide-react** como única biblioteca de ícones
- **Inter** via `next/font/google`, pesos 400, 500 e 700 apenas
- **localStorage** como persistência, acessado somente através de `lib/storage.ts`
- Deploy na **Vercel**, sem variáveis de ambiente obrigatórias

Restrições técnicas:

- Sem backend, sem banco, sem API externa, sem NextAuth. O login é simulado.
- Sem modo escuro.
- Se o Tailwind instalado for a **v4**, declare os tokens em `@theme inline` dentro de
  `app/globals.css` e não crie um `tailwind.config.js` desnecessário. Se for **v3**, use o
  `tailwind.config.ts` normalmente. Informe qual versão foi instalada.
- `npm run build` **precisa passar sem erro nem warning de tipo** antes de qualquer commit.

---

## 3. CONTEXTO VISUAL OBRIGATÓRIO — seguir sem exceção

> Este bloco é a identidade visual já fechada pela equipe. Ele vale para **todas** as telas e
> deve ser reproduzido em `CLAUDE.md` para valer nos próximos prompts também.

**Stack visual.** Next.js + React + Tailwind + shadcn/ui. Fonte Inter via next/font, pesos
400, 500 e 700 apenas.

**Cores.** Primária de ação `#C2410C` (hover `#9A3412`); laranja decorativo `#EA580C` somente
em gráficos e ícones grandes, **nunca em texto**; texto/link laranja `#9A3412`; fundo suave
`#FFF7ED`. Fundo da página `#FAFAF9`, superfície `#FFFFFF`, borda `#E7E5E4`, borda de campo
`#78716C`, texto `#1C1917`, texto secundário `#57534E`. Status: validada `#15803D`, em análise
`#1D4ED8`, pendente `#57534E`, recusada `#B91C1C`. **Nenhum status usa laranja ou âmbar** — a
cor da marca nunca é cor de status.

**Tipografia.** h1 32/700, h2 24/700, h3 20/500, corpo 16/400, label 14/500, legenda 12/400.
Altura de linha 1,5 no corpo, 1,2 nos títulos, 1,45 em texto secundário. Pesos abaixo de 400
proibidos. Números em tabelas com `font-variant-numeric: tabular-nums`.

**Forma e espaço.** Espaçamento sempre em múltiplos de 4 px (8 entre elementos relacionados,
16 entre grupos, 24 entre blocos, 32 entre seções). Conteúdo com máximo de 1200 px;
formulários e texto corrido com máximo de 640 px. Raio único de 8 px, pílula apenas em badge.
Separação por **borda** de 1 px — sombra somente em modal, dropdown e tooltip, nunca em card
estático. Transições de 160 ms em `cubic-bezier(0.2, 0, 0, 1)`, aplicadas apenas a cor,
opacidade e transform.

**Estrutura.** Barra lateral fixa de 240 px, recolhida em menu deslizante abaixo de 768 px.
Item ativo marcado por **três sinais simultâneos**: fundo `#FFF7ED`, barra esquerda de 3 px em
`#C2410C` e peso 500 no rótulo. Toda página tem, nesta ordem: link "Pular para o conteúdo"
(visível só no foco), h1 (32/700) à esquerda, subtítulo de uma linha em texto secundário
abaixo, ação primária alinhada à direita na mesma altura do h1, e o conteúdo a 32 px do
cabeçalho. **Sem exceção, em todas as telas.**

**Densidade.** Tabelas e listas compactas, com linha de 44 px. Painéis e formulários arejados.

**Acessibilidade obrigatória.** Status sempre com cor + ícone + texto. Label visível acima de
todo campo, nunca placeholder como label. Campo obrigatório sinalizado pela palavra
"obrigatório", não por asterisco. Foco visível de 2 px em `#1C1917` com folga de 2 px via
`:focus-visible`; **`outline: none` está proibido em qualquer ponto do código**. Alvo clicável
mínimo de 44×44 px. Um único h1 por página, sem pular níveis de título. Ícone decorativo com
`aria-hidden="true"`; ícone sozinho em botão com `aria-label`.

**Desktop primeiro**, com verificação obrigatória em 375 px ao final de cada tela. Nenhuma
tela pode quebrar no mobile.

---

## 4. Tokens — colar em `app/globals.css`

```css
:root {
  /* Marca */
  --brand:            #EA580C;  /* decorativo, nunca texto */
  --primary:          #C2410C;
  --primary-hover:    #9A3412;
  --primary-fg:       #FFFFFF;
  --accent-text:      #9A3412;
  --accent-soft:      #FFF7ED;

  /* Neutros quentes */
  --background:       #FAFAF9;
  --surface:          #FFFFFF;
  --border:           #E7E5E4;
  --input-border:     #78716C;
  --foreground:       #1C1917;
  --muted-foreground: #57534E;

  /* Status */
  --success: #15803D;  --success-bg: #F0FDF4;
  --review:  #1D4ED8;  --review-bg:  #EFF6FF;
  --pending: #57534E;  --pending-bg: #F5F5F4;
  --danger:  #B91C1C;  --danger-bg:  #FEF2F2;

  /* Foco, forma e movimento */
  --ring:        #1C1917;
  --ring-offset: #FFFFFF;
  --radius:      0.5rem;
  --duration:    160ms;
  --ease:        cubic-bezier(0.2, 0, 0, 1);
}

/* Foco visível em tudo que recebe teclado */
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* Números alinhados em coluna nas tabelas de horas */
table, .tabular { font-variant-numeric: tabular-nums; }

/* Movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Exponha esses tokens ao Tailwind (via `@theme inline` na v4 ou `theme.extend` na v3) para que
as classes utilitárias usem os mesmos valores. **Nunca escreva um hex solto no JSX.**

---

## Convenções deste repositório

Decisões tomadas na etapa 1 (Fundação) para aplicar as seções acima na prática.

### Versões instaladas

Next.js 16 (App Router, Turbopack), React 19, **Tailwind CSS v4** (tokens em `@theme inline`
em `app/globals.css`, sem `tailwind.config`), shadcn/ui 4 no estilo `base-nova` (componentes
sobre `@base-ui/react`), lucide-react 1.x.

### Classes utilitárias disponíveis

A paleta padrão do Tailwind está **desligada** (`--color-*: initial`). Classes como
`bg-orange-500` ou `text-gray-600` não geram CSS; use apenas os tokens:

| Uso | Classes |
|---|---|
| Ação primária | `bg-primary`, `hover:bg-primary-hover`, `text-primary-foreground` |
| Laranja decorativo (nunca texto) | `bg-brand`, `fill-brand`, `stroke-brand` |
| Texto/link laranja | `text-accent-text` |
| Fundo suave / item ativo | `bg-accent-soft` |
| Neutros | `bg-background`, `bg-surface`, `bg-muted`, `border-border`, `border-input-border`, `text-foreground`, `text-muted-foreground` |
| Status | `text-success` + `bg-success-bg`, `text-review` + `bg-review-bg`, `text-pending` + `bg-pending-bg`, `text-danger` + `bg-danger-bg` |
| Tipografia | `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-label`, `text-caption` (tamanho, altura de linha e peso juntos) |
| Altura de linha | `leading-heading` (1,2), `leading-body` (1,5), `leading-secondary` (1,45) |
| Pesos | somente `font-normal`, `font-medium`, `font-bold` |
| Larguras | `max-w-content` (1200 px), `max-w-form` (640 px), `w-sidebar` (240 px) |
| Alvo e linha de 44 px | `min-h-target`, `size-target`, `h-row` — nunca abaixo de 44 px, mesmo em A− |
| Raio | `rounded-lg` (8 px; todas as variações de `rounded-*` valem 8 px); `rounded-full` só em badge |
| Sombra | somente `shadow-overlay`, e só em modal, dropdown e tooltip |
| Transição | `transition-colors`, `transition-opacity`, `transition-transform` (160 ms e easing já são o padrão) |

`h1`, `h2` e `h3` já recebem a escala tipográfica pela camada base.

### Regras de código

- **`cn`** vem de `@/lib/utils`, nunca direto do pacote `cn`: o de `lib/utils.ts` conhece os
  tokens próprios e não descarta `text-h1` ao juntar com `text-foreground`.
- **Componentes shadcn** adicionados com `npx shadcn@latest add` precisam ser ajustados antes
  do commit: remover as classes que suprimem o contorno de foco e os anéis `focus-visible:ring-*`
  (o foco é global), remover as classes `dark:`, trocar `shadow-*` por `shadow-overlay` (ou
  nada), trocar `font-semibold` por `font-medium`/`font-bold`, garantir alvo de 44 px e usar
  `transition-colors` em vez de `transition-all`. Veja `components/ui/button.tsx` como modelo.
- **Comentários também são lidos pelo Tailwind**: não escreva nomes de classe proibidos nem
  em comentário, porque o CSS delas é gerado mesmo assim.
- **Sem modo escuro**: a variante `dark:` está presa a uma classe `.dark` que nunca é aplicada.
- **Ícones de status** no lucide-react 1.x: `check-circle` → `CircleCheck`, `clock` → `Clock`,
  `circle-dashed` → `CircleDashed`, `x-circle` → `CircleX`.
- Textos da interface em português, reproduzidos literalmente da especificação.
- Um commit por etapa, mensagem em português, com `npm run build` limpo.
