import type { Metadata } from "next"
import Link from "next/link"

import { VoltarPaginaAnterior } from "@/components/feedback/VoltarPaginaAnterior"
import { ID_CONTEUDO, ID_RODAPE } from "@/components/layout/SkipLink"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = { title: "Mapa do site · Horas Complementares" }

const secoes = [
  {
    titulo: "Acesso e informações",
    links: [
      { href: "/", rotulo: "Entrada" },
      { href: "/sobre", rotulo: "Sobre este protótipo" },
      { href: "/sobre#acessibilidade", rotulo: "Acessibilidade" },
    ],
  },
  {
    titulo: "Área discente",
    links: [
      { href: "/painel", rotulo: "Painel" },
      { href: "/atividades", rotulo: "Minhas atividades" },
      { href: "/atividades/nova", rotulo: "Cadastrar atividade" },
      { href: "/catalogo", rotulo: "Catálogo de atividades" },
      { href: "/relatorio", rotulo: "Relatório" },
      { href: "/avisos", rotulo: "Central de avisos" },
      { href: "/ajuda", rotulo: "Ajuda" },
      { href: "/configuracoes", rotulo: "Configurações" },
    ],
  },
  {
    titulo: "Área docente",
    links: [
      { href: "/docente", rotulo: "Painel do docente" },
      { href: "/docente/fila", rotulo: "Fila de validação" },
      { href: "/docente/validacao/lote", rotulo: "Validação em lote" },
      { href: "/docente/orientandos", rotulo: "Meus orientandos" },
      { href: "/docente/relatorio", rotulo: "Relatório da turma" },
      { href: "/docente/catalogo", rotulo: "Catálogo de atividades" },
      { href: "/docente/configuracoes", rotulo: "Configurações" },
    ],
  },
] as const

export default function PaginaMapaDoSite() {
  return (
    <div className="flex flex-col items-center px-4 py-8 md:py-12">
      <main
        id={ID_CONTEUDO}
        tabIndex={-1}
        className="w-full max-w-form scroll-mt-(--altura-barra) rounded-lg border bg-surface p-4 sm:p-8"
      >
        <h1 className="mb-3">Mapa do site</h1>
        <p className="mb-8 leading-secondary text-muted-foreground">
          Acesse as páginas disponíveis no protótipo. As áreas discente e docente usam a sessão de
          demonstração selecionada na entrada.
        </p>

        <nav aria-label="Mapa do site" className="flex flex-col gap-8">
          {secoes.map((secao) => (
            <section key={secao.titulo} aria-labelledby={`mapa-${secao.titulo.toLowerCase().replaceAll(" ", "-")}`}>
              <h2 id={`mapa-${secao.titulo.toLowerCase().replaceAll(" ", "-")}`} className="mb-3">
                {secao.titulo}
              </h2>
              <ul className="flex list-disc flex-col gap-2 pl-6">
                {secao.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-accent-text underline underline-offset-4 hover:decoration-2">
                      {link.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </main>

      <footer
        id={ID_RODAPE}
        accessKey="4"
        tabIndex={-1}
        className="mt-6 flex w-full max-w-form scroll-mt-(--altura-barra) flex-wrap gap-4"
      >
        <VoltarPaginaAnterior />
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Ir para a tela de entrada
        </Link>
      </footer>
    </div>
  )
}
