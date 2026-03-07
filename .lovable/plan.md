

## Plano: Atualizar endereço em todo o site + Google Maps

### Onde existem endereços hardcoded (fallbacks)

| Arquivo | Endereço atual (fallback) |
|---|---|
| `src/hooks/useSiteSettings.ts` | `"Rua Exemplo, 123 – Ipsep, Recife – PE"` |
| `src/components/medico/HeaderInfo.tsx` | `"Rua Example, 220"` / `"Ipsep – Recife"` |
| `src/components/medico/FooterMedico.tsx` | `"Rua Example, 220 – Ipsep, Recife"` |

### Ações

1. **Atualizar banco `site_settings`** — UPDATE `address` para `Rua Jean Emile Favre, 1712 – Ipsep, Recife – PE, 51190-450` e `google_maps_embed_url` para o embed do Google Maps desse endereço

2. **Atualizar fallbacks nos 3 arquivos** — substituir os endereços hardcoded pelo endereço correto:
   - `useSiteSettings.ts` → fallback address
   - `HeaderInfo.tsx` → fallback nos splits
   - `FooterMedico.tsx` → fallback no span

### Google Maps Embed URL
Será usada a URL: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.5!2d-34.923!3d-8.109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOCswNicwMC4wIlMgMzTCsDU1JzAwLjAiVw!5e0!3m2!1spt-BR!2sbr!4v1` — buscaremos o embed real via busca pelo endereço exato.

| Arquivo | Alteração |
|---|---|
| BD `site_settings` | UPDATE address + google_maps_embed_url |
| `src/hooks/useSiteSettings.ts` | Fallback address |
| `src/components/medico/HeaderInfo.tsx` | Fallback address |
| `src/components/medico/FooterMedico.tsx` | Fallback address |

