"use client"

// components/formulario/CampoComprovante.tsx
//
// Área de arrastar e soltar, mas o arraste é só conveniência: o botão
// "Selecionar arquivo" aciona um <input type="file"> oculto, e é o único
// caminho garantido por teclado. Tipo e tamanho são checados aqui (não é
// regra de crédito, não entra em lib/calculos.ts).

import { CircleAlert, Paperclip, Upload, X } from "lucide-react"
import { useRef, useState, type RefObject } from "react"

import { Button } from "@/components/ui/button"
import { formatarTamanhoArquivo } from "@/lib/formatacao"
import type { Comprovante } from "@/lib/types"
import { cn } from "@/lib/utils"

const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024
const EXTENSOES_ACEITAS = [".pdf", ".jpg", ".jpeg", ".png"]

function extensaoAceita(nome: string): boolean {
  const nomeMin = nome.toLowerCase()
  return EXTENSOES_ACEITAS.some((ext) => nomeMin.endsWith(ext))
}

export function CampoComprovante({
  id,
  rotulo,
  obrigatorio = false,
  comprovante,
  onEscolher,
  onRemover,
  apoio,
  erro,
  botaoRef,
}: {
  id: string
  rotulo: string
  obrigatorio?: boolean
  comprovante: Comprovante | null
  onEscolher: (comprovante: Comprovante) => void
  onRemover: () => void
  /** Texto da coluna "Tipo de comprovante" do tipo escolhido, ou o genérico antes de escolher. */
  apoio: string
  erro?: string | null
  botaoRef?: RefObject<HTMLButtonElement | null>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [arrastando, setArrastando] = useState(false)
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const idRotulo = `${id}-rotulo`
  const idApoio = `${id}-apoio`
  const idErro = `${id}-erro`
  const erroExibido = erro ?? erroLocal

  function processar(arquivo: File) {
    if (!extensaoAceita(arquivo.name)) {
      setErroLocal("Arquivo em formato não aceito. Envie um PDF, JPG ou PNG.")
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      setErroLocal("Arquivo maior que 10 MB. Envie um arquivo menor.")
      return
    }
    setErroLocal(null)
    onEscolher({ nome: arquivo.name, tamanhoBytes: arquivo.size, tipoMime: arquivo.type })
  }

  const rotuloCompleto = (
    <span id={idRotulo} className="text-label text-foreground">
      {rotulo}
      {obrigatorio && <span className="font-normal text-muted-foreground"> · obrigatório</span>}
    </span>
  )

  if (comprovante) {
    return (
      <div className="flex flex-col gap-2">
        {rotuloCompleto}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-input-border bg-surface p-4">
          <span className="flex min-w-0 items-center gap-2">
            <Paperclip aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate text-body">
              {comprovante.nome} · {formatarTamanhoArquivo(comprovante.tamanhoBytes)}
            </span>
          </span>
          <Button type="button" variant="ghost" size="icon" onClick={onRemover}>
            <X aria-hidden="true" />
            <span className="sr-only">Remover comprovante</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {rotuloCompleto}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArrastando(false)
          const arquivo = e.dataTransfer.files[0]
          if (arquivo) processar(arquivo)
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          arrastando ? "border-primary bg-accent-soft" : "border-input-border bg-surface"
        )}
      >
        <Upload aria-hidden="true" className="size-6 text-muted-foreground" />
        <p className="text-body">Arraste o arquivo ou selecione no computador</p>
        <p id={idApoio} className="text-caption leading-secondary text-muted-foreground">
          {apoio}
        </p>
        <Button ref={botaoRef} type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          Selecionar arquivo
        </Button>
        <input
          ref={inputRef}
          id={id}
          type="file"
          tabIndex={-1}
          accept={EXTENSOES_ACEITAS.join(",")}
          className="sr-only"
          aria-labelledby={idRotulo}
          aria-describedby={erroExibido ? `${idApoio} ${idErro}` : idApoio}
          onChange={(e) => {
            const arquivo = e.target.files?.[0]
            if (arquivo) processar(arquivo)
            e.target.value = ""
          }}
        />
      </div>
      {erroExibido && (
        <p id={idErro} className="flex items-start gap-2 text-label text-danger">
          <span className="flex h-[1.45em] shrink-0 items-center">
            <CircleAlert aria-hidden="true" className="size-4" />
          </span>
          {erroExibido}
        </p>
      )}
    </div>
  )
}
