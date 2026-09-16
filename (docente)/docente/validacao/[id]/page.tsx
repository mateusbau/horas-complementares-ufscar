import type { Metadata } from "next"

import { ValidacaoAtividade } from "@/components/docente/ValidacaoAtividade"

export const metadata: Metadata = { title: "Validação da atividade · Horas Complementares" }

export default async function PaginaValidacaoAtividade(props: PageProps<"/docente/validacao/[id]">) {
  const { id } = await props.params
  return <ValidacaoAtividade id={id} />
}
