# PROMPT INICIAL — Sistema de Gestão de Horas Complementares (SeCoT XVIII)

> Como usar: salve este arquivo na raiz de uma pasta vazia, abra o Claude Code nela e diga:
> **"Leia PROMPT-INICIAL.md e execute do início ao fim, parando ao final de cada etapa para eu revisar."**

---

## 1. Papel e objetivo

Você é o desenvolvedor frontend deste projeto. Construa a **primeira versão navegável** de um
sistema web de gestão pessoal de horas complementares para a UFSCar Sorocaba, pronta para
deploy na Vercel.

Esta etapa é **exclusivamente frontend**: interface, navegação, estados e coerência visual.
Não há backend, não há autenticação real, não há chamada de IA. Toda a persistência é local.
Outros desenvolvedores integrarão funcionalidades (incluindo análise de comprovante por IA)
em cima do que você entregar — por isso a camada de dados precisa estar **isolada da UI**.

O resultado é avaliado por uma banca em cinco critérios de peso igual: **Utilidade,
Praticidade, Acessibilidade, Criatividade e Qualidade do Protótipo**. A avaliação é anônima:
nenhum nome de equipe ou de integrante pode aparecer na interface.

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

## 5. Arquitetura

```
app/
  layout.tsx                  · html lang="pt-BR", Inter, barra de acessibilidade, região aria-live
  globals.css
  page.tsx                    · 01 Login e seleção de perfil
  (discente)/
    layout.tsx                · sidebar perfil discente
    painel/page.tsx           · 02
    atividades/page.tsx       · 03
    atividades/nova/page.tsx  · 04
    atividades/[id]/page.tsx  · 05
    relatorio/page.tsx        · relatório imprimível
    catalogo/page.tsx  simulador/page.tsx  avisos/page.tsx  ajuda/page.tsx
  (docente)/
    layout.tsx                · sidebar perfil docente
    docente/page.tsx          · 06
    docente/fila/page.tsx     · fila completa
    docente/validacao/[id]/page.tsx    · 07
    docente/validacao/lote/page.tsx    · 07 variação em lote
    docente/orientandos/page.tsx  docente/relatorio/page.tsx
components/
  layout/     · Sidebar, PageHeader, SkipLink, BarraAcessibilidade, MobileNav
  ui/         · shadcn
  atividade/  · StatusBadge, TabelaAtividades, LinhaAtividade, FiltroStatus, EstadoVazio
  progresso/  · AnelProgresso, BarraCategoria, CardCategoria
  feedback/   · Skeleton, EstadoVazio, EstadoErro, RegiaoAoVivo
lib/
  types.ts        · tipos do domínio
  storage.ts      · ÚNICA porta de acesso a dados
  mock-data.ts    · seed
  calculos.ts     · regras de horas (puras, testáveis)
  ai/analise-comprovante.ts   · seam para a integração futura
```

### `lib/storage.ts` — regra central

Toda leitura e escrita de dados passa por funções **assíncronas** que retornam `Promise`,
simulando uma API real com um atraso artificial de ~300 ms:

```ts
export async function listarAtividades(): Promise<Atividade[]>
export async function obterAtividade(id: string): Promise<Atividade | null>
export async function criarAtividade(dados: NovaAtividade): Promise<Atividade>
export async function atualizarAtividade(id: string, patch: Partial<Atividade>): Promise<Atividade>
export async function obterProgresso(): Promise<Progresso>
export async function listarFilaValidacao(): Promise<ItemFila[]>
export async function registrarParecer(id: string, parecer: Parecer): Promise<Atividade>
export async function exportarEstado(): Promise<string>   // JSON
export async function importarEstado(json: string): Promise<void>
export async function reiniciarDemo(): Promise<void>      // volta ao seed
```

Nenhum componente pode chamar `localStorage` diretamente. Quando a API real existir, basta
trocar o corpo dessas funções. O atraso artificial não é enfeite: ele **obriga** todas as telas
a terem estado de carregando de verdade, que a banca vai ver.

