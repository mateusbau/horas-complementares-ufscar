import assert from "node:assert/strict"
import { extrairDados } from "../lib/ocr/parse.ts"

const exemplo = extrairDados(`UNIVERSIDADE FEDERAL DE SÃO CARLOS
DISCIPLINA Cálculo II
MODALIDADE Monitoria sem bolsa
PERÍODO DE ATUAÇÃO 27/02/2026 a 26/08/2026 (semestre completo)
CARGA HORÁRIA TOTAL 180 (cento e oitenta) horas
Emitido em 04/09/2026`)
assert.equal(exemplo.horas, "180")
assert.equal(exemplo.titulo, "Monitoria — Cálculo II")
assert.equal(exemplo.data, "2026-02-27")
assert.equal(exemplo.termino, "2026-08-26")
assert.equal(exemplo.instituicao, "UNIVERSIDADE FEDERAL DE SÃO CARLOS")
assert.equal(exemplo.categoria, "Monitoria sem bolsa")
assert.equal(extrairDados("Carga horária: 12,5 horas").horas, "12.5")
assert.equal(extrairDados("Carga horária: 12 horas\nCarga horária: 24 horas").horas, "")
assert.equal(extrairDados("Emitido em 04/09/2026").data, "")
assert.equal(extrairDados("Data da atividade: 31/02/2026").data, "")
assert.equal(extrairDados("Data da atividade: 31/99/2026").data, "")
assert.equal(extrairDados("Data da atividade: 29/02/2024").data, "2024-02-29")
assert.equal(extrairDados("Data da atividade: 29/02/2025").data, "")
assert.equal(extrairDados("Período: 20/09/2026 a 10/09/2026").data, "")
assert.equal(extrairDados("Atividade: A\nAtividade: B").titulo, "")
assert.equal(extrairDados("REGISTRO 180\nCURSO Bacharelado em Ciência de Dados").titulo, "")
assert.equal(extrairDados('Certificamos que participou do curso “Python básico”').titulo, "Python básico")
assert.equal(extrairDados('RA 812901, concluiu o curso “Introdução a Python”').titulo, "Introdução a Python")
assert.equal(extrairDados("modalidade presencial pelo Departamento").categoria, "")
assert.equal(extrairDados("no período de 04/04/2026 a 27/06/2026 ,").termino, "2026-06-27")
console.log("OCR: 20 verificações de extração, ambiguidades e datas passaram.")
