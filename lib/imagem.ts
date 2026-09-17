// lib/imagem.ts
//
// Redimensiona e comprime uma imagem antes de enviar ao Supabase Storage, no envio
// do comprovante (lib/storage.ts, salvarComprovante): lado maior no alvo
// dado, exportada como JPEG na qualidade dada. Só roda no navegador (usa
// FileReader, Image e canvas). PDFs não passam por aqui — o storage grava o
// blob original, sem processar.

/** Redimensiona (sem ampliar) e recomprime uma imagem via canvas, devolvendo um blob JPEG. */
export function redimensionarImagem(arquivo: File, ladoMaiorAlvo: number, qualidade: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."))
    leitor.onload = () => {
      const imagem = new Image()
      imagem.onerror = () => reject(new Error("Não foi possível ler a imagem."))
      imagem.onload = () => {
        const escala = Math.min(1, ladoMaiorAlvo / Math.max(imagem.naturalWidth, imagem.naturalHeight))
        const largura = Math.max(1, Math.round(imagem.naturalWidth * escala))
        const altura = Math.max(1, Math.round(imagem.naturalHeight * escala))

        const tela = document.createElement("canvas")
        tela.width = largura
        tela.height = altura
        const contexto = tela.getContext("2d")
        if (!contexto) {
          reject(new Error("Não foi possível preparar a imagem para envio."))
          return
        }
        // Fundo branco antes de desenhar: PNG com transparência viraria preto
        // ao exportar como JPEG (que não tem canal alfa), sem isso.
        contexto.fillStyle = "white"
        contexto.fillRect(0, 0, largura, altura)
        contexto.drawImage(imagem, 0, 0, largura, altura)

        tela.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível comprimir a imagem."))),
          "image/jpeg",
          qualidade
        )
      }
      imagem.src = leitor.result as string
    }
    leitor.readAsDataURL(arquivo)
  })
}
