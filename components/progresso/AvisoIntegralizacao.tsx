// components/progresso/AvisoIntegralizacao.tsx — Painel do discente
//
// Caixa de aviso contextual: só aparece quando alguma exigência do checklist
// ainda está pendente. O "◆" é puramente decorativo (aria-hidden) — a
// informação inteira está no texto, nunca só no ícone.

export function AvisoIntegralizacao({ texto }: { texto: string }) {
  return (
    <div className="mt-[22px] flex items-start gap-2 rounded-lg border border-integralizacao-aviso-borda bg-integralizacao-aviso-fundo px-4 py-3.5">
      <span aria-hidden="true" className="text-[15px] leading-none text-primary">
        ◆
      </span>
      <p className="text-label leading-body text-integralizacao-aviso-texto">{texto}</p>
    </div>
  )
}
