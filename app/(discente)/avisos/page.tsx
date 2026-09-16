import type { Metadata } from "next"

import { TelaAvisos } from "@/components/avisos/TelaAvisos"

export const metadata: Metadata = { title: "Central de avisos · Horas Complementares" }

export default function PaginaAvisos() {
  return <TelaAvisos />
}
