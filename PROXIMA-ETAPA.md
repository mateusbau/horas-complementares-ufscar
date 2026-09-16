# PRÓXIMA ETAPA — histórico de decisões (roteiro concluído)

## 2026-09-16 — continuidade do OCR

A implementação de OCR está preparada para a branch `ocr`, com Git autenticado e histórico
remoto incorporado. Leia primeiro a atualização de 2026-09-16 em
`HANDOFF.md` e a entrada OCR no `DEV-LOG.md`: validação do preview Vercel, leitores de tela,
certificados com layouts variados e as pendências anteriores de lint são os próximos itens.
O texto abaixo registra o estado anterior à solicitação de OCR.

**As 12 etapas do roteiro estão concluídas** (2026-09-15) — não há próxima etapa planejada.
Este arquivo fica como histórico das decisões que foram sendo fechadas ao longo do projeto;
o estado de entrega, com o resultado de cada verificação, está em `HANDOFF.md` (seção "Estado
de entrega") e em `DEV-LOG.md` (entrada "Etapa 12 — Varredura final antes da entrega").

Entrega do hackathon: **17/09**.

---

## -1. Etapas 9 a 12 — concluídas

Painel do docente, fila completa, catálogo compartilhado, validação individual e em lote,
página "Sobre este protótipo", rota genérica para páginas de apoio e toda a varredura final
(links, primeiro minuto, percurso completo na URL publicada, Lighthouse/axe, critérios de
aceite, anonimato): implementados, buildados e verificados — local e na URL publicada. Nada
deste roteiro ficou pendente para a entrega.

`/docente`, `/docente/fila`, `/docente/catalogo`, `/catalogo` (discente),
`/docente/validacao/[id]`, `/docente/validacao/lote`, `/simulador`, `/avisos`, `/ajuda`,
`/docente/orientandos`, `/docente/relatorio` e `/sobre` já existem e funcionam. `/docente/casca`
e `VitrineCasca.tsx` já saíram (duas vezes — ver `HANDOFF.md`, seção 7, sobre o OneDrive).

---

## 0. Instrução recebida em 2026-09-15 — etapas 8 e 11, nesta ordem, sem parar

Gravada aqui antes de escrever código, para sobreviver a uma eventual compactação de contexto
(instrução explícita). Texto da instrução, na íntegra:

> As etapas 1 a 7 estão concluídas e publicadas. Execute agora as ETAPAS 8 E 11, EM SEQUÊNCIA,
> SEM PARAR ENTRE ELAS.
>
> Inverto a ordem do roteiro de propósito. Motivo, para constar no DEV-LOG: a etapa 8 fecha um
> link quebrado que já está publicado (a linha clicável da listagem aponta para uma tela
> inexistente), e a etapa 11 é o único item do edital — "gerar relatórios para entrega" — ainda
> sem nenhuma implementação. As duas valem mais, agora, do que o fluxo docente.
>
> **ETAPA 8 — DETALHE DA ATIVIDADE (tela 05), VERSÃO MAGRA.** Escopo deliberadamente enxuto. Não
> invente refinamento aqui.
> - Rota `/atividades/[id]`, recebendo a linha clicável que já existe.
> - Dados da atividade, o tipo da Tabela 7 com requisito e comprovante em texto literal, e o
>   cálculo explicado: o que o aluno informou, quantos créditos vale e por quê, incluindo o
>   arredondamento para baixo quando houver.
> - Linha do tempo a partir do histórico, simples: eventos com data e autor, sem elaboração
>   visual.
> - Parecer do docente conforme o adendo, quando existir.
> - Ações conforme o status: editar e enviar quando pendente, nada quando em análise.
> - Id inexistente cai no EstadoErro, nunca em erro cru.
>
> **ETAPA 11 — RELATÓRIO.** Requisito explícito do edital e o que substitui o papel que o aluno
> imprime hoje. Trate como entrega principal.
> - Rota própria, alcançável do painel e da listagem.
> - Somente atividades validadas. Deixe explícito na tela que as demais não entram e quantas
>   são.
> - Agrupado por tipo da Tabela 7, com créditos e horas contabilizadas por linha e total geral.
> - Cita `FONTE_TABELA_7` e a premissa do fator de 15 h derivada da matriz curricular, como já
>   fazem o painel e o catálogo.
> - Mostra o cumprimento da exigência de pelo menos dois tipos diferentes, citando a seção 3.5.4
>   do PPC.
> - Identificação do aluno, curso e data de emissão.
> - `@media print` escondendo barra de acessibilidade, sidebar, navegação e botões. A página
>   impressa precisa caber e ficar legível em A4 retrato, sem corte.
> - Botão de imprimir ou salvar em PDF via `window.print()`. Sem biblioteca nova.
> - Acessibilidade: conteúdo estruturado, não imagem. Cabeçalhos reais, tabela com cabeçalho
>   associado às células, ordem de leitura coerente no leitor de tela.
>
> **PROCEDIMENTO**
> - Um commit por etapa, `DEV-LOG.md` no mesmo commit, build limpo, push ao fim de cada uma.
> - Capturas em 1280 e 375 px, A−/A/A+, alto contraste e percurso por teclado. No relatório,
>   capture também a prévia de impressão.
> - ANTES de começar a escrever código, grave este bloco no `PROXIMA-ETAPA.md` e commite, para a
>   instrução sobreviver a uma eventual compactação de contexto.
> - Atualize `PROXIMA-ETAPA.md` ao terminar e pare ao fim da etapa 11.
>
> **ROTEIRO RESTANTE.** Depois deste bloco: etapas 9 e 10 (painel docente e validação, com o
> lote), e por último a etapa 12, reduzida a uma rota genérica no lugar das páginas de apoio,
> mais favicon próprio e varredura final contra os critérios de aceite. Entrega dia 17. Se algo
> cair por tempo, cai a etapa 12 e o refinamento do mobile docente — nunca o relatório.
>
> Pendência para a etapa 9: `/docente/casca` e o item "Casca da interface" da navegação docente
> ainda estão publicados e precisam sair.

---

## 1. Fator de 15 h por crédito — feito

**Feito** no painel (etapa 6): `formatarPremissaCredito()` em `lib/formatacao.ts`, citando a
matriz curricular, junto de "horas contabilizadas" em `ResumoProgresso.tsx`.

**Feito** também no **relatório** (etapa 11, 2026-09-15): mesma função, na seção "Total
consolidado".

---

## 2. Explicar "carga horária é o máximo, arredondada para baixo" — feito

**Feito** no cadastro (etapa 7): `formatarExplicacaoRequisito(tipoId)` como apoio do campo de
quantidade nos tipos "N h/semestre", e o aviso `carga-acima-do-maximo` quando as horas
informadas passam do teto do semestre.

**Feito** também no **detalhe da atividade** (tela 05, etapa 8, 2026-09-15): mesma função, só
para tipos em horas (`medidoEmHoras`) — para os demais, o texto seria idêntico ao já exibido na
linha "Requisito da Tabela 7" e foi omitido para não duplicar.

---

## 3. Exigência de dois tipos diferentes — feito

**Feito** no painel (etapa 6): a exigência aparece sempre, cumprida ou não, citando a seção
3.5.4 do PPC ("Tipos de atividade diferentes: 2 de 2 — exigência cumprida. O Projeto
Pedagógico (seção 3.5.4) exige pelo menos 2 tipos de atividade diferentes.").

**Feito** também no **relatório** (etapa 11, 2026-09-15): mesma leitura, usando
`progresso.tiposDistintos`/`tiposExigidos`.

---

## 4. Etapa 12 — feita (nada foi cortado)

Rota genérica cobrindo `/simulador`, `/avisos`, `/ajuda`, `/docente/orientandos` e
`/docente/relatorio`; favicon próprio; reinício da demonstração com botão na tela de login;
varredura contra os critérios de aceite da seção 11 do `PROMPT-INICIAL.md` e contra o edital
(13 de 13); conferência de anonimato. Nada precisou ser cortado — a etapa 11 (relatório
imprimível), que era a única marcada como "não pode cair", já estava concluída desde antes.
Detalhe de cada verificação: `DEV-LOG.md`, entrada da etapa 12.

---

## 5. Textos da especificação ainda com "categoria" ou "horas solicitadas" — feito

As telas 02 a 07b estão todas corrigidas (etapas 5 a 10), pela régua do crédito (`CLAUDE.md`):
a fila (06) usa "Tipo" e "Créditos"; a tela 07 não fala em carga solicitada, só em créditos e no
tipo declarado/reclassificado; o lote (07b) usa "grupo da Tabela 7" (não "categoria"), mostra
créditos (não "horas a homologar") e o rodapé por aba já é dinâmico ("N de M atividades de
{grupo} aptas ao lote"). Nenhum texto pendente desta lista.
