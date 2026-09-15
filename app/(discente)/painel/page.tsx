import type { Metadata } from "next"

import { PainelDiscente } from "@/components/painel/PainelDiscente"

export const metadata: Metadata = { title: "Painel · Horas Complementares" }

export default function PaginaPainel() {
  return <PainelDiscente />
}
