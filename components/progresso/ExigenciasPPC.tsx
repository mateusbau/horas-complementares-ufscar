// components/progresso/ExigenciasPPC.tsx — Painel do discente
//
// Substitui "De onde vieram seus créditos" (agrupamento por Ensino/Pesquisa/
// Extensão/Representação): o PPC não define mínimo nem teto por grupo, e o
// próprio subtítulo antigo admitia isso — metade da tela para dizer "nenhum
// crédito validado" duas vezes não ajudava ninguém.
//
// No lugar, as regras que o sistema de fato valida: os dois limiares de
// integralização (créditos e tipos distintos) e as duas notas de rodapé da
// Tabela 7 (asterisco e duplo asterisco), conferidas de volta nas atividades
// já registradas por semDuplaContagemGarantida/semestreCompletoGarantido —
// nenhum item aqui é afirmado sem checar os dados.

import { CircleCheck, CircleDashed, type LucideIcon } from "lucide-react"

import { NOTA_DUPLA_CONTAGEM, NOTA_SEMESTRE_COMPLETO } from "@/lib/catalogo"
import { semDuplaContagemGarantida, semestreCompletoGarantido } from "@/lib/calculos"
import { formatarCreditos, formatarHoras, formatarNumero } from "@/lib/formatacao"
import type { Atividade, Progresso } from "@/lib/types"

type ItemChecklist = { titulo: string; detalhe: string; cumprido: boolean }

export function ExigenciasPPC({
  progresso,
  atividades,
}: {
  progresso: Progresso
  atividades: readonly Atividade[]
}) {
  const itens: ItemChecklist[] = [
    {
      titulo: `${formatarHoras(progresso.horasExigidas)} para integralização`,
      detalhe: `Progresso atual: ${formatarCreditos(progresso.creditosObtidos)} de ${formatarCreditos(progresso.creditosExigidos)}.`,
      cumprido: progresso.creditosObtidos >= progresso.creditosExigidos,
    },
    {
      titulo: `Pelo menos ${formatarNumero(progresso.tiposExigidos)} tipos de atividade diferentes`,
      detalhe: `Seção 3.5.4 do Projeto Pedagógico. Você tem ${formatarNumero(progresso.tiposDistintos)} tipo${progresso.tiposDistintos === 1 ? "" : "s"} com crédito validado.`,
      cumprido: progresso.tiposDistintos >= progresso.tiposExigidos,
    },
    {
      titulo: "Sem dupla contagem de atividades marcadas com asterisco (*)",
      detalhe: NOTA_DUPLA_CONTAGEM,
      cumprido: semDuplaContagemGarantida(atividades),
    },
    {
      titulo: "Monitoria válida apenas com semestre completo (**)",
      detalhe: NOTA_SEMESTRE_COMPLETO,
      cumprido: semestreCompletoGarantido(atividades),
    },
  ]

  return (
    <section aria-labelledby="titulo-exigencias" className="flex flex-col gap-4 rounded-lg border bg-surface p-4">
      <h2 id="titulo-exigencias" className="text-body font-bold">
        Exigências do Projeto Pedagógico
      </h2>
      <ul className="flex flex-col gap-4">
        {itens.map((item) => (
          <li key={item.titulo} className="flex items-start gap-3">
            <IconeEstado cumprido={item.cumprido} />
            <div className="flex flex-col gap-0.5">
              <p className="text-body text-foreground">
                {item.titulo}
                {item.cumprido ? " — cumprido." : " — pendente."}
              </p>
              <p className="text-label leading-secondary text-muted-foreground">{item.detalhe}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function IconeEstado({ cumprido }: { cumprido: boolean }) {
  const Icone: LucideIcon = cumprido ? CircleCheck : CircleDashed
  return (
    <span className="flex h-[1.5em] shrink-0 items-center">
      <Icone aria-hidden="true" className={cumprido ? "size-5 text-success" : "size-5 text-pending"} />
    </span>
  )
}
