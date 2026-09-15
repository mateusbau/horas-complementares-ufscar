"use client"

// components/atividade/VisualizadorComprovante.tsx
//
// Miniatura clicável do comprovante + modal grande com zoom, giro e download.
// Compartilhado entre a validação do docente (tela 07) e o detalhe da
// atividade do discente (tela 05): o blob é o mesmo, só muda se o rótulo
// menciona quem enviou (nomeDiscente é opcional — o discente vendo o próprio
// envio não precisa ler "enviado por você mesmo").
//
// A URL de exibição (lib/storage.ts, obterUrlComprovante) é resolvida uma vez,
// ao montar: tanto a miniatura quanto o modal usam a mesma URL, sem buscar de
// novo ao abrir. Se for um blob do IndexedDB, a URL é revogada ao desmontar
// ou trocar de comprovante — arquivo público da demonstração (começa com
// "/") não é blob e a revogação nesse caso não faz nada.
//
// O modal é o <Dialog> já existente (Base UI): role="dialog", aria-modal,
// aria-labelledby, o foco preso e devolvido ao gatilho ao fechar já vêm de
// graça por usar <DialogTrigger> de verdade envolvendo a miniatura, em vez de
// um Dialog controlado por estado à parte.

import { CircleAlert, Download, FileText, Maximize2, RotateCw, ZoomIn, ZoomOut } from "lucide-react"
import { useEffect, useState } from "react"

import { Skeleton } from "@/components/feedback/Skeleton"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatarTamanhoArquivo } from "@/lib/formatacao"
import { obterUrlComprovante } from "@/lib/storage"
import type { Comprovante } from "@/lib/types"

const ZOOM_MINIMO = 0.5
const ZOOM_MAXIMO = 3
const PASSO_ZOOM = 0.25

type Estado = "carregando" | "pronto" | "indisponivel"

export function VisualizadorComprovante({
  comprovante,
  tipoAtividadeNome,
  nomeDiscente,
}: {
  comprovante: Comprovante | null
  /** Nome do tipo declarado ("Sem tipo previsto" quando não há), para o alt da miniatura. */
  tipoAtividadeNome: string
  /** Só na visão do docente: o discente vendo o próprio envio não precisa ler "enviado por si". */
  nomeDiscente?: string
}) {
  const [estado, setEstado] = useState<Estado>("carregando")
  const [url, setUrl] = useState<string | null>(null)
  const [falhouExibir, setFalhouExibir] = useState(false)

  useEffect(() => {
    if (!comprovante) return
    let ativo = true
    setEstado("carregando")
    setFalhouExibir(false)
    obterUrlComprovante(comprovante).then((resultado) => {
      if (!ativo) return
      if (resultado) {
        setUrl(resultado)
        setEstado("pronto")
      } else {
        setEstado("indisponivel")
      }
    })
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reexecuta só quando o comprovante muda de fato, não a cada nova referência de objeto.
  }, [comprovante?.comprovanteId])

  // Revoga a URL do blob (não a de um arquivo público) ao trocar ou desmontar.
  useEffect(() => {
    return () => {
      if (url && !url.startsWith("/")) URL.revokeObjectURL(url)
    }
  }, [url])

  return (
    <section aria-labelledby="titulo-comprovante" className="flex flex-col gap-3 rounded-lg border bg-surface p-6">
      <h2 id="titulo-comprovante">Comprovante</h2>

      {!comprovante && <p className="leading-secondary text-muted-foreground">Nenhum comprovante anexado.</p>}

      {comprovante && estado === "carregando" && (
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="size-24 rounded-lg" />
          <span className="sr-only">Carregando comprovante…</span>
        </div>
      )}

      {comprovante && estado === "indisponivel" && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-input-border bg-muted p-6 text-center">
          <CircleAlert aria-hidden="true" className="size-6 text-danger" />
          <p className="text-body text-foreground">Não foi possível carregar o comprovante.</p>
          <p className="max-w-full truncate text-caption text-muted-foreground">{comprovante.nome}</p>
        </div>
      )}

      {comprovante && estado === "pronto" && url && (
        <ConteudoPronto
          comprovante={comprovante}
          url={url}
          tipoAtividadeNome={tipoAtividadeNome}
          nomeDiscente={nomeDiscente}
          falhouExibir={falhouExibir}
          onFalhaAoExibir={() => setFalhouExibir(true)}
        />
      )}
    </section>
  )
}

