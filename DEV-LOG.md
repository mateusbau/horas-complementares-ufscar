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

---

## 2026-09-15 · Correção do domínio pela seção 3.5.4 do PPC

**Feito.** Antes de desenhar o painel, a equipe pediu para confirmar o fator de 15 h por
crédito. O adendo não o confirmava (dizia "leitura mais provável"). Lemos a seção 3.5.4 no PPC
oficial publicado pela PROGRAD, e ela trouxe mais do que o fator. Domínio, seed, adendo e
`CLAUDE.md` foram corrigidos; 31 checagens do domínio passam.

**Decisões (tomadas pela equipe, com a citação da fonte na mão).**
- **Fator de 15 h:** mantido. A 3.5.4 não converte as horas complementares em créditos, mas a
  matriz curricular (Tabela 4) define crédito com H = 15 × C em todas as linhas. A fonte ficou
  citada no código; a confirmação com a coordenação segue pendente.
- **Carga horária é máxima, com fração arredondada para baixo** (texto literal do PPC). O
  adendo a lia como requisito e pedia semestres inteiros, o que superestimava atividades
  parciais: uma IC de 90 h viraria 3 créditos, e o PPC dá 1. Nos 11 tipos "N h/semestre" o
  aluno agora informa as horas do comprovante; cada registro é um semestre, com teto. É também
  a leitura que dá sentido à régua do crédito: uma eletiva de 40 h vale 30 horas contabilizadas.
- **Dois tipos diferentes:** regra do PPC que o adendo não tinha. Sem ela, o painel diria
  "integralizado" para quem tem 6 créditos de um tipo só.
- **Atividade fora da tabela:** o aviso passou a citar que só o conselho do curso a valida.
- A versão do estado salvo subiu para 2: navegadores com o seed antigo (quantidade em
  semestres) teriam os créditos zerados, então o estado antigo é descartado e recriado.
- Horas passam a ser escritas por extenso ("30 horas"), pela regra de não abreviar.

**Pendente.** Confirmar o fator de 15 h com a coordenação. As telas 04 e 07 (etapas 7 e 10)
precisam pedir horas nos tipos em horas e mostrar o aviso de teto, já pronto no domínio.

---

## 2026-09-15 · Etapa 4 — Login (tela 01)

**Feito.** A vitrine de tokens em `/` virou a tela de login. Ela tem o perfil de acesso, os
campos institucionais, "Esqueci minha senha" e os dois caminhos de entrada. A sessão simulada
foi para o `storage.ts` (iniciar, obter, trocar de perfil, encerrar), e "Trocar de perfil" e
"Sair" da sidebar passaram a usá-la. As telas com navegação agora exigem sessão. Os destinos
de cada perfil ficam num só lugar, `lib/rotas.ts`. Também entrou o componente `Campo`
(label, apoio e erro ligados ao controle), reutilizável na tela 04, e o `input` do shadcn,
pelo procedimento obrigatório. Verificado no navegador em 1280 e 375 px, com A−/A/A+ e alto
contraste, por teclado e nos fluxos de sessão.

**Decisões.**
- **Visitante discente cai em `/painel`**, criado na etapa 5 desta mesma execução.
- **Visitante docente cai em `/docente/casca`**, temporariamente, até a tela 06 nascer na
  etapa 9. Nunca em 404.
- **"Entrar" com os campos é simulado:** valida os campos e abre os mesmos dados de
  demonstração. O formulário diz isso por escrito, para quem testar com as próprias
  credenciais não estranhar ver a Ana.
- **Perfil com rádios nativos:** Tab e setas funcionam sem código extra. O foco é desenhado no
  cartão inteiro, e o indicador visual (círculo marcado) não depende de cor.
- **Validação ao sair do campo, com duas exceções:**
  - campo nunca editado não mostra erro ao receber Tab (atravessar não é engano);
  - se o foco sai para um botão do formulário, a validação é pulada, porque o envio valida
    tudo.

  A segunda exceção corrige um defeito achado na verificação: o erro aparecia no `mousedown`,
  empurrava o "Entrar" para baixo, e o clique se perdia.
- **A guarda de sessão não bloqueia a tela:** a verificação leva os mesmos 300 ms do skeleton.
  Link direto para a área do outro perfil atualiza a sessão, e a rota vence.
- **"Esqueci minha senha" abre uma explicação,** não uma página que não existe no protótipo.
- **Títulos hifenizam só palavras longas** (regra global de `h1` a `h3`), e o título do login
  tem hífen condicional. Em 375 px com A+, "Complementares" vazava da tela; o Chrome no
  Windows não tem dicionário de português e quebrava em "Complementar-es".
- **O push da etapa 4 foi junto com o da etapa 5,** para não publicar o caminho do visitante
  discente em 404.

**Pendente.**
- `INICIO_DO_PERFIL.docente` aponta para `/docente/casca`; trocar para `/docente` na etapa 9.
- Na tela 04, a validação ao sair deve seguir as mesmas duas exceções do login.

---

## 2026-09-15 · Etapa 5 — Painel do discente (tela 02)

**Feito.** Painel em `/painel` com quatro blocos: "Seu progresso" (anel), "O que fecha o que
falta", "De onde vieram seus créditos" (barras por grupo) e "Acesso rápido". A rota de teste
`/casca` e o item dela na navegação do discente saíram; a do docente fica até a etapa 9. O
texto da tela 02 foi reescrito na especificação. Entrou também uma página própria de endereço
inexistente, em português. Verificado em 1280 e 375 px, com A−/A/A+ e alto contraste, por
teclado e no caminho da banca: um clique em "Entrar como visitante" leva ao painel carregado.

