import { copyFileSync, mkdirSync, readdirSync } from "node:fs"
const destino = "public/ocr"
mkdirSync(destino, { recursive: true })
copyFileSync("node_modules/tesseract.js/dist/worker.min.js", `${destino}/worker.min.js`)
for (const nome of readdirSync("node_modules/tesseract.js-core")) {
  if (nome.includes("-lstm") && /\.(js|wasm)$/.test(nome)) copyFileSync(`node_modules/tesseract.js-core/${nome}`, `${destino}/${nome}`)
}
copyFileSync("node_modules/@tesseract.js-data/por/4.0.0/por.traineddata.gz", `${destino}/por.traineddata.gz`)
copyFileSync("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", `${destino}/pdf.worker.min.mjs`)
console.log("Recursos locais de OCR preparados.")
