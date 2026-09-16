import type { Metadata } from "next"

import { PainelDocente } from "@/components/painel/PainelDocente"

export const metadata: Metadata = { title: "Painel do docente · Horas Complementares" }

export default function PaginaPainelDocente() {
  return <PainelDocente />
}
