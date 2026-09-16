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

import { Contrast } from "lucide-react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { AtalhosDeTeclado } from "@/components/layout/AtalhosDeTeclado"
import { Button } from "@/components/ui/button"
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
      <div className="flex h-(--altura-barra) items-center justify-end gap-2 px-4 md:px-8">
        <Button
          variant="outline"
          aria-pressed={preferencias.altoContraste}
          onClick={() => aoMudar({ altoContraste: !preferencias.altoContraste })}
          className={cn(PRESSIONADO, "aria-pressed:font-medium")}
        >
          <Contrast aria-hidden="true" />
          <span className="max-sm:sr-only">Alto contraste</span>
        </Button>

        <div role="group" aria-labelledby="rotulo-tamanho-texto" className="flex items-center gap-1">
          <span id="rotulo-tamanho-texto" className="mr-1 text-label max-md:sr-only">
            Tamanho do texto
          </span>
          {TAMANHOS_TEXTO.map((tamanho) => (
            <Button
              key={tamanho.valor}
              variant="outline"
              size="icon"
              aria-pressed={preferencias.tamanhoTexto === tamanho.valor}
              onClick={() => aoMudar({ tamanhoTexto: tamanho.valor })}
              className={cn(PRESSIONADO, "font-bold")}
            >
              <span aria-hidden="true" className={TAMANHO_VISUAL[tamanho.valor]}>
                {tamanho.simbolo}
              </span>
              <span className="sr-only">
                {tamanho.simbolo}, {tamanho.nome}
              </span>
            </Button>
          ))}
        </div>

        <AtalhosDeTeclado />
      </div>
    </section>
  )
}
