

## Plano: Carrossel automático na seção de Dentistas

### O que será feito
A seção "Nossa Equipe" na home (`DoctorsSection.tsx`) passará a carregar **todos** os dentistas ativos (sem `limit`) e exibi-los em um carrossel automático usando Embla Carousel (já instalado no projeto via `src/components/ui/carousel.tsx`). A cada ~5 segundos, o carrossel avança automaticamente, mostrando o próximo grupo de 3 cards (desktop) / 2 (tablet) / 1 (mobile). O usuário também pode arrastar/swipe manualmente.

### Etapas

1. **Remover o `limit(3)`** da query para buscar todos os dentistas ativos.

2. **Instalar o plugin Autoplay do Embla** (`embla-carousel-autoplay`) para rotação automática.

3. **Substituir o grid por um Carousel** usando os componentes `Carousel`, `CarouselContent`, `CarouselItem` já existentes, com:
   - Autoplay a cada 5 segundos (pausa no hover)
   - Loop infinito (`loop: true`)
   - Responsivo: `basis-full` no mobile, `basis-1/2` no tablet, `basis-1/3` no desktop
   - Setas de navegação opcionais e indicadores de paginação (dots)

4. **Manter o design atual dos cards** (foto, overlay com nome/especialidade, bio).

### Detalhes técnicos
- O projeto já tem `embla-carousel-react` instalado. Será necessário adicionar `embla-carousel-autoplay` como dependência.
- O componente `Carousel` do projeto aceita `plugins` como prop, onde passaremos o plugin Autoplay.
- Os cards individuais mantêm exatamente o mesmo visual atual.

