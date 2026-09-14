// app/page.tsx
// Página provisória da etapa 1 (Fundação): confere na tela os tokens, a fonte
// e o foco. É substituída pela tela 01 · Login na etapa 4.

import { CircleCheck, CircleDashed, CircleX, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

const cores = [
  { token: "--primary", classe: "bg-primary", uso: "Ação primária" },
  { token: "--primary-hover", classe: "bg-primary-hover", uso: "Hover da ação primária" },
  { token: "--brand", classe: "bg-brand", uso: "Gráficos e ícones grandes, nunca texto" },
  { token: "--accent-text", classe: "bg-accent-text", uso: "Texto e link laranja" },
  { token: "--accent-soft", classe: "bg-accent-soft", uso: "Fundo suave, item ativo" },
  { token: "--background", classe: "bg-background", uso: "Fundo da página" },
  { token: "--surface", classe: "bg-surface", uso: "Superfície de cards" },
  { token: "--border", classe: "bg-border", uso: "Borda de separação" },
  { token: "--input-border", classe: "bg-input-border", uso: "Borda de campo" },
  { token: "--foreground", classe: "bg-foreground", uso: "Texto" },
  { token: "--muted-foreground", classe: "bg-muted-foreground", uso: "Texto secundário" },
  { token: "--muted", classe: "bg-muted", uso: "Skeleton" },
  { token: "--overlay", classe: "bg-overlay", uso: "Escurecimento atrás de modal, 50 %" },
];

const status = [
  { rotulo: "Validada", Icone: CircleCheck, classe: "bg-success-bg text-success" },
  { rotulo: "Em análise", Icone: Clock, classe: "bg-review-bg text-review" },
  { rotulo: "Pendente de envio", Icone: CircleDashed, classe: "bg-pending-bg text-pending" },
  { rotulo: "Recusada", Icone: CircleX, classe: "bg-danger-bg text-danger" },
];

const escala = [
  { classe: "text-h1", texto: "Título 1 · 32/700" },
  { classe: "text-h2", texto: "Título 2 · 24/700" },
  { classe: "text-h3", texto: "Título 3 · 20/500" },
  { classe: "text-body", texto: "Corpo · 16/400, altura de linha 1,5" },
  { classe: "text-label", texto: "Label · 14/500" },
  { classe: "text-caption text-muted-foreground", texto: "Legenda · 12/400, texto secundário" },
];

export default function Fundacao() {
  return (
    <main className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <header>
        <h1>Fundação visual</h1>
        <p className="mt-2 leading-secondary text-muted-foreground">
          Tokens de cor, tipografia e foco que todas as telas vão usar.
        </p>
      </header>

      <section aria-labelledby="titulo-cores" className="mt-8">
        <h2 id="titulo-cores">Cores</h2>
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cores.map(({ token, classe, uso }) => (
            <li
              key={token}
              className="flex items-center gap-4 rounded-lg border bg-surface p-4"
            >
              <span
                aria-hidden="true"
                className={`size-12 shrink-0 rounded-lg border ${classe}`}
              />
              <span className="flex min-w-0 flex-col">
                <code className="text-label break-all">{token}</code>
                <span className="text-caption text-muted-foreground">{uso}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-status" className="mt-8">
        <h2 id="titulo-status">Status</h2>
        <p className="mt-2 leading-secondary text-muted-foreground">
          Sempre cor, ícone e texto juntos. Nenhum status usa laranja.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {status.map(({ rotulo, Icone, classe }) => (
            <li
              key={rotulo}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-label ${classe}`}
            >
              <Icone aria-hidden="true" className="size-4" />
              {rotulo}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-tipografia" className="mt-8">
        <h2 id="titulo-tipografia">Tipografia</h2>
        <ul className="mt-4 flex flex-col gap-4 rounded-lg border bg-surface p-6">
          {escala.map(({ classe, texto }) => (
            <li key={texto} className={classe}>
              {texto}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-foco" className="mt-8">
        <h2 id="titulo-foco">Foco e ações</h2>
        <p className="mt-2 leading-secondary text-muted-foreground">
          Navegue com Tab: o foco aparece como contorno de 2 px com folga de 2 px.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Button>Ação primária</Button>
          <Button variant="outline">Ação secundária</Button>
          <Button variant="link">Link de texto</Button>
        </div>
      </section>
    </main>
  );
}
