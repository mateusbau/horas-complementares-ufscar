# PRÓXIMA ETAPA — decisões pendentes de aplicação

Decisões tomadas pela equipe em 2026-09-15 que ainda não estão totalmente aplicadas. Itens 1 a
5 foram decididos ao fim da etapa 5 e majoritariamente aplicados nas etapas 6 e 7 (ver
`DEV-LOG.md`); o que resta de cada um está listado abaixo, só para as etapas 8 e 11 — **não
repita o que já foi feito.** Contexto geral em `HANDOFF.md`; regras permanentes em `CLAUDE.md`.

Entrega do hackathon: **17/09**.

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

## 1. Fator de 15 h por crédito — falta o relatório

**Feito** no painel (etapa 6): `formatarPremissaCredito()` em `lib/formatacao.ts`, citando a
matriz curricular, junto de "horas contabilizadas" em `ResumoProgresso.tsx`.

**Falta:** a mesma nota no **relatório** (etapa 11), no cabeçalho ou junto ao total. Use
`formatarPremissaCredito()`; não escreva 15 (nem 90, nem 6) fora de `lib/calculos.ts` — o
verificador reprova.

---

## 2. Explicar "carga horária é o máximo, arredondada para baixo" — feito

**Feito** no cadastro (etapa 7): `formatarExplicacaoRequisito(tipoId)` como apoio do campo de
quantidade nos tipos "N h/semestre", e o aviso `carga-acima-do-maximo` quando as horas
informadas passam do teto do semestre.

**Feito** também no **detalhe da atividade** (tela 05, etapa 8, 2026-09-15): mesma função, só
para tipos em horas (`medidoEmHoras`) — para os demais, o texto seria idêntico ao já exibido na
linha "Requisito da Tabela 7" e foi omitido para não duplicar.

---

## 3. Exigência de dois tipos diferentes — falta o relatório

**Feito** no painel (etapa 6): a exigência aparece sempre, cumprida ou não, citando a seção
3.5.4 do PPC ("Tipos de atividade diferentes: 2 de 2 — exigência cumprida. O Projeto
Pedagógico (seção 3.5.4) exige pelo menos 2 tipos de atividade diferentes.").

**Falta:** a mesma condição e fonte no **relatório** (etapa 11). Use
`progresso.tiposDistintos`/`tiposExigidos` (já existem no `Progresso`), não invente uma nova
leitura da regra.

---

## 4. Escopo de corte, se faltar tempo

Ordem do que cortar primeiro:

1. **Etapa 12 (páginas de apoio)** vira uma **rota genérica**: uma página só, com a anatomia
   padrão, atendendo `/catalogo`, `/simulador`, `/avisos`, `/ajuda`, `/docente/orientandos` e
   `/docente/relatorio`. Nenhuma rota da navegação pode dar 404.
2. ~~Etapa 8 (detalhe da atividade) em versão magra~~ — feita em 2026-09-15, já na versão
   magra (dados, situação e parecer, sem extras); não sobrou nada a cortar aqui.

**Não pode cair:** a **etapa 11 (relatório imprimível)**, exigência do edital.

---

## 5. Textos da especificação ainda com "categoria" ou "horas solicitadas"

As telas 02, 03, 04 e 05 já foram corrigidas (etapas 5, 6, 7 e 8). Continuam por corrigir, na
etapa em que cada uma for construída, pela régua do crédito (`CLAUDE.md`):
- 06: colunas "Categoria" e "Horas" da fila;
- 07: subtítulo "Ensino · 30 h solicitadas";
- 07b: subtítulo "da mesma categoria", barra "78 h a homologar", coluna "Horas" e rodapé "4 de
  6 atividades de Ensino aptas ao lote".
