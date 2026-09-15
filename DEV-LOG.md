# DEV-LOG — Horas Complementares · SeCoT XVIII

Registro do fluxo de desenvolvimento, uma entrada por etapa, em ordem cronológica. Cada
entrada diz o que foi feito, as decisões tomadas e por quê, e o que ficou pendente. A
especificação está em `PROMPT-INICIAL.md` e `ADENDO-DOMINIO.md`; as regras vigentes, em
`CLAUDE.md`.

---

## 2026-09-14 · Etapa 1 — Fundação

**Feito.** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (estilo
`base-nova`, sobre Base UI). Inter com pesos 400/500/700; tokens da identidade visual em
`app/globals.css` (`@theme inline`); `CLAUDE.md` e README. Página provisória em `/` com a
vitrine dos tokens.

**Decisões.**
- Paleta padrão do Tailwind, pesos fora de 400/500/700 e sombras desligados no tema: só
  existem as cores e formas do sistema, e a regra deixa de depender de disciplina.
- Alvo e linha com `max(2.75rem, 44px)`: acompanham o A+ e nunca ficam abaixo de 44 px no A−.
- Cor do contorno de foco definida em repouso: `transition-colors` também anima
  `outline-color`, e o foco surgia branco no botão primário por 160 ms.
- Classe de paleta desligada não dá erro, só some. Por isso `scripts/verificar-tokens.mjs`
  roda antes de todo build e reprova paleta padrão, supressão de foco, `dark:`, sombra, hex
  no código e `localStorage` fora do storage. Testado contra os arquivos reais do shadcn.
- `--overlay` = `#1C1917` a 50 %: menor valor redondo em que o modal branco atinge 3:1
  contra o fundo escurecido (WCAG 1.4.11). Escrito como `rgb()` porque, com `color-mix()`, o
  minificador gerava um fallback opaco.

**Pendente.** Favicon ainda é o padrão do Next.

---

## 2026-09-14 · Etapa 2 — Domínio

**Feito.** `lib/catalogo.ts` (Tabela 7 como dado), `calculos.ts`, `types.ts`,
`mock-data.ts`, `storage.ts`, `formatacao.ts` e o encaixe da IA. Verificado com 23 checagens,
incluindo o critério de aceite "criar → validar → progresso sobe".

**Decisões.**
- O modelo inicial (200 h, três categorias com teto e mínimo) foi inferido do protótipo e
  não era a regra do curso. `ADENDO-DOMINIO.md` o substituiu: cada tipo da Tabela 7 vale
  créditos fixos; 90 h exigidas; 15 h por crédito. As três constantes só existem em
  `calculos.ts`, e o verificador reprova 90, 15 e 6 em qualquer outro arquivo.
- Fila do docente derivada do status (decisão da equipe): toda atividade em análise está na
  fila. Mantém o modelo coerente com "a bola está com o aluno" quando a atividade é devolvida.
- Palestras acumulam entre registros e só blocos completos contam: o PPC libera o crédito
  pelo requisito cumprido, não por fração.
- Tipo não previsto é escolha explícita (`tipoId: null`), que avisa e não bloqueia. Sem
  detecção por palavras no título: o sistema não cria regra que o PPC não tem.
- Docente não aprova atividade sem tipo: reclassifica (com justificativa) ou recusa.
- Datas do seed relativas ao primeiro acesso, para a demonstração parecer atual.

**Pendente.** Confirmar o fator de 15 h por crédito na seção 3.5.4 do PPC.

---

## 2026-09-14 · Correções pós-etapa 2 — especificação das telas 06 e 07b

**Feito.** Textos corrigidos na seção 8 do `PROMPT-INICIAL.md`: "165 créditos homologados"
(no lugar de horas agregadas), "Turma 2022 · BCDIA", abas da validação em lote pelos quatro
grupos da Tabela 7 e "O lote valida as atividades e libera os créditos correspondentes".
Seed com esperas Bruno 9, Carla 9, Ana 8, Diego 3, Elisa 1. `.Rhistory` no `.gitignore`.
Início deste DEV-LOG.

**Decisões.**
- Correção feita antes das telas, não nas etapas 9 e 10: o texto da especificação alimenta
  os prompts seguintes, e texto velho gera tela errada.
- Mantida a copy "3 há mais de 7 dias" e ajustado o seed: a copy é o que a banca lê; o dado
  se adapta a ela.
