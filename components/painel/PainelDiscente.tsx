"use client"

// components/painel/PainelDiscente.tsx — Tela 02 · Painel do discente
//
// Régua do crédito (CLAUDE.md): o crédito é a medida principal. Dados do
// storage (300 ms): skeleton com a forma final enquanto carrega, estado de erro
// com nova tentativa.
//
// O h1 é a saudação (nome do aluno); o status da integralização é comunicado
// pelo card de integralização, não pelo cabeçalho da página — por isso não
// há subtítulo nem ação aqui (as ações primárias, "Nova atividade" e "Gerar
// relatório", ficam no rodapé do próprio card). "Painel" só aparece como h1
// provisório enquanto o nome carrega: a página nunca fica sem h1 (CLAUDE.md,
// seção 3).

import { useEffect, useState } from "react"

import { EstadoErro } from "@/components/feedback/EstadoErro"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { AcessoRapido } from "@/components/painel/AcessoRapido"
import { AtividadesRecentes } from "@/components/painel/AtividadesRecentes"
import { CardIntegralizacao } from "@/components/progresso/CardIntegralizacao"
import { OQueFechaOQueFalta } from "@/components/progresso/OQueFechaOQueFalta"
import { listarAtividades, obterDiscenteAtual, obterProgresso } from "@/lib/storage"
import type { Atividade, Discente, Progresso } from "@/lib/types"

type Estado =
  | { status: "carregando" }
  | { status: "erro" }
  | { status: "pronto"; progresso: Progresso; atividades: Atividade[]; discente: Discente }

export function PainelDiscente() {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    Promise.all([obterProgresso(), listarAtividades(), obterDiscenteAtual()])
      .then(([progresso, atividades, discente]) => {
        if (!ativo) return
        setEstado({ status: "pronto", progresso, atividades, discente })
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

  const primeiroNome = estado.status === "pronto" ? estado.discente.nome.split(" ")[0] : null

  return (
    <>
      <PageHeader titulo={primeiroNome ? `Olá, ${primeiroNome}` : "Painel"} />

      {estado.status === "carregando" && (
        <AreaCarregando texto="Carregando seu progresso…" className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 rounded-lg border p-8">
            <Skeleton className="h-8 w-2/3" />
            <div className="flex flex-col gap-6 md:flex-row">
              <Skeleton className="size-[196px] shrink-0 rounded-full" />
              <Skeleton className="h-48 flex-1" />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <Skeleton className="h-40 rounded-lg" />
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
          <CardIntegralizacao progresso={estado.progresso} atividades={estado.atividades} />

          {estado.progresso.integralizado ? (
            <AtividadesRecentes atividades={estado.atividades} />
          ) : (
            <div className="grid items-stretch gap-6 lg:grid-cols-2">
              <OQueFechaOQueFalta progresso={estado.progresso} />
              <AtividadesRecentes atividades={estado.atividades} />
            </div>
          )}

          <AcessoRapido pendentes={estado.atividades.filter((a) => a.status === "pendente").length} />
        </div>
      )}
    </>
  )
}
