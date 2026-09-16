# ADENDO AO PROMPT INICIAL — Modelo de domínio corrigido

> Este documento **substitui integralmente a seção 6** e a seção 9 (dados de demonstração) do
> `PROMPT-INICIAL.md`. Onde houver conflito, vale este arquivo.
> Motivo: a seção 6 original foi inferida do protótipo e não correspondia à regra real do curso.

---

## 1. A regra real

O curso é o **Bacharelado em Ciência de Dados e Inteligência Artificial (BCDIA)**, UFSCar
Sorocaba. As atividades complementares seguem a **Tabela 7 — Atividades Complementares** do
Projeto Pedagógico, e a exigência para integralizar é de **90 horas**.

A diferença essencial em relação ao que estava escrito antes:

> **A carga horária do certificado não é a carga horária que conta.**

Cada *tipo* de atividade previsto na Tabela 7 vale um número fixo de **créditos**, e a coluna
"Carga Horária" da tabela é o **requisito para obter** aqueles créditos — não uma quantidade
que se soma. Uma monitoria de 180 h/semestre não acrescenta 180 h ao progresso: ela vale
3 créditos.

Consequência direta: **horas de tipos diferentes não são intercambiáveis.** ACIEPES vale
3 créditos por 60 h/semestre, enquanto Monitoria vale 3 créditos por 180 h/semestre. Somar
horas de certificado como se fossem equivalentes contradiz a regra da própria universidade.

### Conversão crédito → hora

```ts
// lib/calculos.ts
export const HORAS_POR_CREDITO = 15
export const HORAS_EXIGIDAS = 90        // Tabela 2 do PPC do BCDIA
export const CREDITOS_EXIGIDOS = HORAS_EXIGIDAS / HORAS_POR_CREDITO  // 6
```

Mantenha esses três valores como **as únicas** fontes desses números em todo o projeto.
Nenhum outro arquivo escreve 90, 15 ou 6 literalmente.

> Nota para a equipe: a exigência de 90 h é certa (consta na Tabela 2 do PPC). O fator de
> 15 h por crédito é a leitura mais provável, porque produz 6 créditos exatos, enquanto outros
> fatores dariam número quebrado. Confirmar na seção 3.5.4 do PPC e, se divergir, alterar
> apenas a constante acima.

### Limites por tipo

O PPC consultado não explicita teto por tipo ou por grupo. **Não invente nenhum.** Deixe a
função de verificação preparada, mas inativa:

```ts
// Sem teto conhecido no PPC. Se a coordenação confirmar limites,
// preencher aqui — nenhuma outra parte do código muda.
export const TETOS_POR_TIPO: Partial<Record<TipoAtividadeId, number>> = {}
```

---

## 2. Catálogo de tipos — `lib/catalogo.ts`

Transcreva a Tabela 7 como dado, não como texto. Cada tipo:

```ts
type TipoAtividade = {
  id: TipoAtividadeId
  nome: string
  grupo: GrupoId                 // agrupamento apenas visual, ver seção 4
  unidade: 'semestre' | 'evento' | 'dia' | 'palestra' | 'trabalho' | 'semestre-completo'
  requisito: string              // texto literal da coluna "Carga Horária"
  creditos: number               // por unidade
  comprovante: string            // texto literal da coluna "Tipo de comprovante"
  vedadaDuplaContagem: boolean   // asterisco da tabela
  exigeSemestreCompleto: boolean // duplo asterisco (só Monitoria)
}
```

Conteúdo, na ordem da tabela:

