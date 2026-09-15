# PRÓXIMA ETAPA — decisões pendentes de aplicação

Decisões tomadas pela equipe em 2026-09-15, ao fim da etapa 5, que **ainda não estão no
código**. Valem a partir da etapa 6. Cada item diz o que fazer, onde, e como está hoje.
Contexto geral em `HANDOFF.md`; regras permanentes em `CLAUDE.md`.

Entrega do hackathon: **17/09**.

---

## 1. Colunas "Tipo" e "Créditos" (tela 03 e seguintes)

**Decisão.** A tela 03 (Minhas atividades) usa as colunas **"Tipo"** (tipo da Tabela 7) e
**"Créditos"**. As horas contabilizadas aparecem **só no rodapé** da listagem (ex.: "Total:
4 créditos · 60 horas contabilizadas"). Isso vale para **toda coluna, filtro ou rótulo** que
ainda diga "Categoria" ou "Horas", em qualquer tela.

**Onde ainda aparece** (texto da especificação, seção 8 do `PROMPT-INICIAL.md`):
- 03: busca "Buscar por título ou categoria", colunas "Categoria" e "Horas", linha do card
  mobile "categoria · horas · período", estado vazio "…em cada categoria";
- 05: subtítulo "Ensino · 18 h solicitadas" e os rótulos "Categoria" e "Carga solicitada";
- 06: colunas "Categoria" e "Horas" da fila;
- 07: subtítulo "Ensino · 30 h solicitadas";
- 07b: subtítulo "da mesma categoria", barra "78 h a homologar", coluna "Horas" e rodapé "4 de
  6 atividades de Ensino aptas ao lote".

Corrigir o texto da especificação de cada tela na etapa em que ela for construída.

---

## 2. Hifenização de "Complementares" no título do login

**Decisão.** Nada de hífen fixo nem `&shy;` no texto. O correto é `hyphens: auto` com
`lang="pt-BR"`. A **solução preferida** é reduzir o tamanho do título em 375 px, para a
palavra caber inteira.

**Como está hoje:**
- `app/page.tsx`: o `h1` usa hífen condicional: `Horas Comple{"­"}mentares`.
  **Remover.**
- `app/globals.css` (camada base): `h1`, `h2` e `h3` já têm `hyphens: auto`,
  `hyphenate-limit-chars: 12 6 6` e `overflow-wrap: break-word`. O `<html>` já tem
  `lang="pt-BR"`. Isso fica.
- O que a verificação mostrou: no Chrome do Windows, `hyphens: auto` **não hifenizou** o
  português, por falta de dicionário. A palavra quebrou em "Complementar-es" pelo
  `overflow-wrap`. Por isso a redução do tamanho é o caminho confiável.

**Referência para a redução** (estimativa, confirmar na captura):
- Em 375 px com A+ (texto a 125 %), o cartão do login deixa cerca de 309 px de largura útil.
- "Complementares" em negrito ocupa perto de 8,4 vezes o tamanho da fonte. Em 40 px (32 px
  × 125 %), dá uns 336 px, e **não cabe**.
- Com o estilo do h2 (24 px, 30 px em A+), dá uns 252 px, e **cabe**.
- Sugestão: `text-h2 sm:text-h1` no `h1` do login. O elemento continua `h1`; só o tamanho
  visual muda abaixo de 640 px.

Verificar em 375 px com A−, A, A+ e alto contraste.

---

## 3. Fator de 15 h por crédito declarado na interface

**Decisão.** O fator vira **premissa declarada** na interface, com citação da matriz
curricular do PPC, **em todo lugar onde o total em horas aparecer**: no painel e no relatório.

**Texto sugerido:** "Horas contabilizadas = créditos × 15 horas, pela definição de crédito da
matriz curricular do Projeto Pedagógico (Tabela 4)."

**Como aplicar:**
- **Não escreva 15 no código:** use `HORAS_POR_CREDITO` de `lib/calculos.ts`. O verificador
  de tokens reprova o número em qualquer outro arquivo. O mesmo vale para 90 e 6.
- **Painel (já construído, etapa 5):** acrescentar a nota junto de "60 de 90 horas
  contabilizadas", em `components/progresso/ResumoProgresso.tsx`. **Ainda não aplicado.**
- **Relatório (etapa 11):** incluir a nota no cabeçalho ou junto ao total.

Contexto: a seção 3.5.4 do PPC não converte as horas complementares em créditos; o fator vem
da matriz (H = 15 × C em todas as linhas). A confirmação com a coordenação segue pendente
(`ADENDO-DOMINIO.md`, seção 10).

---

## 4. Explicar "carga horária é o máximo, arredondada para baixo"

**Decisão.** A regra da seção 3.5.4 do PPC precisa ser explicada **em linguagem comum** no
**cadastro** (tela 04, etapa 7) e no **detalhe da atividade** (tela 05, etapa 8).

**A regra:** nos tipos "N h/semestre", a carga da Tabela 7 é o máximo reconhecido por
semestre. Menos horas valem proporcionalmente, sempre arredondando para baixo; horas acima do
máximo não valem.

**Texto sugerido** (Iniciação Científica): "Este tipo reconhece até 180 horas por semestre, que
valem 3 créditos. Menos horas valem proporcionalmente, sempre arredondando para baixo: 120
horas valem 2 créditos, e 90 horas valem 1."

**O que o domínio já oferece:**
- `creditosPorQuantidade`, que calcula os créditos das horas informadas;
- `mensagemAcimaDoMaximo` e o aviso `carga-acima-do-maximo` de `avisosDeCadastro`;
- `medidoEmHoras` e `cargaMaxima` no catálogo.

Falta um texto explicativo gerado a partir do tipo (sugestão: uma função em
`lib/formatacao.ts`), sem números escritos à mão.

---

## 5. Exigência de dois tipos diferentes: citar o PPC

**Decisão.** A exigência de pelo menos dois tipos de atividade diferentes **vem do PPC (seção
3.5.4)**. Ela aparece, com a fonte, no **painel** e no **relatório**.

**Como está hoje:**
- **Painel:** mostra "Tipos de atividade diferentes: 2 de 2 — exigência cumprida.", com ícone
  e texto. A citação ao Projeto Pedagógico **só aparece quando a exigência não está cumprida**
  ("— o Projeto Pedagógico exige pelo menos dois tipos diferentes"). Deixar a fonte visível
  também quando cumprida.
- **Relatório (etapa 11):** incluir a condição e a fonte.
- **No código:** `TIPOS_DISTINTOS_EXIGIDOS` em `lib/calculos.ts`; `tiposDistintos` e
  `tiposExigidos` no `Progresso`.

---

## 6. Escopo de corte, se faltar tempo

Ordem do que cortar primeiro:

1. **Etapa 12 (páginas de apoio)** vira uma **rota genérica**: uma página só, com a anatomia
   padrão, atendendo `/catalogo`, `/simulador`, `/avisos`, `/ajuda`, `/docente/orientandos` e
   `/docente/relatorio`. Nenhuma rota da navegação pode dar 404.
2. **Etapa 8 (detalhe da atividade)** em versão **magra**: dados, situação e parecer, sem os
   extras.

**Não pode cair:** a **etapa 11 (relatório imprimível)**, exigência do edital.
