import type { Metadata } from "next"
import { Suspense } from "react"

import { FilaCompleta } from "@/components/docente/FilaCompleta"

export const metadata: Metadata = { title: "Fila de validação · Horas Complementares" }

export default function PaginaFilaValidacao() {
  // Suspense exigido pelo Next por causa de useSearchParams() em FilaCompleta
  // (o filtro ?discente=<id> vindo de "Meus orientandos"); o próprio
  // componente já tem seu estado de carregando, então o fallback fica vazio.
  return (
    <Suspense fallback={null}>
      <FilaCompleta />
    </Suspense>
  )
}
