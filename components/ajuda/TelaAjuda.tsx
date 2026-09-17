"use client"

// components/ajuda/TelaAjuda.tsx
//
// Página única, sem busca nem filtro: índice de âncoras no topo e seções em
// sequência. Cada h2 tem tabIndex={-1} para o link do índice mover o FOCO, não
// só a rolagem — a mesma técnica do link "Pular para o conteúdo"
// (components/layout/SkipLink.tsx, sobre o <main>). Por isso os links do
// índice são <a> simples, não <Link> do Next: é navegação dentro da mesma
// página, e o comportamento nativo do navegador (rolar + focar um elemento
// com tabIndex) é exatamente o que se quer.
//
// Os números da seção "Créditos e horas" vêm de lib/calculos.ts e
// lib/catalogo.ts, nunca digitados à mão — se a regra mudar, o texto muda
// com ela.

import { useState } from "react"

import { PerguntaFrequente } from "@/components/ajuda/PerguntaFrequente"
import { PageHeader } from "@/components/layout/PageHeader"
import { CREDITOS_EXIGIDOS, HORAS_EXIGIDAS, TIPOS_DISTINTOS_EXIGIDOS, horasDeCreditos } from "@/lib/calculos"
import { medidoEmHoras, obterTipo } from "@/lib/catalogo"
import { formatarCreditos, formatarHoras, formatarNumero, formatarPremissaCredito, formatarRequisito } from "@/lib/formatacao"

const INDICE = [
  { id: "como-funciona", rotulo: "Como funciona" },
  { id: "creditos-e-horas", rotulo: "Créditos e horas" },
  { id: "perguntas-frequentes", rotulo: "Perguntas frequentes" },
  { id: "acessibilidade", rotulo: "Acessibilidade" },
  { id: "glossario", rotulo: "Glossário" },
  { id: "limitacoes", rotulo: "Limitações desta demonstração" },
]

const PASSOS = [
  { titulo: "Cadastrar a atividade", texto: "Preencha os dados na tela “Nova atividade”: título, tipo da Tabela 7, quantidade e período." },
  { titulo: "Enviar com o comprovante", texto: "Anexe o arquivo que comprova a atividade (PDF, JPG ou PNG) e envie para validação." },
  { titulo: "O docente avalia e emite um parecer", texto: "Ele aprova, devolve com pendência (pedindo correção) ou recusa, sempre com um comentário." },
  { titulo: "Acompanhar o status", texto: "A atividade fica em análise, validada, pendente (aguardando você) ou recusada." },
  { titulo: "Emitir o relatório", texto: "A qualquer momento, gere o documento consolidado das atividades já validadas." },
]

const PERGUNTAS = [
  {
    id: "leitura-comprovante",
    pergunta: "Como preencher os dados a partir do certificado?",
    resposta: "Na tela Nova atividade, anexe um PDF, JPG ou PNG e escolha Ler comprovante. Confira e corrija os dados reconhecidos antes de confirmar. A leitura acontece neste navegador; PDF aceita até 5 páginas. Só campos vazios são preenchidos. Instituição e categoria lidas ficam nas observações; escolha o tipo correto no catálogo. Você pode cancelar e preencher manualmente a qualquer momento.",
  },
  {
    id: "certificado-nao-soma",
    pergunta: "Por que meu certificado não soma todas as horas?",
    resposta:
      "O curso contabiliza créditos conforme o tipo da Tabela 7 do Projeto Pedagógico, não a carga horária integral do certificado. A carga do comprovante é o requisito para obter os créditos daquele tipo, não uma quantidade que se soma diretamente ao seu total.",
  },
  {
    id: "atividades-no-progresso",
    pergunta: "Quais atividades entram no progresso?",
    resposta: "Apenas as atividades validadas pelo docente. Em análise, pendentes e recusadas ainda não contam.",
  },
  {
    id: "dois-tipos",
    pergunta: "Por que preciso de dois tipos diferentes de atividade?",
    resposta: `O Projeto Pedagógico (seção 3.5.4) exige atividades de pelo menos ${formatarNumero(TIPOS_DISTINTOS_EXIGIDOS)} tipos distintos da Tabela 7 — não basta atingir os créditos com um único tipo.`,
  },
  {
    id: "corrigir-devolvida",
    pergunta: "Como corrijo uma atividade devolvida?",
    resposta: "Abra o registro da atividade, leia o parecer do docente (o motivo da devolução), edite o que for preciso e reenvie para validação.",
  },
  {
    id: "tipo-nao-encontrado",
    pergunta: "Não encontrei meu tipo de atividade na Tabela 7. O que faço?",
    resposta: "Atividades fora da Tabela 7 não têm créditos previstos e dependem de análise do conselho do curso antes de poderem ser validadas.",
  },
  {
    id: "monitoria-regra-especial",
    pergunta: "Monitoria tem alguma regra especial?",
    resposta: "Sim: só é contabilizada se o monitor atuar durante todo o semestre letivo (nota de duplo asterisco da Tabela 7). Sem o semestre completo, a atividade não pode ser validada.",
  },
  {
    id: "dupla-contagem",
    pergunta: "Posso usar a mesma atividade em dois itens da Tabela 7?",
    resposta: "Não. Atividades já validadas como outro componente curricular não podem ser validadas de novo como atividade complementar — os itens marcados com asterisco na Tabela 7 não admitem essa dupla contagem.",
  },
  {
    id: "atividade-fora-relatorio",
    pergunta: "Por que uma atividade não aparece no relatório?",
    resposta: "O relatório só reúne atividades validadas. Pendentes, recusadas e em análise ficam fora dele, porque ainda não têm créditos confirmados.",
  },
  {
    id: "enviar-relatorio-email",
    pergunta: "Como envio meu relatório por e-mail?",
    resposta: "No relatório, escolha “Enviar por e-mail”, confira o destinatário e abra o aplicativo de e-mail. Salve o relatório em PDF e anexe-o antes de enviar; o sistema prepara a mensagem, mas não envia nem anexa arquivos sozinho.",
  },
]

