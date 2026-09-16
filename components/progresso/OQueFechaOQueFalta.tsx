// components/progresso/OQueFechaOQueFalta.tsx
//
// Nível 2 do painel: traduz o que falta em ações concretas, lidas do catálogo.
// Responde "o que eu preciso fazer para fechar", não "quanto já fiz". Mostra a
// opção mais simples de cada nível de esforço (sugestoesParaFechar), do mais
// simples ao mais difícil. A hora só aparece como requisito do tipo, citado da
// Tabela 7 (régua do crédito).

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
    <section aria-labelledby="titulo-fecha" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
      <h2 id="titulo-fecha">O que fecha o que falta</h2>
      <p>{introducao}</p>
      <ul className="flex flex-col divide-y rounded-lg border">
        {sugestoes.map((opcao) => {
          const nivel = NIVEIS_ESFORCO.find((n) => n.nivel === opcao.nivelEsforco)
          return (
            <li key={opcao.tipoId} className="flex flex-col gap-1 px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-medium">
                  {formatarQuantidade(opcao.tipoId, opcao.quantidade)}
                  {opcao.semestres && opcao.semestres > 1 ? `, em ${formatarNumero(opcao.semestres)} semestres` : ""}
                </span>
                <span className="tabular text-label">
                  {formatarCreditos(opcao.creditos)}
                  {opcao.excede ? " (passa do que falta)" : ""}
                </span>
              </div>
              <span className="text-caption leading-secondary text-muted-foreground">
                {nivel?.nome} · Tabela 7: {formatarRequisito(opcao.tipoId)}
                {opcao.atendeTiposDistintos ? "" : " · não resolve sozinha: falta um tipo diferente"}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="text-caption leading-secondary text-muted-foreground">
        Do mais simples ao mais difícil de conseguir: participação aberta, disciplina com aprovação,
        vínculo ou seleção e produção científica. Um exemplo de cada; há outras combinações.
      </p>
    </section>
  )
}
