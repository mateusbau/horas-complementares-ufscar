# HANDOFF — Horas Complementares · SeCoT XVIII

Documento de passagem para quem vai continuar o projeto sem ter acompanhado nada até aqui.
Estado em **2026-09-15**: etapas 1 a 11 **implementadas e com build limpo**, no commit `af23db5`
(push em `main`). **Atenção — leia antes de tudo:** esse commit está marcado como `WIP` de
propósito. As etapas 9 e 10 foram codificadas, buildadas e verificadas nesta sessão (capturas em
1280/375 px, alto contraste, A+, teclado e foco — ver seção 6), mas a sessão foi interrompida
**antes** de escrever a entrada correspondente no `DEV-LOG.md`, o que o `CLAUDE.md` exige no
mesmo commit de cada etapa. **A próxima sessão deve começar escrevendo essa entrada** (o que foi
feito, as decisões e os porquês — rascunho de decisões está na seção 6 abaixo) antes de seguir
para a etapa 12, para o `DEV-LOG.md` não pular direto da etapa 11 para a 12.

---

## 1. O que é e por onde começar

Sistema web de gestão pessoal de horas complementares do curso **BCDIA** (Bacharelado em
Ciência de Dados e Inteligência Artificial, UFSCar Sorocaba), para um hackathon avaliado por
banca (Utilidade, Praticidade, Acessibilidade, Criatividade, Qualidade do Protótipo). Avaliação
anônima: **nenhum nome de equipe ou integrante na interface.**

É **só frontend**: sem backend, login simulado, dados no `localStorage` (sempre via
`lib/storage.ts`). Deploy previsto na Vercel, sem variáveis de ambiente.

Leia nesta ordem:

1. `CLAUDE.md` — regras vigentes: identidade visual, acessibilidade, classes disponíveis,
   modelo de domínio, procedimentos obrigatórios. **É a referência do dia a dia.**
2. `PROMPT-INICIAL.md` — especificação original: telas (seção 8), arquitetura, ordem das
   etapas (seção 10), critérios de aceite (seção 11). **As seções 6 e 9 estão superadas.**
3. `ADENDO-DOMINIO.md` — o modelo de domínio real, que substitui as seções 6 e 9 do prompt.
4. `DEV-LOG.md` — o que foi feito em cada etapa e por quê.
5. `PROXIMA-ETAPA.md` — decisões já tomadas pela equipe que ainda precisam entrar no código,
   e o escopo de corte se faltar tempo.

