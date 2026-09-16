"use client"

// components/docente/FilaCompleta.tsx
//
// Fila completa (alcançada por "Ver fila completa" do painel, tela 06, pelo
// item de navegação "Fila de validação", e por "Meus orientandos" — a linha
// de um aluno leva aqui com ?discente=<id>, filtrando a mesma fila em vez de
// uma tela à parte): a mesma tabela do painel, sem o recorte de 5 itens.

import { Inbox } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { FilaValidacao } from "@/components/docente/FilaValidacao"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { formatarEspera, formatarNumero } from "@/lib/formatacao"
import { listarFilaValidacao } from "@/lib/storage"
import type { ItemFila } from "@/lib/types"

type Estado = { status: "carregando" } | { status: "erro" } | { status: "pronto"; fila: ItemFila[] }

export function FilaCompleta() {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)
  const parametros = useSearchParams()
  const discenteId = parametros.get("discente")

  useEffect(() => {
    let ativo = true
    listarFilaValidacao()
      .then((fila) => ativo && setEstado({ status: "pronto", fila }))
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [tentativa])

  function tentarNovamente() {
    setEstado({ status: "carregando" })
    setTentativa((t) => t + 1)
  }

  const filaCompleta = estado.status === "pronto" ? estado.fila : []
  const fila = discenteId ? filaCompleta.filter((item) => item.discente.id === discenteId) : filaCompleta
  const nomeFiltrado = discenteId ? fila[0]?.discente.nome : undefined

  const subtitulo =
    estado.status === "pronto" && fila.length > 0
      ? `${formatarNumero(fila.length)} ${fila.length === 1 ? "atividade aguarda" : "atividades aguardam"} validação, da mais antiga para a mais recente · a mais antiga espera há ${formatarEspera(fila[0].esperaDias)}.`
      : undefined

  return (
    <>
      <PageHeader
        titulo="Fila de validação"
        subtitulo={subtitulo}
        voltar={{ href: "/docente", rotulo: "Voltar para o painel do docente" }}
      />

      {discenteId && (
        <p className="mb-6 flex flex-wrap items-center gap-2 text-label text-foreground">
          Filtrado por: <strong className="font-medium">{nomeFiltrado ?? "aluno selecionado"}</strong>
          <Link
            href="/docente/fila"
            className="text-accent-text underline underline-offset-4 hover:decoration-2"
          >
            Limpar filtro
          </Link>
        </p>
      )}

      {estado.status === "carregando" && (
        <AreaCarregando texto="Carregando fila…" className="flex flex-col gap-2">
          <Skeleton className="h-row" />
          <Skeleton className="h-row" />
          <Skeleton className="h-row" />
          <Skeleton className="h-row" />
        </AreaCarregando>
      )}

      {estado.status === "erro" && (
        <EstadoErro nivelTitulo={2} titulo="Não foi possível carregar a fila" onTentarNovamente={tentarNovamente} />
      )}

      {estado.status === "pronto" && fila.length === 0 && (
        <EstadoVazio
          nivelTitulo={3}
          icone={Inbox}
          titulo={discenteId ? "Nenhuma atividade deste aluno aguardando validação" : "Nenhuma atividade aguardando validação"}
          descricao="Quando um discente enviar uma atividade, ela aparece aqui, da mais antiga para a mais recente."
        />
      )}

      {estado.status === "pronto" && fila.length > 0 && <FilaValidacao itens={fila} />}
    </>
  )
}