const ITENS_ACESSIBILIDADE = [
  "Tamanho do texto (A−, A e A+) e alto contraste: os mesmos dois controles aparecem na barra superior de toda tela e na tela de Configurações, e compartilham a mesma preferência — mudar num lugar reflete no outro.",
  "A tecla “?” abre e fecha a lista de atalhos de teclado, em qualquer tela (exceto com o foco num campo de texto).",
  "A tecla Esc fecha diálogos e janelas abertos.",
  "O link “Pular para o conteúdo” é o primeiro elemento focável de toda página e só aparece visualmente quando recebe foco pelo teclado.",
  "As preferências de aparência — incluindo reduzir animações e a densidade da lista — são salvas e continuam valendo nas próximas visitas.",
  "O status de uma atividade (validada, em análise, pendente ou recusada) é sempre indicado por ícone, cor e texto ao mesmo tempo, nunca só por cor.",
]

const GLOSSARIO = [
  { termo: "Crédito", definicao: "A unidade que a matriz curricular usa para medir atividades complementares; cada tipo da Tabela 7 vale um número fixo de créditos." },
  { termo: "Horas contabilizadas", definicao: "O total em horas que os créditos obtidos representam — não a soma das cargas horárias dos comprovantes." },
  { termo: "Tipo de atividade", definicao: "Uma linha da Tabela 7 do Projeto Pedagógico, que define quantos créditos a atividade vale e qual comprovante ela exige." },
  { termo: "Parecer", definicao: "A decisão do docente sobre uma atividade enviada — aprovar, devolver com pendência ou recusar — sempre com um comentário para o discente." },
  { termo: "Validação em lote", definicao: "Aprovar ou devolver, de uma vez, várias atividades do mesmo grupo da Tabela 7, em vez de uma por uma." },
]

const LIMITACOES = [
  "Os dados ficam salvos apenas neste navegador. Limpar os dados do site (ou os dados deste site nas configurações do navegador) apaga as atividades e os comprovantes.",
  "Os comprovantes exibidos nesta demonstração são documentos fictícios, criados só para ilustrar o sistema.",
  "Não há integração automática com o sistema acadêmico da UFSCar. Ao escolher enviar o relatório por e-mail, o aplicativo de e-mail do dispositivo abre com uma mensagem pronta; o envio e o anexo do PDF continuam sob seu controle.",
]

