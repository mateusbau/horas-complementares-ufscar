"use client"

// components/configuracoes/SecaoSessao.tsx
//
// Trocar de perfil, sair, e "Limpar meus dados locais" — a única ação
// destrutiva da tela, por isso a única com diálogo de confirmação (mesmo
// padrão de components/entrada/ReiniciarDemonstracao.tsx e da confirmação em
// lote do docente: foco inicial em "Cancelar", a opção menos arriscada).

import { ArrowLeftRight, LogOut, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
import { INICIO_DO_PERFIL } from "@/lib/rotas"
import { encerrarSessao, limparDadosLocais, trocarPerfil } from "@/lib/storage"
import type { Perfil } from "@/lib/types"
import { cn } from "@/lib/utils"

const CLASSE_ACAO =
  "flex min-h-target w-full items-center gap-3 rounded-lg border border-input-border bg-surface px-4 py-3 text-left text-body text-foreground transition-colors hover:bg-muted"

export function SecaoSessao({ perfil }: { perfil: Perfil }) {
  const router = useRouter()
  const anunciar = useAnunciar()
  const [emAndamento, setEmAndamento] = useState<"trocar" | "sair" | "limpar" | null>(null)
  const cancelarRef = useRef<HTMLButtonElement>(null)
  const outro: Perfil = perfil === "discente" ? "docente" : "discente"

  async function executar(acao: "trocar" | "sair") {
    if (emAndamento) return
    setEmAndamento(acao)
    try {
      if (acao === "trocar") {
        await trocarPerfil(outro)
        router.push(INICIO_DO_PERFIL[outro])
      } else {
        await encerrarSessao()
        router.push("/")
      }
    } catch {
      setEmAndamento(null)
      anunciar("Não foi possível concluir a ação. Tente novamente.")
    }
  }

  async function confirmarLimpeza() {
    setEmAndamento("limpar")
    try {
      await limparDadosLocais()
      anunciar("Dados locais limpos. Voltando aos dados de demonstração iniciais.")
      // Navegação completa, não router.push: garante que nenhuma tela guarde em
      // memória atividades ou comprovantes lidos antes da limpeza.
      window.location.assign(INICIO_DO_PERFIL[perfil])
    } catch {
      setEmAndamento(null)
      anunciar("Não foi possível limpar os dados agora. Tente novamente.")
    }
  }

  return (
    <section aria-labelledby="titulo-sessao" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
      <h2 id="titulo-sessao">Sessão</h2>

      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => void executar("trocar")} disabled={!!emAndamento} className={CLASSE_ACAO}>
          <ArrowLeftRight aria-hidden="true" className="size-5 shrink-0" />
          {emAndamento === "trocar"
            ? "Trocando de perfil…"
            : `Trocar para ${outro === "docente" ? "perfil docente" : "perfil discente"}`}
        </button>
        <button type="button" onClick={() => void executar("sair")} disabled={!!emAndamento} className={CLASSE_ACAO}>
          <LogOut aria-hidden="true" className="size-5 shrink-0" />
          {emAndamento === "sair" ? "Saindo…" : "Sair"}
        </button>
      </div>

      <Dialog>
        <DialogTrigger
          render={
            <button
              type="button"
              disabled={!!emAndamento}
              className={cn(CLASSE_ACAO, "border-danger text-danger hover:bg-danger-bg")}
            />
          }
        >
          <Trash2 aria-hidden="true" className="size-5 shrink-0" />
          Limpar meus dados locais
        </DialogTrigger>
        <DialogContent initialFocus={cancelarRef}>
          <DialogHeader>
            <DialogTitle>Limpar meus dados locais?</DialogTitle>
            <DialogDescription>
              Isto apaga as atividades registradas neste navegador (armazenamento local) e os
              arquivos de comprovante enviados (IndexedDB), voltando aos dados de demonstração
              iniciais. Suas preferências de acessibilidade e de notificação não são afetadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button ref={cancelarRef} variant="outline" />}>Cancelar</DialogClose>
            <Button
              variant="destructive"
              onClick={() => void confirmarLimpeza()}
              disabled={emAndamento === "limpar"}
            >
              {emAndamento === "limpar" ? "Limpando…" : "Limpar dados"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