Rodar: `npm install` e `npm run dev` (http://localhost:3000). `npm run build` roda antes o
verificador de tokens (ver seção 4).

---

## 2. Estado atual

| Etapa | Situação | Commit |
|---|---|---|
| 1 · Fundação | Concluída e aprovada | `3c456ac`, `a7bb47e`, `aa3f70d` |
| 2 · Domínio | Concluída e aprovada (refeita pelo adendo) | `6fbd57a` |
| Correções pós-etapa 2 (textos das telas 06 e 07b, seed) | Concluídas | `6dfd4c9` |
| 3 · Casca | Concluída e verificada no navegador (teclado, 375 px, A−/A/A+, hidratação) | `23a0845` + commit de fechamento |
| Correção do domínio pela seção 3.5.4 do PPC | Concluída | `711d4ea` |
| 4 · Login (tela 01) | Concluída e verificada | `8eb51fa` |
| 5 · Painel do discente (tela 02) | Concluída e verificada | `71ffee8` |
| 6 · Listagem (tela 03) | Concluída e verificada | `b6c5ee2` |
| 7 · Formulário (tela 04) | Concluída e verificada | `40cca88` |
| 8 · Detalhe (tela 05) | Concluída e verificada | `ad5082d` |
| 11 · Relatório | Concluída e verificada (fora de ordem, ver `PROXIMA-ETAPA.md` seção 0) | `53e65b1` |
| 9 · Painel do docente (06) + fila completa | **Código completo e verificado; falta a entrada no `DEV-LOG.md`** | `af23db5` (WIP) |
| 10 · Validação (07) + lote (07b) | **Código completo e verificado; falta a entrada no `DEV-LOG.md`** | `af23db5` (WIP) |
| 12 · Páginas de apoio e varredura final | **Não iniciada** — nada deste escopo foi tocado | — |

`/docente/casca`, `components/demonstracao/VitrineCasca.tsx` e o item "Casca da interface" já
saíram (etapa 9). `INICIO_DO_PERFIL.docente` (`lib/rotas.ts`) já aponta para `/docente`.

Arquivos da etapa 3:

- `components/feedback/` — `RegiaoAoVivo` (a única região `aria-live`, com o hook
  `useAnunciar()`), `Skeleton` e `AreaCarregando`, `EstadoVazio`, `EstadoErro`.
- `components/layout/` — `SkipLink`, `BarraAcessibilidade` (alto contraste, A−/A/A+, botão de
  atalhos), `AtalhosDeTeclado` (modal), `Sidebar`, `MobileNav`, `navegacao.tsx` (itens de cada
  perfil, lista com item ativo, bloco de perfil), `PageHeader`, `Marca`, `EstruturaPerfil`.
- `components/ui/dialog.tsx` e `sheet.tsx` — do shadcn, já ajustados pelo procedimento.
- `app/(discente)/layout.tsx` e `app/(docente)/layout.tsx` — sidebar de cada perfil.
- `app/layout.tsx` — script de preferências no `<head>`, região ao vivo, link de pular, barra.
- **Temporários** (remover na etapa 9): a rota `/docente/casca`,
  `components/demonstracao/VitrineCasca.tsx` e o item "Casca da interface" na navegação
  docente. A `/casca` do discente já saiu na etapa 5.

Arquivos das etapas 4 e 5:

- `app/page.tsx` e `components/entrada/` — tela de login (01).
- `components/formulario/Campo.tsx` — campo acessível reutilizável (label, apoio, erro).
- `components/layout/GuardaSessao.tsx` e `lib/rotas.ts` — sessão exigida nas telas com
  navegação; destinos de cada perfil.
- `app/(discente)/painel/page.tsx`, `components/painel/` e `components/progresso/` — painel
  do discente (02): anel, "o que fecha o que falta", barras por grupo, acesso rápido.
- `app/not-found.tsx` — página própria para endereço inexistente, em português.

Arquivos das etapas 6 e 7:

- `app/(discente)/atividades/page.tsx` e `components/atividade/` (`ListaAtividades`,
  `TabelaAtividades`, `FiltroStatus`, `StatusBadge`) — listagem (03): busca, filtro, ordenação,
  tabela em 768 px+ com cards abaixo disso, estado vazio, `?demo=vazio`.
- `app/(discente)/atividades/nova/page.tsx` e `components/atividade/FormularioNovaAtividade.tsx`
  — formulário (04). Componentes de apoio em `components/formulario/`: `CampoConfirmacao`
  (notas (*)/(**)) e `CampoComprovante` (arrastar e soltar, com o botão como único caminho
  garantido por teclado). Primitivos novos: `components/ui/select.tsx`, `checkbox.tsx`.
- `lib/storage.ts`: `salvarRascunho`/`obterRascunho`/`limparRascunho` — rascunho do formulário,
  à parte de `Atividade` (aceita dados parciais, nunca aparece em `listarAtividades()`).
- `lib/formatacao.ts`: `formatarPremissaCredito`, `formatarExplicacaoRequisito`,
  `formatarRascunhoSalvo`, `formatarTamanhoArquivo`.

Arquivos das etapas 8 e 11 (2026-09-15, fora de ordem — ver `PROXIMA-ETAPA.md`, seção 0):

- `app/(discente)/atividades/[id]/page.tsx` e `components/atividade/DetalheAtividade.tsx` —
  detalhe (05): comprovante (placeholder), linha do tempo do `historico`, dados pelo tipo
  declarado, parecer do docente, ações por status. `app/(discente)/atividades/[id]/editar/` e
  `FormularioEditarAtividade.tsx` — edição de atividade `pendente` (chamada por "Editar").
- `app/(discente)/relatorio/page.tsx` e `components/relatorio/Relatorio.tsx` — relatório
  imprimível: identificação, total consolidado, exigência de dois tipos, tabela por tipo (card
  em mobile), fonte. Botão de imprimir com `window.print()`.
- `components/layout/{Sidebar,MobileNav,PageHeader}.tsx` e `app/globals.css`: `print:hidden` na
  sidebar, no menu mobile e nas ações/voltar do cabeçalho; `@page { size: A4 portrait; margin:
  ... }` — suporte de impressão usado pelo relatório, mas já vale para qualquer tela.

Arquivos das etapas 9 e 10 (2026-09-15, commit `af23db5` — **WIP, sem entrada no `DEV-LOG.md`
ainda**; código completo e buildado, ver seção 6 para o rascunho do que a entrada precisa
cobrir):

- `app/(docente)/docente/page.tsx` e `components/painel/PainelDocente.tsx` — painel do docente
  (06): `components/docente/IndicadoresDocente.tsx` (4 indicadores em crédito, via nova
  `obterEstatisticasDocente()` em `lib/storage.ts`), `components/docente/FilaValidacao.tsx`
  (tabela da fila, reaproveitada em preview e na fila completa) e
  `components/painel/AcessoRapidoDocente.tsx` (cards de acesso; "Trocar de perfil" é botão, não
  link).
- `app/(docente)/docente/fila/page.tsx` e `components/docente/FilaCompleta.tsx` — fila completa
  ("Ver fila completa" do painel e item de navegação "Fila de validação").
- `components/catalogo/CatalogoConteudo.tsx` — conteúdo do catálogo (Tabela 7) extraído para um
  componente compartilhado; `app/(discente)/catalogo/page.tsx` (resolve a pendência antiga de
  "Ver catálogo" 404) e `app/(docente)/docente/catalogo/page.tsx` o expõem, cada um com a
  sidebar do próprio perfil.
- `app/(docente)/docente/validacao/[id]/page.tsx` e `components/docente/ValidacaoAtividade.tsx`
  — validação individual (07): dados enviados, reclassificação com antes/depois
  (`compararReclassificacao`), confirmação da regra `**` (monitoria) própria da tela, nota `*`
  informativa, parecer (aprovar/devolver/recusar) e modal de confirmação para recusar (foco
  inicial em "Cancelar" via `initialFocus`).
- `app/(docente)/docente/validacao/lote/page.tsx` e `components/docente/ValidacaoLote.tsx` —
  validação em lote (07b): abas ARIA manuais pelos quatro grupos (sem componente shadcn de
  tabs), checkboxes reais com "selecionar todos" indeterminado, contagem em `aria-live`,
  confirmação antes de aplicar e aplicação **sequencial** no storage (ver seção 7, armadilha
  nova) com foco devolvido à aba ativa depois.
- Removidos: `app/(docente)/docente/casca/page.tsx` e `components/demonstracao/VitrineCasca.tsx`
  (temporários da etapa 3); `lib/rotas.ts` e `components/layout/navegacao.tsx` atualizados.

---

## 3. O que cada arquivo de `lib/` faz

| Arquivo | Papel |
|---|---|
| `catalogo.ts` | A Tabela 7 do Projeto Pedagógico **como dado**: 19 tipos de atividade, com requisito e comprovante em texto literal, créditos, unidade (semestre, evento, dia, palestra, trabalho, semestre completo), notas (*) e (**), os quatro grupos visuais, o nome do curso e a fonte a citar. O tipo `TipoAtividadeId` é derivado da lista. |
| `calculos.ts` | **Regras, em funções puras.** As únicas constantes `HORAS_POR_CREDITO` (15), `HORAS_EXIGIDAS` (90) e `CREDITOS_EXIGIDOS` (6); `TETOS_POR_TIPO` (vazio, preparado). Conversão quantidade → créditos → horas, progresso, "o que fecha o que falta", as três validações do cadastro, transições de status (envio, reenvio, parecer com reclassificação) e dias de espera. Erros de regra são `ErroDeRegra`, com mensagens prontas para a tela. |
| `types.ts` | Tipos do domínio: `Atividade`, `Parecer`/`NovoParecer`, `Progresso`, `ItemFila`, `AvisoCadastro`, `OpcaoFechamento`, `Perfil`, `EstadoDemo`. |
| `mock-data.ts` | Seed da demonstração: a discente Ana Liz Souza (7 atividades), a docente Prof.ª Renata Marques e mais 12 discentes, que formam a fila de 14 itens. Datas relativas ao momento em que o seed é criado. |
| `storage.ts` | **Única porta de dados.** Funções assíncronas com atraso de 300 ms (listar, obter, criar, atualizar e enviar atividade; progresso; fila; parecer; `obterEstatisticasDocente()` — etapa 9; exportar, importar e reiniciar a demo; pessoas). Exceção síncrona: as preferências de acessibilidade (`lerPreferencias`, `salvarPreferencias`, `SCRIPT_PREFERENCIAS`). Só funciona no navegador. Chamadas em lote (validação em lote) precisam ser sequenciais — ver seção 7. |
| `formatacao.ts` | Números e datas em pt-BR: "66,7%", "4 créditos", "1 semestre de monitoria", "27/08/2025, 14h32", "9 dias". |
| `preferencias.ts` | Tipos e aplicação das preferências da barra de acessibilidade no `<html>` (classe `alto-contraste`, atributo `data-tamanho-texto`) e o texto dos anúncios. |
| `utils.ts` | `cn()` para juntar classes, configurado para reconhecer os tokens próprios. |
| `ai/analise-comprovante.ts` | Encaixe para a análise de comprovante por IA (outra equipe). Devolve `{ disponivel: false }`. **Não chamar e não mostrar na interface.** |

---

## 4. Decisões já fechadas (não reabrir sem a equipe)

**Domínio** (detalhes em `ADENDO-DOMINIO.md` e `CLAUDE.md`):

- A carga horária do certificado não conta. Cada tipo da Tabela 7 vale créditos fixos; horas =
  créditos × 15; exigência de 90 h (6 créditos). Não há teto nem mínimo por tipo ou grupo.
- 90, 15 e 6 só existem em `lib/calculos.ts`; o verificador reprova esses números em outro
  arquivo. O fator de 15 h vem da definição de crédito da matriz curricular (PPC, Tabela 4);
  confirmação com a coordenação pendente.
- PPC, seção 3.5.4 (adendo, seção 10): nos tipos "N h/semestre" o aluno informa horas;
  créditos proporcionais, arredondados para baixo, com teto por registro (um registro = um
  semestre). Integralizar exige também dois tipos diferentes.
- Régua do crédito: o crédito é a medida principal em toda tela; a hora só aparece como
  requisito do tipo ou como "N de 90 horas contabilizadas" (ver `CLAUDE.md`).
- Grupos (Ensino e monitoria, Pesquisa e publicações, Extensão e eventos, Representação
  estudantil) são só organização visual e aparecem sempre com o texto `AVISO_AGRUPAMENTO`.
- Palestras acumulam entre registros; só blocos completos contam (3 palestras = 1 crédito). O
  arredondamento para baixo da 3.5.4 confirma essa regra.
- Tipo não previsto é escolha explícita (`tipoId: null`): avisa e não bloqueia. Sem detecção
  por palavras no título, nem no futuro.
- O docente não aprova atividade sem tipo: reclassifica (com justificativa) ou recusa.
- `pendente` = "a bola está com o aluno" (não enviada ou devolvida).
- Fila do docente derivada do status: toda atividade em análise, de qualquer discente.
- Seed: Ana com 4 de 6 créditos, 60 de 90 h, 66,7%. Esperas da fila: Bruno 9, Carla 9, Ana 8,
  Diego 3, Elisa 1 dias.

**Visual e acessibilidade:**

- Tokens em `app/globals.css`. A paleta padrão do Tailwind, os pesos fora de 400/500/700 e as
  sombras estão desligados; existe só `shadow-overlay`.
- `--overlay` = `#1C1917` a 50 %, a única cor de escurecimento (`bg-overlay`).
- Alvos e linhas com `max(2.75rem, 44px)` (`min-h-target`, `size-target`, `h-row`).
- Foco é uma regra global de `:focus-visible`; nada suprime o contorno.
- Alto contraste reusa tokens existentes (sem cor nova). Tamanho do texto: 87,5 / 100 / 125 %.
- Modal de atalhos sem atalhos de uma tecla só (WCAG 2.1.4): lista só as teclas padrão.

**Processo:**

- `scripts/verificar-tokens.mjs` roda antes de todo build e reprova paleta padrão, supressão de
  foco, `dark:`, sombras, pesos, hex no código, `localStorage` fora do storage e 90/15/6 fora
  de `calculos.ts`. Rodar sozinho: `npm run verificar:tokens`.
- Após `npx shadcn add`, seguir o procedimento da seção de mesmo nome no `CLAUDE.md`:
  dry-run antes; responder **N** quando perguntar se sobrescreve `button.tsx`; nunca usar
  `--overwrite`; corrigir o que o verificador acusar; revisar o resto à mão.
- Um commit por etapa, em português, com `npm run build` limpo e uma entrada no `DEV-LOG.md`
  no mesmo commit.

---

## 5. O que falta, por etapa

- **8 · Detalhe (05):** concluída (2026-09-15, ver `DEV-LOG.md`).
- **9 · Painel do docente (06) + fila completa:** **código concluído** (`af23db5`) — falta só a
  entrada no `DEV-LOG.md`. `/docente/casca` e o item temporário já saíram.
- **10 · Validação (07) + lote (07b):** **código concluído** (`af23db5`) — falta só a entrada no
  `DEV-LOG.md`. Reclassificação com antes e depois (`compararReclassificacao`), confirmação do
  (**) na monitoria, abas pelos quatro grupos, tudo implementado e verificado.
- **11 · Relatório:** concluída (2026-09-15, ver `DEV-LOG.md`).
- **12 · Páginas de apoio e varredura final:** **não iniciada.** `/catalogo` do discente já
  passou a existir de verdade na etapa 9 (não é mais pendência desta etapa); ainda faltam
  `/simulador`, `/avisos`, `/ajuda`, `/docente/orientandos`, `/docente/relatorio` sem 404 (o
  `EstadoErro` já aponta para `/ajuda`); favicon próprio (ainda é o do Next); critérios de
  aceite da seção 11 do prompt; conferência de anonimato. Ver `PROXIMA-ETAPA.md` para o roteiro
  completo desta etapa.

**Textos da especificação ainda desatualizados:** já corrigidos nas telas 06, 07 e 07b pela
implementação das etapas 9 e 10 (régua do crédito: "Tipo"/"Créditos" no lugar de
"Categoria"/"Horas solicitadas", em toda parte). As telas 02 a 07b estão todas atualizadas.

---

## 6. Próxima ação concreta: escrever a entrada do `DEV-LOG.md` das etapas 9 e 10, depois seguir para a 12

**Não recomece as etapas 9 e 10 — o código já existe, já builda limpo e já foi verificado no
navegador** (capturas em 1280/375 px, alto contraste, A+, teclado e foco — ver lista abaixo).
O único débito é documental: escreva a entrada no `DEV-LOG.md` (uma para a etapa 9, uma para a
10, ou uma cobrindo as duas — como as etapas 8+11 fizeram uma entrada cada, mantenha uma por
etapa) e comite só isso, referenciando ou incorporando o commit `af23db5` (WIP). Depois disso,
o roteiro segue para a etapa 12 (páginas de apoio e varredura final).

O que a entrada precisa registrar (decisões já tomadas nesta sessão, não reabrir):

- **Etapa 9.** `/docente` (painel), `/docente/fila` (fila completa — o item de navegação já
  existia e apontava para lugar nenhum), catálogo extraído para
  `components/catalogo/CatalogoConteudo.tsx` e exposto em `/catalogo` (discente — resolve a
  pendência antiga de "Ver catálogo" 404 das etapas 6 a 8) e `/docente/catalogo` (mesma rota não
  pode existir em dois grupos de rotas do Next). `obterEstatisticasDocente()` nova em
  `lib/storage.ts`: "Devolvidas com pendência" conta só quem já foi enviada ao menos uma vez
  (`enviadaEm !== null` e `status === "pendente"`), para não confundir com atividades cadastradas
  e nunca enviadas. "Orientandos ativos" é a contagem real de discentes do seed (13), não o "38"
  fictício do prompt original (já superado pelo adendo); o subtítulo virou "Curso BCDIA" (sem
  inventar uma "turma", que o domínio não modela). Remoção de `/docente/casca` e
  `VitrineCasca.tsx` (temporários da etapa 3).
- **Etapa 10.** Na tela 07, `paraTipoId`/`paraQuantidade` são **sempre** enviados ao parecer
  (mesmo sem reclassificar) — `compararReclassificacao` já resolve `mudou: false` quando nada
  muda, o que simplifica a lógica em vez de só enviar esses campos condicionalmente. A
  confirmação da regra `**` é um checkbox próprio da tela (o docente confirma de novo,
  independente do que o discente já confirmou no cadastro). Recusar abre modal de confirmação
  **controlado** (sem `DialogTrigger`, porque a validação do comentário precisa rodar antes de
  abrir o modal); foco inicial em "Cancelar" via `initialFocus`. No lote (07b), abas são
  `role="tablist"`/`tab`/`tabpanel` manuais (roving tabindex, sem componente de tabs do
  shadcn — evita o procedimento de `shadcn add` sem necessidade real). Monitoria fica sempre
  inapta ao lote (a confirmação `**` só existe na tela individual). Aplicação do lote é
  **sequencial** (`for...of` com `await`), nunca `Promise.all` — ver armadilha nova na seção 7.

Build limpo, verificação por captura em 1280 e 375 px (A−, A, A+ e alto contraste), entrada no
`DEV-LOG.md`, commit e push em `main` — para cada etapa daqui em diante.

**Como verificar no navegador.** Nesta sessão, `playwright-core` foi instalado numa pasta
temporária fora do repositório (`npm install playwright-core --no-save`) e dirigido contra o
Chrome já instalado (`executablePath`, sem baixar navegador). Para repetir:
- `npm run build && npm run start` (se o build falhar com `EPERM` ao apagar algo em `.next`, veja
  a armadilha correspondente na seção 7 antes de tentar de novo);
- capturas em 1280 e 375 px, com A−, A, A+ e alto contraste. As preferências e a sessão podem
  ser gravadas no `localStorage` antes de carregar a página
  (`horas-complementares:preferencias`, `horas-complementares:sessao`);
- teclado: link de pular, ordem do Tab, foco visível, Esc devolvendo o foco;
- sem rolagem horizontal, um único h1, títulos sem salto, sem erro de console ou de hidratação.

**Olhe as capturas, não só os testes.** Elas já pegaram, em etapas anteriores: o botão sem
borda num link (etapa 3), o título vazando em A+ (etapa 4), a trilha do gráfico sumindo no
alto contraste (etapa 5), um `<th>` aninhado dentro de outro (etapa 6), e um aviso de "tipo
não previsto" aparecendo no formulário em branco, antes de qualquer escolha (etapa 7) — nenhum
desses apareceu nos testes automáticos, só nas imagens.

Espere o fim das animações (160 ms) antes de capturar. Evite `waitUntil: "networkidle"`: os
prefetches dos links para rotas ainda inexistentes impedem que a rede fique ociosa.

---

## 7. Armadilhas conhecidas

- **O Tailwind lê comentários.** Um nome de classe proibido escrito em comentário gera CSS e
  pode ser acusado pelo verificador. Os arquivos `.md` da raiz estão fora da varredura.
- **`cn` sempre de `@/lib/utils`**, nunca do pacote `cn`.
- **`storage.ts` só no navegador:** chamar dentro de `useEffect` ou de evento, em componente
  `"use client"`, mostrando skeleton até a resposta.
- **Datas sem hora** (`AAAA-MM-DD`) passam por `lib/formatacao.ts`, que as lê como data local.
  Com `new Date()` direto, elas aparecem um dia antes no fuso de Brasília.
- **Commits no Windows/PowerShell:** a mensagem com várias linhas deve ir por arquivo
  (`git commit -F arquivo.txt`); passar por `-F -` com here-string não funciona.
- **`npx shadcn add` sem terminal interativo** para na pergunta de sobrescrita. Responda com
  `"n" | npx shadcn@latest add <componente>` no PowerShell.
- **Link com aparência de botão:** use `buttonVariants(...)` de `components/ui/button.tsx`,
  que já resolve as classes pelo `cn`. Concatenar classes de variante à mão faz a borda do
  "outline" sumir.
- **Build com `EPERM` ao apagar arquivo em `.next`** (OneDrive/Windows): apague a pasta `.next`
  inteira, que é saída de build, e rode o build de novo. Tipos antigos em `.next/dev/types`
  também quebram o build depois de remover uma rota; mesma solução.
- **Trilha de gráfico usa `--trilha`, não `--border`**: o alto contraste escurece a borda.
- **`react-hooks/refs` (regra nova do Next 16, ligada ao React Compiler)** pode reprovar um
  `ref` passado por uma prop com nome próprio (ex.: `botaoRef`) ou usado fora do padrão de
  render-prop de `Campo`, mesmo quando `.current` só é lido dentro de um handler — falso
  positivo conhecido. Liberar com `// eslint-disable-next-line react-hooks/refs -- <motivo>`
  na linha do `ref=`, não reescrever a lógica em torno disso.
- **Modal aberto deixa o resto da página inerte** (Base UI). Em testes automatizados,
  `getByRole` não acha o botão que abriu o modal enquanto ele está aberto; use um seletor
  CSS, como `[data-slot="sheet-trigger"]`.
- **`finalFocus` do `Dialog` (Base UI) não é confiável num modal controlado sem
  `DialogTrigger`** (ex.: confirmação antes de aplicar um lote, aberta por lógica própria, não
  por um trigger do próprio Dialog): o foco pode voltar para `<body>` em vez do elemento
  indicado. Descoberto e confirmado por captura + polling na etapa 10 (`ValidacaoLote.tsx`). Use
  `finalFocus` mesmo assim (é a API certa), mas reforce com um `window.setTimeout(..., 200)` —
  200 ms é maior que a transição de fechamento do modal (`--duration`, 160 ms) — chamando
  `.focus()` no elemento estável explicitamente. Sem esse reforço, "devolver o foco a um ponto
  estável" (CLAUDE.md, acessibilidade) falha silenciosamente.
- **Chamadas em lote a `lib/storage.ts` precisam ser sequenciais, nunca `Promise.all`.** Cada
  função (`registrarParecer`, etc.) lê o `localStorage` inteiro, aplica a mudança e grava de
  volta; chamadas em paralelo leem o mesmo estado antigo e a última a gravar apaga o que as
  outras escreveram. Descoberto ao implementar a validação em lote (etapa 10): `for (const id of
  ids) await registrarParecer(...)`, nunca `ids.map(...)` com `Promise.all`. Ao testar isso via
  Playwright, contabilize `300 ms × quantidade de itens` na espera antes de checar o resultado —
  não é lento de verdade, só parece nos testes automatizados.
