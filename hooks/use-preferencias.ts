"use client"

// hooks/use-preferencias.ts
//
// Estado das preferências (acessibilidade, aparência, notificações),
// compartilhado entre a barra superior (BarraAcessibilidade) e a tela de
// Configurações: os dois lêem e gravam a MESMA fonte — nunca dois estados
// separados —, e useSyncExternalStore garante que mudar num lugar reflete no
// outro imediatamente, sem recarregar a página.

import { useLayoutEffect, useSyncExternalStore } from "react"

import { PREFERENCIAS_PADRAO, aplicarPreferencias, type Preferencias } from "@/lib/preferencias"
import { lerPreferencias, salvarPreferencias } from "@/lib/storage"

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

export function usePreferencias(): {
  preferencias: Preferencias
  /** Grava e aplica o que for passado; devolve o objeto completo já mesclado. */
  mudar: (parcial: Partial<Preferencias>) => Preferencias
} {
  const preferencias = useSyncExternalStore(assinar, instantaneo, instantaneoDoServidor)

  // Em desenvolvimento, o Strict Mode remonta o <html> e apaga o que o script
  // inline aplicou; reaplica antes da pintura. Em produção, não muda nada.
  useLayoutEffect(() => {
    aplicarPreferencias(instantaneo())
  }, [])

  function mudar(parcial: Partial<Preferencias>): Preferencias {
    const novas = { ...instantaneo(), ...parcial }
    definir(novas)
    return novas
  }

  return { preferencias, mudar }
}
