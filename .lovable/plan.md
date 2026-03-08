

## Remover texto "Dentista" do placeholder do Hero

O problema está na linha 86 do `HeroSection.tsx`. O placeholder da imagem do dentista usa `?text=Dentista`, que exibe o texto "Dentista" enquanto a imagem real carrega (ou se não houver imagem configurada).

### Correção

**`src/components/medico/HeroSection.tsx`** (linha 86):
- Trocar o placeholder de `https://placehold.co/500x600/1a1a1a/cccccc?text=Dentista` para um placeholder sem texto: `https://placehold.co/500x600/1a1a1a/1a1a1a` (mesma cor de fundo e texto, ficando invisível)
- Alternativamente, renderizar a `<img>` somente quando `settings?.hero_doctor_image` existir, evitando completamente o placeholder

A abordagem mais limpa é a segunda: **não renderizar nada** se não houver imagem configurada. Isso elimina o placeholder amador e evita flash de conteúdo.

