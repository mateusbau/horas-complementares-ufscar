// components/layout/EstruturaPerfil.tsx
//
// Estrutura das telas com navegação (perfis discente e docente): sidebar ou
// menu mobile, e o <main id="conteudo"> que o link "Pular para o conteúdo"
// alcança. Conteúdo limitado a 1200 px (max-w-content).

import type { ReactNode } from "react"

import { MobileNav } from "@/components/layout/MobileNav"
import { Sidebar } from "@/components/layout/Sidebar"
import { ID_CONTEUDO } from "@/components/layout/SkipLink"
import type { Perfil } from "@/lib/types"

export function EstruturaPerfil({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar perfil={perfil} />
      <MobileNav perfil={perfil} />
      <main id={ID_CONTEUDO} tabIndex={-1} className="min-w-0 flex-1 scroll-mt-(--altura-barra)">
        <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">{children}</div>
      </main>
    </div>
  )
}
