// TEMPORÁRIO (etapa 3): rota de teste da casca. Sai na etapa 5.

import type { Metadata } from "next"

import { VitrineCasca } from "@/components/demonstracao/VitrineCasca"

export const metadata: Metadata = { title: "Casca da interface · Horas Complementares" }

export default function PaginaCascaDiscente() {
  return <VitrineCasca perfil="discente" />
}
