import { createCn } from "cn/config"

/**
 * Junta classes e resolve conflitos do Tailwind. Os tokens próprios do projeto
 * (app/globals.css) são registrados aqui para que o merge os reconheça: sem
 * isso, `cn("text-h1", "text-foreground")` trataria `text-h1` como cor e o
 * descartaria.
 */
export const cn = createCn({
  extend: {
    theme: {
      text: ["h1", "h2", "h3", "body", "label", "caption"],
      leading: ["heading", "body", "secondary"],
      shadow: ["overlay"],
      container: ["content", "form"],
      spacing: ["sidebar", "target", "row"],
      ease: ["standard"],
    },
  },
})
