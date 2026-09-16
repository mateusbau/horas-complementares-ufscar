// app/sobre/page.tsx — Etapa 12, última parte: "Sobre este protótipo"
//
// Alcançável do rodapé de toda tela (login e das duas áreas com sidebar).
// Não exige sessão: é informativo, não faz parte do fluxo de uso. Mostra o
// que não dá para ver clicando — escopo, decisões de acessibilidade e a
// fidelidade à Tabela 7 — sem identificar quem construiu.

import type { Metadata } from "next"
import Link from "next/link"

import { VoltarPaginaAnterior } from "@/components/feedback/VoltarPaginaAnterior"
import { ID_CONTEUDO } from "@/components/layout/SkipLink"
import { buttonVariants } from "@/components/ui/button"
import { CREDITOS_EXIGIDOS, HORAS_EXIGIDAS, TIPOS_DISTINTOS_EXIGIDOS } from "@/lib/calculos"
import { FONTE_TABELA_7 } from "@/lib/catalogo"
import { formatarCreditos, formatarHoras, formatarNumero, formatarPremissaCredito } from "@/lib/formatacao"

export const metadata: Metadata = { title: "Sobre este protótipo · Horas Complementares" }

export default function PaginaSobre() {
  return (
    <div className="flex flex-col items-center px-4 py-8 md:py-12">
      <main
        id={ID_CONTEUDO}
        tabIndex={-1}
        className="w-full max-w-form scroll-mt-(--altura-barra) rounded-lg border bg-surface p-4 sm:p-8"
      >
        <h1 className="mb-6">Sobre este protótipo</h1>

        <section aria-labelledby="titulo-escopo" className="mb-8 flex flex-col gap-3">
          <h2 id="titulo-escopo">Escopo</h2>
          <p className="leading-secondary text-muted-foreground">
            Protótipo só de frontend, para um hackathon: sem backend, sem autenticação real e sem
            envio de documentos a serviços de IA. O cadastro oferece leitura automática local (OCR),
            com revisão dos dados antes de aplicar. Os dados vivem no navegador de cada visitante, com um conjunto de
            demonstração pronto no primeiro acesso.
          </p>
          <p className="leading-secondary text-muted-foreground">
            Cobre o percurso completo de horas complementares: o discente cadastra uma atividade
            (com a prévia do cálculo antes de enviar), acompanha a fila pelo status e recebe o
            parecer; o docente vê a fila derivada do status, valida uma atividade por vez — com
            reclassificação e antes/depois — ou em lote, por grupo da Tabela 7; o discente gera,
            a qualquer momento, um relatório imprimível do que já foi validado.
          </p>
        </section>

        <section aria-labelledby="titulo-acessibilidade" className="mb-8 flex flex-col gap-3">
          <h2 id="titulo-acessibilidade">Decisões de acessibilidade</h2>
          <ul className="flex flex-col gap-2 leading-secondary text-muted-foreground">
            <li>
              Todo percurso funciona só com teclado, inclusive a validação em lote: caixas de
              seleção reais (nunca uma linha inteira fazendo às vezes de alvo), estado
              indeterminado no &quot;selecionar todos&quot;, confirmação com foco inicial na opção menos
              arriscada e foco devolvido a um ponto estável depois de aplicar.
            </li>
            <li>
              Status nunca depende só de cor: sempre um ícone e um texto junto. Alto contraste e
              três tamanhos de texto (A−/A/A+) ficam disponíveis em toda tela, persistidos entre
              visitas.
            </li>
            <li>
              Uma única região <code>aria-live</code> anuncia mudanças de preferência e resultados
              de ação, sem repetir avisos nem competir com outros anúncios.
            </li>
            <li>Foco visível de 2 px em todo elemento que recebe teclado, sem exceção.</li>
          </ul>
        </section>

        <section aria-labelledby="titulo-tabela7" className="mb-8 flex flex-col gap-3">
          <h2 id="titulo-tabela7">Fidelidade à Tabela 7</h2>
          <p className="leading-secondary text-muted-foreground">
            A carga horária do certificado não é a que conta: cada tipo da Tabela 7 vale um número
            fixo de créditos, e a integralização exige {formatarCreditos(CREDITOS_EXIGIDOS)} (
            {formatarHoras(HORAS_EXIGIDAS)} contabilizadas) em pelo menos{" "}
            {formatarNumero(TIPOS_DISTINTOS_EXIGIDOS)} tipos diferentes.
          </p>
          <p className="leading-secondary text-muted-foreground">{formatarPremissaCredito()}</p>
          <p className="text-caption leading-secondary text-muted-foreground">
            Fonte: {FONTE_TABELA_7}. O fator de conversão entre hora e crédito segue a definição de
            crédito da matriz curricular; a confirmação com a coordenação do curso segue pendente.
          </p>
        </section>

        <section aria-labelledby="titulo-avaliacao" className="mb-8 flex flex-col gap-3">
          <h2 id="titulo-avaliacao">Avaliação anônima</h2>
          <p className="leading-secondary text-muted-foreground">
            Esta demonstração não identifica quem a construiu — nenhum nome de integrante ou de
            equipe aparece na interface, no título das páginas ou nos metadados do projeto.
          </p>
        </section>

        <div className="flex flex-wrap gap-4">
          <VoltarPaginaAnterior />
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Ir para a tela de entrada
          </Link>
        </div>
      </main>
    </div>
  )
}
