// components/painel/AcessoRapido.tsx
//
// Três atalhos do painel. O cartão inteiro é o link: um alvo grande, um só
// Tab e um só contorno de foco (o global, na borda do cartão). O nome do link
// é só o título (aria-labelledby); descrição e contador entram como descrição
// (aria-describedby), para o leitor de tela não ler um bloco longo como nome.
// O contador de avisos é real: atividades com a "bola com o aluno" (pendente).

import { Bell, BookOpen, FileText, type LucideIcon } from "lucide-react"
import Link from "next/link"

import { formatarNumero } from "@/lib/formatacao"

type Atalho = { id: string; href: string; titulo: string; descricao: string; icone: LucideIcon; contador?: string }

export function AcessoRapido({ pendentes }: { pendentes: number }) {
  const atalhos: Atalho[] = [
    { id: "catalogo", href: "/catalogo", titulo: "Catálogo de atividades", descricao: "O que é aceito e quanto vale cada tipo.", icone: BookOpen },
    { id: "relatorio", href: "/relatorio", titulo: "Relatório", descricao: "Gere o comprovante consolidado.", icone: FileText },
    {
      id: "avisos",
      href: "/avisos",
      titulo: "Central de avisos",
      descricao: "Prazos e retornos dos docentes.",
      icone: Bell,
      contador:
        pendentes > 0
          ? `${formatarNumero(pendentes)} ${pendentes === 1 ? "atividade aguarda" : "atividades aguardam"} sua ação`
          : undefined,
    },
  ]

  return (
    <section aria-labelledby="titulo-atalhos" className="flex flex-col gap-4">
      <h2 id="titulo-atalhos">Acesso rápido</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {atalhos.map((atalho) => {
          const Icone = atalho.icone
          const idTitulo = `atalho-${atalho.id}-titulo`
          const idDescricao = `atalho-${atalho.id}-descricao`
          const idContador = `atalho-${atalho.id}-contador`
          return (
            <li key={atalho.id}>
              <Link
                href={atalho.href}
                aria-labelledby={idTitulo}
                aria-describedby={atalho.contador ? `${idDescricao} ${idContador}` : idDescricao}
                className="flex h-full flex-col gap-2 rounded-lg border bg-surface p-4 transition-colors hover:bg-muted"
              >
                <Icone aria-hidden="true" className="size-6 text-accent-text" />
                <h3 id={idTitulo}>{atalho.titulo}</h3>
                <p id={idDescricao} className="leading-secondary text-muted-foreground">
                  {atalho.descricao}
                </p>
                {/* Linha de texto, não pílula: o texto é longo e quebraria dentro dela. */}
                {atalho.contador && (
                  <span id={idContador} className="mt-auto text-label text-accent-text">
                    {atalho.contador}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
