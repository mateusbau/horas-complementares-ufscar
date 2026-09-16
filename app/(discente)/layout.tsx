import type { ReactNode } from "react"

import { EstruturaPerfil } from "@/components/layout/EstruturaPerfil"

export default function LayoutDiscente({ children }: { children: ReactNode }) {
  return <EstruturaPerfil perfil="discente">{children}</EstruturaPerfil>
}
