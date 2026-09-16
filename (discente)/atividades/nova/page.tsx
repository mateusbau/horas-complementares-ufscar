import type { Metadata } from "next"

import { FormularioNovaAtividade } from "@/components/atividade/FormularioNovaAtividade"

export const metadata: Metadata = { title: "Nova atividade · Horas Complementares" }

export default function PaginaNovaAtividade() {
  return <FormularioNovaAtividade />
}
