// components/layout/PageHeader.tsx
//
// Anatomia obrigatória de toda página: h1 à esquerda, subtítulo de uma linha
// em texto secundário, ação primária à direita na altura do h1 e o conteúdo a
// 32 px (mb-8). No DOM a ordem é h1 → subtítulo → ação, que é a ordem de
// leitura; o grid só reposiciona a ação visualmente a partir de 640 px.
// Abaixo disso, tudo empilha na mesma ordem.

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

export function PageHeader({
  titulo,
  subtitulo,
  acao,
  voltar,
}: {
  titulo: string
  subtitulo?: ReactNode
  /** Ação primária (e secundárias, se houver), alinhada à direita. */
  acao?: ReactNode
  /** Link de retorno acima do h1, ex.: "Voltar para Minhas atividades". */
  voltar?: { href: string; rotulo: string }
}) {
  return (
    <div className="mb-8">
      {voltar && (
        <Link
          href={voltar.href}
          className="mb-2 inline-flex min-h-target items-center gap-2 text-label text-accent-text underline underline-offset-4 hover:decoration-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {voltar.rotulo}
        </Link>
      )}
      <header className="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <h1 className="break-words sm:col-start-1 sm:row-start-1">{titulo}</h1>
        {subtitulo && (
          <p className="leading-secondary text-muted-foreground sm:col-start-1 sm:row-start-2">
            {subtitulo}
          </p>
        )}
        {acao && (
          <div className="mt-2 flex flex-wrap items-start gap-2 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:justify-end">
            {acao}
          </div>
        )}
      </header>
    </div>
  )
}
