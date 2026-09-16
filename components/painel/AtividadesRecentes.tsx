// components/painel/AtividadesRecentes.tsx — Painel do discente
//
// Card novo (coluna direita, ao lado de "O que fecha o que falta"): as
// atividades mais recentes do aluno, para o painel não ser só "o que falta"
// e mostrar também o que já foi enviado. O título de cada linha é o link
// real (mesmo padrão de TabelaAtividades: Tab alcança o link, Enter abre o
// detalhe); o chip de status vem de StatusBadge, que já é ícone + cor + texto.

import Link from "next/link"

import { StatusBadge } from "@/components/atividade/StatusBadge"
import { buttonVariants } from "@/components/ui/button"
import { obterTipo } from "@/lib/catalogo"
import { formatarData } from "@/lib/formatacao"
import type { Atividade } from "@/lib/types"

const MAXIMO_EXIBIDO = 4

export function AtividadesRecentes({ atividades }: { atividades: readonly Atividade[] }) {
  const recentes = [...atividades]
    .sort((a, b) => (b.enviadaEm ?? b.criadaEm).localeCompare(a.enviadaEm ?? a.criadaEm))
    .slice(0, MAXIMO_EXIBIDO)

  return (
    <section aria-labelledby="titulo-recentes" className="flex h-full flex-col gap-4 rounded-lg border bg-surface p-4">
      <h2 id="titulo-recentes" className="text-body font-bold">
        Suas atividades
      </h2>

      {recentes.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center gap-3">
          <p className="text-label text-muted-foreground">Você ainda não registrou nenhuma atividade.</p>
          <Link href="/atividades/nova" className={buttonVariants({ variant: "outline" })}>
            Registrar primeira atividade
          </Link>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col divide-y rounded-lg border">
          {recentes.map((atividade) => (
            <li key={atividade.id} className="flex flex-col gap-1.5 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <Link
                  href={`/atividades/${atividade.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:text-accent-text hover:underline"
                >
                  {atividade.titulo}
                </Link>
                <StatusBadge status={atividade.status} />
              </div>
              <span className="text-label text-muted-foreground">
                {atividade.tipoId === null ? "Sem tipo previsto" : obterTipo(atividade.tipoId).nomeCurto} ·{" "}
                {formatarData(atividade.enviadaEm ?? atividade.criadaEm)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/atividades"
        className="mt-auto text-label text-accent-text underline underline-offset-4 hover:decoration-2"
      >
        Ver todas as atividades
      </Link>
    </section>
  )
}
