"use client"

// components/configuracoes/SecaoConta.tsx
//
// Somente leitura: nome, RA/curso (discente) ou departamento (docente) e um
// e-mail institucional. Não existe campo de e-mail no modelo de domínio
// (lib/types.ts) — é derivado aqui, só para exibição, da convenção real da
// UFSCar (RA para discente, nome para docente). Sem formulário de edição: o
// aviso abaixo já diz para onde ir.

import { useEffect, useState } from "react"

import { Skeleton } from "@/components/feedback/Skeleton"
import { emailInstitucionalDiscente, emailInstitucionalDocente } from "@/lib/email"
import { obterDiscenteAtual, obterDocenteAtual } from "@/lib/storage"
import type { Perfil } from "@/lib/types"

type Linha = { rotulo: string; valor: string }

export function SecaoConta({ perfil }: { perfil: Perfil }) {
  const [linhas, setLinhas] = useState<Linha[] | null>(null)

  useEffect(() => {
    let ativo = true
    const carregar =
      perfil === "discente"
        ? obterDiscenteAtual().then((d) => [
            { rotulo: "Nome", valor: d.nome },
            { rotulo: "RA", valor: d.ra },
            { rotulo: "Curso", valor: d.curso },
            { rotulo: "E-mail institucional", valor: emailInstitucionalDiscente(d) },
          ])
        : obterDocenteAtual().then((d) => [
            { rotulo: "Nome", valor: d.nome },
            { rotulo: "Departamento", valor: d.departamento },
            { rotulo: "E-mail institucional", valor: emailInstitucionalDocente(d) },
          ])
    carregar.then((valor) => ativo && setLinhas(valor)).catch(() => undefined)
    return () => {
      ativo = false
    }
  }, [perfil])

  return (
    <section aria-labelledby="titulo-conta" className="flex flex-col gap-4 rounded-lg border bg-surface p-6">
      <h2 id="titulo-conta">Conta</h2>

      {linhas === null ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <span className="sr-only">Carregando dados da conta…</span>
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : (
        <dl className="flex flex-col divide-y rounded-lg border">
          {linhas.map((linha) => (
            <div key={linha.rotulo} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <dt className="text-label text-foreground sm:w-48 sm:shrink-0">{linha.rotulo}</dt>
              <dd className="break-words text-body text-muted-foreground">{linha.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="text-caption leading-secondary text-muted-foreground">
        Dados vindos do sistema acadêmico. Para correções, procure a secretaria.
      </p>
    </section>
  )
}
