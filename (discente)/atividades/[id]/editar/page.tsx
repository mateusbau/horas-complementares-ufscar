import type { Metadata } from "next"

import { FormularioEditarAtividade } from "@/components/atividade/FormularioEditarAtividade"

export const metadata: Metadata = { title: "Editar atividade · Horas Complementares" }

export default async function PaginaEditarAtividade(props: PageProps<"/atividades/[id]/editar">) {
  const { id } = await props.params
  return <FormularioEditarAtividade id={id} />
}
