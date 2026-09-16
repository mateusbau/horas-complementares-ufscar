// components/progresso/OQueFechaOQueFalta.tsx
//
// Nível 2 do painel: traduz o que falta em ações concretas, lidas do catálogo.
// Responde "o que eu preciso fazer para fechar", não "quanto já fiz". Mostra a
// opção mais simples de cada nível de esforço (sugestoesParaFechar), do mais
// simples ao mais difícil. A hora só aparece como requisito do tipo, citado da
// Tabela 7 (régua do crédito).
//
// Cada linha é um <Link> real (não <div> com onClick): Tab alcança cada
// opção, Enter abre Nova atividade com o tipo já pré-preenchido
// (?tipo=<id>, lido em FormularioNovaAtividade). O crédito que a opção vale
// não aparece mais à direita — é redundante com "faltam N créditos" logo
// acima; no lugar, um chip diz o nível de esforço (a mesma classificação da
// nota final, sem repetir o número).

import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { NIVEIS_ESFORCO } from "@/lib/catalogo"
import { sugestoesParaFechar } from "@/lib/calculos"
import { formatarCreditos, formatarNumero, formatarQuantidade, formatarRequisito } from "@/lib/formatacao"
import type { Progresso } from "@/lib/types"

export function OQueFechaOQueFalta({ progresso }: { progresso: Progresso }) {
  const sugestoes = sugestoesParaFechar(progresso)
  if (progresso.integralizado || sugestoes.length === 0) return null

  const soFaltaTipo = progresso.creditosFaltantes === 0
  const introducao = soFaltaTipo
    ? "Seus créditos já bastam, mas falta um tipo de atividade diferente. Qualquer uma destas opções resolve:"
    : `Faltam ${formatarCreditos(progresso.creditosFaltantes)}. Isso equivale a, por exemplo:`

  return (
    <section aria-labelledby="titulo-fecha" className="flex h-full flex-col gap-4 rounded-lg border bg-surface p-4">
      <h2 id="titulo-fecha" className="text-body font-bold">
        O que fecha o que falta
      </h2>
      <div className="flex flex-col gap-1">
        <p className="text-label text-muted-foreground">{introducao}</p>
        <p className="text-label font-medium text-foreground">Escolha uma destas opções:</p>
      </div>
      <ul className="flex flex-col divide-y rounded-lg border">
        {sugestoes.map((opcao) => {
          const nivel = NIVEIS_ESFORCO.find((n) => n.nivel === opcao.nivelEsforco)
          return (
            <li key={opcao.tipoId}>
              <Link
                href={`/atividades/nova?tipo=${opcao.tipoId}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {formatarQuantidade(opcao.tipoId, opcao.quantidade)}
                      {opcao.semestres && opcao.semestres > 1 ? `, em ${formatarNumero(opcao.semestres)} semestres` : ""}
                    </span>
                    {nivel && (
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-label text-muted-foreground">
                        {nivel.nome}
                      </span>
                    )}
                  </span>
                  <span className="text-label leading-secondary text-muted-foreground">
                    Tabela 7: {formatarRequisito(opcao.tipoId)}
                    {opcao.atendeTiposDistintos ? "" : " · não resolve sozinha: falta um tipo diferente"}
                  </span>
                </div>
                <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="text-label leading-secondary text-muted-foreground">
        Do mais simples ao mais difícil de conseguir: participação aberta, disciplina com aprovação,
        vínculo ou seleção e produção científica. Um exemplo de cada; há outras combinações.
      </p>
    </section>
  )
}
