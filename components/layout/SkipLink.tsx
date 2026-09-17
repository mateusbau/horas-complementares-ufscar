// components/layout/SkipLink.tsx
//
// Primeiro elemento focável de toda página, visível só no foco. Leva ao
// <main id="conteudo">, pulando a barra de acessibilidade e a navegação.

export const ID_CONTEUDO = "conteudo"
export const ID_RODAPE = "rodape"

export function SkipLink() {
  return (
    <a
      href={`#${ID_CONTEUDO}`}
      accessKey="1"
      className="sr-only rounded-lg border-2 border-foreground bg-surface px-4 text-label text-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:inline-flex focus:min-h-target focus:items-center"
    >
      Pular para o conteúdo
    </a>
  )
}