| Tipo | Requisito | Créditos | Comprovante | Obs. |
|---|---|---|---|---|
| Monitoria (com ou sem bolsa) | 180 h/semestre | 3 | Relatório ou documento da PROGRAD ou declaração do docente | ** |
| Bolsista Atividade | 120 h/semestre | 2 | Relatório ou documento da PROGRAD | |
| Bolsista Treinamento | 180 h/semestre | 3 | Relatório ou documento da PROGRAD | |
| Atividades de Extensão (com ou sem bolsa) | 180 h/semestre | 3 | Relatório ou documento da PROEX/certificado | * |
| Iniciação Científica (com ou sem bolsa) | 180 h/semestre | 3 | Relatório e/ou documento da Comissão de IC ou declaração do docente | * |
| Participação em projeto (com ou sem bolsa) | 180 h/semestre | 3 | Relatório e/ou declaração do docente responsável | |
| Palestra não associada a eventos | 2 palestras | 1 | Declaração do organizador | |
| Congressos e Simpósios | 1 evento | 1 | Certificado de participação | |
| Feiras | 1 evento | 1 | Certificado de participação | |
| Organização de eventos | 1 dia de evento | 1 | Declaração emitida por órgão superior ou coordenador do evento | |
| Publicação de artigo científico completo | 1 trabalho | 3 | Cópia do trabalho com comprovação de publicação | * |
| Publicação de trabalho científico (resumo ou pôster) | 1 trabalho | 2 | Cópia do trabalho com comprovação de publicação | |
| Participação em competições na área (ex.: Maratona de Programação) | 1 dia | 1 | Certificado de Participação | |
| Estágios em empresa júnior/incubadora, entre outras (não obrigatório) | 180 h/semestre | 3 | Declaração emitida por órgão superior. Contrato da empresa que recebeu o serviço | * |
| Suporte em TI a Departamentos (ex.: Cursos da Universidade, Laboratórios de Ensino ou Pesquisa) | 180 h/semestre | 3 | Declaração emitida pela chefia de departamento ou coordenação do curso | |
| Apoio Técnico: desenvolvimento de software, material didático ou sites | 180 h/semestre | 3 | Declaração emitida por um docente responsável do departamento de computação ou contrato da empresa que recebeu o serviço | |
| Cargo de presidência em Centro Acadêmico ou Atlética | 1 semestre completo | 1 | Registro de nomeação em Ata oficial | |
| ACIEPES | 60 h/semestre | 3 | Ser aprovado na disciplina | * |
| Disciplina Eletiva | 60 h/semestre | 3 | Ser aprovado na disciplina | |

**Notas de rodapé da tabela, reproduzidas na interface onde forem relevantes:**

- `*` — "Atividades já validadas como outro tipo de atividade curricular não poderão ser
  validadas como Atividade complementar, sob pena de impedimento de validação em ambos."
- `**` — "A atividade de monitoria somente será validada se o monitor atuar durante todo o
  semestre letivo."

---

## 3. O que o aluno informa, e o que o sistema calcula

O formulário **não pede carga horária livre**. O aluno escolhe o tipo e informa a
**quantidade na unidade daquele tipo**:

- Monitoria → "quantos semestres?"
- Congressos e Simpósios → "quantos eventos?"
- Palestra não associada a eventos → "quantas palestras?" (2 palestras = 1 crédito)
- Publicação → "quantos trabalhos?"

O sistema calcula: `créditos = quantidade × creditos_do_tipo` (com a regra de agrupamento da
palestra), e `horas = créditos × HORAS_POR_CREDITO`.

Só atividades **validadas** entram no progresso.

### As três validações que o sistema faz no cadastro

Isto é o diferencial do projeto. São regras do PPC verificadas **antes** do envio, evitando a
recusa em vez de comunicá-la depois:

1. **Tipo não previsto.** Se o aluno descreve algo que não corresponde a nenhum tipo da
   Tabela 7, o sistema avisa antes do envio. É o caso mais comum de recusa.
2. **Dupla contagem** (regra do `*`). Ao escolher um tipo marcado com asterisco, o sistema
   exibe a advertência e pede confirmação explícita de que a atividade não foi validada como
   outro componente curricular — citando a penalidade de impedimento em ambos.
3. **Semestre completo** (regra do `**`). Ao escolher Monitoria, o sistema pede confirmação de
   atuação durante todo o semestre letivo, e informa que sem isso a atividade não é validada.

O comprovante exigido é mostrado no formulário com o **texto literal** da coluna "Tipo de
comprovante" daquele tipo, assim que o tipo é escolhido.

---

## 4. Grupos — apenas organização visual

A Tabela 7 é uma lista plana. Para o painel não virar uma lista de 19 linhas, agrupe os tipos:

- **Ensino e monitoria** — Monitoria, Bolsista Atividade, Bolsista Treinamento, ACIEPES,
  Disciplina Eletiva, Suporte em TI, Apoio Técnico
- **Pesquisa e publicações** — Iniciação Científica, Participação em projeto, Publicação de
  artigo completo, Publicação de resumo ou pôster
- **Extensão e eventos** — Atividades de Extensão, Palestras, Congressos e Simpósios, Feiras,
  Organização de eventos, Competições, Estágios em empresa júnior
- **Representação estudantil** — Cargo de presidência em Centro Acadêmico ou Atlética

> **Atenção:** este agrupamento é **nosso**, para leitura. O PPC não define mínimo nem teto por
> grupo. Portanto **não existe marcador de mínimo por categoria** — aquilo foi removido do
> projeto. Se a interface sugerir um mínimo que a regra não tem, ela está mentindo para o
> aluno. Em qualquer lugar onde o agrupamento apareça, deixe claro que é organização por
> natureza da atividade, não exigência do curso.

