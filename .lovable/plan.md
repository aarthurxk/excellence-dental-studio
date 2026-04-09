

## Tracking de Engajamento por Seção + Dashboard

### O que será feito

Adicionar rastreamento invisível de **visualizações por seção** (Intersection Observer) e **cliques em links/botões de navegação** (Tratamentos, Vídeos, Eventos, etc.), armazenando tudo no banco. Exibir esses dados no dashboard de Analytics com um novo gráfico.

---

### 1. Nova tabela: `section_events`

Migration SQL para registrar eventos de seção:

```sql
CREATE TABLE public.section_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,        -- 'view' ou 'click'
  section_name text NOT NULL,      -- 'tratamentos', 'videos', 'eventos', etc.
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.section_events ENABLE ROW LEVEL SECURITY;

-- Anon pode inserir (tracking público)
CREATE POLICY "Anon can insert section events"
  ON public.section_events FOR INSERT TO anon
  WITH CHECK (true);

-- Admins podem ler
CREATE POLICY "Admins can read section events"
  ON public.section_events FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- Índice para queries do dashboard
CREATE INDEX idx_section_events_created ON public.section_events(created_at DESC);
CREATE INDEX idx_section_events_section ON public.section_events(section_name, event_type);
```

### 2. Nova RPC: `analytics_section_engagement`

Função SQL que retorna contagem de views e clicks por seção nos últimos 30 dias:

```sql
CREATE FUNCTION analytics_section_engagement()
RETURNS TABLE(section_name text, views bigint, clicks bigint)
-- Agrupa section_events por section_name, pivotando event_type
```

### 3. Novo hook: `src/hooks/useSectionTracking.ts`

- Usa **Intersection Observer** para detectar quando cada seção entra no viewport (threshold 50%)
- Ao entrar pela primeira vez na sessão, faz INSERT direto na tabela `section_events` com `event_type = 'view'`
- Exporta função `trackSectionClick(sectionName)` para registrar cliques
- Debounce por sessão — cada seção só registra 1 view por sessão

### 4. Instrumentação das seções da Home

Adicionar `data-section="nome"` e o observer nas seções do `Index.tsx`:

| Seção | section_name |
|-------|-------------|
| HeroSection | `hero` |
| AboutSection | `sobre` |
| DepartmentsSection | `tratamentos` |
| DoctorsSection | `equipe` |
| TestimonialsSection | `depoimentos` |
| BeforeAfter | `antes-depois` |
| Videos | `videos` |
| Events | `eventos` |
| FAQ | `faq` |
| Location | `localizacao` |

Para **cliques**, interceptar os botões "Ver todos os tratamentos", "Ver todos os vídeos", "Ver eventos" chamando `trackSectionClick()` antes da navegação.

### 5. Novo componente: `src/components/analytics/SectionEngagement.tsx`

- Gráfico de barras (Recharts) mostrando views e clicks por seção lado a lado
- Estilo neumórfico consistente com o dashboard atual
- Dados vindos da RPC `analytics_section_engagement`

### 6. Atualizar `AdminAnalytics.tsx`

- Adicionar `<SectionEngagement />` no layout do dashboard, abaixo do GeoAccessChart

---

### Arquivos criados
- `src/hooks/useSectionTracking.ts`
- `src/components/analytics/SectionEngagement.tsx`
- Migration SQL (tabela + RPC)

### Arquivos modificados
- `src/components/analytics/AnalyticsProvider.tsx` — ativar o hook de seção
- `src/pages/Index.tsx` — wrapper com refs para observer
- `src/components/home/ServicesPreview.tsx` — track click no "Ver todos"
- `src/components/home/Videos.tsx` — track click
- `src/components/home/Events.tsx` — track click
- `src/pages/admin/AdminAnalytics.tsx` — adicionar SectionEngagement

