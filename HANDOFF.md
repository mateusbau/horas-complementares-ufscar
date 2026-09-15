# HANDOFF — Horas Complementares · SeCoT XVIII

Documento de passagem para quem vai continuar o projeto sem ter acompanhado nada até aqui.
Estado em **2026-09-15**: etapas 1 a 5 concluídas e publicadas; próxima é a etapa 6 (Listagem).

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
| 5 · Painel do discente (tela 02) | Concluída e verificada | commit da etapa 5 |
| 6 a 12 | Não iniciadas | — |

**Pendência explícita:** o visitante docente cai em `/docente/casca`
(`INICIO_DO_PERFIL.docente`, em `lib/rotas.ts`) até a tela 06 nascer em `/docente`, na etapa
9. Nessa etapa, trocar o destino, remover `/docente/casca`, `components/demonstracao/` e o
item "Casca da interface" da navegação docente.

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

---

## 3. O que cada arquivo de `lib/` faz

| Arquivo | Papel |
|---|---|
| `catalogo.ts` | A Tabela 7 do Projeto Pedagógico **como dado**: 19 tipos de atividade, com requisito e comprovante em texto literal, créditos, unidade (semestre, evento, dia, palestra, trabalho, semestre completo), notas (*) e (**), os quatro grupos visuais, o nome do curso e a fonte a citar. O tipo `TipoAtividadeId` é derivado da lista. |
| `calculos.ts` | **Regras, em funções puras.** As únicas constantes `HORAS_POR_CREDITO` (15), `HORAS_EXIGIDAS` (90) e `CREDITOS_EXIGIDOS` (6); `TETOS_POR_TIPO` (vazio, preparado). Conversão quantidade → créditos → horas, progresso, "o que fecha o que falta", as três validações do cadastro, transições de status (envio, reenvio, parecer com reclassificação) e dias de espera. Erros de regra são `ErroDeRegra`, com mensagens prontas para a tela. |
| `types.ts` | Tipos do domínio: `Atividade`, `Parecer`/`NovoParecer`, `Progresso`, `ItemFila`, `AvisoCadastro`, `OpcaoFechamento`, `Perfil`, `EstadoDemo`. |
| `mock-data.ts` | Seed da demonstração: a discente Ana Liz Souza (7 atividades), a docente Prof.ª Renata Marques e mais 12 discentes, que formam a fila de 14 itens. Datas relativas ao momento em que o seed é criado. |
| `storage.ts` | **Única porta de dados.** Funções assíncronas com atraso de 300 ms (listar, obter, criar, atualizar e enviar atividade; progresso; fila; parecer; exportar, importar e reiniciar a demo; pessoas). Exceção síncrona: as preferências de acessibilidade (`lerPreferencias`, `salvarPreferencias`, `SCRIPT_PREFERENCIAS`). Só funciona no navegador. |
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

- **6 · Listagem (03):** filtro, busca, ordenação, estado vazio (`?demo=vazio`), cards no mobile.
  Pela régua do crédito: coluna de tipo da Tabela 7 (não "categoria") e créditos como número
  principal; atualizar os textos da tela 03 no `PROMPT-INICIAL.md`.
- **7 · Formulário (04):** quantidade na unidade do tipo (`pergunta` do catálogo; **horas do
  comprovante** nos tipos "N h/semestre"), as validações (`avisosDeCadastro`, inclusive o
  aviso de horas acima do máximo, e `validarNovaAtividade`), comprovante exigido em texto
  literal, rascunho automático (criar funções de rascunho no storage). Validação ao sair do
  campo com as duas exceções do login (campo não editado; foco indo a botão do formulário) e
  o componente `components/formulario/Campo`.
- **8 · Detalhe (05):** linha do tempo a partir de `historico`; parecer do adendo no #5.
- **9 · Painel do docente (06) + fila completa:** remover `/docente/casca` e o item temporário.
  Decidir como o docente chega ao catálogo: `/catalogo` está no grupo `(discente)` e mostraria
  a sidebar do discente.
- **10 · Validação (07) + lote (07b):** reclassificação com antes e depois
  (`compararReclassificacao`), confirmação do (**) na monitoria, abas pelos quatro grupos.
- **11 · Relatório:** agrupado por tipo da Tabela 7, com créditos e horas, citando
  `FONTE_TABELA_7`; `@media print` escondendo barra, sidebar e botões.
- **12 · Páginas de apoio e varredura final:** `/catalogo`, `/simulador`, `/avisos`, `/ajuda`,
  `/docente/orientandos`, `/docente/relatorio` sem 404 (o `EstadoErro` já aponta para `/ajuda`);
  favicon próprio (ainda é o do Next); critérios de aceite da seção 11 do prompt.

**Textos da especificação ainda desatualizados** (lista na entrada "Correções pós-etapa 2" do
`DEV-LOG.md`): falam em "categoria", "horas solicitadas" ou "teto" nas telas 03, 05, 06, 07 e
07b. A tela 02 já foi reescrita. Regra combinada: corrigir o texto de cada tela na etapa em
que ela for construída, pela régua do crédito.

---

## 6. Próxima ação concreta: etapa 6 (Listagem, tela 03)

Especificação na tela 03 da seção 8 do `PROMPT-INICIAL.md`, lida pela régua do crédito:
primeiro corrigir os textos da tela 03 na especificação (colunas, busca, estado vazio),
depois construir `app/(discente)/atividades/page.tsx` com `listarAtividades()`, filtro por
status com contagem, busca, ordenação, estado vazio em `?demo=vazio` e cards no mobile.

**Como verificar no navegador.** As verificações usam `playwright-core` dirigindo o Chrome
instalado, com scripts fora do repositório. Para repetir: instalar `playwright-core` numa
pasta temporária, subir `npm run build && npm run start` e, para cada tela:
- capturas em 1280 e 375 px, com A−, A, A+ e alto contraste. As preferências e a sessão
  podem ser gravadas no `localStorage` antes de carregar a página
  (`horas-complementares:preferencias`, `horas-complementares:sessao`);
- teclado: link de pular, ordem do Tab, foco visível, Esc devolvendo o foco;
- sem rolagem horizontal, um único h1, títulos sem salto, sem erro de console ou de hidratação.

**Olhe as capturas, não só os testes.** Nas etapas 3 a 5, as capturas pegaram:
- o botão sem borda num link;
- o título vazando em A+;
- os dois cartões aparentando seleção (era a transição);
- o contador quebrando dentro da pílula;
- a trilha do gráfico sumindo no alto contraste.

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
- **Modal aberto deixa o resto da página inerte** (Base UI). Em testes automatizados,
  `getByRole` não acha o botão que abriu o modal enquanto ele está aberto; use um seletor
  CSS, como `[data-slot="sheet-trigger"]`.