function ConteudoPronto({
  comprovante,
  url,
  tipoAtividadeNome,
  nomeDiscente,
  falhouExibir,
  onFalhaAoExibir,
}: {
  comprovante: Comprovante
  url: string
  tipoAtividadeNome: string
  nomeDiscente?: string
  falhouExibir: boolean
  onFalhaAoExibir: () => void
}) {
  const [zoom, setZoom] = useState(1)
  const [rotacao, setRotacao] = useState(0)
  const ehImagem = comprovante.tipoMime.startsWith("image/")
  const alt = nomeDiscente
    ? `Comprovante enviado por ${nomeDiscente} — ${tipoAtividadeNome}`
    : `Comprovante da atividade — ${tipoAtividadeNome}`

  function aoAbrirFechar(aberto: boolean) {
    if (aberto) {
      setZoom(1)
      setRotacao(0)
    }
  }

  if (falhouExibir) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-input-border bg-muted p-6 text-center">
        <CircleAlert aria-hidden="true" className="size-6 text-danger" />
        <p className="text-body text-foreground">Não foi possível carregar o comprovante.</p>
        <a href={url} download={comprovante.nome} className={buttonVariants({ variant: "outline" })}>
          <Download aria-hidden="true" />
          Baixar arquivo
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Dialog onOpenChange={aoAbrirFechar}>
        <DialogTrigger
          render={
            <button
              type="button"
              className="flex size-24 items-center justify-center overflow-hidden rounded-lg border border-input-border bg-muted transition-colors hover:bg-accent-soft"
            />
          }
          aria-label={ehImagem ? undefined : alt}
        >
          {ehImagem ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL de blob/objeto, dinâmica: next/image não otimiza esse tipo de fonte.
            <img src={url} alt={alt} className="size-full object-cover" onError={onFalhaAoExibir} />
          ) : (
            <FileText aria-hidden="true" className="size-8 text-muted-foreground" />
          )}
        </DialogTrigger>
        <DialogContent className="flex flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate">{comprovante.nome}</DialogTitle>
          </DialogHeader>

          <div role="toolbar" aria-label="Ferramentas do comprovante" className="flex flex-wrap items-center gap-2 border-y py-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setZoom((z) => Math.max(ZOOM_MINIMO, Math.round((z - PASSO_ZOOM) * 100) / 100))}
              disabled={zoom <= ZOOM_MINIMO}
            >
              <ZoomOut aria-hidden="true" />
              <span className="sr-only">Diminuir zoom</span>
            </Button>
            <span className="tabular min-w-14 text-center text-label text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setZoom((z) => Math.min(ZOOM_MAXIMO, Math.round((z + PASSO_ZOOM) * 100) / 100))}
              disabled={zoom >= ZOOM_MAXIMO}
            >
              <ZoomIn aria-hidden="true" />
              <span className="sr-only">Aumentar zoom</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => setZoom(1)}>
              <Maximize2 aria-hidden="true" />
              Ajustar à tela
            </Button>
            <Button type="button" variant="outline" onClick={() => setRotacao((r) => (r + 90) % 360)}> {/* tokens-ok: graus de rotação, não HORAS_EXIGIDAS */}
              <RotateCw aria-hidden="true" />
              Girar
            </Button>
            <a href={url} download={comprovante.nome} className={buttonVariants({ variant: "outline", className: "ml-auto" })}>
              <Download aria-hidden="true" />
              Baixar
            </a>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-lg bg-muted p-4">
            {ehImagem ? (
              // eslint-disable-next-line @next/next/no-img-element -- mesma URL de blob/objeto da miniatura acima.
              <img
                src={url}
                alt={alt}
                onError={onFalhaAoExibir}
                className="max-h-[60vh] max-w-full object-contain transition-transform"
                style={{ transform: `scale(${zoom}) rotate(${rotacao}deg)` }}
              />
            ) : (
              <embed
                src={url}
                type="application/pdf"
                aria-label={alt}
                className="h-[60vh] w-full transition-transform"
                style={{ transform: `scale(${zoom}) rotate(${rotacao}deg)` }}
                onError={onFalhaAoExibir}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <p className="max-w-full truncate text-caption text-muted-foreground">{comprovante.nome}</p>
      <p className="tabular text-caption text-muted-foreground">{formatarTamanhoArquivo(comprovante.tamanhoBytes)}</p>
    </div>
  )
}
