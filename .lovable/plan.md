

## Sistema de Tracking Analítico + Dashboard BI

Projeto dividido em 4 fases, sem alterar nada visual no site atual. O tracking opera como um "fantasma" — captura dados em background e nunca bloqueia a navegação do usuário.

---

### FASE 1 — Infraestrutura de Tracking no Front-End

**Novos arquivos:**

1. **`src/hooks/useAnalytics.ts`** — Hook global silencioso, injetado no `App.tsx`. Responsável por:
   - Capturar UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) e Click IDs (`gclid`, `fbclid`, `ttclid`) da URL
   - Salvar em `localStorage` + Cookies first-party (90 dias) para persistência contra bloqueadores
   - Capturar `document.referrer`
   - Gerar um `session_id` único (UUID)

2. **`src/hooks/useScrollDepth.ts`** — Listener passivo de scroll que registra marcos (25%, 50%, 75%, 100%) num state interno, sem re-renders no DOM

3. **`src/hooks/useDeviceInfo.ts`** — Extrai resolução de tela, fuso horário, idioma, qualidade de rede (`navigator.connection`), e detecta In-App Browser (Instagram/Facebook)

4. **`src/lib/trackWhatsAppClick.ts`** — Função utilitária que:
   - Empacota todos os dados coletados (UTMs, scroll, tempo na página, device info) em JSON
   - Faz POST para a Edge Function com timeout de 500ms
   - Em caso de timeout ou erro, redireciona imediatamente para o WhatsApp
   - Tudo dentro de `try/catch` — nunca bloqueia a conversão

**Arquivos modificados:**

- **`src/App.tsx`** — Adicionar `<AnalyticsProvider />` (componente invisível que ativa os hooks)
- **`src/components/layout/WhatsAppButton.tsx`** — Interceptar clique com `data-track-id="btn-flutuante"`, chamar `trackWhatsAppClick` antes de redirecionar
- **`src/components/medico/HeroSection.tsx`** — Adicionar `data-track-id="btn-hero"` no botão WhatsApp do hero
- **`src/components/home/CTABanner.tsx`** — Adicionar `data-track-id="btn-cta-banner"`
- **`src/components/home/FAQ.tsx`** — Adicionar `data-track-id="btn-faq"`
- **`src/components/home/BeforeAfter.tsx`** — Adicionar `data-track-id="btn-antes-depois"`

Cada botão WhatsApp terá seu clique interceptado via um wrapper que chama `trackWhatsAppClick(buttonId)` e depois abre o link normalmente. O `<a>` continua funcionando mesmo sem JavaScript (fallback nativo).

---

### FASE 2 — Backend (Tabelas + Edge Function)

**Novas tabelas (migration):**

```sql
-- Sessões de tráfego
CREATE TABLE public.traffic_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  referrer text DEFAULT '',
  utm_source text, utm_medium text, utm_campaign text, 
  utm_content text, utm_term text,
  gclid text, fbclid text, ttclid text,
  device_os text, browser text, browser_in_app boolean DEFAULT false,
  screen_resolution text, network_type text,
  user_timezone text, user_language text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Leads de WhatsApp
CREATE TABLE public.whatsapp_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  button_id text NOT NULL,
  time_on_site_seconds integer DEFAULT 0,
  max_scroll_depth integer DEFAULT 0,
  click_timestamp timestamptz NOT NULL DEFAULT now(),
  user_timezone text, user_language text,
  ip_address text, ip_isp text,
  geo_state text, geo_city text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

RLS: Leitura restrita a admins (`is_admin(auth.uid())`). Insert liberado para `anon` (tracking público). Sem FK com tabelas existentes.

**Nova Edge Function: `supabase/functions/track-lead/index.ts`**
- Recebe POST com JSON dos dados de sessão + clique
- Extrai IP real via `x-forwarded-for`
- Faz fetch server-side para API aberta de GeoIP (ip-api.com) para obter cidade, estado e ISP
- Insere em `traffic_sessions` (upsert por session_id) e `whatsapp_leads`
- Retorna 200 rápido; se GeoIP falhar, insere sem dados geográficos

---

### FASE 3 — RPCs de Comparação Temporal

**3 funções SQL (database functions via migration):**

1. **`analytics_daily_comparison()`** — Compara leads/sessões de hoje (até hora atual) vs ontem (mesma faixa horária)
2. **`analytics_weekly_comparison()`** — Semana corrente vs mesma fatia da semana passada
3. **`analytics_monthly_comparison()`** — Mês corrente vs mês passado (proporcional aos dias corridos)

Cada uma retorna: `current_count`, `previous_count`, `growth_percentage`. Filtráveis por tipo (sessões ou leads).

**Views/RPCs auxiliares:**
- `analytics_leads_by_source()` — agrupa leads por utm_source/campaign
- `analytics_leads_by_button()` — agrupa por button_id
- `analytics_device_breakdown()` — proporção de dispositivos/conexão
- `analytics_scroll_quality()` — leads com scroll ≥75% vs total

---

### FASE 4 — Dashboard BI (`/admin/dashboard`)

**Novos arquivos:**

1. **`src/pages/admin/AdminAnalytics.tsx`** — Página principal do dashboard com tema escuro + glassmorphism

2. **`src/components/analytics/KPICards.tsx`** — Cards com volume de leads/tráfego e indicador percentual de crescimento (D/D-1, W/W-1, M/M-1)

3. **`src/components/analytics/ChannelAttribution.tsx`** — Gráfico de barras (Recharts) cruzando cliques WhatsApp com campanha geradora

4. **`src/components/analytics/LeadQuality.tsx`** — Gráfico comparando leads totais vs leads com scroll alto (intenção)

5. **`src/components/analytics/DeviceBreakdown.tsx`** — Pie chart de conexões e dispositivos (top de linha vs básicos)

6. **`src/components/analytics/ButtonConversion.tsx`** — Gráfico mostrando conversão por posição de botão

7. **`src/components/analytics/LeadsDataGrid.tsx`** — Tabela real-time listando cada clique com data, cidade, ISP, campanha, navegador, tempo na página. Botão de exportar CSV.

**Arquivos modificados:**
- **`src/App.tsx`** — Nova rota `/admin/dashboard` protegida
- **`src/components/admin/AdminLayout.tsx`** — Novo item no menu lateral "Analytics/BI"

**Estilo visual:** Fundo escuro (`bg-slate-950`), cards com `backdrop-blur-xl bg-white/5 border-white/10`, gradientes sutis nos KPIs, tipografia clara sobre fundo escuro. Integração com Recharts (já disponível no projeto via shadcn charts).

---

### Resumo de segurança

- Nenhum componente visual do site público é alterado (apenas `data-attributes` e interceptação de cliques)
- Todo tracking é `try/catch` com timeout de 500ms — a conversão nunca é bloqueada
- Tabelas novas são isoladas, sem FK com tabelas existentes
- RLS garante que apenas admins leem dados de analytics
- Edge Function valida input com Zod

