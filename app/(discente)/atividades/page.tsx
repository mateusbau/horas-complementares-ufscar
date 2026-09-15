import type { Metadata } from "next"

import { ListaAtividades } from "@/components/atividade/ListaAtividades"

export const metadata: Metadata = { title: "Minhas atividades · Horas Complementares" }

// `?demo=vazio` força o estado vazio para demonstração (PROMPT-INICIAL.md, tela 03).
export default async function PaginaAtividades(props: PageProps<"/atividades">) {
  const searchParams = await props.searchParams
  const vazioForcado = searchParams.demo === "vazio"
  return <ListaAtividades vazioForcado={vazioForcado} />
}
