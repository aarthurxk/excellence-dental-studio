

## Plano: Corrigir logo no footer (fundo escuro)

### Problema
O filtro CSS `brightness-0 invert` transforma toda a imagem em branco puro, perdendo os detalhes internos do logo (a imagem dentro do quadrado desaparece).

### Solução
Remover `brightness-0 invert` e deixar a logo com suas cores originais. Como o fundo do footer é escuro (`bg-secondary`), a logo precisa ser visível sem inversão. Vamos aplicar apenas um `drop-shadow` branco sutil para dar contraste, ou simplesmente remover os filtros — se a logo já tiver fundo transparente com cores claras, ficará visível naturalmente.

### Mudança

**`src/components/medico/FooterMedico.tsx`** (linha 26):
- De: `className="h-20 brightness-0 invert"`
- Para: `className="h-20"` (sem filtros, logo com cores originais)

**`src/components/layout/Footer.tsx`** (linha 14):
- De: `className="h-16 w-auto brightness-0 invert"`
- Para: `className="h-16 w-auto"` (mesma correção)

Se a logo original for escura e não contrastar com o fundo, podemos adicionar um fundo branco arredondado atrás dela (`bg-white/90 rounded p-2`) como alternativa.

