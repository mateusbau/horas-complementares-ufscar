@AGENTS.md

# Horas Complementares · SeCoT XVIII

Sistema web de gestão pessoal de horas complementares para a UFSCar Sorocaba. Frontend
apenas, persistência local. A especificação completa (arquitetura, telas e ordem de execução)
está em `PROMPT-INICIAL.md`. **O modelo de domínio está em `ADENDO-DOMINIO.md`, que substitui
as seções 6 e 9 do prompt inicial** — onde houver conflito, vale o adendo. Leia os dois antes
de qualquer mudança. As seções 2, 3 e 4 abaixo são reproduzidas na íntegra do prompt inicial e
valem para todo prompt deste projeto.

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
`bg-orange-500` ou `text-gray-600` não geram CSS — e **não dão erro**: o elemento só fica sem
a cor. Para essa falha não passar despercebida, `scripts/verificar-tokens.mjs` roda antes de
todo `npm run build` e reprova o build se encontrar alguma classe ou padrão fora do sistema
(veja "Procedimento obrigatório após `shadcn add`"). Use apenas os tokens:

| Uso | Classes |
|---|---|
| Ação primária | `bg-primary`, `hover:bg-primary-hover`, `text-primary-foreground` |
| Laranja decorativo (nunca texto) | `bg-brand`, `fill-brand`, `stroke-brand` |
| Texto/link laranja | `text-accent-text` |
| Fundo suave / item ativo | `bg-accent-soft` |
| Neutros | `bg-background`, `bg-surface`, `bg-muted`, `border-border`, `border-input-border`, `text-foreground`, `text-muted-foreground` |
| Escurecimento de fundo (modal, menu deslizante) | somente `bg-overlay`, sem modificador de opacidade (ver "Decisão: overlay") |
| Trilha de gráfico (anel, barras de progresso) | `stroke-trilha`, `bg-trilha` — não use `border` como trilha: o alto contraste escurece a borda e o progresso em laranja some contra ela |
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

### Decisão: overlay

A identidade visual da seção 3 não define a cor de escurecimento atrás de modal. Decisão
tomada: token `--overlay` = `--foreground` (`#1C1917`) a **50 %** de opacidade, exposto como
`bg-overlay`. Os 50 % são o menor valor redondo em que a superfície branca do modal atinge
contraste de 3:1 contra o fundo escurecido (WCAG 1.4.11): 3,47:1 sobre a página e 3,35:1
sobre um card. A 40 % cairia para 2,5:1. É a **única** cor de overlay do sistema — modal,
confirmação e menu deslizante do mobile usam o mesmo `bg-overlay`, sem `/NN`. O valor é
escrito como `rgb(28 25 23 / 0.5)`, não com `color-mix()`: para `color-mix` o minificador gera
um fallback sem transparência, que deixaria o overlay opaco em navegador sem suporte. O verificador
reprova `bg-black/NN`, fundos neutros escuros translúcidos, `bg-foreground/NN` e
`bg-overlay/NN`.

### Regras de código

- **`cn`** vem de `@/lib/utils`, nunca direto do pacote `cn`: o de `lib/utils.ts` conhece os
  tokens próprios e não descarta `text-h1` ao juntar com `text-foreground`.
- **Componentes shadcn** só entram seguindo o procedimento abaixo. Modelo de componente já
  ajustado: `components/ui/button.tsx`.
- **`npm run verificar:tokens`** roda o verificador isoladamente; `npm run build` o executa
  antes (script `prebuild`), inclusive no deploy da Vercel. Um falso positivo pode ser
  liberado com o comentário `tokens-ok: <motivo>` na mesma linha — sempre com o motivo, que
  passa pela revisão.
- **Comentários também são lidos pelo Tailwind**: não escreva nomes de classe proibidos nem
  em comentário, porque o CSS delas é gerado mesmo assim.
- **Sem modo escuro**: a variante `dark:` está presa a uma classe `.dark` que nunca é aplicada.
- **Ícones de status** no lucide-react 1.x: `check-circle` → `CircleCheck`, `clock` → `Clock`,
  `circle-dashed` → `CircleDashed`, `x-circle` → `CircleX`.
