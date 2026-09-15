"use client"

// components/entrada/ReiniciarDemonstracao.tsx
//
// Etapa 12 (varredura final): caminho óbvio para reiniciar a demonstração. O
// que ficou salvo no navegador do site publicado pode ter sobrado de um teste
// anterior (da equipe ou de outro avaliador); sem este botão, `reiniciarDemo()`
// (lib/storage.ts) existia mas não tinha nenhum jeito de ser acionado pela
// interface. Fica na tela de login — o primeiro lugar que qualquer pessoa
// alcança, com ou sem sessão — porque é onde "recomeçar do zero" faz sentido
// sem ambiguidade.
//
// Confirmação em modal (mesmo padrão das ações destrutivas do docente, etapa
// 10): foco inicial em "Cancelar", a ação em si some dos dados atuais do
// navegador, e por isso pede uma decisão explícita, não um clique único.

import { RotateCcw } from "lucide-react"
import { useRef, useState } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { encerrarSessao, reiniciarDemo } from "@/lib/storage"

export function ReiniciarDemonstracao() {
  const anunciar = useAnunciar()
  const [reiniciando, setReiniciando] = useState(false)
  const cancelarRef = useRef<HTMLButtonElement>(null)

  async function confirmar() {
    setReiniciando(true)
    try {
      await reiniciarDemo()
      await encerrarSessao()
      anunciar("Demonstração reiniciada. Os dados de exemplo voltaram ao ponto inicial.")
      // Navegação completa, não router.push: garante que nenhuma tela guarde em
      // memória um estado (progresso, fila, sessão) lido antes do reinício.
      window.location.assign("/")
    } catch {
      setReiniciando(false)
      anunciar("Não foi possível reiniciar agora. Tente novamente.")
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" className="px-0" />}>
        <RotateCcw aria-hidden="true" className="size-4" />
        Reiniciar demonstração
      </DialogTrigger>
      <DialogContent initialFocus={cancelarRef}>
        <DialogHeader>
          <DialogTitle>Reiniciar demonstração?</DialogTitle>
          <DialogDescription>
            Isto substitui os dados salvos neste navegador — atividades registradas, pareceres e
            sessão — pelo estado inicial da demonstração, com os prazos recalculados a partir de
            agora. Use se você já testou o sistema antes e quer recomeçar do zero.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button ref={cancelarRef} variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={() => void confirmar()} disabled={reiniciando}>
            {reiniciando ? "Reiniciando…" : "Reiniciar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