> **Armadilha do Next.js:** `localStorage` não existe no servidor. Acesse-o apenas dentro de
> `useEffect` em componentes `"use client"`, e renderize skeleton até os dados chegarem. Se
> houver erro de hidratação em qualquer tela, corrija antes de commitar.

### `lib/ai/analise-comprovante.ts` — seam para a próxima etapa

Crie a interface e um stub que hoje devolve `{ disponivel: false }`. **Não a chame em lugar
nenhum e não mostre nada disso na interface** — é apenas o ponto de encaixe documentado para
os outros devs:

```ts
export type AnaliseComprovante = {
  disponivel: boolean
  cargaHorariaDetectada?: number
  tituloDetectado?: string
  categoriaSugerida?: CategoriaId
  confianca?: number
  avisos?: string[]
}
export async function analisarComprovante(arquivo: File): Promise<AnaliseComprovante>
```

---

## 6. Regras de domínio

Três categorias, cada uma com carga própria e **carga mínima exigida**:

| Categoria | Teto | Mínimo exigido |
|---|---|---|
| Ensino | 60 h | 30 h |
| Pesquisa | 70 h | 40 h |
| Extensão | 70 h | 40 h |
| **Total do curso** | **200 h** | — |

Regras em `lib/calculos.ts`, funções puras:

- Horas contabilizadas em uma categoria nunca ultrapassam o teto dela.
- O total é a soma das horas contabilizadas, limitado a 200 h.
- Apenas atividades com status `validada` contam para o progresso.
- Um aluno só integraliza se atingir o total **e** o mínimo de cada categoria — é isso que o
  marcador de mínimo comunica na tela 02.

Status possíveis, sempre com cor + ícone + texto:

| Status | Cor / fundo | Ícone | Rótulo |
|---|---|---|---|
| `validada` | `#15803D` / `#F0FDF4` | `check-circle` | Validada |
| `analise` | `#1D4ED8` / `#EFF6FF` | `clock` | Em análise |
| `pendente` | `#57534E` / `#F5F5F4` | `circle-dashed` | Pendente de envio |
| `recusada` | `#B91C1C` / `#FEF2F2` | `x-circle` | Recusada |

---

## 7. Barra de acessibilidade global

Fixa no topo, acima de tudo, em todas as telas, incluindo o login. Três controles:

1. **Alto contraste** — alterna uma classe no `<html>` que aumenta o contraste de bordas e
   texto secundário. Preferência persistida.
2. **Tamanho do texto — A− / A / A+** — altera a `font-size` base do `<html>` entre 87,5 %,
   100 % e 125 %. Como todo o layout usa `rem`, a interface acompanha. **Teste que nenhuma
   tela quebra em A+.** Preferência persistida.
3. **Atalhos de teclado** — abre um modal listando os atalhos disponíveis.

Mudanças de preferência anunciadas em uma região `aria-live="polite"` única no layout raiz.

---

## 8. Telas — especificação

O protótipo de referência já define textos, hierarquia e comportamento. Reproduza os textos
**literalmente**; eles foram escritos para a banca.

### 01 · Login e seleção de perfil — `/`
Sem barra lateral. Card centralizado, coluna de 640 px máximo.
- Título "Horas Complementares", subtítulo "Sistema de gestão · UFSCar Sorocaba", logo acima.
- **Perfil de acesso · obrigatório**: dois cartões selecionáveis, *Discente* e *Docente*,
  implementados como `radiogroup` navegável por Tab e setas. Texto de apoio: "Selecionado com
  Tab e setas. O perfil define a navegação após a entrada."
- Campos: "Número UFSCar ou e-mail institucional", "Senha". Link "Esqueci minha senha".
- Botão primário **Entrar**; botão secundário **Entrar como visitante (dados de demonstração)**
  — este é o caminho que a banca vai usar, então deve funcionar em um clique e cair no painel
  do perfil selecionado.
- Rodapé: "Acesso institucional. Em caso de dúvida procure a Secretaria de Coordenação de
  Curso · SeCoT XVIII".
