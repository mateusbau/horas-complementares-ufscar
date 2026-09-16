"use client"

import { useEffect, useRef, useState } from "react"
import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { extrairDados, type DadosOCR } from "@/lib/ocr/parse"
import { lerCertificado } from "@/lib/ocr/ler"
import { obterArquivoComprovante } from "@/lib/storage"
import type { Comprovante } from "@/lib/types"

const CAMPOS: [keyof DadosOCR, string][] = [
  ["titulo", "Nome da atividade"], ["horas", "Carga horária do certificado"],
  ["categoria", "Categoria escrita no certificado"], ["data", "Início da realização"], ["termino", "Término da realização"],
  ["instituicao", "Instituição emissora"],
]

export function LeituraComprovante({ arquivo, comprovante, aplicar }: { arquivo: File | null; comprovante: Comprovante; aplicar: (dados: DadosOCR) => void }) {
  const anunciar = useAnunciar()
  const controle = useRef<AbortController | null>(null)
  const revisao = useRef<HTMLHeadingElement>(null)
  const botaoLeitura = useRef<HTMLButtonElement>(null)
  const [ocupado, setOcupado] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [texto, setTexto] = useState("")
  const [dados, setDados] = useState<DadosOCR | null>(null)
  const temDados = dados !== null
  useEffect(() => () => controle.current?.abort(), [])
  useEffect(() => { if (temDados) revisao.current?.focus() }, [temDados])

  async function ler() {
    const abort = new AbortController()
    controle.current = abort
    setOcupado(true)
    setDados(null)
    setMensagem("Preparando leitura…")
    anunciar("Leitura iniciada. Você pode cancelar ou continuar preenchendo o formulário.")
    const limite = setTimeout(() => { abort.abort(); setOcupado(false); setMensagem("A leitura demorou demais. Tente novamente ou preencha manualmente."); anunciar("Tempo de leitura esgotado. Preenchimento manual disponível.") }, 120000)
    abort.signal.addEventListener("abort", () => clearTimeout(limite), { once: true })
    try {
      const origem = arquivo ?? await obterArquivoComprovante(comprovante)
      if (abort.signal.aborted) return
      if (!origem) throw new Error("Não foi possível recuperar o arquivo. Selecione o comprovante novamente ou preencha manualmente.")
      const resultado = await lerCertificado(origem, abort.signal, setMensagem)
      if (abort.signal.aborted) return
      if (!resultado.trim()) throw new Error("Nenhum texto encontrado. Use uma imagem nítida ou preencha manualmente.")
      setTexto(resultado)
      setDados(extrairDados(resultado))
      setMensagem("Leitura concluída. Confira os campos e o texto reconhecido; campos incertos ficam vazios.")
      anunciar("Leitura concluída. Revise os dados antes de aplicar.")
    } catch (erro) {
      if (abort.signal.aborted) return
      const mensagem = erro instanceof Error && /até|páginas|Nenhum texto|Escolha|recuperar/.test(erro.message)
        ? erro.message : "Não foi possível ler este arquivo. Verifique se o PDF está sem senha, tente uma imagem nítida ou preencha manualmente."
      setMensagem(mensagem)
      anunciar(mensagem)
    } finally {
      clearTimeout(limite)
      if (controle.current === abort && !abort.signal.aborted) setOcupado(false)
    }
  }

  function confirmar() {
    if (!dados) return
    const horas = dados.horas.trim().replace(",", ".")
    let erro = ""
    let campo = "ocr-horas"
    if (horas && (!/^\d+(?:\.\d+)?$/.test(horas) || !Number.isFinite(Number(horas)) || Number(horas) <= 0)) {
      erro = "Informe uma carga horária positiva ou deixe o campo vazio."
    } else if (Boolean(dados.data) !== Boolean(dados.termino) || dados.termino < dados.data) {
      erro = "Preencha início e término na ordem correta, ou deixe as duas datas vazias."
      campo = "ocr-data"
    }
    if (erro) {
      setMensagem(erro)
      anunciar(erro)
      document.getElementById(campo)?.focus()
      return
    }
    aplicar({ ...dados, horas })
    setDados(null)
    setMensagem("Dados aplicados. Confira o formulário antes de enviar.")
  }

  return (
    <section aria-labelledby="ocr-cabecalho" className="flex flex-col gap-4 rounded-lg border border-input-border bg-surface p-4">
      <h2 id="ocr-cabecalho" className="text-h3">Preencher a partir do comprovante</h2>
      <p className="text-label text-muted-foreground">Leitura opcional neste navegador, sem enviar o certificado a um serviço de OCR. PDF com até 5 páginas, JPG ou PNG. Revise tudo: a leitura pode errar.</p>
      <div className="flex flex-wrap gap-3">
        <Button ref={botaoLeitura} type="button" variant="outline" disabled={ocupado} onClick={() => void ler()}>{ocupado ? "Lendo comprovante…" : "Ler comprovante"}</Button>
        {ocupado && <Button type="button" variant="outline" onClick={() => { controle.current?.abort(); setOcupado(false); setMensagem("Leitura cancelada. Você pode preencher manualmente."); anunciar("Leitura cancelada."); requestAnimationFrame(() => botaoLeitura.current?.focus()) }}>Cancelar leitura</Button>}
      </div>
      {mensagem && <p className="text-label">{mensagem}</p>}
      {dados && <>
        <h3 ref={revisao} tabIndex={-1} className="text-h3">Revisar dados reconhecidos</h3>
        {CAMPOS.map(([chave, rotulo]) => <div key={chave} className="flex flex-col gap-2">
          <label htmlFor={`ocr-${chave}`} className="text-label">{rotulo}</label>
          <Input id={`ocr-${chave}`} type={chave === "data" || chave === "termino" ? "date" : "text"} value={dados[chave]} onChange={(e) => setDados({ ...dados, [chave]: e.target.value })} />
        </div>)}
        <details><summary className="min-h-target cursor-pointer py-3 text-label">Conferir texto reconhecido</summary><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-sans text-label">{texto}</pre></details>
        <p className="text-label text-muted-foreground">Ao confirmar, só os campos vazios serão preenchidos. Instituição, categoria e carga lidas serão acrescentadas às observações para o docente. Escolha o tipo no catálogo; horas inteiras só preenchem tipos medidos em horas. Frações ficam nas observações, sem arredondamento automático. Créditos e confirmações permanecem sob revisão.</p>
        <Button type="button" onClick={confirmar}>Confirmar e preencher campos vazios</Button>
      </>}
    </section>
  )
}
