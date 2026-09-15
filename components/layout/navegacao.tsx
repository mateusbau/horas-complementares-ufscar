"use client"

// components/layout/navegacao.tsx
//
// Peças compartilhadas pela Sidebar (desktop) e pelo MobileNav (abaixo de
// 768 px): itens de cada perfil, a lista de navegação e o bloco de perfil.

import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Calculator,
  CircleQuestionMark,
  FileChartColumn,
  FileText,
  Inbox,
  LayoutDashboard,
  Layers,
  ListChecks,
  LogOut,
  Shapes,
  Users,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { Skeleton } from "@/components/feedback/Skeleton"
import { obterDiscenteAtual, obterDocenteAtual } from "@/lib/storage"
import type { Perfil } from "@/lib/types"
import { cn } from "@/lib/utils"

type ItemNavegacao = {
  href: string
  rotulo: string
  icone: LucideIcon
  /** Ativo só na rota exata (senão, também nas sub-rotas). */
  exato?: boolean
}

// TEMPORÁRIO (etapa 3): "Casca da interface" é a rota de teste da casca.
// Sai quando as telas reais existirem (etapas 5 e 9).
const ITENS: Record<Perfil, ItemNavegacao[]> = {
  discente: [
    { href: "/painel", rotulo: "Painel", icone: LayoutDashboard },
    { href: "/atividades", rotulo: "Minhas atividades", icone: ListChecks },
    { href: "/catalogo", rotulo: "Catálogo de atividades", icone: BookOpen },
    { href: "/simulador", rotulo: "Simulador", icone: Calculator },
    { href: "/relatorio", rotulo: "Relatório", icone: FileText },
    { href: "/avisos", rotulo: "Central de avisos", icone: Bell },
    { href: "/ajuda", rotulo: "Ajuda", icone: CircleQuestionMark },
    { href: "/casca", rotulo: "Casca da interface", icone: Shapes },
  ],
  docente: [
    { href: "/docente", rotulo: "Painel do docente", icone: LayoutDashboard, exato: true },
    { href: "/docente/fila", rotulo: "Fila de validação", icone: Inbox },
    { href: "/docente/validacao/lote", rotulo: "Validação em lote", icone: Layers },
    { href: "/docente/orientandos", rotulo: "Meus orientandos", icone: Users },
    { href: "/docente/relatorio", rotulo: "Relatório da turma", icone: FileChartColumn },
    { href: "/docente/casca", rotulo: "Casca da interface", icone: Shapes },
  ],
}

export const NOME_PERFIL: Record<Perfil, string> = {
  discente: "Perfil discente",
  docente: "Perfil docente",
}

function estaAtivo(item: ItemNavegacao, caminho: string): boolean {
  if (item.exato) return caminho === item.href
  return caminho === item.href || caminho.startsWith(`${item.href}/`)
}

/**
 * Item ativo com três sinais simultâneos: fundo --accent-soft, barra esquerda
 * de 3 px em --primary e peso 500. Para leitor de tela, aria-current="page".
 */
export function ListaNavegacao({
  perfil,
  onNavegar,
}: {
  perfil: Perfil
  /** Chamado ao escolher um item (o menu mobile fecha). */
  onNavegar?: () => void
}) {
  const caminho = usePathname()

  return (
    <nav aria-label="Navegação principal">
      <ul className="flex flex-col gap-1">
        {ITENS[perfil].map((item) => {
          const ativo = estaAtivo(item, caminho)
          const Icone = item.icone
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavegar}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "relative flex min-h-row items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-body text-foreground transition-colors hover:bg-muted",
                  ativo &&
                    "bg-accent-soft font-medium hover:bg-accent-soft before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary"
                )}
              >
                <Icone aria-hidden="true" className="size-5 shrink-0" />
                {item.rotulo}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

type Identidade = { nome: string; detalhe: string; iniciais: string }

function iniciaisDe(nome: string): string {
  const partes = nome.replace(/^Prof\.ª\s+/, "").split(/\s+/)
  return `${partes[0]?.[0] ?? ""}${partes.at(-1)?.[0] ?? ""}`.toUpperCase()
}

/** Quem está usando, trocar de perfil e sair. */
export function BlocoPerfil({ perfil, onNavegar }: { perfil: Perfil; onNavegar?: () => void }) {
  const [identidade, setIdentidade] = useState<Identidade | null>(null)

  useEffect(() => {
    let ativo = true
    const carregar =
      perfil === "discente"
        ? obterDiscenteAtual().then((d) => ({
            nome: d.nome,
            detalhe: `RA ${d.ra} · ${d.curso}`,
            iniciais: iniciaisDe(d.nome),
          }))
        : obterDocenteAtual().then((d) => ({ nome: d.nome, detalhe: d.departamento, iniciais: d.iniciais }))
    carregar.then((valor) => ativo && setIdentidade(valor)).catch(() => undefined)
    return () => {
      ativo = false
    }
  }, [perfil])

  const outro: Perfil = perfil === "discente" ? "docente" : "discente"

  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <div className="flex items-center gap-3 px-3" aria-busy={identidade === null}>
        {identidade ? (
          <>
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-label font-bold text-foreground"
            >
              {identidade.iniciais}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-label">{identidade.nome}</span>
              <span className="truncate text-caption leading-secondary text-muted-foreground">
                {identidade.detalhe} · {NOME_PERFIL[perfil]}
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="sr-only">Carregando perfil…</span>
            <Skeleton className="size-10 shrink-0" />
            <span className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </span>
          </>
        )}
      </div>
      <ul className="flex flex-col gap-1">
        <li>
          <Link
            href={outro === "docente" ? "/docente" : "/painel"}
            onClick={onNavegar}
            className="flex min-h-row items-center gap-3 rounded-lg px-3 py-2 text-body text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeftRight aria-hidden="true" className="size-5 shrink-0" />
            Trocar para {outro === "docente" ? "perfil docente" : "perfil discente"}
          </Link>
        </li>
        <li>
          <Link
            href="/"
            onClick={onNavegar}
            className="flex min-h-row items-center gap-3 rounded-lg px-3 py-2 text-body text-foreground transition-colors hover:bg-muted"
          >
            <LogOut aria-hidden="true" className="size-5 shrink-0" />
            Sair
          </Link>
        </li>
      </ul>
    </div>
  )
}
