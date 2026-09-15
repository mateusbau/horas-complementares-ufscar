import type { Metadata } from "next"

import { PaginaDeApoio } from "@/components/apoio/PaginaDeApoio"

export const metadata: Metadata = { title: "Simulador · Horas Complementares" }

export default function PaginaSimulador() {
  return (
    <PaginaDeApoio
      perfil="discente"
      titulo="Simulador"
      descricao="Aqui você poderia testar, antes de registrar, combinações de tipos e quantidades da Tabela 7 e ver quantos créditos cada combinação soma."
    />
  )
}
