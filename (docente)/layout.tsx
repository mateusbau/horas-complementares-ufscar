import type { ReactNode } from "react"

import { EstruturaPerfil } from "@/components/layout/EstruturaPerfil"

export default function LayoutDocente({ children }: { children: ReactNode }) {
  return <EstruturaPerfil perfil="docente">{children}</EstruturaPerfil>
}
