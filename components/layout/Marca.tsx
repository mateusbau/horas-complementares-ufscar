// components/layout/Marca.tsx
//
// Marca do sistema: ícone grande em laranja decorativo (--brand, permitido em
// ícones grandes) e nome. Sem nome de equipe: a avaliação é anônima.

import { GraduationCap } from "lucide-react"

import { cn } from "@/lib/utils"

export function Marca({ compacta = false, className }: { compacta?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-primary-foreground"
      >
        <GraduationCap className="size-6" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-label font-bold text-foreground">Horas Complementares</span>
        {!compacta && (
          <span className="text-caption leading-secondary text-muted-foreground">UFSCar Sorocaba</span>
        )}
      </span>
    </div>
  )
}
