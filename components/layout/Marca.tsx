// components/layout/Marca.tsx
//
// Marca do sistema: logo institucional da UFSCar (public/ufscar-logo.png,
// import estático — o Next lê a proporção real do arquivo, então largura
// automática nunca distorce) e nome. Sem nome de equipe: a avaliação é
// anônima.
//
// "Sorocaba" na segunda linha, não "UFSCar Sorocaba": o logo já traz o
// wordmark "UFSCar" por extenso, e a segunda linha existe para dizer *qual
// campus* — repetir a sigla ali seria redundância visual.
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

import { cn } from "@/lib/utils"
import ufscarLogo from "@/public/ufscar-logo.png"

export function Marca({ compacta = false, className }: { compacta?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="shrink-0 rounded-md [html.alto-contraste_&]:bg-surface [html.alto-contraste_&]:p-1 [html.alto-contraste_&]:ring-1 [html.alto-contraste_&]:ring-foreground">
        {/*
          h-10 (40 px), não os ~32 px pedidos originalmente: o arquivo tem
          bastante espaço transparente acima do wordmark (para a órbita e a
          esfera), então a 32 px o traço do "ufscar" fica fino demais para
          ler — confirmado só depois de olhar a captura, não no código.
        */}
        <Image src={ufscarLogo} alt="Universidade Federal de São Carlos" className="h-10 w-auto" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-label font-bold text-foreground">Horas Complementares</span>
        {!compacta && <span className="text-caption leading-secondary text-muted-foreground">Sorocaba</span>}
      </span>
    </div>
  )
}
