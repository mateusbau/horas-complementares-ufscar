// app/page.tsx — Tela 01 · Login e seleção de perfil
//
// Sem barra lateral: card centralizado de até 640 px. A barra de
// acessibilidade (layout raiz) continua no topo, também aqui.

import { GraduationCap } from "lucide-react"
import type { Metadata } from "next"

import { FormularioEntrada } from "@/components/entrada/FormularioEntrada"
import { ID_CONTEUDO } from "@/components/layout/SkipLink"

export const metadata: Metadata = { title: "Entrar · Horas Complementares" }

export default function PaginaEntrada() {
  return (
    <div className="flex flex-col items-center px-4 py-8 md:py-12">
      <main
        id={ID_CONTEUDO}
        tabIndex={-1}
        className="w-full max-w-form scroll-mt-(--altura-barra) rounded-lg border bg-surface p-4 sm:p-8"
      >
        <header className="mb-8 flex flex-col gap-2">
          <span
            aria-hidden="true"
            className="mb-2 flex size-12 items-center justify-center rounded-lg bg-brand text-primary-foreground"
          >
            <GraduationCap className="size-7" />
          </span>
          {/*
            Hífen condicional (­): em 375 px com texto a 125 %, "Complementares"
            não cabe na linha. Sem ele, o navegador sem dicionário de português
            quebra em "Complementar-es"; com ele, em "Comple-mentares", e só
            quando precisa. Leitores de tela ignoram o caractere.
          */}
          <h1>Horas Comple{"­"}mentares</h1>
          <p className="leading-secondary text-muted-foreground">Sistema de gestão · UFSCar Sorocaba</p>
        </header>
        <FormularioEntrada />
      </main>
      <footer className="mt-6 w-full max-w-form text-center text-caption leading-secondary text-muted-foreground">
        Acesso institucional. Em caso de dúvida procure a Secretaria de Coordenação de Curso · SeCoT XVIII
      </footer>
    </div>
  )
}
