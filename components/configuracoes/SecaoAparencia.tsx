"use client"

// components/configuracoes/SecaoAparencia.tsx
//
// Tamanho do texto e alto contraste são os MESMOS controles da barra superior
// (BarraAcessibilidade): o estado vem de hooks/use-preferencias.ts, uma única
// fonte — mudar aqui reflete lá, e vice-versa, sem recarregar. Reduzir
// animações e densidade são novos, na mesma fonte. Sem modo escuro aqui.
//
// Tamanho do texto e densidade são radiogroup (uma opção exclui a outra);
// alto contraste e reduzir animações são caixas de seleção independentes.

import { Circle, CircleDot } from "lucide-react"
import type { ReactNode } from "react"

import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { Checkbox } from "@/components/ui/checkbox"
import { usePreferencias } from "@/hooks/use-preferencias"
import {
  DENSIDADES,
  TAMANHOS_TEXTO,
  anuncioDePreferencia,
  type Densidade,
  type Preferencias,
  type TamanhoTexto,
} from "@/lib/preferencias"
import { cn } from "@/lib/utils"

function CartaoRadio<T extends string>({
  nome,
  valor,
  selecionado,
  onSelecionar,
  titulo,
  descricao,
}: {
  nome: string
  valor: T
  selecionado: boolean
  onSelecionar: (valor: T) => void
  titulo: ReactNode
  descricao: string
}) {
  const Indicador = selecionado ? CircleDot : Circle
  return (
    <label
      className={cn(
        "flex min-h-target flex-1 cursor-pointer items-start gap-3 rounded-lg border border-input-border bg-surface p-3 transition-colors hover:bg-muted",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
        "has-checked:border-primary has-checked:bg-accent-soft has-checked:hover:bg-accent-soft"
      )}
    >
      <input
        type="radio"
        name={nome}
        checked={selecionado}
        onChange={() => onSelecionar(valor)}
        className="sr-only"
      />
      <span className="flex h-6 shrink-0 items-center">
        <Indicador aria-hidden="true" className={cn("size-5", selecionado ? "text-primary" : "text-input-border")} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className={cn("text-body", selecionado && "font-medium")}>{titulo}</span>
        <span className="text-label leading-secondary text-muted-foreground">{descricao}</span>
      </span>
    </label>
  )
}

export function SecaoAparencia() {
  const { preferencias, mudar } = usePreferencias()
  const anunciar = useAnunciar()

  function aoMudar(parcial: Partial<Preferencias>) {
    const novas = mudar(parcial)
    anunciar(anuncioDePreferencia(preferencias, novas))
  }

  return (
    <section aria-labelledby="titulo-aparencia" className="flex flex-col gap-6 rounded-lg border bg-surface p-6">
      <h2 id="titulo-aparencia">Aparência</h2>

      <fieldset role="radiogroup" className="flex flex-col gap-2">
        <legend className="text-label text-foreground">Tamanho do texto</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          {TAMANHOS_TEXTO.map((tamanho) => (
            <CartaoRadio<TamanhoTexto>
              key={tamanho.valor}
              nome="tamanho-texto"
              valor={tamanho.valor}
              selecionado={preferencias.tamanhoTexto === tamanho.valor}
              onSelecionar={(valor) => aoMudar({ tamanhoTexto: valor })}
              titulo={`${tamanho.simbolo} · ${tamanho.nome}`}
              descricao={tamanho.escala}
            />
          ))}
        </div>
      </fieldset>

      <label className="flex min-h-target cursor-pointer items-start gap-3 rounded-lg border border-input-border bg-surface p-3">
        <Checkbox
          checked={preferencias.altoContraste}
          onChange={(e) => aoMudar({ altoContraste: e.target.checked })}
        />
        <span className="flex flex-col gap-1">
          <span className="text-body text-foreground">Alto contraste</span>
          <span className="text-label leading-secondary text-muted-foreground">
            Bordas e texto secundário mais fortes, sem cor nova.
          </span>
        </span>
      </label>

      <label className="flex min-h-target cursor-pointer items-start gap-3 rounded-lg border border-input-border bg-surface p-3">
        <Checkbox
          checked={preferencias.reduzirAnimacoes}
          onChange={(e) => aoMudar({ reduzirAnimacoes: e.target.checked })}
        />
        <span className="flex flex-col gap-1">
          <span className="text-body text-foreground">Reduzir animações</span>
          <span className="text-label leading-secondary text-muted-foreground">
            Além disto, o sistema já respeita a preferência de movimento reduzido do seu
            dispositivo, quando ativada.
          </span>
        </span>
      </label>

      <fieldset role="radiogroup" className="flex flex-col gap-2">
        <legend className="text-label text-foreground">Densidade da lista</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          {DENSIDADES.map((densidade) => (
            <CartaoRadio<Densidade>
              key={densidade.valor}
              nome="densidade"
              valor={densidade.valor}
              selecionado={preferencias.densidade === densidade.valor}
              onSelecionar={(valor) => aoMudar({ densidade: valor })}
              titulo={densidade.nome}
              descricao={densidade.descricao}
            />
          ))}
        </div>
      </fieldset>
    </section>
  )
}
