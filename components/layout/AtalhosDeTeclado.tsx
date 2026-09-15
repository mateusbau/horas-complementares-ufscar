"use client"

// components/layout/AtalhosDeTeclado.tsx
//
// Modal com as teclas que operam o sistema. Deliberadamente sem atalhos de uma
// tecla só: eles conflitam com leitores de tela e com o navegador (WCAG 2.1.4).

import { Keyboard } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function Tecla({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-8 items-center justify-center rounded-lg border border-input-border bg-surface px-2 font-mono text-label">
      {children}
    </kbd>
  )
}

const GRUPOS: { titulo: string; itens: { teclas: ReactNode; acao: string }[] }[] = [
  {
    titulo: "Navegar",
    itens: [
      { teclas: <Tecla>Tab</Tecla>, acao: "Vai para o próximo link, botão ou campo." },
      {
        teclas: (
          <>
            <Tecla>Shift</Tecla> + <Tecla>Tab</Tecla>
          </>
        ),
        acao: "Volta para o elemento anterior.",
      },
      {
        teclas: <Tecla>Tab</Tecla>,
        acao: "Como primeira tecla de qualquer página, mostra o link “Pular para o conteúdo”.",
      },
    ],
  },
  {
    titulo: "Acionar e escolher",
    itens: [
      { teclas: <Tecla>Enter</Tecla>, acao: "Abre links e aciona botões." },
      { teclas: <Tecla>Espaço</Tecla>, acao: "Aciona botões e marca caixas de seleção." },
      {
        teclas: <Tecla>Setas</Tecla>,
        acao: "Trocam a opção dentro de um grupo, como o perfil de acesso e as abas.",
      },
    ],
  },
  {
    titulo: "Janelas e menus",
    itens: [{ teclas: <Tecla>Esc</Tecla>, acao: "Fecha esta janela e o menu de navegação." }],
  },
]

export function AtalhosDeTeclado() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        <Keyboard aria-hidden="true" />
        <span className="max-sm:sr-only">Atalhos de teclado</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-form">
        <DialogHeader>
          <DialogTitle>Atalhos de teclado</DialogTitle>
          <DialogDescription>
            Todo o sistema pode ser usado só com o teclado. Não há atalhos de uma tecla só, para não
            conflitar com leitores de tela e com os atalhos do navegador.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          {GRUPOS.map((grupo, indice) => (
            <section key={grupo.titulo} aria-labelledby={`grupo-atalhos-${indice}`}>
              <h3 id={`grupo-atalhos-${indice}`} className="mb-2">
                {grupo.titulo}
              </h3>
              <dl className="flex flex-col divide-y rounded-lg border">
                {grupo.itens.map((item) => (
                  <div
                    key={item.acao}
                    className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <dt className="flex shrink-0 items-center gap-1 sm:w-40">{item.teclas}</dt>
                    <dd className="leading-secondary text-muted-foreground">{item.acao}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
