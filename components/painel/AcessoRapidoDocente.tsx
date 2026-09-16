"use client"

// components/painel/AcessoRapidoDocente.tsx
//
// Cards de acesso do painel do docente (tela 06): Meus orientandos, Relatório
// da turma, Catálogo e Trocar de perfil. Mesmo padrão visual do
// AcessoRapido do discente (cartão inteiro como alvo único). "Trocar de
// perfil" não é uma rota, é uma ação — por isso é <button>, não <Link>, e
// reaproveita a mesma chamada de BlocoPerfil (trocarPerfil + navegação).

import { ArrowLeftRight, BookOpen, FileChartColumn, Users, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { INICIO_DO_PERFIL } from "@/lib/rotas"
import { trocarPerfil } from "@/lib/storage"

type Atalho = { id: string; href: string; titulo: string; descricao: string; icone: LucideIcon }

const ATALHOS: Atalho[] = [
  {
    id: "orientandos",
    href: "/docente/orientandos",
    titulo: "Meus orientandos",
    descricao: "Acompanhe o progresso de cada discente.",
    icone: Users,
  },
  {
    id: "relatorio",
    href: "/docente/relatorio",
    titulo: "Relatório da turma",
    descricao: "Consolidado de créditos homologados no semestre.",
    icone: FileChartColumn,
  },
  {
    id: "catalogo",
    href: "/docente/catalogo",
    titulo: "Catálogo de atividades",
    descricao: "Os 19 tipos da Tabela 7 e o que cada um exige.",
    icone: BookOpen,
  },
]

export function AcessoRapidoDocente() {
  const router = useRouter()
  const anunciar = useAnunciar()
  const [trocando, setTrocando] = useState(false)

  async function trocarParaDiscente() {
    if (trocando) return
    setTrocando(true)
    try {
      await trocarPerfil("discente")
      router.push(INICIO_DO_PERFIL.discente)
    } catch {
      setTrocando(false)
      anunciar("Não foi possível trocar de perfil. Tente novamente.")
    }
  }

  return (
    <section aria-labelledby="titulo-atalhos" className="flex flex-col gap-4">
      <h2 id="titulo-atalhos">Acesso rápido</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ATALHOS.map((atalho) => {
          const Icone = atalho.icone
          const idTitulo = `atalho-${atalho.id}-titulo`
          const idDescricao = `atalho-${atalho.id}-descricao`
          return (
            <li key={atalho.id}>
              <Link
                href={atalho.href}
                aria-labelledby={idTitulo}
                aria-describedby={idDescricao}
                className="flex h-full flex-col gap-2 rounded-lg border bg-surface p-4 transition-colors hover:bg-muted"
              >
                <Icone aria-hidden="true" className="size-6 text-accent-text" />
                <h3 id={idTitulo}>{atalho.titulo}</h3>
                <p id={idDescricao} className="leading-secondary text-muted-foreground">
                  {atalho.descricao}
                </p>
              </Link>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => void trocarParaDiscente()}
            aria-labelledby="atalho-trocar-titulo"
            aria-describedby="atalho-trocar-descricao"
            className="flex h-full w-full flex-col gap-2 rounded-lg border bg-surface p-4 text-left transition-colors hover:bg-muted"
          >
            <ArrowLeftRight aria-hidden="true" className="size-6 text-accent-text" />
            <h3 id="atalho-trocar-titulo">{trocando ? "Trocando de perfil…" : "Trocar de perfil"}</h3>
            <p id="atalho-trocar-descricao" className="leading-secondary text-muted-foreground">
              Voltar à visão de discente.
            </p>
          </button>
        </li>
      </ul>
    </section>
  )
}