- Hora agregada no painel do docente não tem significado no modelo de créditos; a métrica
  passou a ser créditos homologados.
- A atividade sem tipo previsto fica fora das abas do lote, porque só pode ser reclassificada
  ou recusada individualmente.

**Pendente.** Textos da seção 8 que ainda falam em categoria, horas solicitadas ou teto e que
o adendo não substitui explicitamente, à espera de decisão da equipe:
- 02: card do catálogo "O que é aceito e o teto de horas." (não há teto);
- 03: busca "por título ou categoria", colunas "Categoria" e "Horas", linha mobile
  "categoria · horas · período" e o texto do estado vazio ("…em cada categoria");
- 05: subtítulo "Ensino · 18 h solicitadas" e os rótulos "Categoria" e "Carga solicitada";
- 06: colunas "Categoria" e "Horas" da fila;
- 07: subtítulo "Ensino · 30 h solicitadas";
- 07b: subtítulo "da mesma categoria", barra "78 h a homologar", coluna "Horas" e rodapé
  "4 de 6 atividades de Ensino aptas ao lote".

---

## 2026-09-15 · Etapa 3 — Casca

**Feito.** Estrutura comum a todas as telas: link "Pular para o conteúdo", barra de
acessibilidade fixa (alto contraste, tamanho do texto A−/A/A+, modal de atalhos de teclado),
sidebar de 240 px dos dois perfis com item ativo em três sinais, menu deslizante abaixo de
768 px, `PageHeader` com a anatomia obrigatória, região `aria-live` única e os estados de
carregando, vazio e erro. `dialog` e `sheet` do shadcn entraram pelo procedimento obrigatório
(primeira execução real: o `button.tsx` foi preservado respondendo N à sobrescrita). A etapa
foi escrita em 2026-09-14 e verificada no navegador em 2026-09-15, depois de uma perda de
sessão: teclado, 1280 e 375 px, A−/A/A+, alto contraste, recarga sem piscar e sem erro de
hidratação.

**Decisões.**
- Preferências de acessibilidade são síncronas no `storage.ts`, exceção à regra dos 300 ms:
  com atraso, a tela piscaria em 100 % antes de ir a 125 %. Um script inline no `<head>` as
  aplica antes da primeira pintura; ele é gerado no `storage.ts`, para o `localStorage`
  continuar só lá.
- `useSyncExternalStore` na barra: o React usa o valor padrão na hidratação e o salvo logo
  depois, sem erro de hidratação nos `aria-pressed`.
- Alto contraste sem cor nova: reforça bordas e texto secundário com valores da própria paleta.
- Sem atalhos de uma tecla só (WCAG 2.1.4): conflitariam com leitores de tela. O modal lista
  as teclas padrão, útil para quem não navega por teclado no dia a dia.
- Uma única região `aria-live` para tudo (preferências, ações, erros), para evitar anúncios
  sobrepostos.
- "Nova atividade" fica fora da navegação: já é a ação primária dos cabeçalhos.

**Corrigido durante a verificação** (os testes automáticos passavam; as capturas de tela
mostraram os problemas):
- Botão "outline" usado num `<Link>` aparecia sem borda: fora do `<Button>`, as classes não
  passavam pelo `cn`, e `border-transparent` vencia. `buttonVariants` agora já devolve as
  classes resolvidas, então o erro não se repete em outros usos.
- Com A+, a sidebar cortava "Perfil discente" com reticências. Agora o texto quebra linha:
  quem aumenta o texto não perde informação.
- Com A+, o modal de atalhos abria rolado até o fim, com o título escondido, porque o
  primeiro focável era o "Fechar" do rodapé. O X de fechar passou a vir antes do conteúdo no
  DOM. Em confirmações destrutivas (tela 07), o foco também começa na opção menos arriscada.

**Pendente.**
- Os links da navegação para telas ainda não criadas dão 404 (inclusive nos prefetches do
  Next); somem conforme as etapas 4 a 12 criarem as páginas.
- "Trocar de perfil" e "Sair" são links simples até a sessão simulada da etapa 4.
- O bloco de perfil do menu mobile recarrega (skeleton de 300 ms) a cada abertura.
- Rotas temporárias `/casca` e `/docente/casca` e o item "Casca da interface" na navegação:
  remover nas etapas 5 e 9.
- Decidir na etapa 9 como o docente chega ao catálogo (`/catalogo` está no grupo do discente).
