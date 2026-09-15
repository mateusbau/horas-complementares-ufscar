// components/apoio/PaginaDeApoio.tsx
//
// Rota genérica para páginas de apoio referenciadas na navegação e nos cards
// de acesso rápido, mas fora do escopo construído deste protótipo (etapa 12):
// `/simulador`, `/avisos`, `/ajuda`, `/docente/orientandos` e
// `/docente/relatorio`. Sem isso, cada uma cairia na página de erro 404 do
// Next, em inglês — nenhuma rota da navegação pode fazer isso. Mantém a
// anatomia obrigatória de página (h1 + ação de volta) e explica com clareza o
// que aconteceria ali, em vez de "em construção".

import { Construction } from "lucide-react"
import Link from "next/link"

import { EstadoVazio } from "@/components/feedback/EstadoVazio"
import { PageHeader } from "@/components/layout/PageHeader"
import { buttonVariants } from "@/components/ui/button"
import type { Perfil } from "@/lib/types"

const INICIO_POR_PERFIL: Record<Perfil, { href: string; rotulo: string }> = {
  discente: { href: "/painel", rotulo: "Voltar para o painel" },
  docente: { href: "/docente", rotulo: "Voltar para o painel do docente" },
}

export function PaginaDeApoio({
  titulo,
  descricao,
  perfil,
}: {
  /** Mesmo rótulo do item de navegação, para o h1 confirmar onde a pessoa chegou. */
  titulo: string
  /** O que esta página faria, em uma frase — específico, nunca genérico. */
  descricao: string
  perfil: Perfil
}) {
  const inicio = INICIO_POR_PERFIL[perfil]
  return (
    <>
      <PageHeader titulo={titulo} voltar={inicio} />
      <EstadoVazio
        nivelTitulo={2}
        icone={Construction}
        titulo="Fora do escopo deste protótipo"
        descricao={
          <>
            {descricao} Esta tela existe na navegação porque faz parte da proposta completa do
            sistema, mas não foi construída nesta demonstração — o tempo do hackathon priorizou o
            cadastro, a validação (individual e em lote) e o relatório de horas complementares.
          </>
        }
        acao={
          <Link href={inicio.href} className={buttonVariants()}>
            {inicio.rotulo}
          </Link>
        }
      />
    </>
  )
}
