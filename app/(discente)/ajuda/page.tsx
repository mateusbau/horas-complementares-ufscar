import type { Metadata } from "next"

import { TelaAjuda } from "@/components/ajuda/TelaAjuda"

export const metadata: Metadata = { title: "Ajuda · Horas Complementares" }

export default function PaginaAjuda() {
  return <TelaAjuda />
}
