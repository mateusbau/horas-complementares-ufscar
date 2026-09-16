"use client"

// components/entrada/EsqueciSenha.tsx
//
// "Esqueci minha senha" abre uma explicação em vez de levar a uma página que
// não existe no protótipo. É um botão (abre algo), com aparência de link.

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function EsqueciSenha() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" className="self-start px-0" />}>
        Esqueci minha senha
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Esqueci minha senha</DialogTitle>
          <DialogDescription>
            A senha é a do seu acesso institucional da UFSCar. Para recuperá-la, procure a Secretaria
            de Coordenação de Curso · SeCoT XVIII. Nesta demonstração, use “Entrar como visitante”.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
