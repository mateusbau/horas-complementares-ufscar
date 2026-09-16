"use client"

// hooks/use-atalho-tecla.ts
//
// Atalho de uma tecla só (ex.: "?"), global à página. Ignorado com o foco em
// input, textarea ou elemento com contenteditable — senão o aluno digitando
// "Foi difícil?" na descrição de uma atividade acionaria o atalho sem querer.
//
// Compara por `event.key`, nunca por `event.code`: em teclado ABNT2 o "?" é
// Shift+Q ou Shift+/ dependendo do layout, e `code` identifica a tecla física
// (quebra nos dois casos), enquanto `key` já traz o caractere resultante.

import { useEffect } from "react"

function estaEmCampoEditavel(elemento: EventTarget | null): boolean {
  if (!(elemento instanceof HTMLElement)) return false
  return elemento.tagName === "INPUT" || elemento.tagName === "TEXTAREA" || elemento.isContentEditable
}

/** Chama `aoAcionar` quando `tecla` é pressionada fora de um campo editável. */
export function useAtalhoTecla(tecla: string, aoAcionar: () => void) {
  useEffect(() => {
    function ouvinte(evento: KeyboardEvent) {
      if (evento.key !== tecla) return
      if (estaEmCampoEditavel(evento.target)) return
      evento.preventDefault()
      aoAcionar()
    }
    document.addEventListener("keydown", ouvinte)
    return () => document.removeEventListener("keydown", ouvinte)
  }, [tecla, aoAcionar])
}
