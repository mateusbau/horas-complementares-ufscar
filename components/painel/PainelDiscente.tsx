"use client"

// components/painel/PainelDiscente.tsx — Tela 02 · Painel do discente
//
// Régua do crédito (CLAUDE.md): o crédito é a medida principal. Dados do
// storage (300 ms): skeleton com a forma final enquanto carrega, estado de erro
// com nova tentativa.

import { Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { EstadoErro } from "@/components/feedback/EstadoErro"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { AcessoRapido } from "@/components/painel/AcessoRapido"
import { AnelProgressoEsqueleto } from "@/components/progresso/AnelProgresso"
import { BarrasPorGrupo } from "@/components/progresso/BarrasPorGrupo"
import { OQueFechaOQueFalta } from "@/components/progresso/OQueFechaOQueFalta"
import { ResumoProgresso } from "@/components/progresso/ResumoProgresso"
import { buttonVariants } from "@/components/ui/button"
import { listarAtividades, obterProgresso } from "@/lib/storage"
import type { Progresso } from "@/lib/types"

type Estado =
  | { status: "carregando" }
  | { status: "erro" }
  | { status: "pronto"; progresso: Progresso; pendentes: number }

export function PainelDiscente() {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    Promise.all([obterProgresso(), listarAtividades()])
      .then(([progresso, atividades]) => {
        if (!ativo) return
        setEstado({ status: "pronto", progresso, pendentes: atividades.filter((a) => a.status === "pendente").length })
      })
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [tentativa])

  function tentarNovamente() {
    setEstado({ status: "carregando" })
    setTentativa((t) => t + 1)
  }

  return (
    <>
      <PageHeader
        titulo="Painel"
        subtitulo="Acompanhe o andamento das suas horas complementares no curso."
        acao={
          <Link href="/atividades/nova" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            Nova atividade
          </Link>
        }
      />

      {estado.status === "carregando" && (
        <AreaCarregando texto="Carregando seu progresso…" className="flex flex-col gap-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-6 rounded-lg border bg-surface p-6">
              <Skeleton className="h-8 w-40" />
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <AnelProgressoEsqueleto />
                <div className="flex w-full flex-col gap-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-row" />
              <Skeleton className="h-row" />
              <Skeleton className="h-row" />
              <Skeleton className="h-row" />
            </div>
          </div>
          <Skeleton className="h-48" />
        </AreaCarregando>
      )}

      {estado.status === "erro" && (
        <EstadoErro
          nivelTitulo={2}
          titulo="Não foi possível carregar seu progresso"
          onTentarNovamente={tentarNovamente}
        />
      )}

      {estado.status === "pronto" && (
        <div className="flex flex-col gap-8">
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <ResumoProgresso progresso={estado.progresso} />
            <OQueFechaOQueFalta progresso={estado.progresso} />
          </div>
          <BarrasPorGrupo progresso={estado.progresso} />
          <AcessoRapido pendentes={estado.pendentes} />
        </div>
      )}
    </>
  )
}
