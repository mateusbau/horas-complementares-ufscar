"use client"

// components/entrada/FormularioEntrada.tsx
//
// Tela 01: perfil de acesso, campos institucionais e os dois caminhos de
// entrada. O acesso institucional é simulado (não há autenticação real); o
// caminho da banca é "Entrar como visitante", que não exige os campos e
// funciona em um clique.
//
// Acessibilidade:
// - perfil como grupo de rádios nativos: Tab entra no grupo, setas trocam a
//   opção; o foco aparece no cartão inteiro;
// - validação ao sair do campo (onBlur), nunca a cada tecla;
// - ao enviar com erro, o foco vai ao primeiro campo inválido e o resumo é
//   anunciado na região aria-live.

import { Circle, CircleDot, ClipboardCheck, UserRound, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, type FocusEvent, type FormEvent } from "react"

import { EsqueciSenha } from "@/components/entrada/EsqueciSenha"
import { useAnunciar } from "@/components/feedback/RegiaoAoVivo"
import { Campo } from "@/components/formulario/Campo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { INICIO_DO_PERFIL } from "@/lib/rotas"
import { iniciarSessao } from "@/lib/storage"
import type { ModoEntrada, Perfil } from "@/lib/types"
import { cn } from "@/lib/utils"

const PERFIS: { valor: Perfil; nome: string; descricao: string; icone: LucideIcon }[] = [
  {
    valor: "discente",
    nome: "Discente",
    descricao: "Registre atividades e acompanhe seus créditos.",
    icone: UserRound,
  },
  {
    valor: "docente",
    nome: "Docente",
    descricao: "Valide atividades e acompanhe seus orientandos.",
    icone: ClipboardCheck,
  },
]

type CampoTexto = "usuario" | "senha"

const MENSAGENS: Record<CampoTexto, string> = {
  usuario: "Informe seu número UFSCar ou e-mail institucional.",
  senha: "Informe sua senha.",
}

