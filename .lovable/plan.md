

## Melhorias de UX/UI Mobile — Análise e Plano

### Problemas Identificados

1. **Navbar mobile**: Logo h-14 muito grande para h-16 de altura; botão "AGENDAR" compete com hamburger sem hierarquia clara
2. **InfoStrip**: No mobile, 3 blocos empilhados com ícones h-12 w-12 e texto centralizado ocupam muito espaço vertical desnecessário; animação bounce distrai em tela pequena
3. **HighlightBanner**: Texto com `text-sm` fica apertado; o dash "—" quebra mal em telas estreitas
4. **AboutSection**: Badge "10+ anos" com `absolute -bottom-5 -right-5` transborda no mobile; gap-16 excessivo entre colunas; botões empilham sem respiro
5. **DepartmentsSection**: Cards com `p-8` desperdiçam espaço; link "Agendar" com `opacity-0 group-hover` é invisível no touch (não existe hover)
6. **DoctorsSection**: Grid `md:grid-cols-3` pula direto de 1 para 3 colunas; cards de dentista sem largura máxima no mobile ficam enormes
7. **TestimonialsSection**: Paginação manual (3 em 3) não funciona bem no mobile — deveria ser carrossel com swipe
8. **BeforeAfter**: Slider funciona bem no touch, mas `aspect-[3/2]` pode ser muito estreito no mobile
9. **Videos**: iframes de YouTube no mobile sem lazy visual (layout shift)
10. **Footer**: Copyright + ícone admin em `justify-between` com texto longo quebra em 2 linhas no mobile
11. **WhatsApp FAB**: Ping animation constante é agressivo e distrai

### Plano de Implementação

#### 1. Navbar mobile — compactar e melhorar touch targets
- Reduzir logo para `h-10` no mobile
- Dar mais espaço ao botão "AGENDAR" com padding adequado
- Aumentar touch target do hamburger para min 44x44px

#### 2. InfoStrip — layout horizontal compacto no mobile
- Mudar para layout horizontal (ícone + texto lado a lado) no mobile em vez de centralizado vertical
- Reduzir ícones para `h-8 w-8` no mobile
- Remover animação bounce no mobile
- Reduzir padding vertical

#### 3. HighlightBanner — melhorar legibilidade mobile
- Quebrar texto em 2 linhas intencionais no mobile (bold na primeira, normal na segunda)
- Aumentar padding e espaçamento

#### 4. AboutSection — corrigir overflow e espaçamento
- Remover posicionamento absoluto do badge "10+ anos" no mobile (colocar inline)
- Reduzir gap de 16 para 8 no mobile
- Garantir botões full-width no mobile

#### 5. DepartmentsSection — cards touch-friendly
- Reduzir padding de cards para `p-5` no mobile
- Tornar link "Agendar" sempre visível (remover lógica de hover-only)
- Ícones menores no mobile (`h-8 w-8`)

#### 6. DoctorsSection — grid intermediário
- Adicionar `sm:grid-cols-2` para tablets
- Limitar largura máxima dos cards no mobile

#### 7. TestimonialsSection — carrossel com swipe no mobile
- No mobile, mostrar 1 card por vez com dots/indicadores e suporte a swipe via CSS scroll-snap
- Manter grid de 3 no desktop

#### 8. Footer — layout mobile otimizado
- Copyright em coluna no mobile (texto + ícone admin empilhados)
- Reduzir padding geral

#### 9. WhatsApp FAB — suavizar animação
- Substituir `animate-ping` por uma animação mais sutil (pulse suave) ou remover no mobile

#### 10. Melhorias gerais de tipografia mobile
- Section headers: `text-2xl` no mobile (em vez de `text-3xl`)
- Reduzir `mb-14` dos headers de seção para `mb-8` no mobile
- Touch targets mínimos de 44px em todos os botões e links

### Arquivos a editar
- `src/components/medico/Navbar.tsx`
- `src/components/medico/InfoStrip.tsx`
- `src/components/medico/HighlightBanner.tsx`
- `src/components/medico/AboutSection.tsx`
- `src/components/medico/DepartmentsSection.tsx`
- `src/components/medico/DoctorsSection.tsx`
- `src/components/medico/TestimonialsSection.tsx`
- `src/components/medico/FooterMedico.tsx`
- `src/components/layout/WhatsAppButton.tsx`
- `src/components/medico/HeroSection.tsx`

