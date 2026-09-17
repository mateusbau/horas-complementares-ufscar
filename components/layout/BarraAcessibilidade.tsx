"use client"

// components/layout/BarraAcessibilidade.tsx
//
// Header real, de largura total, no topo de todas as telas (inclusive o
// login): alto contraste, tamanho do texto (A− / A / A+) e atalhos de
// teclado. Cada mudança é aplicada no <html>, persistida em lib/storage.ts e
// anunciada na região aria-live única.
//
// O estado em si vem de hooks/use-preferencias.ts, compartilhado com a tela
// de Configurações: mudar aqui reflete lá, e vice-versa, sem recarregar.

import { Contrast, Map } from "lucide-react"
import Link from "next/link"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { AtalhosDeTeclado } from "@/components/layout/AtalhosDeTeclado"
import { Button, buttonVariants } from "@/components/ui/button"
import { usePreferencias } from "@/hooks/use-preferencias"
import { TAMANHOS_TEXTO, anuncioDePreferencia, type Preferencias } from "@/lib/preferencias"
import { cn } from "@/lib/utils"

/**
 * Estado pressionado com peso visual reduzido: nunca fundo preto (competiria
 * com o conteúdo da página). Borda em --primary e fundo --accent-soft, como o
 * fundo do item ativo da navegação (Sidebar) — mesmo tratamento do resto do
 * sistema para "isto está selecionado".
 */
const PRESSIONADO = "aria-pressed:border-primary aria-pressed:bg-accent-soft aria-pressed:hover:bg-accent-soft"

const TAMANHO_VISUAL = { menor: "text-caption", padrao: "text-label", maior: "text-h3" } as const
const ROTULO_TAMANHO = {
  menor: "Diminuir tamanho do texto",
  padrao: "Restaurar tamanho padrão do texto",
  maior: "Aumentar tamanho do texto",
} as const

export function BarraAcessibilidade() {
  const { preferencias, mudar } = usePreferencias()
  const anunciar = useAnunciar()

  function aoMudar(parcial: Partial<Preferencias>) {
    const novas = mudar(parcial)
    anunciar(anuncioDePreferencia(preferencias, novas))
  }

  return (
    <section
      aria-label="Acessibilidade"
      className="sticky top-0 z-40 border-b bg-surface print:hidden"
    >
      <div className="flex min-h-(--altura-barra) w-full items-center overflow-x-auto px-4 py-1 md:px-8">
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div role="group" aria-label="Tamanho do texto" className="flex shrink-0 items-center gap-1">
            {TAMANHOS_TEXTO.map((tamanho) => (
              <Button
                key={tamanho.valor}
                variant="outline"
                size="icon"
                aria-label={ROTULO_TAMANHO[tamanho.valor]}
                aria-pressed={preferencias.tamanhoTexto === tamanho.valor}
                onClick={() => aoMudar({ tamanhoTexto: tamanho.valor })}
                className={cn(PRESSIONADO, "font-bold")}
              >
                <span aria-hidden="true" className={TAMANHO_VISUAL[tamanho.valor]}>
                  {tamanho.simbolo}
                </span>
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            aria-pressed={preferencias.altoContraste}
            onClick={() => aoMudar({ altoContraste: !preferencias.altoContraste })}
            className={cn(PRESSIONADO, "shrink-0 aria-pressed:font-medium")}
          >
            <Contrast aria-hidden="true" />
            <span className="max-sm:sr-only">Alto contraste</span>
          </Button>

          <Link
            href="/mapa-do-site"
            aria-label="Mapa do site"
            className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
          >
            <Map aria-hidden="true" />
            <span className="max-sm:sr-only">Mapa do site</span>
          </Link>

          <AtalhosDeTeclado />
        </div>
      </div>
    </section>
  )
}
