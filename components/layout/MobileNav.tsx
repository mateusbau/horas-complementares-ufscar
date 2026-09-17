"use client"

// components/layout/MobileNav.tsx
//
// Navegação abaixo de 768 px: faixa com a marca e o botão de menu, que abre um
// painel deslizante à esquerda com a mesma navegação da sidebar. O painel
// (Base UI) prende o foco, fecha com Esc ou no fundo escurecido, e devolve o
// foco ao botão. Escolher um item fecha o menu.

import { Menu } from "lucide-react"
import { useState } from "react"

import { Marca } from "@/components/layout/Marca"
import { BlocoPerfil, ListaNavegacao, NOME_PERFIL } from "@/components/layout/navegacao"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { INICIO_DO_PERFIL } from "@/lib/rotas"
import type { Perfil } from "@/lib/types"

export function MobileNav({ perfil }: { perfil: Perfil }) {
  const [aberto, setAberto] = useState(false)
  const fechar = () => setAberto(false)

  return (
    <header className="flex items-center justify-between gap-4 border-b bg-surface px-4 py-2 md:hidden print:hidden">
      {/* w-14, não o w-40 da sidebar: aqui a marca compartilha uma faixa baixa (py-2) com o botão de menu — na largura da sidebar, a altura proporcional da logo estouraria a faixa. */}
      <Marca href={INICIO_DO_PERFIL[perfil]} largura="w-14" />
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetTrigger render={<Button accessKey="2" variant="outline" size="icon" />}>
          <Menu aria-hidden="true" />
          <span className="sr-only">Abrir menu de navegação</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-sidebar max-w-[85vw] gap-2 overflow-y-auto p-0 pb-4">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>{NOME_PERFIL[perfil]}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-6 px-3">
            <div className="flex-1">
              <ListaNavegacao perfil={perfil} onNavegar={fechar} />
            </div>
            <BlocoPerfil perfil={perfil} onNavegar={fechar} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
