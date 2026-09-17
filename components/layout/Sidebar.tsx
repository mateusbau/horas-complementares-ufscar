// components/layout/Sidebar.tsx
//
// Barra lateral fixa de 240 px (w-sidebar), a partir de 768 px. Fica presa logo
// abaixo da barra de acessibilidade e rola sozinha se o conteúdo não couber
// (ex.: texto em A+ numa tela baixa). Abaixo de 768 px, quem navega é o MobileNav.

import { Marca } from "@/components/layout/Marca"
import { BlocoPerfil, ListaNavegacao } from "@/components/layout/navegacao"
import { INICIO_DO_PERFIL } from "@/lib/rotas"
import type { Perfil } from "@/lib/types"

export function Sidebar({ perfil }: { perfil: Perfil }) {
  return (
    <aside
      id="navegacao-principal"
      accessKey="2"
      tabIndex={-1}
      aria-label="Barra lateral"
      className="sticky top-(--altura-barra) hidden h-[calc(100dvh-var(--altura-barra))] w-sidebar shrink-0 flex-col gap-6 overflow-y-auto border-r bg-surface px-3 py-6 md:flex print:hidden"
    >
      <Marca href={INICIO_DO_PERFIL[perfil]} className="px-3" />
      <div className="flex-1">
        <ListaNavegacao perfil={perfil} />
      </div>
      <BlocoPerfil perfil={perfil} />
    </aside>
  )
}