- Textos da interface em português, reproduzidos literalmente da especificação.
- Um commit por etapa, mensagem em português, com `npm run build` limpo.
- **Toda etapa termina com uma entrada em `DEV-LOG.md`, no mesmo commit:** data, número e nome
  da etapa, o que foi feito, as decisões tomadas e o porquê de cada uma, e o que ficou
  pendente. Poucas linhas, em português, escritas para quem vai ler depois sem ter
  acompanhado — o arquivo vira a documentação do fluxo de desenvolvimento.

### Modelo de domínio (etapa 2)

Regra do BCDIA (`ADENDO-DOMINIO.md`): **a carga horária do certificado não é a que conta.**
Cada tipo da Tabela 7 vale créditos fixos; horas = créditos × `HORAS_POR_CREDITO`.

| Arquivo | Papel |
|---|---|
| `lib/catalogo.ts` | Tabela 7 como dado: 19 tipos, textos literais de requisito e comprovante, notas (*) e (**), grupos |
| `lib/calculos.ts` | Constantes e regras puras: progresso, "o que fecha o que falta", validações do cadastro, parecer |
| `lib/types.ts` | Tipos do domínio |
| `lib/mock-data.ts` | Seed da demonstração |
| `lib/storage.ts` | **Única** porta de dados; assíncrona, com atraso de 300 ms; só no navegador |
| `lib/formatacao.ts` | Números e datas em pt-BR ("66,7%", "4 créditos", "27/08/2025, 14h32") |
| `lib/ai/analise-comprovante.ts` | Encaixe da IA; devolve `{ disponivel: false }`, **não chamar** |

- **90, 15 e 6 só existem em `lib/calculos.ts`** (`HORAS_EXIGIDAS`, `HORAS_POR_CREDITO`,
  `CREDITOS_EXIGIDOS`). O verificador reprova esses números em qualquer outro arquivo; toda
  tela os obtém do `Progresso` ou das constantes. O fator de 15 h por crédito vem da
  definição de crédito da matriz curricular (PPC, Tabela 4); a confirmação com a coordenação
  segue pendente. Se mudar, muda só a constante.
- **Seção 3.5.4 do PPC** (ver `ADENDO-DOMINIO.md`, seção 10): nos tipos "N h/semestre" o aluno
  informa as horas do comprovante; créditos = arredondar para baixo(horas × créditos ÷ carga
  máxima), com teto por registro (um registro = um semestre). Integralizar exige os créditos
  **e** pelo menos dois tipos diferentes (`TIPOS_DISTINTOS_EXIGIDOS`).
- **Sem teto e sem mínimo.** `TETOS_POR_TIPO` fica vazio até a coordenação confirmar limites.
  Os grupos são só organização visual e, onde aparecerem, levam o texto `AVISO_AGRUPAMENTO`.
- **`tipoId: null`** = o aluno declarou algo fora da Tabela 7 (regra 1). Vale 0 crédito e não
  pode ser aprovado sem reclassificação.
- **`pendente`** = "a bola está com o aluno": tanto a atividade não enviada quanto a devolvida.
- **Fila derivada do status:** toda atividade `analise`, de qualquer discente, está na fila do
  docente, da mais antiga para a mais recente. O que a Ana envia entra na fila; o parecer
  atualiza o registro dela.
- **Palestras acumulam entre registros:** nos tipos por unidade, a soma validada é convertida
  de uma vez, então duas palestras em registros separados valem 1 crédito. Nos tipos em horas,
  cada registro é convertido com o próprio teto, e os créditos se somam.
- **Reclassificação** (tela 07) pode ajustar a quantidade, porque a unidade muda com o tipo, e
  exige justificativa quando algo muda.
- **Datas do seed são relativas** ao momento em que ele é criado (primeira visita ou
  "Reiniciar demonstração"): a fila começa com esperas de 9, 9, 8, 3 e 1 dias (Bruno, Carla,
  Ana, Diego, Elisa) — três acima de 7 dias, como diz o indicador da tela 06.
- Violação de regra lança `ErroDeRegra`, com mensagens em `erros` prontas para a tela.

### Régua do crédito (vale para todas as telas)

**O crédito é a medida principal; a hora é consequência, nunca protagonista.**

- Todo indicador primário mostra créditos: "4 de 6 créditos".
- A hora aparece em dois lugares apenas: como requisito dentro do tipo de atividade (texto da
  Tabela 7, ex.: "180 h/semestre valem 3 créditos") e como total secundário, sempre rotulado
  sem ambiguidade — "60 de 90 horas contabilizadas", nunca "60 horas cumpridas".
