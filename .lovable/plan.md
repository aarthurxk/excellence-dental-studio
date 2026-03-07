

## Plano: Banner vermelho por cima da imagem

Inverter a abordagem: em vez da imagem sobrepor o banner, o **InfoStrip fica por cima** da imagem. Assim, qualquer foto que for colocada fica com a parte inferior "cortada" pelo banner vermelho, sem risco de desalinhamento.

### Mudancas

1. **`HeroSection.tsx`**:
   - Remover `translate-y-[30%]` da imagem (ela nao precisa mais "vazar")
   - Manter a imagem posicionada `absolute bottom-0 right-0` dentro do hero, alinhada ao fundo da section
   - Reduzir o z-index da imagem para `z-10`

2. **`InfoStrip.tsx`**:
   - Adicionar `relative z-20` e um `mt-negative` (e.g. `-mt-16` ou `-mt-20`) para que o banner suba e sobreponha a parte inferior do hero/imagem
   - O banner vermelho fica sempre por cima, independente da foto

Resultado: a imagem fica rente ao fundo do hero, e o banner vermelho sobe e cobre a parte de baixo. Trocar a foto nao quebra o alinhamento.

