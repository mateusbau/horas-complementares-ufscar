"use client"

// components/feedback/EstadoErro.tsx
//
// Estado de erro: borda e ícone em --danger, o que aconteceu, a garantia de que
// nada se perdeu, duas saídas e o código para o suporte. Ao aparecer, é
// anunciado pela região aria-live única.

import { CircleAlert, RotateCw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EstadoErro({
  titulo = "Não foi possível carregar as atividades",
  descricao = "A conexão com o sistema acadêmico falhou. Seus dados não foram perdidos.",
  codigo = "HC-503",
  onTentarNovamente,
  nivelTitulo = 3,
  anunciarAoMontar = true,
  className,
}: {
  titulo?: string
  descricao?: string
  codigo?: string
  onTentarNovamente: () => void
  nivelTitulo?: 2 | 3
  /** Desligue só em demonstrações, onde o erro não aconteceu de verdade. */
  anunciarAoMontar?: boolean
  className?: string
}) {
  const anunciar = useAnunciar()
  const Titulo = nivelTitulo === 2 ? "h2" : "h3"

  useEffect(() => {
    if (anunciarAoMontar) anunciar(`${titulo}. ${descricao}`)
  }, [anunciar, anunciarAoMontar, titulo, descricao])

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-danger bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <CircleAlert aria-hidden="true" className="size-8 text-danger" />
      <div className="flex max-w-form flex-col gap-2">
        <Titulo>{titulo}</Titulo>
        <p className="leading-secondary text-muted-foreground">{descricao}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={onTentarNovamente}>
          <RotateCw aria-hidden="true" />
          Tentar novamente
        </Button>
        <Link href="/ajuda" className={buttonVariants({ variant: "outline" })}>
          Falar com a SeCoT
        </Link>
      </div>
      <p className="text-caption text-muted-foreground">
        Código do erro: <span className="tabular">{codigo}</span>
      </p>
    </div>
  )
}
