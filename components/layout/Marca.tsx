// components/layout/Marca.tsx
//
// Marca do sistema: só a logo institucional da UFSCar (public/ufscar-logo.png,
// import estático — o Next lê a proporção real do arquivo, então largura
// automática nunca distorce), sem o nome do sistema ao lado. Sem nome de
// equipe: a avaliação é anônima.
//
// O nome acessível do sistema ("Horas Complementares — UFSCar Sorocaba") não
// desapareceu com o texto: virou o aria-label do link, então quem usa leitor
// de tela continua ouvindo o mesmo nome ao tabular até aqui. A imagem em si
// leva alt="" (decorativa dentro do link) para não duplicar o anúncio.
//
// Alto contraste: o PNG não muda de cor com a preferência (é raster, não
// token). Como a superfície da barra lateral também não muda de cor nesse
// modo, o logo por si só continua legível; ainda assim, um contorno e um
// leve fundo aparecem só quando `.alto-contraste` está ativo (variante
// arbitrária, escopada ao componente — não é um token novo em
// app/globals.css, porque é um uso único, não reaproveitado em outro
// lugar), para reforçar a separação também numa imagem que a preferência
// não alcança.

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import ufscarLogo from "@/public/ufscar-logo.png"

export function Marca({
  href,
  /** Largura da imagem; a altura acompanha a proporção real do arquivo. */
  largura = "w-40",
  className,
}: {
  href: string
  largura?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label="Horas Complementares — UFSCar Sorocaba"
      className={cn("inline-flex w-fit items-center rounded-md transition-opacity hover:opacity-80", className)}
    >
      <span className="rounded-md [html.alto-contraste_&]:bg-surface [html.alto-contraste_&]:p-1 [html.alto-contraste_&]:ring-1 [html.alto-contraste_&]:ring-foreground">
        <Image src={ufscarLogo} alt="" className={cn("h-auto", largura)} />
      </span>
    </Link>
  )
}
