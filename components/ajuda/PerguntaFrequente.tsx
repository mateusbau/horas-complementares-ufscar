"use client"

// components/ajuda/PerguntaFrequente.tsx
//
// Uma pergunta frequente: h3 com um <button> (aria-expanded, aria-controls),
// nunca uma div clicável nem <details> estilizado. A região de resposta fica
// sempre no DOM — só o atributo `hidden` muda — para aria-controls nunca
// apontar para um elemento inexistente enquanto a pergunta está recolhida.
// Enter e Espaço já funcionam de graça: é um <button> nativo.

import { ChevronDown } from "lucide-react"

export function PerguntaFrequente({
  id,
  pergunta,
  resposta,
  aberta,
  onAlternar,
}: {
  id: string
  pergunta: string
  resposta: string
  aberta: boolean
  onAlternar: () => void
}) {
  const idResposta = `resposta-${id}`
  return (
    <div className="border-b last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={aberta}
          aria-controls={idResposta}
          onClick={onAlternar}
          className="flex min-h-target w-full items-center justify-between gap-3 px-4 py-3 text-left text-body font-medium text-foreground transition-colors hover:bg-muted"
        >
          {pergunta}
          <ChevronDown
            aria-hidden="true"
            className={`size-5 shrink-0 text-muted-foreground transition-transform ${aberta ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div id={idResposta} hidden={!aberta} className="px-4 pb-4">
        <p className="leading-secondary text-muted-foreground">{resposta}</p>
      </div>
    </div>
  )
}
