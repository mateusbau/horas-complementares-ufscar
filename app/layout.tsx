import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { RegiaoAoVivo } from "@/components/feedback/RegiaoAoVivo";
import { BarraAcessibilidade } from "@/components/layout/BarraAcessibilidade";
import { SkipLink } from "@/components/layout/SkipLink";
import { SCRIPT_PREFERENCIAS } from "@/lib/storage";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Horas Complementares · UFSCar Sorocaba",
  description:
    "Sistema de gestão pessoal de horas complementares da UFSCar Sorocaba.",
};

// suppressHydrationWarning no <html>: o script do <head> aplica alto contraste
// e tamanho do texto antes da primeira pintura, e o React deve aceitar esse DOM.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_PREFERENCIAS }} />
      </head>
      <body>
        <RegiaoAoVivo>
          <SkipLink />
          <BarraAcessibilidade />
          {children}
        </RegiaoAoVivo>
      </body>
    </html>
  );
}
