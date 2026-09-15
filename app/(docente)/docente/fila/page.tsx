import type { Metadata } from "next"

import { FilaCompleta } from "@/components/docente/FilaCompleta"

export const metadata: Metadata = { title: "Fila de validação · Horas Complementares" }

export default function PaginaFilaValidacao() {
  return <FilaCompleta />
}