export function FormularioEntrada() {
  const router = useRouter()
  const anunciar = useAnunciar()
  const [perfil, setPerfil] = useState<Perfil>("discente")
  const [valores, setValores] = useState<Record<CampoTexto, string>>({ usuario: "", senha: "" })
  const [erros, setErros] = useState<Partial<Record<CampoTexto, string>>>({})
  const [editados, setEditados] = useState<Record<CampoTexto, boolean>>({ usuario: false, senha: false })
  const [entrando, setEntrando] = useState<ModoEntrada | null>(null)
  const refs = { usuario: useRef<HTMLInputElement>(null), senha: useRef<HTMLInputElement>(null) }

  function validar(campo: CampoTexto, valor: string): string | undefined {
    return valor.trim() ? undefined : MENSAGENS[campo]
  }

  /**
   * Validação ao sair do campo, com duas exceções que evitam erro prematuro e
   * clique perdido (o envio valida tudo de qualquer forma):
   * - campo nunca editado: atravessá-lo com Tab não é engano do usuário;
   * - foco indo para um botão do formulário: o erro apareceria no mousedown,
   *   empurraria o botão para baixo e o clique cairia fora dele.
   */
  function aoSair(campo: CampoTexto, evento: FocusEvent<HTMLInputElement>) {
    if (!editados[campo]) return
    const destino = evento.relatedTarget
    if (destino instanceof HTMLButtonElement && evento.currentTarget.form?.contains(destino)) return
    setErros((atuais) => ({ ...atuais, [campo]: validar(campo, valores[campo]) }))
  }

  function aoDigitar(campo: CampoTexto, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
    if (!editados[campo]) setEditados((e) => ({ ...e, [campo]: true }))
  }

  async function entrar(modo: ModoEntrada) {
    if (entrando) return
    setEntrando(modo)
    try {
      await iniciarSessao(perfil, modo)
      router.push(INICIO_DO_PERFIL[perfil])
    } catch {
      setEntrando(null)
      anunciar("Não foi possível entrar agora. Tente novamente.")
    }
  }

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const novos = {
      usuario: validar("usuario", valores.usuario),
      senha: validar("senha", valores.senha),
    }
    setErros(novos)
    const invalidos = (["usuario", "senha"] as const).filter((campo) => novos[campo])
    if (invalidos.length) {
      refs[invalidos[0]].current?.focus()
      const quantos = invalidos.length === 1 ? "1 campo precisa" : `${invalidos.length} campos precisam`
      anunciar(`Não foi possível entrar: ${quantos} de correção. ${invalidos.map((c) => MENSAGENS[c]).join(" ")}`)
      return
    }
    void entrar("institucional")
  }

  return (
    <form noValidate onSubmit={aoEnviar} className="flex flex-col gap-6">
      <fieldset role="radiogroup" aria-describedby="apoio-perfil" aria-required="true" className="flex flex-col gap-2">
        <legend className="text-label text-foreground">
          Perfil de acesso <span className="font-normal text-muted-foreground">· obrigatório</span>
        </legend>
        <p id="apoio-perfil" className="text-label font-normal leading-secondary text-muted-foreground">
          Selecionado com Tab e setas. O perfil define a navegação após a entrada.
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {PERFIS.map((opcao) => {
            const selecionado = perfil === opcao.valor
            const Icone = opcao.icone
            const Indicador = selecionado ? CircleDot : Circle
            return (
              <label
                key={opcao.valor}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border border-input-border bg-surface p-4 transition-colors hover:bg-muted",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                  "has-checked:border-primary has-checked:bg-accent-soft has-checked:hover:bg-accent-soft"
                )}
              >
                {/* Rádio nativo (Tab e setas de graça); o visual é o cartão e o indicador. */}
                <input
                  type="radio"
                  name="perfil"
                  value={opcao.valor}
                  checked={selecionado}
                  onChange={() => setPerfil(opcao.valor)}
                  className="sr-only"
                />
                {/* h-6 = altura da linha do texto (16 × 1,5): o indicador fica centrado nela. */}
                <span className="flex h-6 shrink-0 items-center">
                  <Indicador aria-hidden="true" className={cn("size-5", selecionado ? "text-primary" : "text-input-border")} />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className={cn("flex items-center gap-2 text-body", selecionado && "font-medium")}>
                    <Icone aria-hidden="true" className="size-5 shrink-0" />
                    {opcao.nome}
                  </span>
                  <span className="text-label font-normal leading-secondary text-muted-foreground">
                    {opcao.descricao}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <Campo id="usuario" rotulo="Número UFSCar ou e-mail institucional" obrigatorio erro={erros.usuario}>
        {(aria) => (
          <Input
            {...aria}
            ref={refs.usuario}
            name="usuario"
            autoComplete="username"
            value={valores.usuario}
            onChange={(e) => aoDigitar("usuario", e.target.value)}
            onBlur={(e) => aoSair("usuario", e)}
          />
        )}
      </Campo>

      <div className="flex flex-col gap-2">
        <Campo id="senha" rotulo="Senha" obrigatorio erro={erros.senha}>
          {(aria) => (
            <Input
              {...aria}
              ref={refs.senha}
              type="password"
              name="senha"
              autoComplete="current-password"
              value={valores.senha}
              onChange={(e) => aoDigitar("senha", e.target.value)}
              onBlur={(e) => aoSair("senha", e)}
            />
          )}
        </Campo>
        <EsqueciSenha />
      </div>

      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg">
          {entrando === "institucional" ? "Entrando…" : "Entrar"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => void entrar("visitante")}>
          {entrando === "visitante" ? "Entrando…" : "Entrar como visitante (dados de demonstração)"}
        </Button>
        <p className="text-caption leading-secondary text-muted-foreground">
          Protótipo: o acesso institucional é simulado. Os dois caminhos abrem os mesmos dados de
          demonstração, no perfil escolhido acima.
        </p>
      </div>
    </form>
  )
}