- Motivo: a carga do certificado não é a carga contabilizada. Uma eletiva de 40 h vale 2
  créditos, ou seja, 30 horas contabilizadas. Se a interface disser só "horas", o aluno soma os
  certificados, chega a outro número e conclui que o sistema errou.
- "Categoria" não existe: use o tipo da Tabela 7 e os quatro grupos visuais, sempre com
  `AVISO_AGRUPAMENTO`. Nenhuma barra ou indicador sugere mínimo por grupo.
- Números por extenso, sem abreviação: "4 créditos", "30 horas" (`lib/formatacao.ts`). Os
  textos literais da Tabela 7 ("180 h/semestre") são a exceção, porque são citação.

### Procedimento obrigatório após `shadcn add`

Os componentes shadcn chegam com classes da paleta padrão (o overlay do `dialog` usa
`bg-black/10`), `outline-none`, anéis `focus-visible:ring-*`, classes `dark:`, alvos de 24 a
32 px e textos em inglês. Com a paleta desligada, as cores simplesmente não geram CSS: o modal
abre sem escurecer o fundo e nada acusa o problema. **Nenhum componente adicionado é commitado
sem passar por todos estes passos:**

1. **Comece com a árvore limpa** (`git status`), para que o diff mostre só o que o shadcn trouxe.
2. **Veja antes o que será gravado:** `npx shadcn@latest add <componente> --dry-run`. Se algum
   arquivo existente aparecer como `overwrite` (o `dialog` depende do `button` e tenta
   sobrescrever `components/ui/button.tsx`), rode o `add` sem flags e **responda N** quando ele
   perguntar se deve sobrescrever. **Nunca use `-o`/`--overwrite`.** Se algo já ajustado foi
   sobrescrito, desfaça com `git restore <arquivo>`.
3. **Rode `npm run verificar:tokens`** e corrija cada item. Cada violação mostra o arquivo, a
   linha e o token substituto. Referência rápida:

   | Chega do shadcn | Vira |
   |---|---|
   | `bg-black/NN`, `bg-zinc-950/NN` e todo fundo escuro translúcido (overlay) | `bg-overlay`, sempre, sem `/NN` |
   | `text-white` / `bg-white` | `text-primary-foreground` / `bg-surface` |
   | cinzas (`gray`, `zinc`, `neutral`, `stone`, `slate`) | `text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border`, `border-input-border` |
   | vermelhos / verdes / azuis | `danger` / `success` / `review` (com `-bg` para fundo) |
   | laranja ou âmbar | nunca status: `primary`, `text-accent-text`, `bg-accent-soft`, `brand` |
   | `shadow`, `shadow-xs`, `shadow-sm` | remover (separação por borda) |
   | `shadow-md`, `shadow-lg`, `shadow-xl` em modal, dropdown ou tooltip | `shadow-overlay` |
   | `font-semibold` | `font-medium` (rótulo) ou `font-bold` (título) |
   | `outline-none`, `outline-hidden`, `focus-visible:ring-*` | remover (o foco é global) |
   | `dark:*` | remover |
   | `transition-all`, `transition` | `transition-colors`, `transition-opacity` ou `transition-transform` |
   | `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` |

4. **Revise à mão o que o script não detecta:**
   - **alvo de 44 px:** `h-6`, `h-7`, `h-8`, `size-6` a `size-9` em elementos clicáveis viram
     `min-h-target` ou `size-target`. Os tamanhos `xs`, `sm` e `icon-sm` do botão não existem
     aqui (o TypeScript acusa quando um componente os usa);
   - **linha de tabela:** `h-10` vira `h-row`;
   - **tipografia:** `text-sm`, `text-base` e `leading-none` viram `text-label`, `text-body` ou
     `text-caption`; o título de modal segue a escala (`text-h2`);
   - **idioma:** textos em inglês, inclusive os `sr-only` ("Close" vira "Fechar");
   - **mobile e A+:** `whitespace-nowrap` que possa estourar em 375 px ou com texto a 125 %;
   - **`git diff app/globals.css`:** o shadcn pode injetar variáveis em `oklch(...)` e um bloco
     `.dark`; remova-os ou aponte-os para os tokens existentes.
5. **`npm run build`**: o `prebuild` roda o verificador de novo, e o build falha se sobrar
   alguma violação.
6. **Verifique no navegador** (Tab, 375 px, A+) e só então commite.
