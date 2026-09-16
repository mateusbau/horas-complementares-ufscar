// components/configuracoes/TelaConfiguracoes.tsx
//
// Alcançável pelo bloco de perfil na base da sidebar (components/layout/navegacao.tsx,
// BlocoPerfil). Quatro seções independentes; nenhuma delas envia um formulário
// em conjunto — cada controle grava sozinho, ao mudar.

import { PageHeader } from "@/components/layout/PageHeader"
import type { Perfil } from "@/lib/types"

import { SecaoAparencia } from "./SecaoAparencia"
import { SecaoConta } from "./SecaoConta"
import { SecaoNotificacoes } from "./SecaoNotificacoes"
import { SecaoSessao } from "./SecaoSessao"

export function TelaConfiguracoes({ perfil }: { perfil: Perfil }) {
  return (
    <div>
      <PageHeader titulo="Configurações" subtitulo="Sua conta, aparência, notificações e sessão." />
      <div className="flex flex-col gap-6">
        <SecaoConta perfil={perfil} />
        <SecaoAparencia />
        <SecaoNotificacoes />
        <SecaoSessao perfil={perfil} />
      </div>
    </div>
  )
}