---

## 5. Painel — o que substitui o marcador de mínimo

**Nível 1 — Total.** Anel de progresso com as duas unidades, porque a confusão entre elas é a
dor central:

```
60 de 90 h
4 de 6 créditos · 66,7% concluído
Faltam 30 h (2 créditos) para a integralização
```

**Nível 2 — "O que fecha o que falta".** No lugar das barras com marcador, um bloco que
traduz o que falta em ações concretas, lido do catálogo:

```
Faltam 2 créditos. Isso equivale a, por exemplo:
· 1 publicação de resumo ou pôster  ....................  2 créditos
· 2 participações em congressos ou simpósios  ..........  2 créditos
· 4 palestras não associadas a eventos  ................  2 créditos
· 1 semestre de monitoria  .............................  3 créditos (excede)
```

Abaixo dele, as barras por grupo, sem marcador de mínimo, apenas mostrando de onde vieram os
créditos já obtidos.

Esse bloco é o **simulador** que o protótipo já previa como card de acesso rápido, trazido
para o painel. Ele responde a pergunta real do aluno, que não é "quanto já fiz", mas
"o que eu preciso fazer para fechar".

---

## 6. Dados de demonstração — substitui a seção 9

**Aluna:** Ana Liz Souza · RA 811902 · Discente · 3º ano
**Docente:** Prof.ª Renata Marques · DCoMP · iniciais RM
**Progresso:** 4 de 6 créditos · 60 de 90 h · 66,7% · faltam 30 h

| # | Atividade | Tipo (Tabela 7) | Qtd. | Créditos | Horas | Status |
|---|---|---|---|---|---|---|
| 1 | Monitoria de Algoritmos e Estruturas de Dados I | Monitoria | 1 semestre | 3 | 45 h | validada |
| 2 | Organização da Semana de Computação | Organização de eventos | 1 dia | 1 | 15 h | validada |
| 3 | Iniciação científica PIBIC · visão computacional | Iniciação Científica | 1 semestre | 3 | 45 h | em análise |
| 4 | Projeto de extensão Meninas Digitais | Atividades de Extensão | 1 semestre | 3 | 45 h | em análise |
| 5 | Minicurso de Git e GitHub · SeCoT XVIII | Congressos e Simpósios | 1 evento | 1 | 15 h | pendente |
| 6 | Publicação de resumo em anais de evento | Publicação de trabalho científico (resumo ou pôster) | 1 trabalho | 2 | 30 h | pendente |
| 7 | Curso online de banco de dados (Coursera) | — não previsto na Tabela 7 — | — | 0 | 0 h | recusada |

Contagem dos chips da tela 03: **Validadas 2 · Em análise 2 · Pendentes 2 · Recusadas 1**,
exatamente como no protótipo.

Observações sobre registros específicos:

- **#5** é a atividade da tela 05, devolvida com pendência. "Pendente de envio" e "devolvida
  com pendência · aguarda sua ação" são o mesmo estado sob a ótica do aluno: a bola está com
  ele. O parecer da docente passa a ser: *"O certificado não comprova a participação no evento
  completo. Reenvie o certificado emitido pela organização do SeCoT."*
- **#7** é o exemplo didático da regra 1: curso online de plataforma comercial não consta na
  Tabela 7. Motivo da recusa: *"Tipo de atividade não previsto na Tabela 7 do Projeto
  Pedagógico. Cursos em plataformas comerciais não constam entre os tipos aceitos."*
- Os textos literais do protótipo que citavam 87 h, 200 h, 43,5 % ou as categorias
  Ensino/Pesquisa/Extensão com mínimo **devem ser atualizados** para os números acima.

**Fila do docente** — remapeie os cinco itens para tipos reais da Tabela 7, mantendo nomes,
RAs e tempos de espera. Inclua ao menos um caso de monitoria para exercitar a regra do `**`.

---

## 7. Tela 07 — o que o docente decide

O docente **não digita carga horária livre**. Isso deixa de fazer sentido: a carga vem do tipo.
O que ele faz, na ordem:

1. Confere se o comprovante corresponde ao **tipo declarado**.
2. Pode **reclassificar o tipo** — o que recalcula os créditos automaticamente e mostra o
   antes e depois, com justificativa obrigatória quando houver mudança.
3. Para Monitoria, confirma explicitamente a atuação no semestre completo (regra do `**`).
4. Aprova, devolve com pendência ou recusa. Devolver e recusar seguem exigindo comentário.

