// components/progresso/FaixaProgresso.tsx — Painel do discente
//
// Substitui o antigo card "Seu progresso" (rosca + card): uma faixa de
// largura total, direto sobre o fundo da página, sem card. A régua do
// crédito continua valendo (CLAUDE.md): crédito é a medida principal, hora é
// só o total secundário, rotulado sem ambiguidade.
//
// A informação de progresso aparece no máximo duas vezes na tela: aqui
// (título + linha secundária + barra + legenda, todas a mesma informação em
// formatos diferentes de um único bloco) e no checklist "Exigências do
// Projeto Pedagógico" mais abaixo, que confere outra coisa (regras
// cumpridas, não o andamento). A porcentagem não aparece em lugar nenhum.
//
// Barra segmentada: "Em análise" não pode depender só de cor (CLAUDE.md),
// então além do tom claro usa hachura diagonal — quem vê em escala de cinza
// ou baixa visão de cor ainda distingue o padrão. A legenda com os valores
// em créditos não é decoração, é a alternativa textual exigida.

import { CircleHelp, FileText, Plus } from "lucide-react"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { buttonVariants } from "@/components/ui/button"
import { creditosEmAnalise } from "@/lib/calculos"
import { formatarCreditos, formatarHorasContabilizadas, formatarPremissaCredito } from "@/lib/formatacao"
import type { Atividade, Progresso } from "@/lib/types"

/** Diagonal em --primary sobre --accent-soft: "laranja claro", nunca a cor sozinha (há hachura de verdade). */
const HACHURA_EM_ANALISE: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, var(--primary) 0px, var(--primary) 4px, var(--accent-soft) 4px, var(--accent-soft) 8px)",
}

export function FaixaProgresso({
  progresso,
  atividades,
}: {
  progresso: Progresso
  atividades: readonly Atividade[]
}) {
  const analise = creditosEmAnalise(atividades)
  const validado = progresso.creditosObtidos
  // A barra sempre soma ao que for maior: o exigido, ou o que já está validado + em análise
  // (quando isso já passa do exigido, nada fica de fora da barra por falta de espaço).
  const denominador = Math.max(progresso.creditosExigidos, validado + analise)
  const falta = Math.max(0, denominador - validado - analise)

  const pctValidado = (validado / denominador) * 100
  const pctAnalise = (analise / denominador) * 100

  const titulo = progresso.integralizado
    ? "Integralização concluída"
    : progresso.creditosFaltantes > 0
      ? `Faltam ${formatarCreditos(progresso.creditosFaltantes)} para integralizar`
      : "Falta um segundo tipo de atividade para integralizar"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-h1">{titulo}</h2>
          <p className="text-body text-muted-foreground">
            {formatarCreditos(progresso.creditosObtidos)} de {formatarCreditos(progresso.creditosExigidos)} ·{" "}
            {formatarHorasContabilizadas(progresso.horasObtidas, progresso.horasExigidas)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
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

      <div className="flex flex-col gap-2">
        <div
          role="progressbar"
          aria-valuenow={validado}
          aria-valuemin={0}
          aria-valuemax={denominador}
          aria-label={`Créditos: ${formatarCreditos(validado)} validados, ${formatarCreditos(analise)} em análise, de ${formatarCreditos(progresso.creditosExigidos)} exigidos.`}
          className="flex h-3 w-full overflow-hidden rounded-lg bg-trilha"
        >
          {pctValidado > 0 && <div className="h-full bg-primary" style={{ width: `${pctValidado}%` }} />}
          {pctAnalise > 0 && <div className="h-full" style={{ width: `${pctAnalise}%`, ...HACHURA_EM_ANALISE }} />}
        </div>

        {/* Alternativa textual obrigatória, não decorativa: os mesmos três valores da barra, por extenso. */}
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-label text-muted-foreground">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-primary" />
            Validado: {formatarCreditos(validado)}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={HACHURA_EM_ANALISE} />
            Em análise: {formatarCreditos(analise)}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-trilha" />
            Falta: {formatarCreditos(falta)}
          </li>
        </ul>
      </div>

      <Popover>
        <PopoverTrigger
          className="inline-flex min-h-target w-fit items-center gap-1.5 text-label text-accent-text underline underline-offset-4 hover:decoration-2 print:hidden"
        >
          <CircleHelp aria-hidden="true" className="size-4" />
          Como isso é calculado?
        </PopoverTrigger>
        <PopoverContent>
          <p className="leading-secondary text-foreground">{formatarPremissaCredito()}</p>
        </PopoverContent>
      </Popover>
    </div>
  )
}
