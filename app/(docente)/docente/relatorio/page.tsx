import type { Metadata } from "next"

import { PaginaDeApoio } from "@/components/apoio/PaginaDeApoio"

export const metadata: Metadata = { title: "Relatório da turma · Horas Complementares" }

export default function PaginaRelatorioTurma() {
  return (
    <PaginaDeApoio
      perfil="docente"
      titulo="Relatório da turma"
      descricao="Aqui você geraria um relatório consolidado dos créditos homologados por toda a turma no semestre, não só por atividade individual."
    />
  )
}
