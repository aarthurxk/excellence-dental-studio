

## Plano: Corrigir preview do link no WhatsApp (og:image)

### Problema
O logo não aparece quando o link é compartilhado no WhatsApp porque:
1. **A imagem está em formato `.webp`** — o WhatsApp só aceita **JPEG ou PNG** para `og:image`.
2. **Tamanho recomendado**: WhatsApp precisa de imagens com no mínimo 300x200px e idealmente 1200x630px.
3. **`og:url` inconsistente**: `index.html` aponta para `odontoexcellence-ipsep.com.br` mas `SEOHead.tsx` usa `odontoexcellencerecife.com.br`.

### Correções

1. **Converter a imagem para PNG/JPEG** e hospedar na pasta `public/` do projeto (ex: `public/og-image.png`), garantindo formato compatível.

2. **Atualizar `og:image` no `index.html`** para apontar para a URL absoluta da imagem PNG (ex: `https://odontoexcellencerecife.lovable.app/og-image.png` ou o domínio definitivo).

3. **Corrigir `og:url`** no `index.html` para usar o mesmo domínio do `SEOHead.tsx` (`odontoexcellencerecife.com.br`).

4. **Após publicar**, limpar o cache do WhatsApp usando a ferramenta de debug do Facebook: `https://developers.facebook.com/tools/debug/` — colar a URL do site e clicar "Scrape Again".

### Arquivos afetados
- `public/og-image.png` — nova imagem convertida
- `index.html` — atualizar `og:image`, `twitter:image` e `og:url`

