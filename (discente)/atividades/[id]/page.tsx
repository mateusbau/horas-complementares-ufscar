import type { Metadata } from "next"

import { DetalheAtividade } from "@/components/atividade/DetalheAtividade"

export const metadata: Metadata = { title: "Detalhe da atividade · Horas Complementares" }

export default async function PaginaDetalheAtividade(props: PageProps<"/atividades/[id]">) {
  const { id } = await props.params
  return <DetalheAtividade id={id} />
}
