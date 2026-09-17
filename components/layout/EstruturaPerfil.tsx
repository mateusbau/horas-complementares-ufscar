// components/layout/EstruturaPerfil.tsx
//
// Estrutura das telas com navegação (perfis discente e docente): sidebar ou
// menu mobile, e o <main id="conteudo"> que o link "Pular para o conteúdo"
// alcança. Conteúdo limitado a 1200 px (max-w-content).

import Link from "next/link"
import type { ReactNode } from "react"

import { GuardaSessao } from "@/components/layout/GuardaSessao"
import { MobileNav } from "@/components/layout/MobileNav"
import { Sidebar } from "@/components/layout/Sidebar"
import { ID_CONTEUDO, ID_RODAPE } from "@/components/layout/SkipLink"
import type { Perfil } from "@/lib/types"

export function EstruturaPerfil({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <GuardaSessao perfil={perfil} />
      <Sidebar perfil={perfil} />
      <MobileNav perfil={perfil} />
      <main id={ID_CONTEUDO} tabIndex={-1} className="min-w-0 flex-1 scroll-mt-(--altura-barra)">
        <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">{children}</div>
        <footer
          id={ID_RODAPE}
          accessKey="4"
          tabIndex={-1}
          className="mx-auto w-full max-w-content scroll-mt-(--altura-barra) border-t px-4 py-6 md:px-8 print:hidden"
        >
          <Link href="/sobre" className="text-caption text-accent-text underline underline-offset-4 hover:decoration-2">
            Sobre este protótipo
          </Link>
        </footer>
      </main>
    </div>
  )
}
