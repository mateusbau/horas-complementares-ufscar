# HANDOFF — Horas Complementares · SeCoT XVIII

Documento de passagem para quem vai continuar o projeto sem ter acompanhado nada até aqui.
Estado em **2026-09-14**, commit `23a0845`.

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
| **3 · Casca** | **Parcial: código escrito, sem verificação no navegador** | `23a0845` |
| 4 a 12 | Não iniciadas | — |

**Etapa 3, o que existe:** passam o verificador de tokens, o TypeScript (`npx tsc --noEmit`),
o ESLint e o `npm run build`. **O que não foi feito:** percurso por teclado, checagem em 375 px e
em A+ no navegador, e a entrada da etapa 3 no `DEV-LOG.md`.

Arquivos da etapa 3:

- `components/feedback/` — `RegiaoAoVivo` (a única região `aria-live`, com o hook
  `useAnunciar()`), `Skeleton` e `AreaCarregando`, `EstadoVazio`, `EstadoErro`.
- `components/layout/` — `SkipLink`, `BarraAcessibilidade` (alto contraste, A−/A/A+, botão de
  atalhos), `AtalhosDeTeclado` (modal), `Sidebar`, `MobileNav`, `navegacao.tsx` (itens de cada
  perfil, lista com item ativo, bloco de perfil), `PageHeader`, `Marca`, `EstruturaPerfil`.
- `components/ui/dialog.tsx` e `sheet.tsx` — do shadcn, já ajustados pelo procedimento.
- `app/(discente)/layout.tsx` e `app/(docente)/layout.tsx` — sidebar de cada perfil.
- `app/layout.tsx` — script de preferências no `<head>`, região ao vivo, link de pular, barra.
- **Temporários** (remover quando as telas reais existirem): rotas `/casca` e
  `/docente/casca`, `components/demonstracao/VitrineCasca.tsx` e o item "Casca da interface"
  nas duas navegações (`components/layout/navegacao.tsx`). A página `/` ainda é a vitrine de
  tokens da etapa 1; vira o login na etapa 4.

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
  arquivo. O fator de 15 h por crédito ainda precisa ser confirmado na seção 3.5.4 do PPC.
- Grupos (Ensino e monitoria, Pesquisa e publicações, Extensão e eventos, Representação
  estudantil) são só organização visual e aparecem sempre com o texto `AVISO_AGRUPAMENTO`.
- Palestras acumulam entre registros; só blocos completos contam (3 palestras = 1 crédito).
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

- **3 · Casca (terminar):** verificação no navegador (ver seção 6); entrada no `DEV-LOG.md`.
- **4 · Login (01):** substituir a vitrine em `/`. "Entrar como visitante" em um clique, caindo
  no painel do perfil escolhido. Criar a sessão simulada no `storage.ts` e ligar a ela o
  "Trocar de perfil" e o "Sair" da sidebar (hoje são links simples para `/docente`, `/painel`
  e `/`). O `<main>` precisa de `id="conteudo"`.
- **5 · Painel do discente (02):** conforme a seção 5 do adendo (anel com horas e créditos,
  bloco "o que fecha o que falta" via `opcoesParaFechar`, barras por grupo **sem** marcador
  de mínimo). Escolher quais opções destacar: a ordenação neutra põe "bolsista atividade"
  primeiro. Remover `/casca` e o item temporário da navegação discente.
- **6 · Listagem (03):** filtro, busca, ordenação, estado vazio (`?demo=vazio`), cards no mobile.
- **7 · Formulário (04):** quantidade na unidade do tipo (`pergunta` do catálogo), as três
  validações (`avisosDeCadastro`, `validarNovaAtividade`), comprovante exigido em texto
  literal, validação no blur, rascunho automático (criar funções de rascunho no storage).
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

**Textos da especificação ainda desatualizados**, à espera de decisão da equipe (lista completa
na última entrada do `DEV-LOG.md`): falam em "categoria", "horas solicitadas" ou "teto" nas
telas 02, 03, 05, 06, 07 e 07b.

---

## 6. Próxima ação concreta: fechar a etapa 3

1. **Liberar a porta 3000.** Um processo desconhecido estava escutando nela quando o trabalho
   parou. Verifique o que é antes de encerrar; pode não ser deste projeto. Alternativa:
   `npx next start -p 3001`.
2. `npm run build`, depois `npm run start`, e abrir `/casca`, `/docente/casca` e `/`.
3. Conferir por teclado (Tab, Shift+Tab, Enter, Espaço, Esc):
   - o primeiro Tab mostra "Pular para o conteúdo", e Enter leva o foco ao `<main id="conteudo">`;
   - o item ativo da navegação tem os três sinais (fundo `--accent-soft`, barra de 3 px em
     `--primary`, peso 500) e `aria-current="page"`;
   - A+ e alto contraste mudam o `<html>`, são anunciados na região ao vivo ("Tamanho do texto:
     texto maior, 125%." / "Alto contraste ativado.") e **continuam aplicados ao recarregar,
     sem piscar e sem erro de hidratação** no console;
   - o modal de atalhos abre com Enter, prende o foco, fecha com Esc e devolve o foco ao botão.
4. Em 375 px: a sidebar some e aparece o botão "Abrir menu de navegação" (44 px, com
   `aria-expanded`). O menu prende o foco, fecha com Esc devolvendo o foco ao botão, e fecha
   ao escolher um item. Nenhuma rolagem horizontal em 375 px com A−, A e A+.
5. Pontos de risco a olhar: a barra e a sidebar fixas com texto em A+ numa tela baixa; se a
   classe `break-words` (usada no `PageHeader`) existe no Tailwind v4 instalado; as animações
   do menu deslizante (só opacidade e deslocamento, 160 ms).
6. Corrigir o que falhar, rodar `npm run build`, escrever a entrada da etapa 3 no `DEV-LOG.md`
   (o que foi feito, as decisões e o porquê, pendências) e fazer o commit.

Decisões da etapa 3 que devem constar nessa entrada do DEV-LOG:

- As preferências de acessibilidade são síncronas no `storage.ts`: com o atraso de 300 ms, a
  tela piscaria em 100 % antes de ir a 125 %.
- O script inline é gerado no `storage.ts`, para o `localStorage` continuar só lá.
- `useSyncExternalStore` evita erro de hidratação nos `aria-pressed`.
- O alto contraste não cria cor nova.
- Não há atalhos de uma tecla só.
- O "Nova atividade" fica fora da navegação, porque já é a ação primária dos cabeçalhos.

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
