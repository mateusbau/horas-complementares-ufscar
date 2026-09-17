// app/page.tsx — Tela 01 · Login e seleção de perfil
//
// Sem barra lateral: card centralizado de até 640 px. A barra de
// acessibilidade (layout raiz) continua no topo, também aqui.
//
// Etapa 12 (primeiro minuto do avaliador): o rótulo "Protótipo de demonstração"
// aparece já no cabeçalho, antes dos campos de usuário/senha — sem isso, quem
// abre o link frio lê "Número UFSCar ou e-mail institucional" e pode achar que
// precisa de credencial real antes de notar o botão de visitante mais abaixo.

import { GraduationCap } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { FormularioEntrada } from "@/components/entrada/FormularioEntrada"
import { ReiniciarDemonstracao } from "@/components/entrada/ReiniciarDemonstracao"
import { ID_CONTEUDO, ID_RODAPE } from "@/components/layout/SkipLink"
import ufscarLogo from "@/public/ufscar-logo.png"

export const metadata: Metadata = { title: "Entrar · Horas Complementares" }

export default function PaginaEntrada() {
  return (
    <div className="flex flex-col items-center px-4 py-8 md:py-12">
      {/*
        Primeiro elemento visual da tela, acima do cartão de login. O anel e o
        fundo só aparecem em alto contraste (mesmo tratamento de
        components/layout/Marca.tsx): o PNG não muda de cor com a preferência,
        e a superfície da página também não, então sem isso o logo continuaria
        exatamente igual nos dois modos.
      */}
      <span className="mb-6 inline-flex shrink-0 rounded-md [html.alto-contraste_&]:bg-foreground [html.alto-contraste_&]:p-1 [html.alto-contraste_&]:ring-1 [html.alto-contraste_&]:ring-foreground">
        <Image src={ufscarLogo} alt="Universidade Federal de São Carlos" className="h-12 w-auto sm:h-16" />
      </span>
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
          <p className="text-label text-accent-text">
            Protótipo de demonstração — escolha um perfil abaixo e entre como visitante, sem
            credencial real.
          </p>
        </header>
        <FormularioEntrada />
      </main>
      <footer
        id={ID_RODAPE}
        accessKey="4"
        tabIndex={-1}
        className="mt-6 flex w-full max-w-form scroll-mt-(--altura-barra) flex-col items-center gap-3 text-center"
      >
        <p className="text-caption leading-secondary text-muted-foreground">
          Acesso institucional. Em caso de dúvida procure a Secretaria de Coordenação de Curso ·
          SeCoT XVIII
        </p>
        <ReiniciarDemonstracao />
        <Link href="/sobre" className="text-caption text-accent-text underline underline-offset-4 hover:decoration-2">
          Sobre este protótipo
        </Link>
      </footer>
    </div>
  )
}
