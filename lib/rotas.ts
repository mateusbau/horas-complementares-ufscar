// lib/rotas.ts
//
// Destinos de navegação usados em mais de um lugar (login, troca de perfil).

import type { Perfil } from "./types"

/** Página inicial de cada perfil, ao entrar ou ao trocar de perfil. */
export const INICIO_DO_PERFIL: Record<Perfil, string> = {
  discente: "/painel",
  // TEMPORÁRIO até a etapa 9: a tela 06 (Painel do docente) nascerá em /docente.
  // Até lá o docente cai na rota de teste da casca, nunca em 404.
  docente: "/docente/casca",
}