**Decisões.**
- **Régua do crédito** (decisão da equipe, vale para todas as telas): o crédito é a medida
  principal ("4 de 6 créditos"); a hora só aparece como requisito do tipo ("180 h/semestre
  valem 3 créditos") ou como total secundário, "60 de 90 horas contabilizadas", nunca
  "cumpridas".

  Motivo: a carga do certificado não é a carga contabilizada. Um curso de 40 h pode valer 2
  créditos, ou seja, 30 horas contabilizadas. Se a interface disser só "horas", o aluno soma
  os certificados, chega a outro número e conclui que o sistema errou. O sistema existe
  justamente para mostrar essa diferença.
- **Sugestões ordenadas por esforço de obtenção**, em cinco níveis pelo que a atividade exige
  do aluno:
  1. participação aberta;
  2. disciplina com aprovação;
  3. vínculo ou seleção;
  4. produção científica;
  5. cargo eletivo.

  O painel mostra a opção mais simples de cada um dos quatro primeiros níveis, para dar
  variedade real. A classificação é nossa, não do PPC, e está declarada assim no código
  (`NIVEIS_ESFORCO`). A ordenação neutra punha "bolsista atividade", a menos acessível, em
  primeiro.
- **A exigência de dois tipos diferentes** aparece no próprio bloco de progresso, com ícone e
  texto.
- **Barras por grupo sem marcador de mínimo**, com `AVISO_AGRUPAMENTO`, em relação ao total
  exigido, listando os tipos que contribuíram.
- **Contador da central de avisos real** (atividades que aguardam ação do aluno), no lugar do
  "3 novos" fixo da especificação, que não correspondia a nenhum dado.
- **Cartões de atalho inteiros como link:** um só Tab e um só contorno de foco. O nome
  acessível é o título, e a descrição vai por `aria-describedby`.

**Corrigido durante a verificação** (só as capturas mostraram):
- No alto contraste, a trilha do anel e das barras usava a cor de borda, que escurece. O
  laranja do progresso ficava a ~1,4:1 dela e sumia em escala de cinza. Criado o token
  `--trilha`, que não muda.
- O contador "2 atividades aguardam sua ação" quebrava dentro da pílula; virou linha de texto.

**Pendente.**
- "Nova atividade" e os atalhos levam a telas das etapas 6 a 12; até lá, caem na página de
  não encontrada.
- O docente continua caindo em `/docente/casca` até a etapa 9.

---

## 2026-09-15 · Etapa 6 — Listagem (tela 03)

**Feito.** Antes da tela, aplicadas três decisões pendentes de `PROXIMA-ETAPA.md` que valem
para todo o sistema: título do login sem `&shy;` (agora `text-h2 sm:text-h1`, que cabe inteiro
em 375 px com A+ sem depender de hifenização); a premissa do fator crédito → hora, com a
fonte, junto de "horas contabilizadas" no painel (`formatarPremissaCredito`); e a exigência de
dois tipos citando a seção 3.5.4 do PPC sempre, não só quando pendente. Depois, `/atividades`:
busca, filtro por status com contagem, ordenação por créditos e por período (com
`aria-sort`), estado vazio de filtro, `?demo=vazio` e cards no mobile. Verificado em 1280 e
375 px, A−/A/A+ e alto contraste, por teclado, e os três itens corrigidos antes foram
reverificados no painel e no login.

**Decisões.**
- **Colunas Tipo e Créditos** (`PROXIMA-ETAPA.md`, item 1): a coluna Créditos mostra o que a
  atividade vale pelo tipo declarado mesmo antes de validada — mesmo cálculo que a fila do
  docente já fazia (`creditosDaAtividade`), agora também na lista do aluno. As horas só
  aparecem, agregadas, no rodapé.
- **Rodapé mostra o progresso real, não o filtrado:** "Total: 4 créditos · 60 de 90 horas
  contabilizadas" não muda ao filtrar por status, porque é o mesmo progresso do painel (só
  atividades validadas contam), não uma soma da lista visível.
- **Linha inteira clicável com um link real na primeira célula:** o clique em qualquer ponto
  da linha navega (`onClick` no `<tr>`), e o título é um `<Link>` de verdade, alcançável por
  Tab e ativado com Enter — a navegação não depende de nenhum comportamento só de mouse.
- **Texto de busca "por título ou tipo"**, não "por categoria": já não existe categoria.

**Corrigido durante a verificação** (só a captura de `?demo=vazio` mostrou):
- Com `?demo=vazio`, a lista zerava mas o progresso continuava vindo do estado real da
  demonstração (4 de 6 créditos) — o subtítulo dizia "0 registros · 4 créditos de 6
  contabilizados", contradizendo o próprio estado vazio. O progresso passou a ser calculado
  sobre a mesma lista exibida (`calcularProgresso`, não mais uma segunda chamada ao storage),
  então o vazio força também os créditos a zero.
- Um `<th>` estava aninhado dentro de outro `<th>` (o cabeçalho ordenável retornava seu
  próprio `<th>`, e o pai o envolvia em mais um): HTML inválido e nó de acessibilidade
  duplicado, achado pela verificação automática por teclado ao localizar o cabeçalho.

**Pendente.** `/atividades/nova` e `/atividades/[id]` (etapas 7 e 8) — os links da tabela para
o detalhe e o botão "Nova atividade" caem na página de não encontrada até lá.

---

## 2026-09-15 · Etapa 7 — Formulário (tela 04)

