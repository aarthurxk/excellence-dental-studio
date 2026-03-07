

# Conectar Frontend ao Banco de Dados

## Resumo
Substituir todos os dados hardcoded em 15 componentes/páginas por queries dinâmicas ao banco usando React Query + Supabase client. Criar um hook centralizado `useSiteSettings` para dados compartilhados (telefone, WhatsApp, endereço, etc.).

## Componentes a alterar

### 1. Hook compartilhado: `useSiteSettings`
- Novo hook que busca `site_settings` (1 row) e cacheia globalmente
- Usado por: Header, Footer, Hero, Location, CTABanner, WhatsAppButton, ContactPage

### 2. Home sections (7 componentes)
| Componente | Tabela | Query |
|---|---|---|
| `Hero.tsx` | `site_settings` | hero_title, hero_subtitle, whatsapp_number, whatsapp_message |
| `Features.tsx` | `features` | all, ordered by display_order |
| `ServicesPreview.tsx` | `services` | active=true, ordered by display_order, limit 6 |
| `About.tsx` | `about_content` | single row (maybeSingle) |
| `Team.tsx` | `dentists` | active=true, ordered by display_order, limit 4 |
| `Testimonials.tsx` | `testimonials` | active=true, featured first, limit 3 |
| `Videos.tsx` | `videos` | active=true, featured first, limit 2 |
| `Events.tsx` | `events` | active=true, ordered by event_date, limit 3 |

### 3. Sub-páginas (6 páginas)
| Página | Tabela |
|---|---|
| `ServicesPage.tsx` | `services` (active) |
| `TeamPage.tsx` | `dentists` (active) |
| `TestimonialsPage.tsx` | `testimonials` (active) |
| `VideosPage.tsx` | `videos` (active) |
| `EventsPage.tsx` | `events` (active) |
| `About.tsx` | `about_content` |

### 4. Layout components (4 componentes)
| Componente | Dados do `site_settings` |
|---|---|
| `Header.tsx` | phone, whatsapp_number, whatsapp_message |
| `Footer.tsx` | phone, phone_secondary, email, address, hours_weekday, hours_saturday, instagram_url, facebook_url |
| `Location.tsx` | address, phone, phone_secondary, email, hours_weekday, hours_saturday, google_maps_embed_url |
| `CTABanner.tsx` | whatsapp_number, whatsapp_message, phone_secondary |
| `WhatsAppButton.tsx` | whatsapp_number, whatsapp_message |

### 5. ContactPage
- Usar `site_settings` para dados de contato
- Formulário funcional: submit insere na tabela `contact_messages` com validação zod
- Toast de sucesso/erro

## Padrão de implementação

- Cada componente terá loading skeleton e fallback para dados hardcoded caso a query falhe
- `useSiteSettings` com `staleTime: 5min` para evitar re-fetches desnecessários
- Icon mapping: criar helper `getIconComponent(iconName)` para mapear string do banco para componente Lucide (usado em Features e Services)
- Videos: embed real do YouTube usando `youtube_id`

## Arquivos novos
- `src/hooks/useSiteSettings.ts`
- `src/lib/icon-map.ts`

## Arquivos editados (15)
- `src/components/home/Hero.tsx`
- `src/components/home/Features.tsx`
- `src/components/home/ServicesPreview.tsx`
- `src/components/home/About.tsx`
- `src/components/home/Team.tsx`
- `src/components/home/Testimonials.tsx`
- `src/components/home/Videos.tsx`
- `src/components/home/Events.tsx`
- `src/components/home/Location.tsx`
- `src/components/home/CTABanner.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/WhatsAppButton.tsx`
- `src/pages/ContactPage.tsx` (+ formulário funcional)
- `src/pages/ServicesPage.tsx`
- `src/pages/TeamPage.tsx`
- `src/pages/TestimonialsPage.tsx`
- `src/pages/VideosPage.tsx`
- `src/pages/EventsPage.tsx`
- `src/pages/About.tsx`

