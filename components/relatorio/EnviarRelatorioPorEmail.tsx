"use client"

import { Mail } from "lucide-react"
import { useRef, useState } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { Campo } from "@/components/formulario/Campo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { criarLinkDeEmail } from "@/lib/email"

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function EnviarRelatorioPorEmail({
  destinatarioInicial = "",
  assunto,
  mensagem,
  rotulo = "Enviar por e-mail",
  desabilitado = false,
  ariaDescribedbyGatilho,
}: {
  /** Endereço sugerido a partir do nome (ver aviso no campo) — nunca disparado sem revisão. */
  destinatarioInicial?: string
  assunto: string
  mensagem: string
  rotulo?: string
  desabilitado?: boolean
  ariaDescribedbyGatilho?: string
}) {
  const anunciar = useAnunciar()
  const gatilhoRef = useRef<HTMLButtonElement>(null)
  const campoRef = useRef<HTMLInputElement>(null)
  const [aberto, setAberto] = useState(false)
  const [destinatario, setDestinatario] = useState(destinatarioInicial)
  const [erro, setErro] = useState<string | null>(null)

  function abrir() {
    setDestinatario(destinatarioInicial)
    setErro(null)
    setAberto(true)
  }

  function enviar() {
    const email = destinatario.trim()
    if (!emailValido(email)) {
      setErro("Informe um endereço de e-mail válido.")
      campoRef.current?.focus()
      return
    }
    setAberto(false)
    anunciar("O aplicativo de e-mail foi aberto. Anexe o PDF do relatório antes de enviar.")
    window.location.assign(criarLinkDeEmail(email, assunto, mensagem))
  }

  return (
    <>
      <Button
        ref={gatilhoRef}
        variant="outline"
        onClick={abrir}
        disabled={desabilitado}
        aria-describedby={desabilitado ? ariaDescribedbyGatilho : undefined}
      >
        <Mail aria-hidden="true" />
        {rotulo}
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent initialFocus={campoRef} finalFocus={() => gatilhoRef.current ?? undefined}>
          <DialogHeader>
            <DialogTitle>Enviar relatório por e-mail</DialogTitle>
            <DialogDescription>
              O seu aplicativo de e-mail abrirá com uma mensagem pronta. Salve o relatório em PDF e anexe-o antes de enviar.
            </DialogDescription>
          </DialogHeader>

          <Campo
            id="destinatario-relatorio"
            rotulo="Destinatário"
            obrigatorio
            apoio={
              destinatarioInicial
                ? "Endereço sugerido a partir do nome do orientador — pode não existir. Confira antes de enviar."
                : "Informe o e-mail de quem vai receber o relatório."
            }
            erro={erro}
          >
            {(atributos) => (
              <Input
                {...atributos}
                ref={campoRef}
                type="email"
                autoComplete="email"
                value={destinatario}
                onChange={(evento) => {
                  setDestinatario(evento.target.value)
                  if (erro) setErro(null)
                }}
                onBlur={() => {
                  if (destinatario.trim() && !emailValido(destinatario.trim())) setErro("Informe um endereço de e-mail válido.")
                }}
              />
            )}
          </Campo>

          <div className="flex flex-col gap-2 rounded-lg border bg-muted p-4">
            <span className="text-label text-foreground">Assunto</span>
            <span className="text-body">{assunto}</span>
            <span className="text-label text-muted-foreground">A mensagem traz um resumo do relatório. O PDF não é anexado automaticamente.</span>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={enviar}>Abrir e-mail</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
