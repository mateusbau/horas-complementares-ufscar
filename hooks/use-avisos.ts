"use client"

// hooks/use-avisos.ts
//
// Estado dos avisos, compartilhado entre o item "Central de avisos" da
// sidebar (o badge de não lidos) e a própria tela: os dois lêem a MESMA
// fonte, e marcar um aviso como lido em qualquer lugar atualiza o badge na
// hora, sem recarregar — mesmo padrão de hooks/use-preferencias.ts, adaptado
// para uma leitura assíncrona (listarAvisos já tem o atraso simulado de
// lib/storage.ts).

import { useEffect, useState, useSyncExternalStore } from "react"

import { listarAvisos, marcarAvisoComoLido, marcarTodosAvisosComoLidos } from "@/lib/storage"
import type { Aviso } from "@/lib/types"

const ouvintes = new Set<() => void>()
// Referência estável enquanto cache === null: useSyncExternalStore compara o
// retorno de getSnapshot por identidade, e um array literal novo a cada
// chamada (`cache ?? []`) pareceria "mudar" a cada render, entrando em loop
// infinito de re-render antes do primeiro carregamento resolver.
const VAZIO: Aviso[] = []
let cache: Aviso[] | null = null

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

function instantaneo(): Aviso[] {
  return cache ?? VAZIO
}

function instantaneoDoServidor(): Aviso[] {
  return VAZIO
}

async function recarregar(): Promise<void> {
  cache = await listarAvisos()
  ouvintes.forEach((ouvinte) => ouvinte())
}

export function useAvisos(): {
  avisos: Aviso[]
  naoLidos: number
  carregando: boolean
  marcarComoLido: (id: string) => Promise<void>
  marcarTodosComoLidos: () => Promise<void>
} {
  const avisos = useSyncExternalStore(assinar, instantaneo, instantaneoDoServidor)
  const [carregando, setCarregando] = useState(cache === null)

  useEffect(() => {
    if (cache !== null) return
    let ativo = true
    recarregar().then(() => {
      if (ativo) setCarregando(false)
    })
    return () => {
      ativo = false
    }
  }, [])

  async function marcarComoLido(id: string) {
    await marcarAvisoComoLido(id)
    await recarregar()
  }

  async function marcarTodosComoLidos() {
    await marcarTodosAvisosComoLidos()
    await recarregar()
  }

  return {
    avisos,
    naoLidos: avisos.filter((a) => !a.lido).length,
    carregando,
    marcarComoLido,
    marcarTodosComoLidos,
  }
}
