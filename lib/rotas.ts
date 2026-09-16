// lib/rotas.ts
//
// Destinos de navegação usados em mais de um lugar (login, troca de perfil).

import type { Perfil } from "./types"

/** Página inicial de cada perfil, ao entrar ou ao trocar de perfil. */
export const INICIO_DO_PERFIL: Record<Perfil, string> = {
  discente: "/painel",
  docente: "/docente",
}

/** Tela de Configurações de cada perfil, alcançável pelo bloco de perfil na sidebar. */
export const CONFIGURACOES_DO_PERFIL: Record<Perfil, string> = {
  discente: "/configuracoes",
  docente: "/docente/configuracoes",
}
