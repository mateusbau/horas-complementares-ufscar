// lib/comprovantes-db.ts
//
// IndexedDB só para os blobs dos comprovantes enviados pelo formulário — não
// no armazenamento de chave e valor que lib/storage.ts usa para o resto do
// estado: a cota por origem lá é ~5 MB, e uma única imagem já lançaria
// QuotaExceededError e derrubaria o app no meio da demonstração. Este módulo
// é só o acesso bruto ao banco (abrir, gravar, ler, remover um blob por id);
// as regras (processar a imagem, gerar o id, decidir quando é um arquivo
// público da demonstração) ficam em lib/storage.ts, que é o único lugar que
// importa este arquivo — nenhum componente fala com IndexedDB direto, pelo
// mesmo princípio que já vale para o resto do armazenamento.

const NOME_BANCO = "horas-complementares:comprovantes"
const VERSAO_BANCO = 1
const NOME_LOJA = "blobs"

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(NOME_BANCO, VERSAO_BANCO)
    pedido.onupgradeneeded = () => {
      if (!pedido.result.objectStoreNames.contains(NOME_LOJA)) {
        pedido.result.createObjectStore(NOME_LOJA)
      }
    }
    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error ?? new Error("Não foi possível abrir o banco de comprovantes."))
  })
}

export async function gravarBlob(id: string, blob: Blob): Promise<void> {
  const banco = await abrirBanco()
  try {
    await new Promise<void>((resolve, reject) => {
      const transacao = banco.transaction(NOME_LOJA, "readwrite")
      transacao.objectStore(NOME_LOJA).put(blob, id)
      transacao.oncomplete = () => resolve()
      transacao.onerror = () => reject(transacao.error ?? new Error("Não foi possível gravar o comprovante."))
    })
  } finally {
    banco.close()
  }
}

/** `null` quando o id não existe — nunca lança por isso (o blob pode ter sido limpo do navegador). */
export async function lerBlob(id: string): Promise<Blob | null> {
  const banco = await abrirBanco()
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const transacao = banco.transaction(NOME_LOJA, "readonly")
      const pedido = transacao.objectStore(NOME_LOJA).get(id)
      pedido.onsuccess = () => resolve((pedido.result as Blob | undefined) ?? null)
      pedido.onerror = () => reject(pedido.error ?? new Error("Não foi possível ler o comprovante."))
    })
  } finally {
    banco.close()
  }
}

export async function removerBlob(id: string): Promise<void> {
  const banco = await abrirBanco()
  try {
    await new Promise<void>((resolve, reject) => {
      const transacao = banco.transaction(NOME_LOJA, "readwrite")
      transacao.objectStore(NOME_LOJA).delete(id)
      transacao.oncomplete = () => resolve()
      transacao.onerror = () => reject(transacao.error ?? new Error("Não foi possível remover o comprovante."))
    })
  } finally {
    banco.close()
  }
}
