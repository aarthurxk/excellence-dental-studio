

## Corrigir botões com texto invisível

**Problema**: Ambos os botões "outline" (Hero: "TRATAMENTOS" e CTA: telefone) usam `text-primary-foreground` que é branco. No Hero com fundo escuro o botão fica com borda/texto branco pouco visíveis, e no CTA com fundo vermelho o botão de telefone fica branco sobre vermelho com borda fraca.

### Correções

**1. `src/components/medico/HeroSection.tsx`** (linha 53):
- Trocar o botão "TRATAMENTOS" para ter fundo branco semi-transparente e texto branco mais visível:
  - `border-white text-white bg-white/10 hover:bg-white/20`

**2. `src/components/home/CTABanner.tsx`** (linha 43):
- Trocar o botão do telefone para ter fundo branco com texto escuro (contraste total):
  - `bg-white text-primary border-white hover:bg-white/90 font-semibold`
  - Isso cria um botão branco com texto vermelho, perfeitamente legível sobre o fundo vermelho

### Resultado
Ambos os botões terão contraste adequado e serão claramente visíveis e clicáveis.

