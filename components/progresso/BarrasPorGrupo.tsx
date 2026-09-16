// components/progresso/BarrasPorGrupo.tsx
//
// De onde vieram os créditos já validados, pelos quatro grupos visuais. Sem
// marcador de mínimo: o PPC não define mínimo nem teto por grupo, e o aviso
// AVISO_AGRUPAMENTO acompanha o bloco. A barra é decorativa; o valor está no
// texto. Pontas retas: com 8 px de altura, o raio de 8 px viraria pílula, que
// o sistema reserva para badges.

import { AVISO_AGRUPAMENTO, GRUPOS, obterTipo } from "@/lib/catalogo"
import { formatarCreditos } from "@/lib/formatacao"
import type { Progresso } from "@/lib/types"

export function BarrasPorGrupo({ progresso }: { progresso: Progresso }) {
  return (
    <section aria-labelledby="titulo-grupos" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
      <div className="flex flex-col gap-2">
        <h2 id="titulo-grupos">De onde vieram seus créditos</h2>
        <p className="leading-secondary text-muted-foreground">{AVISO_AGRUPAMENTO}</p>
      </div>
      <ul className="flex flex-col gap-6">
        {progresso.porGrupo.map((grupo) => {
          const nome = GRUPOS.find((g) => g.id === grupo.grupoId)?.nome ?? grupo.grupoId
          const tipos = progresso.porTipo.filter(
            (item) => item.creditos > 0 && obterTipo(item.tipoId).grupo === grupo.grupoId
          )
          const largura = Math.min(100, (grupo.creditos / progresso.creditosExigidos) * 100)
          return (
            <li key={grupo.grupoId} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="text-label">{nome}</span>
                <span className="tabular text-label">{formatarCreditos(grupo.creditos)}</span>
              </div>
              <div aria-hidden="true" className="h-2 overflow-hidden bg-trilha">
                <div className="h-full bg-brand" style={{ width: `${largura}%` }} />
              </div>
              <span className="text-caption leading-secondary text-muted-foreground">
                {tipos.length
                  ? tipos.map((item) => `${obterTipo(item.tipoId).nomeCurto}: ${formatarCreditos(item.creditos)}`).join(" · ")
                  : "Nenhum crédito validado neste grupo."}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="text-caption leading-secondary text-muted-foreground">
        Cada barra mostra os créditos do grupo em relação aos {formatarCreditos(progresso.creditosExigidos)} exigidos
        no total.
      </p>
    </section>
  )
}
