import type { Metadata } from "next"

import { CatalogoConteudo } from "@/components/catalogo/CatalogoConteudo"

export const metadata: Metadata = { title: "Catálogo de atividades · Horas Complementares" }

export default function PaginaCatalogoDiscente() {
  return <CatalogoConteudo />
}
