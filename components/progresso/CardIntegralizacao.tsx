// components/progresso/CardIntegralizacao.tsx — Painel do discente
//
// Substitui a faixa de progresso segmentada e o card "Exigências do Projeto
// Pedagógico" separado por um único card de duas colunas: anel à esquerda,
// checklist de exigências à direita. Cálculo, regras do PPC e fontes de
// dados não mudam — só a apresentação. Os quatro itens do checklist são os
// mesmos de antes: os dois limiares de integralização (créditos e tipos
// distintos) e as duas notas de rodapé da Tabela 7 (asterisco e duplo
// asterisco), conferidas de volta nas atividades já registradas por
// semDuplaContagemGarantida/semestreCompletoGarantido — nenhum item é
// afirmado sem checar os dados. Sem seção por eixo (Ensino/Pesquisa/
// Extensão/Representação): o PPC não define mínimo nem teto por grupo.
//
// A informação de progresso aparece no máximo duas vezes na tela: aqui
// (título + subtítulo + anel + legenda, um só bloco) e no checklist ao
// lado, que confere outra coisa (regras cumpridas, não o andamento). A
// porcentagem aparece só no miolo do anel.

import { CircleHelp, FileText, Plus } from "lucide-react"
import Link from "next/link"

import { AnelIntegralizacao } from "@/components/progresso/AnelIntegralizacao"
import { AvisoIntegralizacao } from "@/components/progresso/AvisoIntegralizacao"
import { LinhaExigencia } from "@/components/progresso/LinhaExigencia"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { buttonVariants } from "@/components/ui/button"
import { NOTA_DUPLA_CONTAGEM, NOTA_SEMESTRE_COMPLETO } from "@/lib/catalogo"
import { creditosEmAnalise, semDuplaContagemGarantida, semestreCompletoGarantido } from "@/lib/calculos"
import {
  formatarCreditos,
  formatarHoras,
  formatarHorasContabilizadas,
  formatarNumero,
  formatarPremissaCredito,
} from "@/lib/formatacao"
import type { Atividade, Progresso } from "@/lib/types"

type ItemChecklist = { titulo: string; detalhe: string; cumprido: boolean }

export function CardIntegralizacao({
  progresso,
  atividades,
}: {
  progresso: Progresso
  atividades: readonly Atividade[]
}) {
  const analise = creditosEmAnalise(atividades)
  const validado = progresso.creditosObtidos
  // Mesma regra da faixa anterior: a base do anel soma ao que for maior, o exigido
  // ou o que já está validado + em análise, para nada ficar de fora por falta de espaço.
  const denominador = Math.max(progresso.creditosExigidos, validado + analise)
  const falta = Math.max(0, denominador - validado - analise)

  const titulo = progresso.integralizado
    ? "Integralização concluída"
    : progresso.creditosFaltantes > 0
      ? `Faltam ${formatarCreditos(progresso.creditosFaltantes)} para integralizar`
      : "Falta um segundo tipo de atividade para integralizar"

  const itens: ItemChecklist[] = [
    {
      titulo: `${formatarHoras(progresso.horasExigidas)} para integralização`,
      detalhe: `Progresso atual: ${formatarCreditos(progresso.creditosObtidos)} de ${formatarCreditos(progresso.creditosExigidos)}.`,
      cumprido: progresso.creditosObtidos >= progresso.creditosExigidos,
    },
    {
      titulo: `Pelo menos ${formatarNumero(progresso.tiposExigidos)} tipos de atividade diferentes`,
      detalhe: `Seção 3.5.4 do Projeto Pedagógico. Você tem ${formatarNumero(progresso.tiposDistintos)} tipo${progresso.tiposDistintos === 1 ? "" : "s"} com crédito validado.`,
      cumprido: progresso.tiposDistintos >= progresso.tiposExigidos,
    },
    {
      titulo: "Sem dupla contagem de atividades marcadas com asterisco (*)",
      detalhe: NOTA_DUPLA_CONTAGEM,
      cumprido: semDuplaContagemGarantida(atividades),
    },
    {
      titulo: "Monitoria válida apenas com semestre completo (**)",
      detalhe: NOTA_SEMESTRE_COMPLETO,
      cumprido: semestreCompletoGarantido(atividades),
    },
  ]
  const pendentes = itens.filter((item) => !item.cumprido)

  return (
    <div className="rounded-lg bg-integralizacao-fundo-area p-6">
      <div className="w-full rounded-lg border border-integralizacao-card-borda bg-surface p-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-h2 tracking-[-0.01em] text-integralizacao-texto-titulo">{titulo}</h2>
            <p className="text-label text-integralizacao-texto-subtitulo">
              {formatarCreditos(progresso.creditosObtidos)} de {formatarCreditos(progresso.creditosExigidos)} ·{" "}
              {formatarHorasContabilizadas(progresso.horasObtidas, progresso.horasExigidas)}
            </p>
          </div>

          <Popover>
            <PopoverTrigger className="inline-flex min-h-target w-fit items-center gap-1.5 text-label font-medium text-primary underline underline-offset-4 hover:decoration-2 print:hidden">
              <CircleHelp aria-hidden="true" className="size-4" />
              Como isso é calculado?
            </PopoverTrigger>
            <PopoverContent>
              <p className="leading-secondary text-foreground">{formatarPremissaCredito()}</p>
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-8 flex flex-col flex-wrap gap-10 md:flex-row">
          <div className="flex justify-center md:justify-start">
            <AnelIntegralizacao
              progresso={progresso}
              validado={validado}
              analise={analise}
              falta={falta}
              denominador={denominador}
            />
          </div>

          <div className="min-w-0 flex-1 md:min-w-[360px]">
            <h3 className="text-body font-bold text-integralizacao-texto-titulo">Exigências do Projeto Pedagógico</h3>
            <ul className="mt-[18px] flex flex-col gap-[18px]">
              {itens.map((item) => (
                <LinhaExigencia key={item.titulo} {...item} />
              ))}
            </ul>

            {pendentes.length > 0 && (
              <AvisoIntegralizacao
                texto={`Ainda falta cumprir: ${pendentes.map((item) => item.titulo).join("; ")}.`}
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 print:hidden">
          <Link href="/relatorio" className={buttonVariants({ variant: "outline" })}>
            <FileText aria-hidden="true" />
            Gerar relatório
          </Link>
          <Link href="/atividades/nova" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            Nova atividade
          </Link>
        </div>
      </div>
    </div>
  )
}
