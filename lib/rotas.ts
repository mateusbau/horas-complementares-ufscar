// lib/rotas.ts
//
// Destinos de navegação usados em mais de um lugar (login, troca de perfil).

import type { Perfil } from "./types"

/** Página inicial de cada perfil, ao entrar ou ao trocar de perfil. */
export const INICIO_DO_PERFIL: Record<Perfil, string> = {
  discente: "/painel",
  docente: "/docente",
}
