import type { Metadata } from "next"

import { PaginaDeApoio } from "@/components/apoio/PaginaDeApoio"

export const metadata: Metadata = { title: "Central de avisos · Horas Complementares" }

export default function PaginaAvisos() {
  return (
    <PaginaDeApoio
      perfil="discente"
      titulo="Central de avisos"
      descricao="Aqui apareceriam, reunidos num só lugar, os prazos, os retornos dos docentes e os avisos da coordenação do curso."
    />
  )
}
