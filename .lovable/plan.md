

## Melhorias de UX/UI Mobile

Analisei todos os componentes do site na perspectiva mobile. Aqui estão os problemas e as melhorias planejadas:

---

### 1. Navbar Mobile -- Menu lateral profissional (Sheet)

**Problema**: O menu mobile atual é um dropdown simples que empurra o conteúdo para baixo, sem ícones e sem informações de contato.

**Correção**: Substituir o dropdown por um Sheet (drawer lateral) com:
- Logo no topo
- Ícones ao lado de cada item de navegação (Home, Info, Stethoscope, Users, Video, Mail)
- Botão de WhatsApp destacado em verde no rodapé do drawer
- Telefone e horário no rodapé do menu
- Animação suave de entrada

### 2. Hero Section -- Otimização mobile

**Problema**: `min-h-[600px]` é excessivo no mobile, botões com padding grande, texto pode ficar apertado.

**Correção**:
- Reduzir altura mínima no mobile: `min-h-[450px] md:min-h-[600px]`
- Ajustar título para `text-3xl` no mobile (era `text-4xl`)
- Reduzir padding dos botões no mobile
- Badges de prova social em coluna no mobile pequeno

### 3. InfoStrip -- Scroll horizontal no mobile

**Problema**: 3 cards empilhados verticalmente ocupam muito espaço vertical no mobile.

**Correção**:
- Remover o `-mt-16` no mobile (fica sobrepondo o hero)
- Reduzir padding interno dos cards no mobile

### 4. HighlightBanner -- Texto menor no mobile

**Problema**: Texto `text-lg md:text-xl` com ícones grandes fica apertado no mobile.

**Correção**: Reduzir para `text-sm md:text-xl` e ícones menores no mobile.

### 5. Seções de conteúdo -- Espaçamento consistente

**Problema**: Todas as seções usam `py-20` que é excessivo no mobile.

**Correção**: Padronizar para `py-12 md:py-20` nas seções: AboutSection, DepartmentsSection, DoctorsSection, TestimonialsSection, BeforeAfter, Videos, Events, CTABanner, FAQ, Location.

### 6. Footer -- Layout mobile

**Problema**: Grid de 4 colunas fica muito longo no mobile.

**Correção**: Esconder colunas de "Links Rápidos" e "Tratamentos" no mobile (já acessíveis pelo menu), manter apenas logo+descrição e contato.

### 7. WhatsApp Button -- Ajuste de posição

**Problema**: Botão pode ficar sobrepondo conteúdo no mobile.

**Correção**: Reduzir tamanho para `h-12 w-12` no mobile e ajustar posição `bottom-4 right-4`.

### 8. Container padding

**Problema**: `padding: 2rem` é muito no mobile.

**Correção**: Alterar no tailwind.config para `padding: "1rem"` mobile e `"2rem"` desktop via screens config.

---

### Arquivos a editar

| Arquivo | Mudança |
|---------|---------|
| `tailwind.config.ts` | Container padding responsivo |
| `Navbar.tsx` | Substituir dropdown por Sheet lateral com ícones |
| `HeroSection.tsx` | Altura, tipografia e botões mobile |
| `InfoStrip.tsx` | Padding e margin mobile |
| `HighlightBanner.tsx` | Texto e ícones menores mobile |
| `AboutSection.tsx` | py-12 md:py-20 |
| `DepartmentsSection.tsx` | py-12 md:py-20 |
| `DoctorsSection.tsx` | py-12 md:py-20 |
| `TestimonialsSection.tsx` | py-12 md:py-20 |
| `BeforeAfter.tsx` | py-12 md:py-20 |
| `Videos.tsx` | py-12 md:py-20 |
| `Events.tsx` | py-12 md:py-20 |
| `CTABanner.tsx` | py-12 md:py-20 |
| `FAQ.tsx` | py-12 md:py-20 |
| `Location.tsx` | py-12 md:py-20 |
| `FooterMedico.tsx` | Esconder colunas secundárias mobile |
| `WhatsAppButton.tsx` | Tamanho e posição mobile |

