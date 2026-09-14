import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Botão shadcn/ui (base-nova) ajustado à identidade visual:
 * - sem supressão de contorno nem anel próprio: o foco vem da regra global
 *   de :focus-visible (2 px em --ring com folga de 2 px);
 * - alvo mínimo de 44 × 44 px (`min-h-target` / `size-target`), por isso não
 *   há tamanhos xs/sm;
 * - o rótulo pode quebrar linha, para não estourar em 375 px com texto a 125 %;
 * - transição só de cor.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-clip-padding text-center text-label transition-colors select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border-input-border bg-surface text-foreground hover:bg-accent-soft aria-expanded:bg-accent-soft",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-border aria-expanded:bg-border",
        ghost:
          "text-foreground hover:bg-accent-soft aria-expanded:bg-accent-soft",
        destructive:
          "border-danger bg-surface text-danger hover:bg-danger-bg",
        link: "text-accent-text underline underline-offset-4 hover:decoration-2",
      },
      size: {
        default: "min-h-target px-4 py-2",
        lg: "min-h-target px-6 py-3",
        icon: "size-target",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
