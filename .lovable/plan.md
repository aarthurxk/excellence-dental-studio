

## Plano: Imagem da dentista sobrepondo o banner vermelho

O objetivo e fazer a imagem da dentista (lado direito do Hero) descer e sobrepor parcialmente o InfoStrip vermelho abaixo, como na referencia.

### Mudancas

1. **`HeroSection.tsx`**: Remover `overflow-hidden` da section. Posicionar a imagem com `absolute bottom-0` e `translate-y` parcial para que ela "vaze" para baixo do hero, sobrepondo o banner. Adicionar `z-20` para ficar acima do InfoStrip.

2. **`InfoStrip.tsx`**: Adicionar `relative` e um `z-10` para que a imagem do hero fique por cima.

3. **`Index.tsx`**: O wrapper do Hero+InfoStrip nao precisa de mudanca, pois o posicionamento absoluto da imagem resolve o overlap naturalmente.

### Abordagem tecnica
- A imagem sera posicionada com `absolute bottom-0 right-0` dentro do container do hero, com `translate-y-[30%]` para descer ~30% da sua altura sobre o banner vermelho.
- A section do hero perde `overflow-hidden` para permitir o vazamento.
- Um wrapper com `relative z-20` no Index envolvera o HeroSection para garantir que a imagem fique acima do InfoStrip.

