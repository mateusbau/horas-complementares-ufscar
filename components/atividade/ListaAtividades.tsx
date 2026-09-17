"use client"

// components/atividade/ListaAtividades.tsx — Tela 03 · Minhas atividades
//
// Busca e filtro agem sobre a lista já carregada (sem nova chamada ao
// storage); as contagens dos chips vêm da lista inteira, não da filtrada, daí
// o cálculo em separado. O rodapé mostra o progresso real (obterProgresso()),
// igual ao painel — não muda com o filtro, porque só reflete o que foi
// validado, não o que está sendo mostrado na tela.

import { ClipboardList, Plus, SearchX } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import {
  TabelaAtividades,
  ordenarAtividades,
  type CampoOrdenacao,
  type Ordenacao,
} from "@/components/atividade/TabelaAtividades"
import { FiltroStatus, type StatusFiltro } from "@/components/atividade/FiltroStatus"
import { EstadoErro } from "@/components/feedback/EstadoErro"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { calcularProgresso } from "@/lib/calculos"
import { obterTipo } from "@/lib/catalogo"
import { formatarCreditos, formatarHorasContabilizadas, formatarNumero } from "@/lib/formatacao"
import { listarAtividades } from "@/lib/storage"
import type { Atividade, Progresso, StatusAtividade } from "@/lib/types"

type Estado =
  | { status: "carregando" }
  | { status: "erro" }
  | { status: "pronto"; atividades: Atividade[]; progresso: Progresso }

const CONTAGEM_VAZIA: Record<StatusFiltro, number> = {
  todos: 0,
  validada: 0,
  analise: 0,
  pendente: 0,
  recusada: 0,
}

export function ListaAtividades({ vazioForcado = false }: { vazioForcado?: boolean }) {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" })
  const [tentativa, setTentativa] = useState(0)
  const [filtro, setFiltro] = useState<StatusFiltro>("todos")
  const [busca, setBusca] = useState("")
  const [ordenacao, setOrdenacao] = useState<Ordenacao | null>(null)

  useEffect(() => {
    let ativo = true
    listarAtividades()
      .then((todas) => {
        if (!ativo) return
        // O progresso é calculado sobre a mesma lista exibida: com ?demo=vazio,
        // os créditos zeram junto com os registros, sem contradizer o estado
        // vazio com os créditos reais da demonstração.
        const atividades = vazioForcado ? [] : todas
        setEstado({ status: "pronto", atividades, progresso: calcularProgresso(atividades) })
      })
      .catch(() => ativo && setEstado({ status: "erro" }))
    return () => {
      ativo = false
    }
  }, [tentativa, vazioForcado])

  function tentarNovamente() {
    setEstado({ status: "carregando" })
    setTentativa((t) => t + 1)
  }

  function alternarOrdenacao(campo: CampoOrdenacao) {
    setOrdenacao((atual) =>
      atual?.campo === campo ? { campo, direcao: atual.direcao === "asc" ? "desc" : "asc" } : { campo, direcao: "asc" }
    )
  }

  function limparFiltro() {
    setFiltro("todos")
    setBusca("")
  }

  const contagens = useMemo((): Record<StatusFiltro, number> => {
    if (estado.status !== "pronto") return CONTAGEM_VAZIA
    const base = { ...CONTAGEM_VAZIA, todos: estado.atividades.length }
    for (const a of estado.atividades) base[a.status as StatusAtividade]++
    return base
  }, [estado])

  const filtradas = useMemo(() => {
    if (estado.status !== "pronto") return []
    const termo = busca.trim().toLowerCase()
    const porStatus = filtro === "todos" ? estado.atividades : estado.atividades.filter((a) => a.status === filtro)
    const porBusca = !termo
      ? porStatus
      : porStatus.filter((a) => {
          const nomeTipo = a.tipoId ? obterTipo(a.tipoId).nome.toLowerCase() : ""
          return a.titulo.toLowerCase().includes(termo) || nomeTipo.includes(termo)
        })
    return ordenarAtividades(porBusca, ordenacao)
  }, [estado, filtro, busca, ordenacao])

  const subtitulo =
    estado.status === "pronto"
      ? `${formatarNumero(estado.atividades.length)} registros · ${formatarCreditos(estado.progresso.creditosObtidos)} de ${formatarNumero(estado.progresso.creditosExigidos)} contabilizados.`
      : undefined

  return (
    <>
      <PageHeader
        titulo="Minhas atividades"
        subtitulo={subtitulo}
        acao={
          <Link href="/atividades/nova" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            Nova atividade
          </Link>
        }
      />

      {estado.status === "carregando" && (
        <AreaCarregando texto="Carregando atividades…" className="flex flex-col gap-4">
          <Skeleton className="h-target w-full max-w-form" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-row w-full" />
          <Skeleton className="h-row w-full" />
          <Skeleton className="h-row w-full" />
        </AreaCarregando>
      )}

      {estado.status === "erro" && <EstadoErro nivelTitulo={2} onTentarNovamente={tentarNovamente} />}

      {estado.status === "pronto" && estado.atividades.length === 0 && (
        <EstadoVazio
          nivelTitulo={3}
          icone={ClipboardList}
          titulo="Você ainda não registrou atividades"
          descricao="Registre cursos, monitorias, projetos de extensão e pesquisa para contabilizar créditos. Consulte o catálogo para saber quanto vale cada tipo."
          acao={
            <>
              <Link href="/atividades/nova" className={buttonVariants()}>
                Registrar primeira atividade
              </Link>
              <Link href="/catalogo" className={buttonVariants({ variant: "link" })}>
                Ver catálogo de atividades aceitas
              </Link>
            </>
          }
        />
      )}

      {estado.status === "pronto" && estado.atividades.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:max-w-form">
            <label htmlFor="busca-atividades" className="text-label text-foreground">
              Buscar por título ou tipo
            </label>
            <Input
              id="busca-atividades"
              accessKey="3"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <FiltroStatus contagens={contagens} valor={filtro} onMudar={setFiltro} />

          {filtradas.length === 0 ? (
            <EstadoVazio
              nivelTitulo={3}
              icone={SearchX}
              titulo="Nenhuma atividade neste filtro"
              descricao="Nenhum registro corresponde ao status selecionado. Limpe o filtro para ver todos."
              acao={<Button onClick={limparFiltro}>Limpar filtro</Button>}
            />
          ) : (
            <>
              <TabelaAtividades atividades={filtradas} ordenacao={ordenacao} onOrdenar={alternarOrdenacao} />
              <p className="text-caption text-muted-foreground">
                Mostrando {formatarNumero(filtradas.length)} de {formatarNumero(estado.atividades.length)} registros
                · Total: {formatarCreditos(estado.progresso.creditosObtidos)} ·{" "}
                {formatarHorasContabilizadas(estado.progresso.horasObtidas, estado.progresso.horasExigidas)}.
              </p>
            </>
          )}
        </div>
      )}
    </>
  )
}
