import type { Metadata } from "next"

import { TelaConfiguracoes } from "@/components/configuracoes/TelaConfiguracoes"

export const metadata: Metadata = { title: "Configurações · Horas Complementares" }

export default function PaginaConfiguracoes() {
  return <TelaConfiguracoes perfil="discente" />
}