- Mobile 375 px: mesma ordem, barra de acessibilidade compacta.

### 02 · Painel do Discente — `/painel`
h1 "Painel", subtítulo "Acompanhe o andamento das suas horas complementares no curso.", ação
primária **Nova atividade**.
> Reescrito em 2026-09-15 pelo modelo de créditos (`ADENDO-DOMINIO.md`, seções 5 e 10) e pela
> régua do crédito (`CLAUDE.md`): o crédito é a medida principal; a hora aparece só como
> requisito do tipo ou como "horas contabilizadas". Não há categoria, teto nem mínimo.

- **Seu progresso** (nível 1): anel SVG com o laranja decorativo `#EA580C` sobre trilha
  `#E7E5E4`. Ao centro, "4 de 6" e "créditos"; ao lado, "66,7% concluído", "60 de 90 horas
  contabilizadas" e "Faltam 2 créditos (30 horas contabilizadas) para a integralização." O
  anel tem `role="img"` e `aria-label` com o mesmo texto. Abaixo, com ícone e texto, a
  exigência da seção 3.5.4 do PPC: "Tipos de atividade diferentes: 2 de 2 — exigência cumprida."
- **O que fecha o que falta** (nível 2): "Faltam 2 créditos. Isso equivale a, por exemplo:" e
  uma opção por nível de esforço, do mais simples ao mais difícil de conseguir (classificação
  `NIVEIS_ESFORCO`): "4 palestras não associadas a eventos · 2 créditos", "40 horas de
  disciplina eletiva · 2 créditos", "120 horas de participação em projeto · 2 créditos", "1
  publicação de resumo ou pôster · 2 créditos". Cada opção cita o requisito da Tabela 7 (ex.:
  "180 h/semestre valem 3 créditos").
- **De onde vieram seus créditos**: uma barra por grupo visual (Ensino e monitoria, Pesquisa e
  publicações, Extensão e eventos, Representação estudantil), em relação aos 6 créditos
  exigidos, com os tipos que contribuíram. **Sem marcador de mínimo**, sempre com o texto de
  `AVISO_AGRUPAMENTO`.
