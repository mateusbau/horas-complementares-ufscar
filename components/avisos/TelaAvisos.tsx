"use client"

// components/avisos/TelaAvisos.tsx
//
// Lista cronológica (mais recente primeiro — hooks/use-avisos.ts já devolve
// nessa ordem, via lib/storage.ts). Filtro Todos/Não lidos, "Marcar todas
// como lidas" (anuncia o resultado em aria-live) e clique no título leva à
// atividade e marca como lido.

import { BellOff } from "lucide-react"
import { useState } from "react"

import { ItemAviso } from "@/components/avisos/ItemAviso"
import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { useAvisos } from "@/hooks/use-avisos"
import { formatarNumero } from "@/lib/formatacao"

/** Mesmo tratamento de aria-pressed da barra superior (components/layout/BarraAcessibilidade.tsx). */
const PRESSIONADO =
  "aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-primary-foreground aria-pressed:hover:bg-foreground"

type Filtro = "todos" | "nao-lidos"

export function TelaAvisos() {
  const { avisos, naoLidos, carregando, marcarComoLido, marcarTodosComoLidos } = useAvisos()
  const [filtro, setFiltro] = useState<Filtro>("todos")
  const anunciar = useAnunciar()
  const agora = new Date()

  const visiveis = filtro === "nao-lidos" ? avisos.filter((a) => !a.lido) : avisos

  async function aoMarcarTodas() {
    const quantidade = naoLidos
    await marcarTodosComoLidos()
    if (quantidade === 0) {
      anunciar("Não havia avisos não lidos.")
    } else if (quantidade === 1) {
      anunciar("1 aviso marcado como lido.")
    } else {
      anunciar(`${formatarNumero(quantidade)} avisos marcados como lidos.`)
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Central de avisos"
        subtitulo="Avisos gerados pelo sistema sobre suas atividades, do mais recente para o mais antigo."
        acao={
          <Button variant="outline" onClick={() => void aoMarcarTodas()} disabled={carregando || naoLidos === 0}>
            Marcar todas como lidas
          </Button>
        }
      />

      <div role="group" aria-label="Filtrar avisos" className="mb-6 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-pressed={filtro === "todos"}
          onClick={() => setFiltro("todos")}
          className={PRESSIONADO}
        >
          Todos
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-pressed={filtro === "nao-lidos"}
          onClick={() => setFiltro("nao-lidos")}
          className={PRESSIONADO}
        >
          Não lidos{naoLidos > 0 ? ` (${formatarNumero(naoLidos)})` : ""}
        </Button>
      </div>

      {carregando && (
        <AreaCarregando texto="Carregando avisos…" className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </AreaCarregando>
      )}

      {!carregando && visiveis.length === 0 && (
        <EstadoVazio
          icone={BellOff}
          nivelTitulo={2}
          titulo={filtro === "nao-lidos" ? "Nenhum aviso não lido" : "Nenhum aviso por enquanto"}
          descricao={
            filtro === "nao-lidos"
              ? "Você já viu todos os avisos."
              : "Avisos sobre suas atividades aparecem aqui."
          }
        />
      )}

      {!carregando && visiveis.length > 0 && (
        <ul className="flex flex-col gap-3">
          {visiveis.map((aviso) => (
            <ItemAviso key={aviso.id} aviso={aviso} agora={agora} onClicar={() => void marcarComoLido(aviso.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}
