// app/not-found.tsx
//
// Página para endereços que não existem, em português e com a identidade do
// sistema, no lugar da página padrão do Next (em inglês). Mantém a anatomia:
// link de pular (layout raiz), h1, subtítulo e ação.

import type { Metadata } from "next"
import Link from "next/link"

import { VoltarPaginaAnterior } from "@/components/feedback/VoltarPaginaAnterior"
import { ID_CONTEUDO } from "@/components/layout/SkipLink"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = { title: "Página não encontrada · Horas Complementares" }

export default function NaoEncontrada() {
  return (
    <main
      id={ID_CONTEUDO}
      tabIndex={-1}
      className="mx-auto w-full max-w-form scroll-mt-(--altura-barra) px-4 py-12"
    >
      <h1>Página não encontrada</h1>
      <p className="mt-2 leading-secondary text-muted-foreground">
        O endereço acessado não existe neste sistema. Confira o link ou volte para onde estava.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <VoltarPaginaAnterior />
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Ir para a tela de entrada
        </Link>
      </div>
    </main>
  )
}
