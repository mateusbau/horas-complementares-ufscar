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
