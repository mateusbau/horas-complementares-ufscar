// components/docente/FilaValidacao.tsx
//
// Tabela da fila de validação (tela 06, em preview, e a fila completa em
// /docente/fila): toda atividade em análise, de qualquer discente, da que
// espera há mais tempo para a mais recente (a ordenação já vem de
// listarFilaValidacao, lib/storage.ts). Régua do crédito: coluna "Créditos",
// nunca "Horas" nem "Categoria" — o tipo da Tabela 7 é o que existe.
// Mesmo padrão visual de TabelaAtividades: tabela em 768 px+, cards abaixo
// disso, linha inteira clicável com o título como link real (o resto da linha
// é conveniência de mouse).

import Link from "next/link"
import { useRouter } from "next/navigation"

import { StatusBadge } from "@/components/atividade/StatusBadge"
import { obterTipo } from "@/lib/catalogo"
import { formatarCreditos, formatarEspera } from "@/lib/formatacao"
import type { ItemFila } from "@/lib/types"

function nomeDoTipo(item: ItemFila): string {
  return item.tipoId === null ? "Sem tipo previsto" : obterTipo(item.tipoId).nomeCurto
}

export function FilaValidacao({ itens }: { itens: ItemFila[] }) {
  const router = useRouter()

  return (
    <>
      {/* Desktop: tabela real, a partir de 768 px. */}
      <div className="hidden overflow-x-auto rounded-lg border bg-surface md:block">
        <table className="w-full tabular">
          <thead className="border-b bg-muted">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Discente
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Atividade
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Tipo
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Créditos
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Espera
              </th>
              <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {itens.map((item) => (
              <tr
                key={item.atividadeId}
                onClick={() => router.push(`/docente/validacao/${item.atividadeId}`)}
                className="h-row cursor-pointer transition-colors hover:bg-muted"
              >
                <td className="celula-densidade px-4 text-body">
                  {item.discente.nome}
                  {item.discente.ra && (
                    <span className="text-caption text-muted-foreground"> · RA {item.discente.ra}</span>
                  )}
                </td>
                <td className="celula-densidade px-4">
                  <Link
                    href={`/docente/validacao/${item.atividadeId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-body text-foreground underline-offset-4 hover:text-accent-text hover:underline"
                  >
                    {item.titulo}
                  </Link>
                </td>
                <td className="celula-densidade px-4 text-body text-muted-foreground">{nomeDoTipo(item)}</td>
                <td className="celula-densidade px-4 text-body">{formatarCreditos(item.creditos)}</td>
                <td className="celula-densidade px-4 text-body text-muted-foreground">{formatarEspera(item.esperaDias)}</td>
                <td className="celula-densidade px-4">
                  <StatusBadge status="analise" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: lista de cards, abaixo de 768 px. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {itens.map((item) => (
          <li key={item.atividadeId}>
            <Link
              href={`/docente/validacao/${item.atividadeId}`}
              className="flex flex-col gap-2 rounded-lg border bg-surface p-4 transition-colors hover:bg-muted"
            >
              <span className="text-body font-medium">{item.titulo}</span>
              <span className="tabular text-label text-muted-foreground">
                {item.discente.nome} · {nomeDoTipo(item)} · {formatarCreditos(item.creditos)} ·{" "}
                {formatarEspera(item.esperaDias)}
              </span>
              <StatusBadge status="analise" className="self-start" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
