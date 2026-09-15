# PRÓXIMA ETAPA — decisões pendentes de aplicação

Decisões tomadas pela equipe em 2026-09-15 que ainda não estão totalmente aplicadas. Itens 1 a
5 foram decididos ao fim da etapa 5 e majoritariamente aplicados nas etapas 6 e 7 (ver
`DEV-LOG.md`); o que resta de cada um está listado abaixo, só para as etapas 8 e 11 — **não
repita o que já foi feito.** Contexto geral em `HANDOFF.md`; regras permanentes em `CLAUDE.md`.

Entrega do hackathon: **17/09**.

---

## 1. Fator de 15 h por crédito — falta o relatório

**Feito** no painel (etapa 6): `formatarPremissaCredito()` em `lib/formatacao.ts`, citando a
matriz curricular, junto de "horas contabilizadas" em `ResumoProgresso.tsx`.

**Falta:** a mesma nota no **relatório** (etapa 11), no cabeçalho ou junto ao total. Use
`formatarPremissaCredito()`; não escreva 15 (nem 90, nem 6) fora de `lib/calculos.ts` — o
verificador reprova.

---

## 2. Explicar "carga horária é o máximo, arredondada para baixo" — falta o detalhe

**Feito** no cadastro (etapa 7): `formatarExplicacaoRequisito(tipoId)` como apoio do campo de
quantidade nos tipos "N h/semestre", e o aviso `carga-acima-do-maximo` quando as horas
informadas passam do teto do semestre.

**Falta:** a mesma explicação no **detalhe da atividade** (tela 05, etapa 8), para quem só vê
a atividade depois de enviada (o parecer do docente pode citar essa regra, por exemplo).
Reaproveite `formatarExplicacaoRequisito`, não escreva o texto de novo.

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
2. **Etapa 8 (detalhe da atividade)** em versão **magra**: dados, situação e parecer, sem os
   extras.

**Não pode cair:** a **etapa 11 (relatório imprimível)**, exigência do edital.

---

## 5. Textos da especificação ainda com "categoria" ou "horas solicitadas"

As telas 02, 03 e 04 já foram corrigidas (etapas 5, 6 e 7). Continuam por corrigir, na etapa em
que cada uma for construída, pela régua do crédito (`CLAUDE.md`):
- 05: subtítulo "Ensino · 18 h solicitadas" e os rótulos "Categoria" e "Carga solicitada";
- 06: colunas "Categoria" e "Horas" da fila;
- 07: subtítulo "Ensino · 30 h solicitadas";
- 07b: subtítulo "da mesma categoria", barra "78 h a homologar", coluna "Horas" e rodapé "4 de
  6 atividades de Ensino aptas ao lote".
