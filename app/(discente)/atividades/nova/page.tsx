import type { Metadata } from "next"
import { Suspense } from "react"

import { FormularioNovaAtividade } from "@/components/atividade/FormularioNovaAtividade"

export const metadata: Metadata = { title: "Nova atividade · Horas Complementares" }

export default function PaginaNovaAtividade() {
  // Suspense exigido pelo Next por causa de useSearchParams() em
  // FormularioNovaAtividade (o tipo pré-preenchido vindo de "O que fecha o
  // que falta", no painel); o próprio componente já tem seu estado de
  // carregando, então o fallback fica vazio.
  return (
    <Suspense fallback={null}>
      <FormularioNovaAtividade />
    </Suspense>
  )
}
