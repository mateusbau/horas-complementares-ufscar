import assert from "node:assert/strict"
import { criarLinkDeEmail, emailInstitucionalDiscente, emailInstitucionalDocente } from "../lib/email.ts"

assert.equal(emailInstitucionalDiscente({ ra: "811902" }), "811902@estudante.ufscar.br")
assert.equal(emailInstitucionalDocente({ nome: "Prof.ª Renata Marques" }), "renata.marques@ufscar.br")
assert.equal(emailInstitucionalDocente({ nome: "Prof. João Vitor" }), "joao.vitor@ufscar.br")

const link = criarLinkDeEmail("destino@ufscar.br", "Relatório & créditos", "Olá,\nPDF em anexo.")
assert.equal(
  link,
  "mailto:destino%40ufscar.br?subject=Relat%C3%B3rio%20%26%20cr%C3%A9ditos&body=Ol%C3%A1%2C%0APDF%20em%20anexo."
)
console.log("E-mail: 4 verificações de endereço e composição do link passaram.")
