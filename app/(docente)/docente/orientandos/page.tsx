import type { Metadata } from "next"

import { PaginaDeApoio } from "@/components/apoio/PaginaDeApoio"

export const metadata: Metadata = { title: "Meus orientandos · Horas Complementares" }

export default function PaginaOrientandos() {
  return (
    <PaginaDeApoio
      perfil="docente"
      titulo="Meus orientandos"
      descricao="Aqui você acompanharia o progresso de cada discente sob sua orientação, um a um — créditos obtidos, tipos distintos e o que falta para integralizar."
    />
  )
}
