// components/catalogo/CatalogoConteudo.tsx
//
// Conteúdo do catálogo (Tabela 7), compartilhado pelas rotas /catalogo
// (discente) e /docente/catalogo — mesmo conteúdo, cada uma com a sidebar do
// próprio perfil (EstruturaPerfil já resolve isso pelo grupo de rotas). Só a
// leitura: nenhuma ação de cadastro aqui.
//
// Agrupado pelos quatro grupos visuais (AVISO_AGRUPAMENTO sempre visível), com
// os textos literais de requisito e comprovante, os créditos e as notas (*) e
// (**) da tabela. Régua do crédito: cada linha mostra o crédito como medida
// principal e a hora só como o requisito da própria linha.

import { Asterisk } from "lucide-react"

import { PageHeader } from "@/components/layout/PageHeader"
import {
  AVISO_AGRUPAMENTO,
  FONTE_TABELA_7,
  GRUPOS,
  NOTA_DUPLA_CONTAGEM,
  NOTA_SEMESTRE_COMPLETO,
  tiposDoGrupo,
} from "@/lib/catalogo"
import { formatarRequisito } from "@/lib/formatacao"

export function CatalogoConteudo() {
  return (
    <>
      <PageHeader
        titulo="Catálogo de atividades"
        subtitulo="Os 19 tipos de atividade complementar previstos na Tabela 7 do Projeto Pedagógico e quanto cada um vale."
      />

      <div className="flex flex-col gap-8">
        <p className="max-w-form leading-secondary text-muted-foreground">{AVISO_AGRUPAMENTO}</p>

        {GRUPOS.map((grupo) => (
          <section key={grupo.id} aria-labelledby={`grupo-${grupo.id}`} className="flex flex-col gap-3">
            <h2 id={`grupo-${grupo.id}`}>{grupo.nome}</h2>

            {/* Desktop: tabela real, a partir de 768 px — mesmo ponto de corte do resto do sistema. */}
            <div className="hidden overflow-x-auto rounded-lg border bg-surface md:block">
              <table className="w-full tabular">
                <thead className="border-b bg-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Tipo
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Requisito da Tabela 7
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-label text-foreground">
                      Comprovante exigido
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tiposDoGrupo(grupo.id).map((tipo) => (
                    <tr key={tipo.id}>
                      <td className="px-4 py-2 text-body">
                        {tipo.nome}
                        {(tipo.vedadaDuplaContagem || tipo.exigeSemestreCompleto) && (
                          <span className="ml-1 text-accent-text" aria-hidden="true">
                            {tipo.vedadaDuplaContagem ? "*" : ""}
                            {tipo.exigeSemestreCompleto ? "**" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-body text-muted-foreground">{formatarRequisito(tipo.id)}</td>
                      <td className="px-4 py-2 text-body text-muted-foreground">{tipo.comprovante}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: lista de cards, abaixo de 768 px — nunca rolagem horizontal. */}
            <ul className="flex flex-col gap-2 md:hidden">
              {tiposDoGrupo(grupo.id).map((tipo) => (
                <li key={tipo.id} className="flex flex-col gap-1 rounded-lg border bg-surface p-4">
                  <span className="text-body font-medium">
                    {tipo.nome}
                    {(tipo.vedadaDuplaContagem || tipo.exigeSemestreCompleto) && (
                      <span className="ml-1 text-accent-text" aria-hidden="true">
                        {tipo.vedadaDuplaContagem ? "*" : ""}
                        {tipo.exigeSemestreCompleto ? "**" : ""}
                      </span>
                    )}
                  </span>
                  <span className="tabular text-label text-muted-foreground">{formatarRequisito(tipo.id)}</span>
                  <span className="text-label text-muted-foreground">{tipo.comprovante}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="titulo-notas" className="flex flex-col gap-3 rounded-lg border bg-accent-soft p-6">
          <h2 id="titulo-notas" className="flex items-center gap-2">
            <Asterisk aria-hidden="true" className="size-5 text-accent-text" />
            Notas da tabela
          </h2>
          <p className="leading-secondary text-foreground">
            <strong className="font-medium">*</strong> — {NOTA_DUPLA_CONTAGEM}
          </p>
          <p className="leading-secondary text-foreground">
            <strong className="font-medium">**</strong> — {NOTA_SEMESTRE_COMPLETO}
          </p>
        </section>

        <footer className="border-t pt-4 text-caption leading-secondary text-muted-foreground">
          Fonte: {FONTE_TABELA_7}.
        </footer>
      </div>
    </>
  )
}
