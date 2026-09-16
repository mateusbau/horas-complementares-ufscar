import type { Metadata } from "next"

import { TelaOrientandos } from "@/components/docente/TelaOrientandos"

export const metadata: Metadata = { title: "Meus orientandos · Horas Complementares" }

export default function PaginaOrientandos() {
  return <TelaOrientandos />
}