- **Acesso rápido**: quatro cards — Simulador de créditos ("Teste combinações antes de
  registrar."), Catálogo de atividades ("O que é aceito e quanto vale cada tipo."), Relatório
  ("Gere o comprovante consolidado."), Central de avisos ("Prazos e retornos dos docentes.")
  com contador real das atividades que aguardam ação do aluno ("2 atividades aguardam sua
  ação"), no lugar do "3 novos" fixo, que não correspondia a nenhum dado.

### 03 · Minhas atividades — `/atividades`
h1 "Minhas atividades", subtítulo "7 registros · 4 de 6 créditos contabilizados.", ação
**Nova atividade**.
> Reescrito em 2026-09-15 pela régua do crédito (`CLAUDE.md`) e por `PROXIMA-ETAPA.md`: colunas
> "Tipo" (da Tabela 7) e "Créditos"; as horas contabilizadas aparecem só no rodapé, com a fonte
> do fator crédito → hora (`formatarPremissaCredito`). Não há "categoria" nem teto.
- Busca "Buscar por título ou tipo" e filtro de status como grupo de chips com contagem:
  Todos · 7 / Validadas · 2 / Em análise · 2 / Pendentes · 2 / Recusadas · 1. Filtro e busca
  funcionais.
- Tabela com colunas Atividade, Tipo, Créditos, Período, Status. A coluna Créditos mostra o
  que a atividade vale pelo tipo declarado, mesmo antes de validada (só o parecer confirma).
  Linhas de 44 px, linha inteira clicável levando ao detalhe, ordenável por créditos e por
  período.
- Rodapé: "Mostrando 7 de 7 registros" · "Total: 4 créditos · 60 horas contabilizadas." — o
  total reflete só as atividades validadas, igual ao painel, não a lista filtrada.
- **Mobile**: a tabela vira lista de cards — "título" na primeira linha e
  "tipo · créditos · período" na segunda, com o badge. Nunca scroll horizontal.
- **Estado vazio** (rota acessível para demonstração, ex. `?demo=vazio`): h3 "Você ainda não
  registrou atividades", texto "Registre cursos, monitorias, projetos de extensão e pesquisa
  para contabilizar créditos. Consulte o catálogo para saber quanto vale cada tipo.", botão
  primário "Registrar primeira atividade" e link "Ver catálogo de atividades aceitas".

### 04 · Nova atividade — `/atividades/nova`
Coluna de 640 px. h1 "Nova atividade", subtítulo "Preencha os dados e anexe o comprovante para
envio ao docente validador.", ação secundária **Ver catálogo**.
> Reescrito em 2026-09-15 pelo modelo de créditos e por `PROXIMA-ETAPA.md`, item 4: "categoria"
> e "carga horária livre" saem; entram o tipo da Tabela 7 e a quantidade na unidade dele, com a
> regra do teto por semestre explicada em linguagem comum (`formatarExplicacaoRequisito`).
- **Título da atividade · obrigatório** — apoio: "Use o nome que aparece no certificado."
- **Tipo de atividade · obrigatório** — select com os 19 tipos da Tabela 7 pelo nome completo,
  mais a opção "Não encontrei um tipo correspondente" (`tipoId: null`). Ao escolher um tipo, o
  apoio passa a mostrar o comprovante exigido, literal da tabela; nos tipos "N h/semestre",
  também a explicação da carga máxima: "Este tipo reconhece até 180 horas por semestre, que
  valem 3 créditos. Menos horas valem proporcionalmente, sempre arredondando para baixo — por
  exemplo, 90 horas valem 1 crédito." Ao escolher "Não encontrei…", aviso (não bloqueia o
  envio): "Esta atividade não corresponde a nenhum tipo da Tabela 7 do Projeto Pedagógico.
  Pelo Projeto Pedagógico, atividades fora da tabela só são validadas com aprovação do
  conselho do curso. Consulte o catálogo: se houver um tipo equivalente, escolha-o antes de
  enviar."
- **Quantidade · obrigatório** (some com o tipo) — rótulo e sufixo mudam com o tipo escolhido:
  "Quantas horas de monitoria constam no comprovante?" ou "Quantas palestras?". Nos tipos em
  horas, acima do máximo do semestre mostra aviso, não erro: "Este tipo reconhece no máximo
  180 horas por semestre, que valem 3 créditos. Horas acima disso não são validadas. Se a
  atividade durou mais de um semestre, registre cada semestre separadamente."
- **Confirmações condicionais**, exigidas antes do envio conforme o tipo (seção 3 do
  `ADENDO-DOMINIO.md`): caixa de seleção com a nota (*) da dupla contagem, ou com a nota (**)
  do semestre completo (Monitoria).
- **Período de realização** — Início e Término, opcional.
- **Anexar comprovante · obrigatório** — área de arrastar e soltar com texto "Arraste o arquivo
  ou selecione no computador", apoio com o comprovante exigido pelo tipo (ou "PDF, JPG ou PNG
  até 10 MB" antes de escolher o tipo) e botão "Selecionar arquivo". A área precisa ser
  **operável por teclado** e não depender de arrastar. Depois de escolhido, mostra nome e
  tamanho ("certificado-git-secot.pdf · 1,2 MB") com botão de remover.
- **Observações para o docente** — "Opcional · descreva o que foi realizado, caso o certificado
  não deixe claro."
- Ações: **Enviar para validação** (primário) e **Salvar rascunho**, com indicador
  "Rascunho salvo há 2 min" (autosave real no storage).
- **Validação dispara ao sair do campo (`onBlur`), nunca a cada tecla**, com as duas exceções
  da tela 01 (campo nunca editado; foco indo para um botão do formulário). Ao enviar com erro,
  o foco vai para o primeiro campo inválido e um resumo de erros é anunciado em `aria-live`.

### 05 · Detalhe da atividade · discente — `/atividades/[id]`
Link "Voltar para Minhas atividades". h1 com o título da atividade, subtítulo
"Ensino · 18 h solicitadas · enviada em 20/08/2025.", ação **Reenviar comprovante**.
- Coluna esquerda: pré-visualização do comprovante, com "Página 1 de 1 · imagem do certificado".
- Coluna direita:
  - **Situação** — linha do tempo vertical: "Enviada para validação · 20/08", "Analisada pelo
    docente · 27/08", "Devolvida com pendência · aguarda sua ação · 27/08".
  - **Dados da atividade** — Categoria, Carga solicitada, Período, Validador (Prof.ª Renata
    Marques).
  - **Parecer do docente** — bloco com o badge do status e o texto: "O certificado não informa
    a carga horária total. Reenvie o documento com a carga declarada ou anexe a declaração da
    organização do evento." Assinado "Prof.ª Renata Marques · 27/08/2025, 14h32". Botão
    **Responder ao docente**.
- Mobile: coluna única, comprovante colapsado com "Toque para ampliar o comprovante".

### 06 · Painel do Docente — `/docente`
h1 "Painel do docente", subtítulo "14 atividades aguardam validação · a mais antiga espera há
9 dias.", ação **Abrir fila de validação**.
- Quatro indicadores: Aguardando validação · **14** · "3 há mais de 7 dias"; Validadas no
  semestre · **132** · "165 créditos homologados"; Devolvidas com pendência · **7** · "Aguardando
  o discente"; Orientandos ativos · **38** · "Turma 2022 · BCDIA".
- **Fila de validação**, "Ordenada por tempo de espera", colunas Discente, Atividade,
  Categoria, Horas, Espera, Status. Rodapé "Mostrando 5 de 14 na fila" e link "Ver fila
  completa".
- Cards de acesso: Meus orientandos, Relatório da turma, Catálogo, **Trocar de perfil**
  ("Voltar à visão de discente.").

### 07 · Validação da atividade · docente — `/docente/validacao/[id]`
Link "Voltar para a fila · 14 pendentes". h1 "Monitoria de Cálculo II", subtítulo "Bruno
Okamoto · RA 812345 · Ensino · 30 h solicitadas · espera há 9 dias." Ações **Validar em lote**
e **Próxima da fila**.
- Esquerda: comprovante, "Página 1 de 2 · declaração assinada pela coordenação".
- Direita:
  - **Dados enviados** — Categoria "Ensino · monitoria", Período, **Progresso do discente**
    "104 de 200 h", **Teto da categoria** "30 de 60 h usadas". Esse contexto é o que evita o
    docente homologar acima do teto.
  - **Parecer do docente** — campo "Carga horária a homologar" (numérico, sufixo "horas") com
    apoio "Você pode homologar uma carga menor que a solicitada."; botão primário
    **Aprovar 30 h** cujo rótulo acompanha o valor digitado.
  - Campo "Comentário para o discente · obrigatório ao devolver ou recusar", com apoio
    "Explique o que precisa ser corrigido ou o motivo da recusa."
  - **Devolver com pendência** e **Recusar atividade**, este último com o aviso "A recusa exige
    justificativa e não pode ser desfeita pelo discente." Recusar abre confirmação em modal.

### 07b · Validação em lote — `/docente/validacao/lote`
h1 "Validação em lote", subtítulo "Atividades da mesma categoria e do mesmo tipo de
comprovante, revisadas em conjunto.", ação **Revisar uma a uma**.
- Abas pelos quatro grupos da Tabela 7: Ensino e monitoria · 4 / Pesquisa e publicações · 3 /
  Extensão e eventos · 5 / Representação estudantil · 1 (contagens do seed). A atividade sem tipo
  previsto na Tabela 7 não entra em nenhuma aba: ela só pode ser reclassificada ou recusada
  individualmente.
- Barra de seleção: "3 atividades selecionadas · 78 h a homologar" com **Aprovar selecionadas**
  e **Devolver com pendência**. O contador atualiza em `aria-live`.
- Tabela com checkbox, Discente, Atividade, Horas, Espera e link "Abrir comprovante".
  Itens inaptos ao lote vêm desmarcados e desabilitados, com explicação.
- Rodapé: "4 de 6 atividades de Ensino aptas ao lote · 2 exigem revisão individual" e
  "O lote valida as atividades e libera os créditos correspondentes."

### Relatório — `/relatorio`
O edital exige geração de relatório para entrega. Construa uma página imprimível:
- Cabeçalho com dados do aluno, data de geração e total consolidado.
- Tabela de atividades validadas agrupada por categoria, com subtotais e o comparativo contra
  o mínimo de cada categoria.
- Botão **Imprimir / salvar em PDF** usando `window.print()`, com `@media print` que esconde
  sidebar, barra de acessibilidade e botões, e imprime em preto sobre branco.

### 08 · Estados de sistema
Implemente como componentes reutilizáveis, usados de verdade nas telas:
- **Carregando** — skeleton com a forma do conteúdo final em `#F5F5F4`, contêiner com
  `aria-busy="true"` e texto "Carregando atividades…" para leitor de tela.
- **Vazio** — ícone 32 px em texto secundário, frase explicativa e botão primário com a ação.
  Ex.: "Nenhuma atividade neste filtro" / "Nenhum registro corresponde ao status selecionado.
  Limpe o filtro para ver todos." / botão "Limpar filtro".
- **Erro** — borda e ícone em `#B91C1C`, "Não foi possível carregar as atividades", "A conexão
  com o sistema acadêmico falhou. Seus dados não foram perdidos.", botões "Tentar novamente" e
  "Falar com a SeCoT", e "Código do erro: HC-503".

### Páginas de apoio
`/catalogo`, `/simulador`, `/avisos`, `/ajuda`, `/docente/orientandos`, `/docente/relatorio`
existem na navegação e **não podem dar 404**. Construa cada uma com a anatomia padrão de página
(h1 + subtítulo + ação) e um estado que explique com clareza o que aparecerá ali. Nada de
"em construção" ou "lorem ipsum" — texto real, redigido para um usuário.

---

## 9. Dados de demonstração — `lib/mock-data.ts`

Use exatamente estes registros; foram escolhidos para cobrir todos os status e categorias.

**Aluno:** Ana Liz Souza · RA 811902 · Discente · 4º ano · 87 de 200 h
**Docente:** Prof.ª Renata Marques · DCoMP · iniciais RM

**Atividades do discente**

| Título | Categoria | Horas | Período | Status |
|---|---|---|---|---|
| Monitoria de Algoritmos e Estruturas de Dados I | Ensino | 30 h | 2025/1 | validada |
| Iniciação científica PIBIC · visão computacional | Pesquisa | 25 h | 2024/2 – 2025/1 | analise |
| Projeto de extensão Meninas Digitais | Extensão | 20 h | 2025/1 | validada |
| Minicurso de Git e GitHub · SeCoT XVIII | Ensino | 12 h | 2025/2 | pendente |
| Organização da Semana de Computação | Extensão | 8 h | 2025/2 | analise |
| Curso online de banco de dados (Coursera) | Ensino | 40 h | 2024/2 | recusada |
| Publicação de resumo em anais de evento | Pesquisa | 10 h | 2025/1 | pendente |

**Fila do docente** (ordenada por tempo de espera)

| Discente | RA | Atividade | Categoria | Horas | Espera |
|---|---|---|---|---|---|
| Bruno Okamoto | 812345 | Monitoria de Cálculo II | Ensino | 30 h | 9 dias |
| Ana Liz Souza | 811902 | Minicurso de Git e GitHub | Ensino | 18 h | 7 dias |
| Carla Menezes | 810778 | Projeto Meninas Digitais | Extensão | 20 h | 5 dias |
| Diego Ferraz | 813410 | Iniciação científica PIBIC | Pesquisa | 25 h | 3 dias |
| Elisa Nakamura | 812004 | Organização da SeCoT XVIII | Extensão | 8 h | 1 dia |

**Lote de Ensino:** Bruno Okamoto · Monitoria de Cálculo II · 30 h · 9 dias · apto;
Ana Liz Souza · Minicurso de Git e GitHub · 18 h · 7 dias · apto;
Felipe Antunes · Monitoria de Algoritmos I · 30 h · 4 dias · apto;
Gabriela Reis · Minicurso de Python para dados · 12 h · 2 dias · **exige revisão individual**.

---

## 10. Ordem de execução

Execute nesta ordem, **um commit por etapa**, e pare ao final de cada uma para revisão.

1. **Fundação** — `create-next-app` com TypeScript, Tailwind e App Router; `shadcn` init;
   Inter via `next/font`; tokens em `globals.css`; `CLAUDE.md` contendo as seções 2, 3 e 4
   deste documento na íntegra; README com instruções de rodar e de deploy.
2. **Domínio** — `types.ts`, `mock-data.ts`, `calculos.ts`, `storage.ts`, `ai/analise-comprovante.ts`.
3. **Casca** — `SkipLink`, `BarraAcessibilidade`, `Sidebar` (dois perfis), `MobileNav`,
   `PageHeader`, `RegiaoAoVivo`, skeleton/vazio/erro. Uma rota de teste já navegável.
4. **Login (01)** — com o caminho de visitante funcionando de ponta a ponta.
5. **Painel do discente (02)** — anel e barras com marcador de mínimo.
6. **Listagem (03)** — filtro, busca, ordenação, estado vazio, versão mobile em cards.
7. **Formulário (04)** — validação no blur, upload acessível, rascunho automático.
8. **Detalhe (05)**.
9. **Painel do docente (06)** + fila completa.
10. **Validação (07)** + validação em lote (07b).
11. **Relatório** imprimível.
12. **Páginas de apoio** e varredura final.

Ao final de **cada** etapa:

- `npm run build` passa limpo;
- percorra a tela inteira só com teclado (Tab, Shift+Tab, Enter, Espaço, setas) e corrija o que
  não for alcançável ou não tiver foco visível;
- confira em 375 px e em A+ (texto a 125 %);
- escreva **3 linhas** explicando as decisões de acessibilidade aplicadas naquela etapa — a
  equipe usa esse texto na defesa oral;
- commit com mensagem descritiva em português.

---

## 11. Critérios de aceite

A primeira versão está pronta quando:

- [ ] Toda a navegação funciona; nenhuma rota da sidebar dá 404.
- [ ] O caminho "Entrar como visitante" leva a um sistema já populado, em um clique.
- [ ] Os dois perfis (discente e docente) são navegáveis, com troca de perfil funcionando.
- [ ] Criar uma atividade nova aparece na listagem e afeta o progresso ao ser validada.
- [ ] Nenhum componente lê `localStorage` diretamente — tudo passa por `lib/storage.ts`.
- [ ] Nenhum hex escrito à mão no JSX; todas as cores vêm dos tokens.
- [ ] Nenhuma ocorrência de `outline: none` no repositório.
- [ ] Todo status aparece com cor **+** ícone **+** texto; a tela continua legível em escala de cinza.
- [ ] Um único `h1` por página; níveis de título sem salto.
- [ ] Todo campo tem label visível associado; obrigatórios marcados pela palavra "obrigatório".
- [ ] Nenhuma tela quebra em 375 px nem com o texto em 125 %.
- [ ] `npm run build` passa sem erro nem warning de tipo.
- [ ] Nenhum nome de equipe ou de integrante aparece na interface (avaliação anônima).

---

## 12. Como responder

- Antes de cada etapa, liste em 2 linhas o que vai fazer. Não peça confirmação para decisões
  já fechadas neste documento.
- Ao gerar código, escreva arquivos completos com o caminho no topo.
- Ao final de cada etapa, explique em 3 a 5 linhas o que foi feito e por quê, em português, e
  liste as decisões de acessibilidade aplicadas.
- Se algo estiver genuinamente ambíguo, **pergunte antes de inventar regra de negócio**. Não
  invente regra de horas complementares que não esteja na seção 6.
- Não instale dependência fora da lista da seção 2 sem justificar.
