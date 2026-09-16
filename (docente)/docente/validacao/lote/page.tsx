import type { Metadata } from "next"

import { ValidacaoLote } from "@/components/docente/ValidacaoLote"
import { GRUPOS, type GrupoId } from "@/lib/catalogo"

export const metadata: Metadata = { title: "Validação em lote · Horas Complementares" }

function ehGrupoId(valor: unknown): valor is GrupoId {
  return typeof valor === "string" && GRUPOS.some((g) => g.id === valor)
}

// `?grupo=` chega do atalho "Validar em lote" da tela 07, para abrir já na aba do tipo em análise.
export default async function PaginaValidacaoLote(props: PageProps<"/docente/validacao/lote">) {
  const searchParams = await props.searchParams
  const grupoInicial = ehGrupoId(searchParams.grupo) ? searchParams.grupo : undefined
  return <ValidacaoLote grupoInicial={grupoInicial} />
}
