

## Linkar badge "4.9 no Google" à página de avaliações

O badge "4.9 no Google" no HeroSection é atualmente um `div` estático. A proposta é:

1. **Transformar o badge em um link (`<a>`)** apontando para a página de avaliações do Google da clínica (Google Maps/Business).

2. **Adicionar um campo `google_reviews_url`** na tabela `site_settings` para que o link seja editável pelo admin, sem necessidade de alterar código.

3. **Usar o valor do banco** no componente: `settings?.google_reviews_url || "URL_DEFAULT"`.

### Alterações

- **Migration SQL**: adicionar coluna `google_reviews_url text` à tabela `site_settings`
- **`src/components/medico/HeroSection.tsx`**: trocar o `<div>` do badge Google por `<a href={settings?.google_reviews_url} target="_blank" rel="noopener noreferrer">` com mesmas classes + `cursor-pointer hover:bg-primary-foreground/15 transition-colors`
- **`src/hooks/useSiteSettings.ts`**: adicionar `google_reviews_url: ""` ao fallback

Para funcionar, será preciso informar a URL do perfil Google da clínica (ex: `https://g.page/r/...` ou `https://www.google.com/maps/place/...`). Posso pré-popular o campo no banco se você fornecer o link.

