"use client"

// components/configuracoes/SecaoNotificacoes.tsx
//
// Quatro caixas de seleção independentes, mesma fonte de hooks/use-preferencias.ts.
// Protótipo só de frontend: nada aqui dispara e-mail ou push de verdade.

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { Checkbox } from "@/components/ui/checkbox"
import { usePreferencias } from "@/hooks/use-preferencias"
import { NOTIFICACOES, anuncioDePreferencia, type Preferencias } from "@/lib/preferencias"

export function SecaoNotificacoes() {
  const { preferencias, mudar } = usePreferencias()
  const anunciar = useAnunciar()

  function aoMudar(parcial: Partial<Preferencias>) {
    const novas = mudar(parcial)
    anunciar(anuncioDePreferencia(preferencias, novas))
  }

  return (
    <section aria-labelledby="titulo-notificacoes" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
      <h2 id="titulo-notificacoes">Notificações</h2>
      <fieldset aria-describedby="apoio-notificacoes" className="flex flex-col gap-2">
        <legend className="text-label text-foreground">Avisar quando</legend>
        <p id="apoio-notificacoes" className="text-label leading-secondary text-muted-foreground">
          Protótipo: estas preferências não enviam e-mail nem notificação real.
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {NOTIFICACOES.map((notificacao) => (
            <label
              key={notificacao.chave}
              className="flex min-h-target cursor-pointer items-center gap-3 rounded-lg border border-input-border bg-surface p-3"
            >
              <Checkbox
                checked={preferencias[notificacao.chave]}
                onChange={(e) => aoMudar({ [notificacao.chave]: e.target.checked })}
              />
              <span className="text-body text-foreground">{notificacao.nome}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  )
}
