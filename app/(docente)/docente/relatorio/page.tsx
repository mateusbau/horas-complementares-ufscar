import type { Metadata } from "next"

import { RelatorioTurma } from "@/components/docente/RelatorioTurma"

export const metadata: Metadata = { title: "Relatório da turma · Horas Complementares" }

export default function PaginaRelatorioTurma() {
  return <RelatorioTurma />
}