**Feito.** `/atividades/nova`: título, tipo de atividade (os 19 da Tabela 7 mais "Não encontrei
um tipo correspondente"), quantidade só depois de escolher o tipo — rótulo e sufixo vêm do
catálogo (`pergunta`, `UNIDADES`) —, as confirmações condicionais (*)/(**), período opcional,
comprovante por arrastar-e-soltar ou seleção, observações, envio e rascunho automático.
Também os componentes `Campo`, `CampoConfirmacao`, `CampoComprovante` e os primitivos `Select`
e `Checkbox`. Verificado em 1280 e 375 px, A−/A/A+ e alto contraste, por teclado, e o caminho
completo (preencher → enviar → aparecer em `/atividades` com o status e os créditos certos).

**Decisões.**
- **Quantidade nos tipos "N h/semestre" pede as horas do comprovante**, não semestres —
  reaproveita a leitura da seção 3.5.4 do PPC fixada antes do painel (etapa 5): a carga é o
  máximo por semestre, e horas acima dele não valem (aviso não bloqueante,
  `mensagemAcimaDoMaximo`). A explicação (`formatarExplicacaoRequisito`) calcula o exemplo a
  partir do próprio tipo — nenhum número de crédito ou hora foi escrito à mão na tela.
- **"Não encontrei um tipo correspondente" é uma escolha, não um estado neutro:** a seleção
  vazia inicial ("") e a escolha explícita de "nenhum" são estados distintos na tela, mesmo
  os dois resultando em `tipoId: null` para o domínio — só a escolha explícita mostra o aviso
  da regra 1 (tipo não previsto).
- **Validação ao sair do campo com as mesmas duas exceções do login** (campo nunca editado;
  foco indo para um botão do formulário), generalizada para seis campos por uma função
  compartilhada (`aoSairCampo`), em vez de repetida seis vezes.
- **Rascunho é um documento à parte** (`lib/storage.ts`, `salvarRascunho`/`obterRascunho`),
  não uma `Atividade` incompleta: aceita dados parciais, sem validação, e nunca aparece em
  `listarAtividades()`. Autosave 1,5 s depois da última mudança; "Salvar rascunho" força o
  salvamento na hora. Ao carregar a tela, um rascunho existente prefila o formulário
  silenciosamente — é uma recuperação, não uma decisão que peça confirmação.
- **Comprovante exigido e tipo de arquivo/tamanho são checados no componente da tela**, não em
  `lib/calculos.ts`: não são regra de crédito, são restrição de arquivo.
- **O botão "Selecionar arquivo" é o único caminho garantido por teclado** para o comprovante;
  o `<input type="file">` fica fora da ordem de tabulação (`tabIndex={-1}`) para não duplicar
  o alvo, e arrastar é só conveniência de mouse.

**Corrigido durante a verificação:**
- Com a tela recém-aberta, sem nenhum tipo escolhido, o aviso "Esta atividade não corresponde
  a nenhum tipo da Tabela 7…" já aparecia — a captura de tela pegou. `tipoId` derivado da
  seleção vazia ("nada escolhido ainda") também dá `null`, igual à escolha explícita de
  "nenhum", e o aviso só checava `tipoId === null`. Corrigido para só mostrar o aviso quando o
  usuário de fato escolheu "Não encontrei um tipo correspondente".
- Um `<th>` de cabeçalho ordenável, reaproveitado da etapa 6, não se aplica aqui, mas o mesmo
  cuidado (reler a tela renderizada, não só os testes) valeu de novo: sem ele, o aviso
  prematuro teria ido para produção.
- Uma regra de lint nova do Next 16 (`react-hooks/refs`, ligada ao React Compiler) reprovou
  passar `ref` por uma prop com nome próprio (`botaoRef`, e um `ref` usado fora do padrão de
  render-prop de `Campo`) — falso positivo para o padrão de encaminhar um ref a um elemento
  interno de um componente composto. Liberado com `eslint-disable-next-line` e o motivo, no
  mesmo espírito do `tokens-ok:` do verificador de tokens.

**Pendente.**
- `formatarExplicacaoRequisito` ainda falta no detalhe da atividade (tela 05, etapa 8) e
  `formatarPremissaCredito`/a citação de dois tipos ainda faltam no relatório (etapa 11) —
  registrado em `PROXIMA-ETAPA.md`.
- "Ver catálogo" leva a `/catalogo`, que ainda não existe (etapa 12); cai na página de não
  encontrada.

---

## 2026-09-15 · Etapa 8 — Detalhe da atividade (tela 05), versão magra

**Feito.** `/atividades/[id]`, recebida pela linha clicável da listagem (etapa 6) que até aqui
caía em "página não encontrada". Escopo enxuto pedido pela equipe: comprovante (só nome e
tamanho — não há arquivo de verdade, por isso um placeholder explica isso em vez de fingir uma
pré-visualização), Situação (linha do tempo a partir de `atividade.historico`, sem elaboração
visual: rótulo, autor e data por evento), Dados da atividade (tipo, requisito e comprovante
exigido literais da Tabela 7, o que a discente informou, período, validador) e Parecer do
docente (badge da decisão, comentário, reclassificação quando houver, assinatura). Ações por
status: `pendente` mostra Editar e Enviar para validação; `analise` e os status finais não
mostram ação alguma. Id inexistente cai no `EstadoErro` (código HC-404), nunca em erro cru —
com "Tentar novamente" (repete a busca) porque o padrão já existente não previa um terceiro
botão, e refazer a busca é uma ação válida mesmo quando o resultado deve se repetir.

Junto, `/atividades/[id]/editar` e `FormularioEditarAtividade`: a ação "Editar" do detalhe
precisa levar a algum lugar, e a única edição que faz sentido pelo domínio é a de uma atividade
`pendente` (regra já existente em `atualizarAtividade`, `lib/storage.ts`). Reaproveita os
mesmos blocos do cadastro (`Campo`, `CampoComprovante`, `CampoConfirmacao`, `Select`) e a mesma
validação de `lib/calculos.ts`, mas sem rascunho automático — é um registro já salvo, não um
formulário em andamento — e sem a ação de enviar: salvar volta para o detalhe, e o envio
acontece lá, como uma ação separada (a instrução da etapa pediu "editar **e** enviar", não um
botão só). Uma atividade que não está mais `pendente` (por exemplo, o link editado à mão para
uma em análise) mostra um aviso e um link de volta, sem tentar renderizar o formulário.

**Decisões.**
- **"Enviar para validação" chama `enviarAtividade` direto do detalhe**, sem navegar — já era o
  plano do `HANDOFF.md` para esta etapa. Falha (ex.: comprovante ausente, no caso #6 do seed,
  cadastrada mas nunca enviada) aparece como uma mensagem inline abaixo do cabeçalho, com as
  mensagens de `ErroDeRegra`; sucesso atualiza o estado local sem recarregar a página, e os
  botões de ação somem porque o status deixa de ser `pendente`.
- **O rótulo do parecer não é o `StatusBadge` da atividade.** A primeira versão reusava
  `StatusBadge(atividade.status)` dentro de "Parecer do docente"; para uma devolução, o status
  vira `pendente` ("a bola está com o aluno") e o badge dizia "Pendente de envio" — verdadeiro,
  mas fora de lugar sob um parecer, que deveria dizer o que o docente decidiu. Corrigido com um
  badge próprio por `DecisaoParecer` (aprovar/devolver/recusar), reaproveitando as mesmas cores
  de status (sucesso/pendente/recusa) pelo significado, não pelo enum.
- **A explicação do arredondamento (`formatarExplicacaoRequisito`, item 2 do
  `PROXIMA-ETAPA.md`) só aparece quando acrescenta algo.** Para tipos em horas, mostra o texto
  completo (teto do semestre, proporção, exemplo calculado). Para tipos por unidade (evento,
  palestra...), a função devolve a mesma frase de `formatarRequisito`, já exibida na linha
  "Requisito da Tabela 7" — repeti-la no rodapé só duplicava a tela; a primeira versão
  duplicava, corrigido antes do commit.
- **Autor dos eventos da linha do tempo**: só existe uma docente na demonstração, então
  `obterDocenteAtual()` (sem relação individual por `parecer.docenteId`) já identifica quem
  decidiu; "enviada"/"reenviada" são sempre "Você" — é a própria discente vendo a própria
  atividade, não faz sentido citar o nome dela.
- **`atv-ana-resumo-anais` (#6, pendente sem nunca ter sido enviada) tem `historico: []`.** A
  Situação trata a lista vazia como um estado à parte ("Nenhum evento registrado ainda..."), não
  como uma linha do tempo malformada.

**Corrigido durante a verificação:** o parecer badge (acima) e a explicação duplicada (acima) —
os dois só apareceram nas capturas reais, comparando uma atividade validada com uma devolvida e
uma em análise lado a lado, não nos testes automáticos de navegação e foco.

**Pendente.** Nada pendente de etapas anteriores restou para o relatório: a citação de
`formatarPremissaCredito` e a exigência de dois tipos ficam para a etapa 11, a seguir, na mesma
sessão.

---

## 2026-09-15 · Etapa 11 — Relatório

Executada fora da ordem do `PROMPT-INICIAL.md`, por instrução explícita da equipe (registrada em
`PROXIMA-ETAPA.md`, seção 0): é o único item do edital ("gerar relatórios para entrega") ainda
sem implementação, e vale mais agora do que o fluxo docente (etapas 9 e 10).

**Feito.** `/relatorio`, alcançável do painel e da sidebar (já existia o item de navegação,
apontando para uma rota que ainda não existia). Só atividades **validadas** entram — mesma fonte
de verdade do painel e da listagem (`calcularProgresso`) — com um aviso explícito de quantas
ficaram de fora e por quê ("5 de 7 atividades registradas não entram, porque ainda não foram
validadas (2 em análise, 2 pendentes, 1 recusada)"). Quatro seções, cada uma um `h2`:
Identificação (discente, RA, curso, data de emissão), Total consolidado (créditos e horas,
citando `formatarPremissaCredito`, e a exigência de dois tipos do PPC 3.5.4, no mesmo formato já
usado no painel), Atividades por tipo (tabela agrupada por tipo da Tabela 7 — não por
"categoria" — com créditos e horas por linha e uma linha de total, `<caption>`, `scope="col"` no
cabeçalho e `scope="row"` no total) e a fonte (`FONTE_TABELA_7`) no rodapé. Botão "Imprimir ou
salvar em PDF" chama `window.print()` direto, sem biblioteca nova.

**Feito também**, de apoio à impressão, reaproveitável por qualquer tela: `print:hidden` na
`Sidebar`, no `MobileNav` e nas ações/link "voltar" do `PageHeader` (não só do relatório — a
barra de acessibilidade já tinha isso desde a etapa 3); `@page { size: A4 portrait; margin: 14mm
12mm }` em `app/globals.css`.

**Decisões.**
- **A tabela também tem versão em cards para mobile**, escondida a partir de 768 px e forçada de
  volta em `@media print` (`hidden md:block print:block` / `md:hidden print:hidden`) — o mesmo
  padrão de `TabelaAtividades` (etapa 6). Sem isso, os quatro colunas ("Tipo", "Você
  registrou", "Créditos", "Horas contabilizadas") não cabiam em 375 px sem rolagem horizontal, e
  "nenhuma tela pode quebrar no mobile" vale também aqui — mesmo sendo uma tela pensada para
  impressão, alguém pode abri-la no celular antes de decidir imprimir.
- **`print:break-inside-avoid`** nas seções de Identificação e Total consolidado, e em cada
  linha da tabela: sem isso, uma quebra de página no meio de uma linha ou de um bloco curto fica
  ilegível. Não foi aplicado à seção da tabela inteira, de propósito — com mais tipos validados,
  a tabela precisa poder continuar na página seguinte (o cabeçalho da tabela se repete sozinho,
  comportamento nativo do navegador para `<thead>` em impressão).
- **Números da tabela por extenso** ("45 horas", não "45"): a régua do crédito
  (`CLAUDE.md`) vale também em células de tabela — um número solto na coluna "Horas
  contabilizadas" ficaria ambíguo num documento que vai para a secretaria.
- **Sem lista de atividades individuais no relatório**, só o resumo por tipo (créditos e horas
  somados) — é exatamente o que a instrução da etapa pediu ("créditos e horas contabilizadas por
  linha e total geral") e o que `progresso.porTipo` já calcula; uma segunda tabela por atividade
  seria refinamento não pedido, na mesma linha da recomendação de manter a etapa 8 enxuta.
- **`emitidoEm` é fixado no primeiro render** (`useState(() => new Date())`), não recalculado a
  cada renderização: é a data que vai para o documento impresso, não deve mudar entre o
  carregamento da tela e o clique em "Imprimir".

**Corrigido durante a verificação:**
- **"1 recusadas"** — o texto de atividades excluídas usava só a forma plural
  (`analise`/`pendente`/`recusada` → "em análise"/"pendentes"/"recusadas"), errado para
  quantidade 1. Corrigido com singular e plural por status, escolhido pela contagem.
- **`window.print()` de verdade**, não só o botão: verificado interceptando `window.print` num
  teste automatizado (chamada 1 vez ao clicar) — o clique visual não garante que o handler certo
  foi ligado ao botão certo.
- Gerei o relatório como PDF (`page.pdf()` do Playwright) para conferir a paginação real em A4,
  não só a prévia de tela: com poucas atividades o conteúdo cabe quase todo numa página, sobrando
  duas linhas de rodapé na segunda — comportamento normal de quebra de página do navegador, não
  um corte de conteúdo, e que só piora graciosamente conforme mais atividades forem validadas
  (mais linhas na tabela, mais páginas) em vez de cortar ou sobrepor texto.

**Pendente.** Nada. Com isso, o edital ("gerar relatórios para entrega") tem implementação, e o
roteiro volta à ordem original do prompt: etapa 9 (painel do docente + fila), 10 (validação +
lote) e 12 (páginas de apoio e varredura final) — ver `HANDOFF.md`, seção 6.

---

## 2026-09-15 · Etapa 9 — Painel do docente (tela 06) e fila completa

Retomando a ordem original do `PROMPT-INICIAL.md` depois das etapas 8 e 11 (fora de ordem).
Motivo, já registrado: painel do docente sem a tela de validação é um painel que não faz nada —
por isso as etapas 9 e 10 foram feitas em sequência, na mesma sessão, sem parar entre elas.

**Feito.** `/docente` (painel), com quatro indicadores em **crédito** — nunca hora agregada,
régua do crédito do `CLAUDE.md`: "Aguardando validação", "Validadas" (com os créditos
homologados), "Devolvidas com pendência" e "Orientandos ativos". A nova
`obterEstatisticasDocente()` (`lib/storage.ts`) calcula os quatro sobre o estado inteiro (todos
os discentes, não só o da demonstração). Abaixo, a fila de validação em preview (5 itens,
`FilaValidacao`, componente compartilhado com a fila completa) e "Ver fila completa" leva a
`/docente/fila` — a mesma tabela, sem o recorte, alcançada também pelo item de navegação "Fila
de validação" que já existia e apontava para lugar nenhum. Cards de acesso (`Meus orientandos`,
`Relatório da turma`, `Catálogo de atividades`, `Trocar de perfil`) fecham a tela.

**Feito também**, resolvendo uma pendência mais antiga: o catálogo (Tabela 7) foi extraído para
`components/catalogo/CatalogoConteudo.tsx` — um componente sem rota própria, sem ação de
cadastro, só leitura — e exposto em duas rotas que renderizam o mesmo conteúdo:
`app/(discente)/catalogo/page.tsx` (resolve o "Ver catálogo" que 404 desde a etapa 6) e
`app/(docente)/docente/catalogo/page.tsx`. Duas rotas porque o Next não permite o mesmo caminho
em dois grupos de rotas, e cada grupo precisa da sidebar do próprio perfil.

**Limpeza obrigatória, feita:** removidos `app/(docente)/docente/casca/page.tsx` e
`components/demonstracao/VitrineCasca.tsx` (temporários desde a etapa 3), e o item "Casca da
interface" saiu da navegação docente (`components/layout/navegacao.tsx`). `INICIO_DO_PERFIL.docente`
(`lib/rotas.ts`) passa a apontar para `/docente`.

**Decisões.**
- **"Devolvidas com pendência" conta só quem já foi enviada ao menos uma vez** (`status ===
  "pendente" && enviadaEm !== null`), não toda atividade `pendente`. O domínio usa `pendente`
  para dois momentos diferentes sob a ótica do aluno ("a bola está com ele"), mas sob a ótica do
  docente são coisas distintas: uma atividade nunca enviada não é "devolvida" — ele nunca a viu.
- **"Orientandos ativos" é a contagem real de discentes do seed (13)**, não o "38" do
  `PROMPT-INICIAL.md` original (número que a seção 6 do prompt, já superada pelo adendo, nunca
  justificou). O subtítulo do indicador virou "Curso BCDIA" — nada de inventar uma "Turma 2022",
  que o domínio não modela (`Discente` não tem esse campo), para não citar um dado que não existe.
- **Colunas da fila são "Tipo" e "Créditos"**, nunca "Categoria" ou "Horas" — a mesma régua do
  crédito das telas do discente. A tabela e o card mobile reaproveitam a mesma estrutura de
  `TabelaAtividades` (etapa 6), com o `StatusBadge` fixo em "Em análise" (a fila é derivada do
  status: só entra quem está em análise, então o badge nunca varia — mantido mesmo assim porque
  é o mesmo vocabulário visual do resto do sistema).
- **"Trocar de perfil" é botão, não link**, no card de acesso do docente
  (`AcessoRapidoDocente.tsx`): é uma ação (chama `trocarPerfil` e navega depois), não uma rota,
  o mesmo raciocínio já aplicado ao item homônimo da barra lateral (`navegacao.tsx`, `BlocoPerfil`).

**Pendente.** Nada dentro do escopo desta etapa. `/docente/orientandos` e `/docente/relatorio`
continuam 404 (cards e itens de navegação apontam para eles) — fica para a etapa 12, junto das
demais páginas de apoio.

---

## 2026-09-15 · Etapa 10 — Validação (tela 07) e lote (07b)

**Feito — individual.** `/docente/validacao/[id]`: comprovante (mesmo placeholder da tela 05),
"Dados enviados" (tipo declarado, requisito e comprovante literais da Tabela 7, o que a
discente informou, período e o progresso dela — `obterProgresso(discenteId)`, já existente),
"Reclassificação" (select de tipo + campo de quantidade, com "antes e depois" via
`compararReclassificacao` sempre que o tipo ou a quantidade mudam) e "Parecer do docente"
(comentário e três ações: Aprovar, Devolver com pendência, Recusar atividade). Recusar abre um
modal de confirmação ("A recusa exige justificativa e não pode ser desfeita pelo discente."),
com foco inicial em "Cancelar". "Validar em lote" leva a `/docente/validacao/lote`, já na aba do
grupo da atividade aberta (`?grupo=`); "Próxima da fila" avança para o próximo item, quando
houver.

**Feito — lote.** `/docente/validacao/lote`: abas pelos quatro grupos da Tabela 7
(`role="tablist"`/`tab`/`tabpanel` manuais, sem componente de tabs do shadcn), cada uma com a
contagem de itens. Dentro de cada aba, uma tabela com checkbox real por atividade (rótulo
próprio, identificando atividade e discente — nunca a linha inteira como alvo de seleção),
"Selecionar todos" com estado indeterminado, contagem de selecionados e créditos a homologar
anunciada em `aria-live` a cada mudança, e duas ações — "Aprovar selecionadas" e "Devolver com
pendência" — cada uma atrás de um modal de confirmação que diz, em texto, quantas atividades e
quantos créditos serão afetados, com foco inicial em "Cancelar". Depois de aplicar, o resultado
é anunciado e o foco volta para a aba ativa (um ponto que sempre existe, mesmo que as linhas
selecionadas tenham saído da fila).

**Decisões.**
- **`paraTipoId`/`paraQuantidade` são sempre enviados ao parecer**, mesmo quando o docente não
  reclassifica nada — `compararReclassificacao` já resolve `mudou: false` quando tipo e
  quantidade batem com o que a discente declarou, então não reclassificar deixa de ser um caso
  especial na tela: é só o resultado natural de não mudar os campos.
- **Atividade sem tipo previsto não pode ser aprovada** (regra já pronta em
  `validarParecer`/`lib/calculos.ts`): o botão "Aprovar" mostra dinamicamente "Aprovar 0
  créditos" nesse caso, em vez de ficar desabilitado — o rótulo já avisa que não há nada a
  aprovar sem reclassificar primeiro, e clicar mostra a mensagem de regra pronta ("Reclassifique-a
  para um tipo previsto ou recuse-a.").
- **A confirmação da regra `**` (monitoria) é um checkbox próprio da tela de validação**,
  independente do que a discente já confirmou no cadastro (`atividade.confirmacoes.semestreCompleto`):
  o docente confirma de novo, com o texto literal da nota da Tabela 7
  (`NOTA_SEMESTRE_COMPLETO`), porque é ele quem valida, não quem declara. A nota `*` (dupla
  contagem) aparece só como informação — `validarParecer` não exige confirmação do docente para
  essa regra, então não há checkbox para ela.
- **O modal de recusa é um `Dialog` controlado, sem `DialogTrigger`**: a validação do comentário
  obrigatório precisa rodar *antes* de abrir o modal (para não abrir uma confirmação que vai
  falhar), então o botão "Recusar atividade" decide se abre o modal, em vez de um trigger do
  próprio Dialog decidir por ele.
- **Monitoria fica sempre inapta ao lote** (desmarcada, desabilitada, com o motivo visível): a
  confirmação da regra `**` só existe na tela individual, e o lote não tem onde coletá-la — por
  isso toda atividade de monitoria "exige revisão individual", mesmo dentro da própria aba de
  Ensino e monitoria.
- **A aplicação do lote é sequencial (`for...of` com `await`), nunca `Promise.all`.**
  `registrarParecer` (como toda função de `lib/storage.ts`) lê o `localStorage` inteiro, aplica a
  mudança e grava de volta; em paralelo, cada chamada leria o mesmo estado antigo e a última a
  gravar apagaria o que as outras escreveram. Descoberto durante a implementação, antes de gerar
  dado incorreto — não foi um bug em produção, mas quase foi um.

**Corrigido durante a verificação:**
- **O foco depois de aplicar o lote não chegava na aba ativa** — ficava em `document.body`. O
  `Dialog` (Base UI) é controlado e não tem `DialogTrigger`, então a prop `finalFocus` (a API
  certa para devolver o foco a um elemento específico ao fechar) não tinha um "de onde" confiável
  para agir. Confirmado por captura de tela e por polling do foco a cada 150 ms num teste
  automatizado — sem isso, o bug não aparecia num clique manual apressado, só quando alguém
  esperava e checava de fato onde o foco tinha ido. Corrigido com um `window.setTimeout(...,
  200)` chamando `.focus()` no botão da aba ativa depois de fechar o modal — 200 ms é maior que a
  transição de fechamento (`--duration`, 160 ms), então esse `.focus()` sempre vence a corrida.
- **A mesma verificação levou tempo demais na primeira tentativa** porque a espera do teste não
  contava `300 ms × quantidade de itens selecionados` (cada `registrarParecer` sequencial soma
  esse atraso simulado) — o teste checava o resultado antes da última chamada terminar. Não é um
  bug do sistema, só um lembrete para quem for verificar de novo.

**Pendente.** Nada dentro do escopo desta etapa. Falta a etapa 12 (páginas de apoio e varredura
final) — ver `PROXIMA-ETAPA.md`.

---

## 2026-09-15 · Etapa 12 — Varredura final antes da entrega

Última etapa do roteiro. Não é etapa de feature: garante que um avaliador anônimo, sem
contexto, usa o sistema inteiro sem tropeçar. Seis partes, nesta ordem.

**Parte 1 — nenhum beco sem saída.** Varredura de todo `href`/`router.push` do projeto contra
as rotas existentes: só cinco apontavam para nada — `/simulador`, `/avisos`, `/ajuda`,
`/docente/orientandos`, `/docente/relatorio` (já eram pendência conhecida desde a etapa 9; nenhum
outro link quebrado apareceu). `components/apoio/PaginaDeApoio.tsx` é o componente
compartilhado: anatomia de página completa, explica que aquele recurso está fora do escopo desta
demonstração (com uma frase específica do que a tela faria, nunca "em construção") e devolve ao
painel do próprio perfil. Cinco rotas novas, cada uma só passando título e descrição.

**Achado à parte, corrigido de novo:** `/docente/casca` e `components/demonstracao/
VitrineCasca.tsx` — removidos na etapa 9 — tinham reaparecido no disco local antes de eu
começar esta etapa, quase entrando de novo no build. Causa mais provável: o projeto vive numa
pasta do OneDrive, que sincroniza e pode restaurar versões antigas por conta própria, sem o git
saber. Removidos outra vez; ficou registrado como armadilha no `HANDOFF.md` para quem notar o
mesmo `git status` estranho depois.

**Parte 2 — primeiro minuto do avaliador.** A tela de login já tinha os dois perfis bem
visíveis (cartões de rádio com nome e descrição) e o botão "Entrar como visitante (dados de
demonstração)", mas o rótulo "protótipo" só aparecia numa frase pequena perto dos botões — quem
lê de cima para baixo passa pelos campos "Número UFSCar ou e-mail institucional" e "Senha" antes
disso, e pode achar que precisa de credencial real. Corrigido com uma linha no cabeçalho, antes
do formulário: "Protótipo de demonstração — escolha um perfil abaixo e entre como visitante, sem
credencial real." Troca de perfil já era descobrível (botão "Trocar para perfil X" na barra
lateral, com esse texto exato) — nada a mudar aqui.

`reiniciarDemo()` já existia em `lib/storage.ts` desde a etapa 2, mas nunca teve um botão em
lugar nenhum da interface. `components/entrada/ReiniciarDemonstracao.tsx`: botão na tela de
login (o único lugar que qualquer pessoa alcança, com ou sem sessão — inclusive vindo de "Sair"),
com confirmação em modal (mesmo padrão das ações destrutivas do docente, foco inicial em
"Cancelar") e um `window.location.assign("/")` no final, não `router.push`, para nenhuma tela
guardar em memória um progresso ou uma fila lidos antes do reinício. Testado numa janela
totalmente nova (seed limpo direto) e numa com dados de um percurso de teste completo já salvos
(o botão devolveu ao seed original nas duas).

**Parte 3 — percurso completo na URL publicada.** Rodado duas vezes contra
`https://horas-complementares-ufscar.vercel.app`, a primeira por clique, a segunda só por
teclado: cadastrar uma palestra (2 unidades = 1 crédito) → ver a prévia do cálculo → anexar
comprovante → enviar → trocar para o perfil docente → achar a atividade na fila → aprovar
individualmente → validar outra atividade em lote (grupo Ensino e monitoria, selecionar todos os
aptos, confirmar, aplicar) → voltar ao perfil discente → confirmar o crédito somado no painel (4
→ 5 de 6) → abrir o relatório e ver a linha nova → imprimir. As duas rodadas completaram o
percurso inteiro sem um erro de console, sem um `pageerror`, sem uma resposta 5xx.

**Achado corrigido durante esta parte:** o formulário de cadastro (tela 04) nunca mostrava
nenhum crédito antes do envio — só o texto da regra (`formatarExplicacaoRequisito`), sem o
número calculado. Para a régua do crédito valer também na tela mais importante do fluxo do
discente, um parágrafo aparece assim que tipo e quantidade são válidos: "Isto vale N créditos (M
horas contabilizadas)." — texto visível comum, não `aria-live` (recalcular a cada tecla digitada
anunciaria o valor a cada dígito).

**Sobre o repeat por teclado:** o botão "Selecionar arquivo" abre o seletor de arquivos do
sistema operacional — fora do alcance de qualquer script de teclado dentro da página (nenhuma
ferramenta de automação de navegador consegue apertar tecla dentro de uma caixa de diálogo do
SO). O que se testa e se garante é que o Tab alcança o botão certo, com o rótulo certo; o anexo
em si usa a mesma API de arquivo que o clique usaria depois de a pessoa escolher o arquivo na
caixa do sistema. Da mesma forma, a navegação por seta/letra dentro de um `<select>` nativo já
fechado é garantia do próprio navegador em qualquer sistema real — não é algo que este app
implemente ou possa quebrar — e não foi possível reproduzir de forma confiável via CDP
(Chromium headless); o que importa e o que foi confirmado é que o Tab alcança o controle certo,
com o rótulo certo.

**Parte 4 — medição e conformidade.**

Lighthouse (desktop) e axe-core, direto contra a URL publicada, sessão válida gravada antes de
cada página (sem isso `GuardaSessao` mandaria para o login, mas a tela renderiza igual porque a
verificação não bloqueia):

| Tela | Performance | Acessibilidade | Boas práticas | SEO | axe |
|---|---|---|---|---|---|
| Login | 98 | 100 | 100 | 100 | 0 |
| Painel (discente) | 89 | 100 | 100 | 100 | 0 |
| Listagem | 95 | 100 | 100 | 100 | 0 |
| Formulário | 97 | 100 | 100 | 100 | 0 |
| Detalhe | 97 | 100 | 100 | 100 | 0 |
| Painel do docente | 98 | 100 | 100 | 100 | 0 |
| Validação | 96 | 100 | 100 | 100 | 0 |
| Relatório | 96 | 100 | 100 | 100 | 0 |

axe também rodou, com 0 violações, na validação em lote (1280 e 375 px) e no painel de cada
perfil em 375 px. Performance mais baixa no painel do discente (89) é o anel de progresso (SVG
animado) mais o maior número de componentes na primeira pintura; nenhum dos quatro está abaixo
de 89, e nenhuma pontuação de Acessibilidade, Boas práticas ou SEO ficou abaixo de 100 em
nenhuma tela.

**Corrigido a partir do axe:** violação `region` ("All page content should be contained by
landmarks") em toda tela com sidebar — a marca e o bloco de perfil (nome, RA, "Trocar de
perfil", "Sair") são irmãos do `<nav>` dentro de um `<div>` comum, não contidos por ele.
`Sidebar.tsx` virou `<aside aria-label="Barra lateral">`; `MobileNav.tsx` (a mesma marca, na
faixa mobile) virou `<header>`. Depois da correção, 0 violações em toda tela testada, nas duas
larguras.

**Critérios de aceite (seção 11 do `PROMPT-INICIAL.md`), um por um:**

- [x] Toda a navegação funciona; nenhuma rota da sidebar dá 404. *(as cinco que faltavam ganharam
  rota nesta etapa)*
- [x] "Entrar como visitante" leva a um sistema já populado, em um clique.
- [x] Os dois perfis são navegáveis, com troca de perfil funcionando.
- [x] Criar uma atividade nova aparece na listagem e afeta o progresso ao ser validada.
  *(confirmado na Parte 3: 4 → 5 de 6 créditos)*
- [x] Nenhum componente lê `localStorage` diretamente.
- [x] Nenhum hex escrito à mão no JSX.
- [x] Nenhuma ocorrência de `outline: none`.
- [x] Todo status aparece com cor + ícone + texto.
- [x] Um único `h1` por página; níveis de título sem salto. *(confirmado também nas seis páginas
  novas desta etapa)*
- [x] Todo campo tem label visível associado; obrigatórios marcados pela palavra "obrigatório".
- [x] Nenhuma tela quebra em 375 px nem com o texto em 125 %.
- [x] `npm run build` passa sem erro nem warning de tipo.
- [x] Nenhum nome de equipe ou de integrante aparece na interface.

Treze de treze. Nenhuma pendência desta lista foi para a entrega.

**Parte 5 — identidade e anonimato.**

- Favicon próprio: `app/icon.svg`, o mesmo emblema do componente `Marca` (quadrado `--brand`,
  ícone de graduation-cap em branco), substituindo `app/favicon.ico` (o ícone padrão do Next).
  Convenção do App Router: qualquer `app/icon.*` já é servido e referenciado no `<head>` sem
  configuração extra.
- Título e metadados: já estavam em português, descritivos, sem nome de equipe (`"Horas
  Complementares · UFSCar Sorocaba"` e a descrição em `app/layout.tsx`) — nada a corrigir.
- `lang="pt-BR"` no `<html>`: já estava, desde a etapa 3.
- Conferência de anonimato — o que foi procurado e o resultado:
  - `package.json`: campo `author` ausente (nunca existiu); `name` é `"semdia"`, um nome de
    projeto genérico, não um nome de pessoa ou de equipe.
  - `README.md`: sem seção de créditos ou autoria.
  - Interface (`app/`, `components/`, `lib/`): busca pelo nome do responsável pela conta git
    deste repositório não encontrou nenhuma ocorrência.
  - "SeCoT XVIII" aparece várias vezes (rodapé do login, títulos internos de documentação) — é o
    nome do próprio hackathon/evento, não de uma equipe ou integrante; a especificação original
    já usa esse nome como parte do produto ("Horas Complementares · SeCoT XVIII"), então foi
    deixado como está.
  - Commits do git carregam o nome de quem operou o repositório (autor do commit) — isso é
    metadado do Git, não "interface, título, README ou `package.json`" (a lista literal da
    instrução), e reescrever histórico de commits é uma operação destrutiva fora do escopo desta
    varredura; fica registrado aqui para quem decidir se isso importa antes de tornar o
    repositório público.

**Parte 6 — "Sobre este protótipo".** Havia tempo depois das partes obrigatórias, então foi
feita. `app/sobre/page.tsx`, sem sessão exigida, alcançável por um link no rodapé de toda tela
(`EstruturaPerfil.tsx`, dentro de `<main>`, e do rodapé da própria tela de login). Quatro seções:
Escopo (o que o protótipo cobre, em texto corrido — não é lista de features), Decisões de
acessibilidade (teclado completo até no lote, status nunca só por cor, uma única região
`aria-live`, foco visível de 2 px), Fidelidade à Tabela 7 (créditos exigidos, tipos distintos e a
premissa do fator de conversão, citando `FONTE_TABELA_7` e `formatarPremissaCredito()` — nenhum
número do domínio escrito à mão na página) e Avaliação anônima. Testada em 1280 e 375 px.

**Pendente para a entrega.** Nada dentro do escopo desta etapa ou das anteriores. O roteiro do
`PROMPT-INICIAL.md` está completo. Duas notas para quem for defender o protótipo, não bugs:
(1) o fator de 15 h por crédito é a leitura mais provável da matriz curricular, mas a
confirmação com a coordenação do curso segue pendente (documentado desde a etapa 2 e citado de
novo em "Sobre este protótipo"); (2) o autor dos commits do Git é visível no histórico do
repositório, fora do que esta varredura de anonimato cobre (ver Parte 5).

---

## 2026-09-16 · OCR local de certificados — branch `ocr`

**Solicitação.** Integrar OCR ao cadastro com revisão humana e atualizar o handoff.
A pasta fornecida foi comparada com `main` (`a35fb6f`); a integração foi aplicada sobre
`ocr` (`0b466fb`), incluindo os uploads existentes do usuário. Removidas cópias idênticas
de arquivos de `app/` inseridas na raiz por upload e artefatos gerados que estavam rastreados.

**Implementação.** `lib/ocr/ler.ts` carrega Tesseract.js/PDF.js sob demanda; `parse.ts`
extrai candidatos conservadores. `LeituraComprovante.tsx` oferece início, cancelamento,
texto reconhecido, edição e confirmação. `CampoComprovante` fornece o `File` original;
`obterArquivoComprovante` em storage recupera arquivos de rascunhos no IndexedDB.
Instituição/categoria/carga vão para observações com nome do arquivo; título/período/horas
inteiras preenchem apenas campos vazios. Horas não viram eventos, e confirmações não são marcadas.

**Verificação executada.**

| Verificação | Resultado |
| --- | --- |
| `npm ci --ignore-scripts` no clone da branch | Instalação concluída; auditoria sem vulnerabilidades conhecidas |
| `npm run verificar:ocr` | 20 verificações passaram: campos, ambiguidades, números decimais, datas inválidas/bissextas, período e emissão |
| `npm run build` | Passou: tokens, 24 verificações de migração, compilação, TypeScript e geração das rotas |
| Lint dos arquivos alterados/adicionados | Sem erros ou avisos |
| Lint global | 6 erros e 3 avisos anteriores, em arquivos não alterados nesta implementação; detalhados abaixo |
| JPG de monitoria do seed | Leu 180 horas, modalidade, instituição e período; mostrou confusão de OCR entre II/11 no título, corrigível na revisão |
| PDF digital de curso do seed | Leu nome do curso, 60 horas, instituição e período; não confundiu modalidade presencial com categoria |
| PDF escaneado criado a partir do JPG fictício | Renderização + OCR funcionaram, inclusive no build de produção local |
| Aplicar revisão | Título já digitado preservado; horas preencheram Monitoria; confirmação do semestre continuou desmarcada |
| Tipo contado em palestras | Quantidade permaneceu vazia ao aplicar carga horária de certificado |
| Cancelar e reabrir rascunho | Cancelamento sem aplicar resultado; arquivo salvo recuperado após recarregar |
| 375 px, A+ e alto contraste | Revisão legível, sem overflow horizontal e sem IDs duplicados; foco na revisão |
| Revisão inválida por teclado | Enter com carga “abc” impediu aplicar e focou o campo de carga |

**Pendências anteriores de lint.** `react-hooks/set-state-in-effect` em
`DetalheAtividade`, `FormularioEditarAtividade`, `VisualizadorComprovante` e
`ValidacaoAtividade`; duas aspas JSX em `AtalhosDeTeclado`. Avisos em `TelaOrientandos`
(dependências), `ValidacaoAtividade` (variável não usada) e `ReiniciarDemonstracao`
(navegação). Não foram suprimidos globalmente. Corrigidas as aspas de `Sobre`, arquivo
já alterado para explicar o OCR local.

**Próxima pessoa.** Validar o preview Vercel da branch; testar NVDA/VoiceOver e certificados
anonimizados variados. O teste de navegador não é auditoria completa de acessibilidade.
Não houve merge em `main`. O envio pelo conector retornou 403: instalação encontrada apenas
em `rhedymarques`, repositório pertence a `mateusbau`; Git local sem autenticação. Código
preparado em commit/patch local para envio após corrigir a conexão. Limites e decisões
atuais estão no topo do `HANDOFF.md`.

**Continuação em 2026-09-16:** Git local autenticado; simulação de push autorizada.
Incorporado `eb8cea3` sem reescrever histórico. As 21 rotas copiadas para fora de `app/`
foram comparadas com as versões corretas e removidas somente após confirmar igualdade.
Publicação pela conexão Git na branch `ocr`; a pendência de autenticação acima é histórica.
