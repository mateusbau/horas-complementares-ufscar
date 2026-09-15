"use client"

// components/docente/FilaCompleta.tsx
//
// Fila completa (alcançada por "Ver fila completa" do painel, tela 06, e pelo
// item de navegação "Fila de validação"): a mesma tabela do painel, sem o
// recorte de 5 itens.

import { Inbox } from "lucide-react"
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

  const subtitulo =
    estado.status === "pronto" && estado.fila.length > 0
      ? `${formatarNumero(estado.fila.length)} ${estado.fila.length === 1 ? "atividade aguarda" : "atividades aguardam"} validação, da mais antiga para a mais recente · a mais antiga espera há ${formatarEspera(estado.fila[0].esperaDias)}.`
      : undefined

  return (
    <>
      <PageHeader
        titulo="Fila de validação"
        subtitulo={subtitulo}
        voltar={{ href: "/docente", rotulo: "Voltar para o painel do docente" }}
      />

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

      {estado.status === "pronto" && estado.fila.length === 0 && (
        <EstadoVazio
          nivelTitulo={3}
          icone={Inbox}
          titulo="Nenhuma atividade aguardando validação"
          descricao="Quando um discente enviar uma atividade, ela aparece aqui, da mais antiga para a mais recente."
        />
      )}

      {estado.status === "pronto" && estado.fila.length > 0 && <FilaValidacao itens={estado.fila} />}
    </>
  )
}
