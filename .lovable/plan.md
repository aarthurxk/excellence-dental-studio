

## Redesign do Dashboard Analytics — Neumorfismo Clean + Geo Chart + Paginação

### Visão Geral

Trocar o visual escuro com glassmorphism para um estilo **neumórfico clean** (fundo claro acinzentado, sombras internas/externas suaves) alinhado com o resto do admin. Adicionar um **gráfico de acessos por localização** com filtro por granularidade geográfica, e implementar **paginação** na tabela de leads (últimos 30, 10 por página).

---

### Alterações por Arquivo

**1. `src/pages/admin/AdminAnalytics.tsx`** — Página principal
- Remover fundo `bg-slate-950` e `-m-6`
- Usar fundo claro (`bg-gray-100`) com tipografia escura
- Adicionar o novo componente `<GeoAccessChart />` entre os gráficos existentes
- Layout mais completo: seção de resumo textual no topo, grid de KPIs, gráficos em 2 colunas, geo chart em largura total, tabela paginada

**2. `src/components/analytics/KPICards.tsx`** — Cards KPI
- Estilo neumórfico: `bg-gray-100 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] rounded-2xl`
- Texto escuro (`text-gray-800`, `text-gray-500`)
- Badges de crescimento mantêm cores (verde/vermelho) mas com fundo neumórfico

**3. `src/components/analytics/ChannelAttribution.tsx`** — Gráfico de barras
- Mesmo estilo neumórfico nos cards
- Tooltip com fundo claro
- Cores de barras ajustadas para harmonizar com tema claro

**4. `src/components/analytics/ButtonConversion.tsx`** — Gráfico de botões
- Mesma refatoração de estilo neumórfico

**5. `src/components/analytics/LeadQuality.tsx`** — Pie chart qualidade
- Estilo neumórfico, cores mais vibrantes para contraste em fundo claro

**6. `src/components/analytics/DeviceBreakdown.tsx`** — Pie chart dispositivos
- Estilo neumórfico

**7. `src/components/analytics/LeadsDataGrid.tsx`** — Tabela de leads
- Estilo neumórfico
- Limitar query a `30` registros (em vez de 200)
- Adicionar state de paginação (`page`, 10 por página)
- Renderizar controles de paginação (Anterior/Próximo) usando componentes de `pagination.tsx`
- Exportar CSV dos 30 leads carregados

**8. `src/components/analytics/GeoAccessChart.tsx`** — **NOVO**
- Componente com um `<Select>` para escolher granularidade: Cidade, Estado, País (futuramente Bairro quando disponível)
- Query que agrupa `whatsapp_leads` por `geo_city`, `geo_state` conforme filtro selecionado
- Exibe um `BarChart` horizontal (Recharts) mostrando os top 10 locais por volume de leads
- Estilo neumórfico consistente

**9. Migration SQL** — Nova RPC `analytics_leads_by_geo`
- Função que recebe parâmetro `_group_by` (`city`, `state`) e retorna `location_name` + `lead_count`
- Agrupa pela coluna correspondente em `whatsapp_leads` nos últimos 30 dias
- `SECURITY DEFINER` com acesso restrito

---

### Detalhes Técnicos

**Estilo Neumórfico (padrão aplicado a todos os cards):**
```
bg-gray-100 rounded-2xl p-5
shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]
```

**Paginação da tabela:**
- `useState` para `currentPage`
- Slice do array: `leads.slice((page-1)*10, page*10)`
- Total de páginas: `Math.ceil(leads.length / 10)` (máximo 3 páginas para 30 leads)

**RPC `analytics_leads_by_geo`:**
```sql
CREATE FUNCTION analytics_leads_by_geo(_group_by text DEFAULT 'city')
RETURNS TABLE(location_name text, lead_count bigint)
-- agrupa por geo_city ou geo_state dos últimos 30 dias
```

