"use client"

// components/layout/GuardaSessao.tsx
//
// Telas com navegação exigem sessão. Sem sessão (ninguém entrou, ou saiu),
// volta ao login. Se o perfil da rota difere do da sessão (link direto para a
// área do outro perfil), a rota vence e a sessão é atualizada, para "Trocar de
// perfil" continuar coerente. Não bloqueia a tela: a verificação leva os
// mesmos 300 ms do carregamento dos dados, que já mostram skeleton.

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { obterSessao, trocarPerfil } from "@/lib/storage"
import type { Perfil } from "@/lib/types"

export function GuardaSessao({ perfil }: { perfil: Perfil }) {
  const router = useRouter()

  useEffect(() => {
    let ativo = true
    obterSessao()
      .then(async (sessao) => {
        if (!ativo) return
        if (!sessao) router.replace("/")
        else if (sessao.perfil !== perfil) await trocarPerfil(perfil)
      })
      .catch(() => undefined)
    return () => {
      ativo = false
    }
  }, [perfil, router])

  return null
}