export function TelaAjuda() {
  const [abertas, setAbertas] = useState<ReadonlySet<string>>(new Set())

  function alternar(id: string) {
    setAbertas((atuais) => {
      const novas = new Set(atuais)
      if (novas.has(id)) novas.delete(id)
      else novas.add(id)
      return novas
    })
  }

  const monitoriaBase = obterTipo("monitoria")
  // Invariante do catálogo: monitoria é medida em horas (cargaMaxima não é null).
  // O guard só estreita o tipo para o exemplo numérico citar cargaMaxima abaixo.
  if (!medidoEmHoras(monitoriaBase)) {
    throw new Error("O tipo 'monitoria' deveria ser medido em horas.")
  }
  const monitoria = monitoriaBase
  const horasContabilizadasMonitoria = horasDeCreditos(monitoria.creditos)

  return (
    <div>
      <PageHeader
        titulo="Ajuda"
        subtitulo="Como o sistema funciona, como créditos e horas se relacionam, e o que esperar desta demonstração."
      />

      <nav aria-label="Índice desta página" className="mb-8 rounded-lg border bg-surface p-6">
        <p aria-hidden="true" className="mb-3 text-label text-foreground">
          Nesta página
        </p>
        <ul className="flex flex-col gap-2">
          {INDICE.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex min-h-target items-center text-body text-accent-text underline underline-offset-4 hover:decoration-2"
              >
                {item.rotulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-8">
        {/* 1. Como funciona */}
        <section aria-labelledby="como-funciona">
          <h2 id="como-funciona" tabIndex={-1} className="mb-4 scroll-mt-(--altura-barra)">
            Como funciona
          </h2>
          <ol className="flex flex-col gap-3 rounded-lg border bg-surface p-6">
            {PASSOS.map((passo, indice) => (
              <li key={passo.titulo} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-caption font-bold text-accent-text"
                >
                  {indice + 1}
                </span>
                <span className="flex flex-col">
                  <span className="text-body font-medium text-foreground">{passo.titulo}</span>
                  <span className="leading-secondary text-muted-foreground">{passo.texto}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* 2. Créditos e horas */}
        <section aria-labelledby="creditos-e-horas">
          <h2 id="creditos-e-horas" tabIndex={-1} className="mb-4 scroll-mt-(--altura-barra)">
            Créditos e horas
          </h2>
          <div className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
            <p className="leading-secondary text-foreground">
              A unidade usada pela matriz curricular é o <strong className="font-medium">crédito</strong>, não a
              hora. Cada tipo de atividade da Tabela 7 do Projeto Pedagógico vale um número fixo de créditos,
              entre 1 e 3.
            </p>
            <p className="leading-secondary text-foreground">
              A carga horária que aparece na Tabela 7 (por exemplo, “180 h/semestre”) é o{" "}
              <strong className="font-medium">requisito</strong> para obter os créditos daquele tipo — não uma
              quantidade que se soma às demais atividades.
            </p>
            <p className="leading-secondary text-foreground">{formatarPremissaCredito()}</p>
            <p className="leading-secondary text-foreground">
              Para integralizar são exigidos {formatarCreditos(CREDITOS_EXIGIDOS)}, equivalentes a{" "}
              {formatarHoras(HORAS_EXIGIDAS)} contabilizadas.
            </p>
            <div className="rounded-lg border border-input-border bg-accent-soft p-4">
              <p className="leading-secondary text-foreground">
                <strong className="font-medium">Exemplo:</strong> {formatarRequisito("monitoria")}. Um discente
                que atua como monitor durante um semestre completo — {monitoria.requisito} — obtém{" "}
                {formatarCreditos(monitoria.creditos)}, ou seja, {formatarHoras(horasContabilizadasMonitoria)}{" "}
                contabilizadas. Não são {formatarHoras(monitoria.cargaMaxima)}: a carga do comprovante é o
                requisito, os créditos são o que conta.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Perguntas frequentes */}
        <section aria-labelledby="perguntas-frequentes">
          <h2 id="perguntas-frequentes" tabIndex={-1} className="mb-4 scroll-mt-(--altura-barra)">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col rounded-lg border bg-surface">
            {PERGUNTAS.map((item) => (
              <PerguntaFrequente
                key={item.id}
                id={item.id}
                pergunta={item.pergunta}
                resposta={item.resposta}
                aberta={abertas.has(item.id)}
                onAlternar={() => alternar(item.id)}
              />
            ))}
          </div>
        </section>

        {/* 4. Acessibilidade */}
        <section aria-labelledby="acessibilidade">
          <h2 id="acessibilidade" tabIndex={-1} className="mb-4 scroll-mt-(--altura-barra)">
            Acessibilidade
          </h2>
          <ul className="flex flex-col gap-3 rounded-lg border bg-surface p-6">
            {ITENS_ACESSIBILIDADE.map((texto) => (
              <li key={texto} className="leading-secondary text-foreground">
                {texto}
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Glossário */}
        <section aria-labelledby="glossario">
          <h2 id="glossario" tabIndex={-1} className="mb-4 scroll-mt-(--altura-barra)">
            Glossário
          </h2>
          <dl className="flex flex-col divide-y rounded-lg border bg-surface">
            {GLOSSARIO.map((item) => (
              <div key={item.termo} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-baseline sm:gap-4">
                <dt className="text-body font-medium text-foreground sm:w-56 sm:shrink-0">{item.termo}</dt>
                <dd className="leading-secondary text-muted-foreground">{item.definicao}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 6. Limitações desta demonstração */}
        <section aria-labelledby="limitacoes">
          <h2 id="limitacoes" tabIndex={-1} className="mb-4 scroll-mt-(--altura-barra)">
            Limitações desta demonstração
          </h2>
          <ul className="flex flex-col gap-3 rounded-lg border bg-surface p-6">
            {LIMITACOES.map((texto) => (
              <li key={texto} className="leading-secondary text-foreground">
                {texto}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
