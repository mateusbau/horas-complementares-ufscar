// components/formulario/Campo.tsx
//
// Estrutura acessível de um campo de formulário: label visível acima (nunca
// placeholder como label), a palavra "obrigatório" em vez de asterisco, texto
// de apoio e mensagem de erro com ícone. Apoio e erro chegam ao controle por
// aria-describedby; o erro também por aria-invalid.
//
// Uso:
//   <Campo id="senha" rotulo="Senha" obrigatorio erro={erros.senha}>
//     {(aria) => <Input type="password" {...aria} />}
//   </Campo>

import { CircleAlert } from "lucide-react"
import type { ReactNode } from "react"

export type AtributosDoControle = {
  id: string
  "aria-describedby"?: string
  "aria-invalid"?: true
  "aria-required"?: true
}

export function Campo({
  id,
  rotulo,
  obrigatorio = false,
  apoio,
  erro,
  children,
}: {
  id: string
  rotulo: string
  obrigatorio?: boolean
  apoio?: ReactNode
  /** Mensagem pronta do domínio ou da tela; null/undefined quando não há erro. */
  erro?: string | null
  children: (atributos: AtributosDoControle) => ReactNode
}) {
  const idApoio = `${id}-apoio`
  const idErro = `${id}-erro`
  const descritores = [apoio ? idApoio : null, erro ? idErro : null].filter(Boolean).join(" ")

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-foreground">
        {rotulo}
        {obrigatorio && <span className="font-normal text-muted-foreground"> · obrigatório</span>}
      </label>
      {children({
        id,
        ...(descritores ? { "aria-describedby": descritores } : {}),
        ...(erro ? { "aria-invalid": true } : {}),
        ...(obrigatorio ? { "aria-required": true } : {}),
      })}
      {apoio && (
        <p id={idApoio} className="text-label font-normal leading-secondary text-muted-foreground">
          {apoio}
        </p>
      )}
      {erro && (
        <p id={idErro} className="flex items-start gap-2 text-label text-danger">
          <span className="flex h-[1.45em] shrink-0 items-center">
            <CircleAlert aria-hidden="true" className="size-4" />
          </span>
          {erro}
        </p>
      )}
    </div>
  )
}
