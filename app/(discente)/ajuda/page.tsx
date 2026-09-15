import type { Metadata } from "next"

import { PaginaDeApoio } from "@/components/apoio/PaginaDeApoio"

export const metadata: Metadata = { title: "Ajuda · Horas Complementares" }

export default function PaginaAjuda() {
  return (
    <PaginaDeApoio
      perfil="discente"
      titulo="Ajuda"
      descricao="Aqui você encontraria respostas para dúvidas comuns sobre o preenchimento e um canal de contato direto com a Secretaria de Coordenação de Curso · SeCoT XVIII."
    />
  )
}
