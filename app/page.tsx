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
            text-h2 abaixo de 640 px: em 375 px com A+ (125 %), "Complementares"
            no tamanho de h1 (40 px) não cabe na linha. O Chrome no Windows não
            tem dicionário de português para hyphens: auto (regra global de
            h1-h3 em globals.css), e o navegador quebraria a palavra com
            overflow-wrap. Reduzir o tamanho, e não hifenizar à mão, mantém a
            palavra inteira e legível. O elemento continua h1; só o tamanho
            visual muda.
          */}
          <h1 className="text-h2 sm:text-h1">Horas Complementares</h1>
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
