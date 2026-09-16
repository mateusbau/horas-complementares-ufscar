"use client"

// components/layout/AtalhosDeTeclado.tsx
//
// Modal com as teclas que operam o sistema. Só há uma tecla de caractere único
// no sistema — "?", para abrir este próprio painel — e ela segue a mitigação
// exigida pela WCAG 2.1.4 (atalhos de tecla única): não dispara com o foco em
// campo editável (use-atalho-tecla.ts), então nunca conflita com o que se
// digita. As demais teclas listadas abaixo (Tab, Enter, Esc...) são todas
// combinações ou teclas de navegação do próprio navegador, fora do escopo da
// 2.1.4.

import { Keyboard } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { useRef, useState } from "react"

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
import { useAtalhoTecla } from "@/hooks/use-atalho-tecla"
import { cn } from "@/lib/utils"

function Tecla({ children, className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-8 items-center justify-center rounded-lg border border-input-border bg-surface px-2 font-mono text-label",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}

const GRUPOS: { titulo: string; itens: { teclas: ReactNode; acao: string }[] }[] = [
  {
    titulo: "Este painel",
    itens: [
      { teclas: <Tecla>?</Tecla>, acao: "Abre e fecha esta lista." },
      { teclas: <Tecla>Esc</Tecla>, acao: "Fecha esta lista." },
    ],
  },
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
  const [aberto, setAberto] = useState(false)
  // O gatilho é o retorno de foco ao fechar (finalFocus), tanto pelo clique
  // quanto pelo "?": sem ref, o Base UI devolveria o foco a quem tinha foco no
  // momento do "?", que pode não ser este botão.
  const gatilhoRef = useRef<HTMLButtonElement>(null)

  useAtalhoTecla("?", () => setAberto((estava) => !estava))

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger render={<Button ref={gatilhoRef} variant="outline" />}>
        <Keyboard aria-hidden="true" />
        <span className="max-sm:sr-only">Atalhos de teclado</span>
        <Tecla className="max-sm:hidden" aria-hidden="true">
          ?
        </Tecla>
      </DialogTrigger>
      <DialogContent finalFocus={() => gatilhoRef.current ?? undefined} className="sm:max-w-form">
        <DialogHeader>
          <DialogTitle>Atalhos de teclado</DialogTitle>
          <DialogDescription>
            Todo o sistema pode ser usado só com o teclado. A única tecla de caractere único é "?", que
            abre e fecha esta lista e não dispara com o foco em um campo de texto; as demais são
            combinações, para não conflitar com leitores de tela e com os atalhos do navegador.
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
