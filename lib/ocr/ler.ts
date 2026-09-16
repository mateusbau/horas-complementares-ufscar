import type { Worker } from "tesseract.js"

export async function lerCertificado(arquivo: File, signal: AbortSignal, progresso: (texto: string) => void): Promise<string> {
  let worker: Worker | undefined
  let destruirPDF: (() => Promise<void>) | undefined
  const cancelar = () => { void worker?.terminate(); void destruirPDF?.() }
  signal.addEventListener("abort", cancelar, { once: true })
  const verificar = () => signal.throwIfAborted()
  async function aguardar<T>(promessa: Promise<T>): Promise<T> {
    verificar()
    let abortar: () => void = () => {}
    try {
      return await Promise.race([promessa, new Promise<never>((_, rejeitar) => {
        abortar = () => rejeitar(new DOMException("Leitura cancelada", "AbortError"))
        signal.addEventListener("abort", abortar, { once: true })
      })])
    } finally { signal.removeEventListener("abort", abortar) }
  }
  async function reconhecer(imagem: File | HTMLCanvasElement) {
    verificar()
    if (!worker) {
      progresso("Preparando leitura em português…")
      const { createWorker } = await import("tesseract.js")
      verificar()
      const criacao = createWorker("por", 1, {
        workerPath: "/ocr/worker.min.js", corePath: "/ocr", langPath: "/ocr",
        cacheMethod: "none", workerBlobURL: false,
        logger: (m) => { if (!signal.aborted && m.status === "recognizing text") progresso(`Lendo texto: ${Math.round(m.progress * 100)}%.`) },
      }).then((criado) => {
        if (signal.aborted) void criado.terminate()
        return criado
      })
      worker = await aguardar(criacao)
      verificar()
    }
    return (await aguardar(worker.recognize(imagem))).data.text
  }
  try {
    verificar()
    if (arquivo.size > 10 * 1024 * 1024) throw new Error("Escolha um arquivo de até 10 MB.")
    if (!/\.(pdf|png|jpe?g)$/i.test(arquivo.name)) throw new Error("Escolha um PDF, JPG ou PNG.")
    if (!/\.pdf$/i.test(arquivo.name)) return await reconhecer(arquivo)
    const pdfjs = await import("pdfjs-dist")
    verificar()
    pdfjs.GlobalWorkerOptions.workerSrc = "/ocr/pdf.worker.min.mjs"
    const tarefa = pdfjs.getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) })
    destruirPDF = () => tarefa.destroy()
    verificar()
    const pdf = await tarefa.promise
    if (pdf.numPages > 5) throw new Error("A leitura aceita até 5 páginas. Separe o certificado ou preencha manualmente.")
    const textos: string[] = []
    for (let numero = 1; numero <= pdf.numPages; numero++) {
      verificar()
      progresso(`Lendo página ${numero} de ${pdf.numPages}…`)
      const pagina = await pdf.getPage(numero)
      const conteudo = await pagina.getTextContent()
      let texto = conteudo.items.map((item) => "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "").join("")
      if (texto.replace(/\s/g, "").length < 40) {
        const base = pagina.getViewport({ scale: 1 })
        const viewport = pagina.getViewport({ scale: Math.min(2, Math.sqrt(4000000 / (base.width * base.height))) })
        const canvas = document.createElement("canvas")
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        try {
          await pagina.render({ canvas, viewport }).promise
          texto = await reconhecer(canvas)
        } finally { canvas.width = 0; canvas.height = 0 }
      }
      textos.push(texto)
      pagina.cleanup()
    }
    verificar()
    return textos.join("\n")
  } finally {
    signal.removeEventListener("abort", cancelar)
    await worker?.terminate()
    await destruirPDF?.()
  }
}