O bloco "Dados enviados" passa a mostrar: tipo declarado, requisito do tipo, créditos e horas
resultantes, comprovante exigido pela tabela, progresso do discente (`60 de 90 h`) e se o tipo
é marcado com `*` ou `**`.

---

## 8. O que isso muda nas etapas seguintes

- **Etapa 2 (Domínio)** — é reescrita por este adendo. `catalogo.ts` é novo e vem primeiro.
- **Etapa 5 (Painel)** — sem marcador de mínimo; com o bloco "o que fecha o que falta".
- **Etapa 7 (Formulário)** — campo de quantidade na unidade do tipo, não carga horária livre;
  as três validações da seção 3; comprovante exigido exibido literalmente.
- **Etapa 10 (Validação docente)** — reclassificação de tipo no lugar de digitar horas.
- **Relatório** — agrupa por tipo da Tabela 7, com créditos e horas, e cita a tabela como
  fonte. É o documento que a secretaria recebe, então precisa falar a língua do PPC.

Todo o restante do `PROMPT-INICIAL.md` — identidade visual, acessibilidade, arquitetura,
`lib/storage.ts`, ordem de execução, critérios de aceite — **continua valendo sem alteração**.

---

## 9. Ajustes posteriores (revisão da etapa 2)

- **Esperas da fila.** Para o indicador "3 há mais de 7 dias" da tela 06 ser verdadeiro, o
  seed passa a ter Bruno 9 dias, Carla 9, Ana 8, Diego 3 e Elisa 1 (antes: 9, 7, 5, 3 e 1).
  Vale sobre o "mantendo tempos de espera" da seção 6.
- **Fila derivada do status.** Um item da Ana está na fila se, e somente se, estiver em
  análise. O #5 (devolvido) não está na fila; entram o #3 e o #4.
- **Textos das telas 06 e 07b** foram corrigidos diretamente na seção 8 do `PROMPT-INICIAL.md`:
  "165 créditos homologados", "Turma 2022 · BCDIA", abas pelos quatro grupos e "O lote valida
  as atividades e libera os créditos correspondentes".

---

## 10. Leitura da seção 3.5.4 do PPC (2026-09-15)

Conferido no PPC oficial (versão final de janeiro de 2026, publicado pela PROGRAD). Onde esta
seção conflita com as seções 1, 3 e 6 deste adendo, **vale esta seção**.

**Carga horária é máxima, com validação fracionada.** A 3.5.4 diz: "Para cada atividade, a
tabela indica a uma carga horária máxima que pode ser reconhecida, o número de créditos que
serão validados para essa carga (…) Ainda que seja cumprido um número de créditos maior que o
limite em uma determinada atividade, os créditos excedentes não serão validados. As atividades
podem ter validação fracionada com arredondamento para baixo."

- Nos 11 tipos com carga "N h/semestre", o aluno informa **as horas do comprovante** (não
  semestres). Créditos = arredondar para baixo(horas × créditos ÷ carga máxima), limitados aos
  créditos do tipo. Cada registro vale um semestre; atividade de mais de um semestre é
  registrada semestre a semestre. Ex.: IC de 90 h vale 1 crédito; eletiva de 40 h vale 2
  créditos (30 horas contabilizadas).
- Nos tipos por unidade (evento, palestra, trabalho, dia, semestre completo) nada muda; o
  arredondamento para baixo confirma a regra das palestras (3 palestras = 1 crédito).
- Isto substitui "Monitoria → quantos semestres?" da seção 3 e a coluna "Qtd." da seção 6
  para esses tipos. O seed passou a usar horas; os créditos da Ana não mudam (4 de 6).

**Dois tipos diferentes.** A 3.5.4 diz: "o discente deverá cumprir no mínimo 90 horas de
atividades complementares, em pelo menos dois tipos de atividades diferentes." Integralizar
exige os créditos **e** pelo menos dois tipos da Tabela 7 com crédito validado.

**Atividades fora da tabela.** A 3.5.4 diz: "Outras atividades não contempladas na tabela
poderão ser validadas somente com a aprovação do conselho." O aviso da regra 1 passou a citar
isso. O docente continua sem aprovar atividade sem tipo: quem decide é o conselho.

**Fator de 15 h por crédito.** A 3.5.4 não converte as 90 h em créditos, e a linha
"Atividades Complementares" da matriz curricular (Tabela 4) deixa os créditos em branco. O
fator foi adotado pela definição de crédito da própria matriz: "C é o número total de créditos
(…) e H é a carga horária da atividade", com H = 15 × C em todas as linhas (4 créditos = 60 h;
140 créditos = 2.100 h). A confirmação com a coordenação segue pendente.
