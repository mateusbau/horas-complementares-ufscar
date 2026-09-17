import type { Metadata } from "next"
import Link from "next/link"

import { VoltarPaginaAnterior } from "@/components/feedback/VoltarPaginaAnterior"
import { ID_CONTEUDO, ID_RODAPE } from "@/components/layout/SkipLink"
import { buttonVariants } from "@/components/ui/button"
import { CREDITOS_EXIGIDOS, HORAS_EXIGIDAS } from "@/lib/calculos"
import { formatarCreditos, formatarHoras } from "@/lib/formatacao"

export const metadata: Metadata = { title: "Sobre este projeto · Horas Complementares" }

const SECAO = "mb-8 flex flex-col gap-3"
const TEXTO = "leading-secondary text-muted-foreground"
const CARTOES = "grid gap-3 sm:grid-cols-2"
const CARTAO = "rounded-lg border bg-surface p-4 leading-secondary text-muted-foreground"
const CELULA = "border-b px-4 py-3 text-left align-top leading-secondary"

export default function PaginaSobre() {
  return (
    <div className="flex flex-col items-center px-4 py-8 md:py-12">
      <main id={ID_CONTEUDO} tabIndex={-1} className="w-full max-w-form scroll-mt-(--altura-barra) rounded-lg border bg-surface p-4 sm:p-8">
        <h1 className="mb-6">Sobre este projeto</h1>

        <section aria-labelledby="titulo-sistema" className={SECAO}>
          <h2 id="titulo-sistema">Sistema de Gestão de Horas Complementares</h2>
          <p className="font-medium text-foreground">BCDIA — UFSCar Sorocaba · Hackathon SeCoT XVIII</p>
          <p className={TEXTO}>Hoje as horas complementares do curso são geridas no papel. O aluno guarda certificados numa pasta, não sabe quanto do que fez já conta, e não existe fluxo digital de envio nem de validação. O docente recebe comprovantes soltos, sem histórico consolidado e sem visão da turma.</p>
          <p className={TEXTO}>Este não é um conjunto de telas: é uma aplicação que funciona. Os dois perfis estão implementados, os cálculos são reais, os relatórios saem, os comprovantes são lidos na hora, o e-mail sai pronto pra enviar — tudo pela aplicação, enquanto você avalia. Nada aqui é maquete.</p>
        </section>

        <section aria-labelledby="titulo-diferencial" className={SECAO}>
          <h2 id="titulo-diferencial">O que nos diferencia: o sistema é baseado no PPC do curso, não em um modelo genérico de horas</h2>
          <p className={TEXTO}>A maior parte do trabalho não está na interface. Está na regra — e a regra não é uma convenção nossa, é o <strong className="font-medium text-foreground">Projeto Pedagógico do Curso (PPC) do Bacharelado em Ciência de Dados e Inteligência Artificial (BCDIA)</strong>, lido por inteiro antes de desenhar qualquer tela.</p>
          <p className={TEXTO}>Fomos ler o PPC. A <strong className="font-medium text-foreground">Tabela 7</strong> não é um contador de horas somadas: a unidade da matriz é o <strong className="font-medium text-foreground">crédito</strong>, cada tipo de atividade vale de 1 a 3 créditos, e a carga horária da tabela é o <strong className="font-medium text-foreground">requisito</strong> para obter aquele crédito — nunca um valor que se acumula. A conversão crédito → hora também não é arbitrária: vem da <strong className="font-medium text-foreground">Tabela 4</strong> do PPC, que define o crédito da matriz curricular. São exigidos {formatarCreditos(CREDITOS_EXIGIDOS)} ({formatarHoras(HORAS_EXIGIDAS)}) e, pela seção 3.5.4, atividades de pelo menos <strong className="font-medium text-foreground">dois tipos distintos</strong>.</p>
          <p className={TEXTO}><strong className="font-medium text-foreground">Exemplo:</strong> 180 horas de monitoria em um semestre completo valem 3 créditos. Não 180 horas somadas.</p>
          <p className={TEXTO}>Nosso primeiro modelo tinha 200 horas divididas em Ensino, Pesquisa e Extensão, com teto por categoria. Estava construído e era mais fácil de visualizar. Foi descartado no segundo dia, porque não é o que o PPC diz.</p>
          <p className={TEXTO}>O sistema valida, no momento do cadastro:</p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>tipo de atividade não previsto na Tabela 7;</li>
            <li>vedação de dupla contagem (itens com asterisco);</li>
            <li>monitoria contabilizada apenas com o semestre completo (duplo asterisco).</li>
          </ul>
          <p className={TEXTO}>As regras vivem como dado puro, fora dos componentes, com as citações do PPC registradas no repositório — e é exatamente por serem dado, e não lógica espalhada pela interface, que dá pra trocar de curso sem reescrever o sistema (ver &quot;Próximos passos&quot;).</p>
        </section>

        <section aria-labelledby="titulo-funcionalidades" className={SECAO}>
          <h2 id="titulo-funcionalidades">Funcionalidades</h2>
          <h3>Discente</h3>
          <ul className={CARTOES}>
            <li className={CARTAO}><strong className="font-medium text-foreground">Envio pelo comprovante, não pelo formulário — e isso funciona de verdade.</strong> Você anexa o certificado em PDF ou imagem, o OCR roda no próprio navegador (Tesseract.js + pdfjs-dist, sem enviar o arquivo a um serviço de OCR) e o formulário chega pré-preenchido para revisão. Ao salvar, o comprovante é enviado ao Supabase Storage.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">O arquivo fica guardado.</strong> Comprovantes persistem no Supabase Storage e podem ser reabertos no visualizador interno, inclusive em outro navegador.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Painel de integralização.</strong> Anel de créditos com legenda por situação e checklist das exigências do PPC — inclusive a dos dois tipos distintos.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Sugestões para integralização</strong> com linhas clicáveis que já abrem o formulário no tipo escolhido.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Relatório pronto para entregar.</strong> Filtros por período e por tipo da Tabela 7, versão para impressão/PDF, exportação em CSV e <strong className="font-medium text-foreground">envio por e-mail funcional</strong>: o app monta a mensagem e abre o cliente de e-mail do usuário já preenchido, faltando só anexar o PDF.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Central de Avisos</strong>, com notificações geradas pelo próprio sistema (aprovação, recusa, pendência), filtráveis por lidas/não lidas.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Ajuda</strong> com passo a passo, FAQ, glossário (crédito, hora contabilizada, tipo de atividade, parecer, validação em lote) e as limitações declaradas da demonstração.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Configurações de aparência</strong> persistentes entre sessões: tamanho de texto, alto contraste, redução de animação e densidade de lista (confortável ou compacta).</li>
          </ul>
          <h3 className="mt-3">Docente</h3>
          <ul className={CARTOES}>
            <li className={CARTAO}><strong className="font-medium text-foreground">Fila ordenada por tempo de espera</strong>, para que nenhum pedido fique esquecido.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Três caminhos em vez de dois:</strong> aprovar, recusar e <strong className="font-medium text-foreground">devolver com pendência</strong>, com parecer escrito que o aluno lê e responde.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Validação em lote</strong> para casos idênticos.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Meus Orientandos e Relatório da Turma</strong>, com filtros, impressão e CSV.</li>
            <li className={CARTAO}><strong className="font-medium text-foreground">Detecção de risco silencioso:</strong> o aluno com créditos suficientes concentrados em um único tipo — a conta fecha e ele ainda assim não integraliza. A lista de risco é sempre calculada sobre o histórico completo, ignorando os filtros da tela: alerta filtrado é alerta perdido.</li>
          </ul>
        </section>

        <section id="acessibilidade" aria-labelledby="titulo-acessibilidade" className={`${SECAO} scroll-mt-(--altura-barra)`}>
          <h2 id="titulo-acessibilidade">Acessibilidade</h2>
          <p className={TEXTO}>Acessibilidade não foi bônus. Uma universidade federal responde ao eMAG, e essa leitura orientou desde a escolha da biblioteca de componentes até a cor de cada neutro.</p>
          <h3>Na estrutura</h3>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Skip link &quot;Pular para o conteúdo&quot;, visível ao receber foco, e primeiro elemento focável de toda página.</li>
            <li>Foco visível em todos os controles, com folga de 2 px.</li>
            <li>Modais com foco preso e devolvido ao elemento de origem.</li>
            <li>Região <code>aria-live</code> única, sem anúncio duplicado.</li>
            <li>Expansíveis com <code>&lt;button aria-expanded aria-controls&gt;</code> real — nunca <code>div</code> clicável.</li>
            <li>Erros de formulário no campo, associados por <code>aria-describedby</code>.</li>
            <li>Anel de progresso com <code>role=&quot;progressbar&quot;</code> e o número em texto real no centro.</li>
            <li>Atalhos de acesso reais (1 · conteúdo principal, 2 · navegação, 3 · busca, 4 · rodapé) e tecla <code>?</code> para a lista completa de atalhos, lendo <code>event.key</code> para funcionar em teclado ABNT2.</li>
            <li>Mapa do site dedicado, listando os destinos reais das áreas discente e docente.</li>
          </ul>
          <h3>Informação nunca só na cor</h3>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Status indicados por ícone, cor <strong className="font-medium text-foreground">e</strong> texto ao mesmo tempo.</li>
            <li>Ícones de forma distinta, não apenas de cor diferente.</li>
            <li>Arco &quot;Em análise&quot; com preenchimento hachurado, distinguível sem cor.</li>
            <li>Barra de OCR indeterminada, com status anunciado — sem porcentagem falsa.</li>
          </ul>
          <h3>Sob seu controle</h3>
          <p className={TEXTO}>Alto contraste, tamanho de texto, redução de animação e densidade de lista, com preferências persistidas entre sessões — também respeitando a preferência de movimento reduzido já configurada no sistema operacional do visitante.</p>
          <h3>Contraste</h3>
          <p className={TEXTO}>Mínimo de 4,5:1 em texto e 3:1 em bordas e ícones funcionais — verificado com ferramenta e corrigido onde falhou.</p>
        </section>

        <section aria-labelledby="titulo-design" className={SECAO}>
          <h2 id="titulo-design">Design</h2>
          <ul className={CARTOES}>
            {["Laranja institucional em três níveis: decorativo, ação e hover/texto.", "Neutros quentes, sem modo escuro: um tema bem resolvido em vez de dois pela metade.", "Inter com numerais tabulares, para as colunas de crédito não dançarem.", "Raio único de 8 px; separação por borda ou sombra, nunca as duas.", "Quatro cores semânticas mapeadas aos status de atividade.", "Nenhuma tela a mais de dois cliques do painel.", "Verificado em desktop (1440 px) e mobile (375 px)."].map((item) => <li key={item} className={CARTAO}>{item}</li>)}
          </ul>
          <p className={TEXTO}>Todos os tokens são centralizados, e um script confere se algum arquivo escapou deles.</p>
        </section>

        <section aria-labelledby="titulo-decisoes" className={SECAO}>
          <h2 id="titulo-decisoes">Decisões que definem o projeto</h2>
          <p className={TEXTO}><strong className="font-medium text-foreground">Não simulamos o que não implementamos.</strong> O compartilhamento usa <code>mailto:</code>, que abre o cliente de e-mail do usuário e deixa claro que o PDF precisa ser anexado por ele. É menos impressionante que um &quot;e-mail enviado&quot; na tela, e é a única das duas opções que não mente para quem avalia. A mesma régua eliminou a porcentagem falsa no OCR, uma coluna de horas reconvertidas no CSV e os lembretes por e-mail em Configurações — que existem como preferência de interface, mas dizem claramente que não disparam nada real nesta demonstração.</p>
          <p className={TEXTO}><strong className="font-medium text-foreground">Uma única fonte de verdade por número.</strong> Cada valor exibido — tela, impressão, CSV — passa pelo mesmo caminho de cálculo. Os filtros restringem a lista de atividades <em>antes</em> das funções de cálculo, em vez de reimplementá-las.</p>
          <p className={TEXTO}><strong className="font-medium text-foreground">Honestidade do dado.</strong> No relatório, &quot;carga horária do certificado&quot; e &quot;créditos reconhecidos&quot; são colunas separadas: uma é o que está no documento, a outra é o que a regra concedeu. Sem conversão inventada entre as duas.</p>
          <p className={TEXTO}><strong className="font-medium text-foreground">Cada campo nomeado pelo que faz.</strong> O filtro de período recorta pela data de validação, a única garantida em toda atividade validada. Em vez de mudar o critério, os campos se chamam &quot;Validado a partir de&quot; e &quot;Validado até&quot; — na tela, na impressão e no CSV.</p>
        </section>

        <section aria-labelledby="titulo-ferramentas" className={SECAO}>
          <h2 id="titulo-ferramentas">Ferramentas e tecnologias</h2>
          <h3>Aplicação</h3>
          <Tabela titulo="Tecnologias da aplicação" linhas={[
            ["TypeScript", "Tipagem em todo o projeto"], ["Next.js (App Router) + React", "Estrutura, roteamento e interface"], ["Tailwind CSS", "Estilos a partir de tokens centralizados"], ["shadcn/ui sobre Base UI", "Componentes com ARIA, foco e teclado"], ["Estado React + validações de domínio", "Formulários e validação das regras da Tabela 7"], ["Tesseract.js", "OCR dos comprovantes, no navegador"], ["pdfjs-dist", "Leitura de comprovantes em PDF"], ["SVG próprio", "Anel de integralização"], ["Supabase PostgreSQL", "Estado funcional da aplicação em JSONB"], ["Supabase Storage", "Armazenamento dos arquivos de comprovante"], ["Armazenamento local do navegador", "Preferências de acessibilidade, sessão simulada e rascunho"], ["Blob + URL.createObjectURL", "CSV gerado no navegador, com ; e BOM UTF-8 para o Excel pt-BR"], ["mailto:", "Envio do relatório por e-mail, com mensagem pré-preenchida"],
          ]} />
          <h3 className="mt-3">Infraestrutura</h3>
          <Tabela titulo="Infraestrutura" linhas={[["Supabase", "PostgreSQL e Storage para persistência compartilhada do protótipo"], ["GitHub", "main protegida, branches por prefixo (feat/, a11y/)"], ["Vercel", "Deploy automático e preview por pull request"]]} />
          <h3 className="mt-3">Qualidade e acessibilidade</h3>
          <Tabela titulo="Qualidade e acessibilidade" linhas={[["axe DevTools / axe-core", "Auditoria de acessibilidade — zero violações nas telas trabalhadas"], ["Lighthouse", "Checkpoint após cada feature"], ["Navegação só por teclado", "Teste manual obrigatório antes de cada commit"], ["Scripts próprios", "Verificação de tokens, do pipeline de OCR e da composição de e-mail"]]} />
          <h3 className="mt-3">Projeto e conteúdo</h3>
          <Tabela titulo="Projeto e conteúdo" linhas={[["Claude e Claude Code", "Geração de código assistida, com explicação exigida a cada etapa e um commit por feature"], ["Miro", "UserFlow dos dois perfis, desenhado antes da primeira tela"], ["PPC do BCDIA", "Fonte de toda a regra de domínio — Tabela 4 (crédito), Tabela 7 (atividades) e seção 3.5.4"]]} />
        </section>

        <section aria-labelledby="titulo-limitacoes" className={SECAO}>
          <h2 id="titulo-limitacoes">Limitações conhecidas</h2>
          <p className={TEXTO}>Preferimos declarar do que deixar descobrir.</p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Os dados funcionais e os comprovantes persistem no Supabase; preferências de acessibilidade, sessão simulada e rascunho continuam locais neste navegador.</li>
            <li>Não há integração com o sistema acadêmico da UFSCar.</li>
            <li>Os comprovantes desta demonstração são documentos fictícios criados para o evento.</li>
            <li>O envio do relatório abre o cliente de e-mail do avaliador com a mensagem pronta; o anexo do PDF e o envio em si continuam sob controle dele.</li>
            <li>As preferências de notificação em Configurações (validação, recusa, prazo, marco de créditos) não disparam e-mail nem notificação real — são estado de interface.</li>
            <li>O OCR assiste o preenchimento; a revisão humana continua obrigatória antes de salvar.</li>
            <li>O sistema hoje trata a Tabela 7 do BCDIA como a única regra existente; ver &quot;Próximos passos&quot; para o caminho de generalização por curso.</li>
          </ul>
        </section>

        <section aria-labelledby="titulo-proximos-passos" className={SECAO}>
          <h2 id="titulo-proximos-passos">Próximos passos</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Integração com o sistema acadêmico da UFSCar e autenticação institucional.</li>
            <li><strong className="font-medium text-foreground">Regras por curso, não só por PPC do BCDIA.</strong> Hoje a Tabela 7 e a Tabela 4 estão embutidas como a única fonte de regra. O próximo passo natural é atribuir a cada aluno o ID do seu curso e buscar, a partir dele, a tabela de créditos e a exigência de integralização específicas do PPC daquele curso — permitindo que o mesmo sistema sirva outros cursos da UFSCar sem reescrever a lógica de cálculo, só trocando o dado de origem.</li>
            <li>Perfil de secretaria como terceira visão de triagem.</li>
            <li>Verificação automática do processo SEI a partir dos códigos extraídos pelo OCR.</li>
            <li>Bloqueio antifraude por par de códigos de verificação duplicado.</li>
            <li>Modo de leitura com espaçamento ampliado.</li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-4">
          <VoltarPaginaAnterior />
          <Link href="/" className={buttonVariants({ variant: "outline" })}>Ir para a tela de entrada</Link>
        </div>
      </main>
      <footer id={ID_RODAPE} accessKey="4" tabIndex={-1} className="mt-6 w-full max-w-form scroll-mt-(--altura-barra) text-center">
        <Link href="/mapa-do-site" className="text-caption text-accent-text underline underline-offset-4">Mapa do site</Link>
      </footer>
    </div>
  )
}

function Tabela({ titulo, linhas }: { titulo: string; linhas: readonly (readonly [string, string])[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <caption className="sr-only">{titulo}</caption>
        <thead className="bg-muted"><tr><th scope="col" className={CELULA}>Ferramenta</th><th scope="col" className={CELULA}>Para quê</th></tr></thead>
        <tbody>{linhas.map(([ferramenta, finalidade]) => <tr key={ferramenta}><th scope="row" className={`${CELULA} font-medium text-foreground`}>{ferramenta}</th><td className={`${CELULA} text-muted-foreground`}>{finalidade}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
