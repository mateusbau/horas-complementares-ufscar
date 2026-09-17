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
        "inline-flex min-w-8 max-w-full items-center justify-center whitespace-nowrap rounded-lg border border-input-border bg-surface px-2 font-mono text-label",
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
    titulo: "Atalhos de acesso",
    itens: [
      { teclas: <Tecla>1</Tecla>, acao: "Vai para o conteúdo principal." },
      { teclas: <Tecla>2</Tecla>, acao: "Vai para a navegação principal ou abre o menu em telas menores." },
      {
        teclas: <Tecla>3</Tecla>,
        acao: "Vai para a busca, quando disponível na página Minhas atividades.",
      },
      { teclas: <Tecla>4</Tecla>, acao: "Vai para o rodapé." },
    ],
  },
  {
    titulo: "Como usar os atalhos de acesso",
    itens: [
      {
        teclas: (
          <>
            <Tecla>Alt</Tecla> + <Tecla>número</Tecla>
          </>
        ),
        acao: "Chrome e Edge no Windows e no Linux.",
      },
      {
        teclas: (
          <>
            <Tecla>Alt</Tecla> + <Tecla>Shift</Tecla> + <Tecla>número</Tecla>
          </>
        ),
        acao: "Firefox no Windows e no Linux.",
      },
      {
        teclas: (
          <>
            <Tecla>Control</Tecla> + <Tecla>Option</Tecla> + <Tecla>número</Tecla>
          </>
        ),
        acao: "Safari, Chrome, Edge e Firefox no macOS.",
      },
    ],
  },
  {
    titulo: "Zoom do navegador",
    itens: [
      {
        teclas: (
          <>
            <Tecla>Ctrl</Tecla> + <Tecla>+</Tecla> / <Tecla>-</Tecla>
          </>
        ),
        acao: "Aumenta ou diminui o zoom no Windows, Linux e ChromeOS.",
      },
      {
        teclas: (
          <>
            <Tecla>Command ⌘</Tecla> + <Tecla>+</Tecla> / <Tecla>-</Tecla>
          </>
        ),
        acao: "Aumenta ou diminui o zoom no macOS.",
      },
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
            Todo o sistema pode ser usado só com o teclado. A única tecla de caractere único é &quot;?&quot;, que
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
                    className="grid min-w-0 grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:items-center sm:gap-4"
                  >
                    <dt className="flex min-w-0 flex-wrap items-center gap-1">{item.teclas}</dt>
                    <dd className="min-w-0 leading-secondary text-muted-foreground">{item.acao}</dd>
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
