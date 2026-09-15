"use client"

// components/demonstracao/VitrineCasca.tsx
//
// TEMPORÁRIO: rota de teste da casca, hoje só em /docente/casca (a do discente
// saiu na etapa 5, com o painel). Também é o destino provisório do docente ao
// entrar (lib/rotas.ts). Sai na etapa 9, com a tela 06.

import { RotateCw, SearchX } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"

import { EstadoErro } from "@/components/feedback/EstadoErro"
import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { AreaCarregando, Skeleton } from "@/components/feedback/Skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { INICIO_DO_PERFIL } from "@/lib/rotas"
import { listarAtividades, listarFilaValidacao } from "@/lib/storage"
import type { Perfil } from "@/lib/types"

type Carga = { estado: "carregando" } | { estado: "pronto"; total: number } | { estado: "erro" }

function Secao({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id}>{titulo}</h2>
      {children}
    </section>
  )
}

export function VitrineCasca({ perfil }: { perfil: Perfil }) {
  const anunciar = useAnunciar()
  const [carga, setCarga] = useState<Carga>({ estado: "carregando" })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    const total =
      perfil === "discente"
        ? listarAtividades().then((lista) => lista.length)
        : listarFilaValidacao().then((fila) => fila.length)
    total
      .then((valor) => ativo && setCarga({ estado: "pronto", total: valor }))
      .catch(() => ativo && setCarga({ estado: "erro" }))
    return () => {
      ativo = false
    }
  }, [perfil, tentativa])

  function recarregar() {
    setCarga({ estado: "carregando" })
    setTentativa((t) => t + 1)
  }

  const outro: Perfil = perfil === "discente" ? "docente" : "discente"

  return (
    <>
      <PageHeader
        titulo="Casca da interface"
        subtitulo="Rota de teste da etapa 3: navegação, cabeçalho e estados do sistema."
        acao={
          <Button onClick={recarregar}>
            <RotateCw aria-hidden="true" />
            Recarregar dados
          </Button>
        }
      />

      <div className="flex flex-col gap-8">
        <Secao id="secao-carregando" titulo="Carregando">
          {carga.estado === "carregando" && (
            <AreaCarregando texto="Carregando atividades…" className="flex flex-col gap-2 rounded-lg border bg-surface p-4">
              <Skeleton className="h-row" />
              <Skeleton className="h-row" />
              <Skeleton className="h-row w-2/3" />
            </AreaCarregando>
          )}
          {carga.estado === "pronto" && (
            <p className="rounded-lg border bg-surface p-4">
              {perfil === "discente"
                ? `${carga.total} atividades carregadas do armazenamento local, após o atraso simulado de 300 ms.`
                : `${carga.total} atividades na fila de validação, carregadas do armazenamento local.`}
            </p>
          )}
          {carga.estado === "erro" && <EstadoErro onTentarNovamente={recarregar} />}
        </Secao>

        <Secao id="secao-vazio" titulo="Vazio">
          <EstadoVazio
            icone={SearchX}
            titulo="Nenhuma atividade neste filtro"
            descricao="Nenhum registro corresponde ao status selecionado. Limpe o filtro para ver todos."
            acao={<Button onClick={() => anunciar("Filtro limpo. Mostrando todas as atividades.")}>Limpar filtro</Button>}
          />
        </Secao>

        <Secao id="secao-erro" titulo="Erro">
          <EstadoErro
            anunciarAoMontar={false}
            onTentarNovamente={() => anunciar("Nova tentativa de carregamento iniciada.")}
          />
        </Secao>

        <Secao id="secao-regiao" titulo="Região ao vivo">
          <p className="max-w-form leading-secondary text-muted-foreground">
            Mudanças de preferência na barra de acessibilidade e resultados de ação são anunciados
            por uma única região aria-live, sem mover o foco.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => anunciar("Mensagem de teste anunciada na região ao vivo.")}>
              Anunciar mensagem de teste
            </Button>
            <Link
              href={INICIO_DO_PERFIL[outro]}
              className="inline-flex min-h-target items-center text-accent-text underline underline-offset-4 hover:decoration-2"
            >
              {outro === "discente" ? "Ir para o painel do discente" : "Ver a casca do perfil docente"}
            </Link>
          </div>
        </Secao>
      </div>
    </>
  )
}
