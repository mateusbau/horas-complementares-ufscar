"use client"

// components/layout/BarraAcessibilidade.tsx
//
// Fixa no topo de todas as telas, inclusive o login: alto contraste, tamanho do
// texto (A− / A / A+) e atalhos de teclado. Cada mudança é aplicada no <html>,
// persistida em lib/storage.ts e anunciada na região aria-live única.
//
// Na primeira pintura, quem aplica as preferências é o script inline do layout
// raiz (SCRIPT_PREFERENCIAS). Aqui, useSyncExternalStore usa o valor padrão na
// hidratação (igual ao do servidor) e o valor salvo logo depois, sem erro de
// hidratação nos aria-pressed.

import { Contrast } from "lucide-react"
import { useLayoutEffect, useSyncExternalStore } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { AtalhosDeTeclado } from "@/components/layout/AtalhosDeTeclado"
import { Button } from "@/components/ui/button"
import {
  PREFERENCIAS_PADRAO,
  TAMANHOS_TEXTO,
  anuncioDePreferencia,
  aplicarPreferencias,
  type Preferencias,
} from "@/lib/preferencias"
import { lerPreferencias, salvarPreferencias } from "@/lib/storage"
import { cn } from "@/lib/utils"

// --- Store das preferências ------------------------------------------------------

const ouvintes = new Set<() => void>()
let atuais: Preferencias | null = null

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

function instantaneo(): Preferencias {
  atuais ??= lerPreferencias()
  return atuais
}

function instantaneoDoServidor(): Preferencias {
  return PREFERENCIAS_PADRAO
}

function definir(novas: Preferencias) {
  atuais = novas
  aplicarPreferencias(novas)
  salvarPreferencias(novas)
  ouvintes.forEach((ouvinte) => ouvinte())
}

// --- Componente ------------------------------------------------------------------

/** Estado pressionado visível sem depender de cor: fundo escuro e texto claro. */
const PRESSIONADO = "aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-primary-foreground aria-pressed:hover:bg-foreground"

const TAMANHO_VISUAL = { menor: "text-caption", padrao: "text-label", maior: "text-h3" } as const

export function BarraAcessibilidade() {
  const preferencias = useSyncExternalStore(assinar, instantaneo, instantaneoDoServidor)
  const anunciar = useAnunciar()

  // Em desenvolvimento, o Strict Mode remonta o <html> e apaga o que o script
  // inline aplicou; reaplica antes da pintura. Em produção, não muda nada.
  useLayoutEffect(() => {
    aplicarPreferencias(instantaneo())
  }, [])

  function mudar(parcial: Partial<Preferencias>) {
    const anterior = instantaneo()
    const novas = { ...anterior, ...parcial }
    definir(novas)
    anunciar(anuncioDePreferencia(anterior, novas))
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
          onClick={() => mudar({ altoContraste: !preferencias.altoContraste })}
          className={PRESSIONADO}
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
              onClick={() => mudar({ tamanhoTexto: tamanho.valor })}
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
