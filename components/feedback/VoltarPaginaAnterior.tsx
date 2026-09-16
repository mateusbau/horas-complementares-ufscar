"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

/** Volta no histórico do navegador, sem perder o contexto de onde a pessoa estava. */
export function VoltarPaginaAnterior() {
  const router = useRouter()
  return (
    <Button onClick={() => router.back()}>
      <ArrowLeft aria-hidden="true" />
      Voltar à página anterior
    </Button>
  )
}
