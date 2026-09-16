// components/feedback/Skeleton.tsx
//
// Estado de carregando: blocos com a forma do conteúdo final, em --muted, e um
// contêiner com aria-busy e texto para leitor de tela. Os blocos são
// decorativos (aria-hidden); quem informa é o texto.

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-muted", className)} />
}

export function AreaCarregando({
  texto,
  children,
  className,
}: {
  /** Ex.: "Carregando atividades…". */
  texto: string
  children: ReactNode
  className?: string
}) {
  return (
    <div aria-busy="true" className={className}>
      <p className="sr-only">{texto}</p>
      {children}
    </div>
  )
}
