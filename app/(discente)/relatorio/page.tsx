import type { Metadata } from "next"

import { Relatorio } from "@/components/relatorio/Relatorio"

export const metadata: Metadata = { title: "Relatório · Horas Complementares" }

export default function PaginaRelatorio() {
  return <Relatorio />
}
