"use client"

// components/painel/PainelDocente.tsx — Tela 06 · Painel do docente
//
// Fila derivada do status (lib/storage.ts, listarFilaValidacao): toda
// atividade em análise, de qualquer discente, da mais antiga para a mais
// recente. Indicadores em crédito (régua do crédito, CLAUDE.md) — nunca em
// hora agregada. Mostra as 5 primeiras da fila, com rodapé e link para a
// fila completa (/docente/fila).

import { Inbox } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { FilaValidacao } from "@/components/docente/FilaValidacao"
import { IndicadoresDocente } from "@/components/docente/IndicadoresDocente"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { AcessoRapidoDocente } from "@/components/painel/AcessoRapidoDocente"
import { buttonVariants } from "@/components/ui/button"
import { formatarEspera, formatarNumero } from "@/lib/formatacao"
import { listarFilaValidacao, obterEstatisticasDocente, type EstatisticasDocente } from "@/lib/storage"
import type { ItemFila } from "@/lib/types"

const PREVIA = 5

type Estado =
  | { status: "carregando" }
  | { status: "erro" }
  | { status: "pronto"; estatisticas: EstatisticasDocente; fila: ItemFila[] }

export function PainelDocente() {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    Promise.all([obterEstatisticasDocente(), listarFilaValidacao()])
      .then(([estatisticas, fila]) => {
        if (!ativo) return
        setEstado({ status: "pronto", estatisticas, fila })
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

  const subtitulo =
    estado.status === "pronto"
      ? estado.fila.length === 0
        ? "Nenhuma atividade aguarda validação neste momento."
        : `${formatarNumero(estado.fila.length)} ${estado.fila.length === 1 ? "atividade aguarda" : "atividades aguardam"} validação · a mais antiga espera há ${formatarEspera(estado.fila[0].esperaDias)}.`
      : undefined

  return (
    <>
      <PageHeader
        titulo="Painel do docente"
        subtitulo={subtitulo}
        acao={
          estado.status === "pronto" && estado.fila.length > 0 ? (
            <Link href="/docente/fila" className={buttonVariants()}>
              <Inbox aria-hidden="true" />
              Abrir fila de validação
            </Link>
          ) : undefined
        }
      />

      {estado.status === "carregando" && (
        <AreaCarregando texto="Carregando painel…" className="flex flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-row" />
            <Skeleton className="h-row" />
            <Skeleton className="h-row" />
          </div>
        </AreaCarregando>
      )}

      {estado.status === "erro" && (
        <EstadoErro nivelTitulo={2} titulo="Não foi possível carregar o painel" onTentarNovamente={tentarNovamente} />
      )}

      {estado.status === "pronto" && (
        <div className="flex flex-col gap-8">
          <IndicadoresDocente estatisticas={estado.estatisticas} />

          <section aria-labelledby="titulo-fila" className="flex flex-col gap-4">
            <h2 id="titulo-fila">Fila de validação</h2>
            <p className="text-caption text-muted-foreground">Ordenada por tempo de espera.</p>

            {estado.fila.length === 0 ? (
              <EstadoVazio
                nivelTitulo={3}
                icone={Inbox}
                titulo="Nenhuma atividade aguardando validação"
                descricao="Quando um discente enviar uma atividade, ela aparece aqui, da mais antiga para a mais recente."
              />
            ) : (
              <>
                <FilaValidacao itens={estado.fila.slice(0, PREVIA)} />
                <p className="text-caption text-muted-foreground">
                  Mostrando {formatarNumero(Math.min(PREVIA, estado.fila.length))} de{" "}
                  {formatarNumero(estado.fila.length)} na fila ·{" "}
                  <Link href="/docente/fila" className="text-accent-text underline underline-offset-4 hover:decoration-2">
                    Ver fila completa
                  </Link>
                </p>
              </>
            )}
          </section>

          <AcessoRapidoDocente />
        </div>
      )}
    </>
  )
}
