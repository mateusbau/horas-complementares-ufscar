"use client"

// components/feedback/RegiaoAoVivo.tsx
//
// A ÚNICA região aria-live do sistema, montada no layout raiz. Qualquer
// componente anuncia por ela com `useAnunciar()`: mudanças de preferência,
// resultados de ação, erros de carregamento. Uma região só evita anúncios
// sobrepostos e leitores de tela lendo a mesma coisa duas vezes.

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"

type Anunciar = (mensagem: string) => void

const ContextoAnuncio = createContext<Anunciar | null>(null)

/** Tempo entre esvaziar e preencher a região, para repetir a mesma frase. */
const INTERVALO_MS = 50

export function RegiaoAoVivo({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState("")
  const temporizador = useRef<number | undefined>(undefined)

  const anunciar = useCallback((texto: string) => {
    // Esvazia antes: sem isso, anunciar duas vezes a mesma frase não é lido de novo.
    setMensagem("")
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setMensagem(texto), INTERVALO_MS)
  }, [])

  return (
    <ContextoAnuncio.Provider value={anunciar}>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {mensagem}
      </div>
      {children}
    </ContextoAnuncio.Provider>
  )
}

export function useAnunciar(): Anunciar {
  const anunciar = useContext(ContextoAnuncio)
  if (!anunciar) throw new Error("useAnunciar precisa estar dentro de <RegiaoAoVivo>.")
  return anunciar
}
