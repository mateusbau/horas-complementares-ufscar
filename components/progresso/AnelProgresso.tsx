// components/progresso/AnelProgresso.tsx
//
// Anel SVG de progresso: arco em --brand (laranja decorativo, permitido em
// gráficos) sobre --trilha, que continua clara no alto contraste. O contêiner é role="img" com aria-label;
// o texto do centro é o mesmo, então fica oculto do leitor de tela para não
// ser lido duas vezes. O valor nunca depende só do gráfico: está no texto.

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const RAIO = 52
const ESPESSURA = 12
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

export function AnelProgresso({
  percentual,
  rotuloAcessivel,
  children,
  className,
}: {
  /** 0 a 100. */
  percentual: number
  rotuloAcessivel: string
  /** Texto do centro (visual). */
  children: ReactNode
  className?: string
}) {
  const fracao = Math.min(100, Math.max(0, percentual)) / 100
  return (
    <div role="img" aria-label={rotuloAcessivel} className={cn("relative size-48 shrink-0", className)}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={RAIO} fill="none" strokeWidth={ESPESSURA} className="stroke-trilha" />
        <circle
          cx="60"
          cy="60"
          r={RAIO}
          fill="none"
          strokeWidth={ESPESSURA}
          className="stroke-brand"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - fracao)}
        />
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        {children}
      </div>
    </div>
  )
}

/** Forma do anel para o estado de carregando. */
export function AnelProgressoEsqueleto() {
  return (
    <svg viewBox="0 0 120 120" className="size-48 shrink-0 animate-pulse" aria-hidden="true">
      <circle cx="60" cy="60" r={RAIO} fill="none" strokeWidth={ESPESSURA} className="stroke-muted" />
    </svg>
  )
}
