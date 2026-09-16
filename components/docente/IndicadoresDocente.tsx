// components/docente/IndicadoresDocente.tsx
//
// Os quatro indicadores do painel do docente (tela 06), sempre em crédito
// quando o número vem de atividades — nunca em hora agregada (régua do
// crédito, CLAUDE.md). Mesmo cartão com borda (nunca sombra) do resto do
// sistema; sem cor de status aqui, porque nenhum destes números é, em si, um
// status de atividade.

import { formatarCreditos, formatarNumero } from "@/lib/formatacao"
import type { EstatisticasDocente } from "@/lib/storage"

type Indicador = { id: string; rotulo: string; valor: string; detalhe: string }

export function IndicadoresDocente({ estatisticas }: { estatisticas: EstatisticasDocente }) {
  const indicadores: Indicador[] = [
    {
      id: "aguardando",
      rotulo: "Aguardando validação",
      valor: formatarNumero(estatisticas.aguardando),
      detalhe:
        estatisticas.esperandoMaisDe7Dias > 0
          ? `${formatarNumero(estatisticas.esperandoMaisDe7Dias)} há mais de 7 dias`
          : "Nenhuma espera há mais de 7 dias",
    },
    {
      id: "validadas",
      rotulo: "Validadas",
      valor: formatarNumero(estatisticas.validadas),
      detalhe: `${formatarCreditos(estatisticas.creditosHomologados)} homologados`,
    },
    {
      id: "devolvidas",
      rotulo: "Devolvidas com pendência",
      valor: formatarNumero(estatisticas.devolvidas),
      detalhe: "Aguardando o discente",
    },
    {
      id: "orientandos",
      rotulo: "Orientandos ativos",
      valor: formatarNumero(estatisticas.orientandosAtivos),
      detalhe: "Curso BCDIA",
    },
  ]

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {indicadores.map((indicador) => (
        <li key={indicador.id} className="flex flex-col gap-1 rounded-lg border bg-surface p-4">
          <span className="text-label text-muted-foreground">{indicador.rotulo}</span>
          <span className="tabular text-h2">{indicador.valor}</span>
          <span className="text-caption leading-secondary text-muted-foreground">{indicador.detalhe}</span>
        </li>
      ))}
    </ul>
  )
}
