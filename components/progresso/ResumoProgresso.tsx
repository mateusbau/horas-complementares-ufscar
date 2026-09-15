// components/progresso/ResumoProgresso.tsx
//
// Nível 1 do painel. Régua do crédito (CLAUDE.md): o crédito é a medida
// principal; a hora aparece só como total secundário, rotulado
// "horas contabilizadas" — nunca "cumpridas", porque a carga do certificado
// não é a carga contabilizada.

import { CircleCheck, CircleDashed } from "lucide-react"

import { AnelProgresso } from "@/components/progresso/AnelProgresso"
import { formatarCreditos, formatarHoras, formatarHorasContabilizadas, formatarNumero, formatarPercentual } from "@/lib/formatacao"
import type { Progresso } from "@/lib/types"

export function ResumoProgresso({ progresso }: { progresso: Progresso }) {
  const { creditosObtidos, creditosExigidos, creditosFaltantes, horasFaltantes } = progresso
  const percentual = formatarPercentual(progresso.percentual)
  const tiposOk = progresso.tiposDistintos >= progresso.tiposExigidos

  return (
    <section aria-labelledby="titulo-progresso" className="flex flex-col gap-6 rounded-lg border bg-surface p-6">
      <h2 id="titulo-progresso">Seu progresso</h2>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <AnelProgresso
          percentual={progresso.percentual}
          rotuloAcessivel={`${formatarNumero(creditosObtidos)} de ${formatarCreditos(creditosExigidos)}, ${percentual} concluído.`}
        >
          <span className="text-h1 tabular">
            {formatarNumero(creditosObtidos)} de {formatarNumero(creditosExigidos)}
          </span>
          <span className="text-label text-muted-foreground">créditos</span>
        </AnelProgresso>

        <div className="flex min-w-0 flex-col gap-2 text-center sm:text-left">
          <p className="text-h3">{percentual} concluído</p>
          <p className="leading-secondary text-muted-foreground">
            {formatarHorasContabilizadas(progresso.horasObtidas, progresso.horasExigidas)}
          </p>
          <p>
            {progresso.integralizado
              ? "Você cumpriu as atividades complementares exigidas para a integralização."
              : creditosFaltantes > 0
                ? `Faltam ${formatarCreditos(creditosFaltantes)} (${formatarHoras(horasFaltantes)} contabilizadas) para a integralização.`
                : "Os créditos já bastam; falta só um tipo de atividade diferente."}
          </p>
        </div>
      </div>

      {/* PPC, 3.5.4: pelo menos dois tipos diferentes. Estado com ícone + texto, nunca só cor. */}
      <p className="flex items-start gap-2 border-t pt-4">
        <span className="flex h-6 shrink-0 items-center">
          {tiposOk ? (
            <CircleCheck aria-hidden="true" className="size-5 text-success" />
          ) : (
            <CircleDashed aria-hidden="true" className="size-5 text-pending" />
          )}
        </span>
        <span>
          Tipos de atividade diferentes:{" "}
          <strong className="font-medium tabular">
            {formatarNumero(Math.min(progresso.tiposDistintos, progresso.tiposExigidos))} de{" "}
            {formatarNumero(progresso.tiposExigidos)}
          </strong>
          {tiposOk ? " — exigência cumprida." : " — o Projeto Pedagógico exige pelo menos dois tipos diferentes."}
        </span>
      </p>
    </section>
  )
}
