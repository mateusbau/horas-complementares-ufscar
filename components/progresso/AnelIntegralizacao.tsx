// components/progresso/AnelIntegralizacao.tsx — Painel do discente
//
// Anel do card "Integralização": um círculo de base (cor "falta") com dois
// arcos de traço por cima — mesma técnica do antigo AnelProgresso (SVG,
// stroke-dasharray/stroke-dashoffset), agora com dois arcos em vez de um.
// SVG, não CSS conic-gradient: só em SVG dá para aplicar um <pattern>
// (hachura) num arco específico sem mascarar o resto do anel.
//
// "Em análise" nunca depende só de cor: o arco usa um <pattern> hachurado
// (equivalente em SVG do repeating-linear-gradient a 135°), repetido na
// bolinha da legenda abaixo. O SVG é decorativo (aria-hidden); quem carrega
// a informação para leitor de tela é o texto real no miolo (percentual e as
// duas linhas de créditos/horas) — não fica escondido atrás de um
// role="img" que apagaria esse texto da árvore de acessibilidade. O
// contêiner externo mantém role="progressbar", com os mesmos valores em
// créditos que a faixa anterior já usava.

import { formatarCreditos, formatarNumero } from "@/lib/formatacao"
import type { Progresso } from "@/lib/types"

const DIAMETRO = 196
const ESPESSURA = 25
const RAIO = DIAMETRO / 2 - ESPESSURA / 2
const CIRCUNFERENCIA = 2 * Math.PI * RAIO
const LADRILHO_HACHURA = 6 // tokens-ok: lado em px do ladrilho SVG da hachura, não crédito — coincide com CREDITOS_EXIGIDOS

const HACHURA_LEGENDA = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--integralizacao-anel-em-analise) 0px, var(--integralizacao-anel-em-analise) 2px, var(--surface) 2px, var(--surface) 4px)",
}

export function AnelIntegralizacao({
  progresso,
  validado,
  analise,
  falta,
  denominador,
}: {
  progresso: Progresso
  validado: number
  analise: number
  falta: number
  denominador: number
}) {
  const comprimentoValidado = (validado / denominador) * CIRCUNFERENCIA
  const comprimentoAnalise = (analise / denominador) * CIRCUNFERENCIA
  const percentualExibido = formatarNumero(Math.round(progresso.percentual))

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        role="progressbar"
        aria-valuenow={validado}
        aria-valuemin={0}
        aria-valuemax={denominador}
        aria-label={`Créditos: ${formatarCreditos(validado)} validados, ${formatarCreditos(analise)} em análise, de ${formatarCreditos(progresso.creditosExigidos)} exigidos.`}
        className="relative size-[12.25rem] shrink-0"
      >
        <svg aria-hidden="true" viewBox={`0 0 ${DIAMETRO} ${DIAMETRO}`} className="size-full -rotate-90">
          <defs>
            <pattern
              id="hachura-anel-em-analise"
              width={LADRILHO_HACHURA}
              height={LADRILHO_HACHURA}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(135)"
            >
              <rect width={LADRILHO_HACHURA} height={LADRILHO_HACHURA} className="fill-integralizacao-anel-em-analise" />
              <rect width={LADRILHO_HACHURA / 2} height={LADRILHO_HACHURA} className="fill-surface" />
            </pattern>
          </defs>
          <circle
            cx={DIAMETRO / 2}
            cy={DIAMETRO / 2}
            r={RAIO}
            fill="none"
            strokeWidth={ESPESSURA}
            className="stroke-integralizacao-anel-falta"
          />
          {comprimentoValidado > 0 && (
            <circle
              cx={DIAMETRO / 2}
              cy={DIAMETRO / 2}
              r={RAIO}
              fill="none"
              strokeWidth={ESPESSURA}
              className="stroke-primary"
              strokeDasharray={`${comprimentoValidado} ${CIRCUNFERENCIA - comprimentoValidado}`}
            />
          )}
          {comprimentoAnalise > 0 && (
            <circle
              cx={DIAMETRO / 2}
              cy={DIAMETRO / 2}
              r={RAIO}
              fill="none"
              strokeWidth={ESPESSURA}
              stroke="url(#hachura-anel-em-analise)"
              strokeDasharray={`${comprimentoAnalise} ${CIRCUNFERENCIA - comprimentoAnalise}`}
              strokeDashoffset={-comprimentoValidado}
            />
          )}
        </svg>

        <div className="absolute inset-[1.5625rem] flex flex-col items-center justify-center rounded-full bg-surface px-1 text-center">
          <p className="flex items-baseline text-integralizacao-texto-titulo">
            <span className="text-[2.5rem] leading-none font-bold tracking-[-0.03em]">{percentualExibido}</span>
            <span className="text-h2 font-bold">%</span>
          </p>
          <p className="mt-1 whitespace-nowrap text-label leading-tight font-medium text-integralizacao-texto-auxiliar">
            {formatarNumero(progresso.creditosObtidos)} de {formatarCreditos(progresso.creditosExigidos)}
          </p>
          <p className="whitespace-nowrap text-label leading-tight font-medium text-integralizacao-texto-auxiliar">
            {formatarNumero(progresso.horasObtidas)} de {formatarNumero(progresso.horasExigidas)} horas
          </p>
        </div>
      </div>

      {/* Alternativa textual obrigatória, não decorativa: os mesmos três valores da barra, por extenso. */}
      <ul className="flex w-full flex-col gap-2 text-label text-integralizacao-texto-item">
        <li className="flex min-w-0 items-start gap-2">
          <span aria-hidden="true" className="mt-[0.25em] size-[10px] shrink-0 rounded-full bg-primary" />
          <span className="min-w-0">Validado: {formatarCreditos(validado)}</span>
        </li>
        <li className="flex min-w-0 items-start gap-2">
          <span aria-hidden="true" className="mt-[0.25em] size-[10px] shrink-0 rounded-full" style={HACHURA_LEGENDA} />
          <span className="min-w-0">Em análise: {formatarCreditos(analise)}</span>
        </li>
        <li className="flex min-w-0 items-start gap-2">
          <span aria-hidden="true" className="mt-[0.25em] size-[10px] shrink-0 rounded-full bg-integralizacao-anel-falta" />
          <span className="min-w-0">Falta: {formatarCreditos(falta)}</span>
        </li>
      </ul>
    </div>
  )
}
