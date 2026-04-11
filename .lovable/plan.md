

## Plano: Filtro Anti-Bot no Analytics

### Problema
Bots de datacenters (heficed, ColoCrossing) estão gerando cliques falsos que inflam os números e escondem leads reais.

### Correções

**1. Filtro no backend (Edge Function `track-lead`)**
- Manter uma lista de ISPs/ASNs conhecidos de datacenter (heficed, ColoCrossing, OVH, Hetzner, DigitalOcean, AWS, Google Cloud, Azure, etc.)
- Quando o geo-IP retornar um ISP dessa lista, marcar o registro com `is_bot: true` ou simplesmente descartar o registro
- Alternativa: verificar se o país é diferente de "Brasil" e marcar como suspeito

**2. Adicionar coluna `is_bot` na tabela `whatsapp_leads`**
- Migração: `ALTER TABLE whatsapp_leads ADD COLUMN is_bot boolean DEFAULT false`
- Permite manter os dados para auditoria mas filtrá-los nos dashboards

**3. Filtrar bots no dashboard**
- Atualizar todas as queries do analytics (KPIs, gráficos, DataGrid) para excluir `WHERE is_bot = false`
- Adicionar toggle opcional "Mostrar bots" para debug

**4. Limpar dados existentes**
- Migração para marcar como bot os registros existentes de ISPs conhecidos de datacenter

**5. Rate-limit por sessão**
- No `track-lead`, limitar a no máximo 1 registro por `session_id + button_id` a cada 30 segundos para evitar duplicatas mesmo de usuários reais (debounce)

### Arquivos afetados
- `supabase/functions/track-lead/index.ts` — filtro de ISP + rate-limit
- Migração SQL — coluna `is_bot` + limpeza de dados existentes
- `src/components/analytics/KPICards.tsx`, `LeadsDataGrid.tsx`, `ButtonConversion.tsx`, `DailyTrendChart.tsx` — filtro `is_bot = false`

### Detalhes técnicos
- A detecção por ISP é simples e eficaz para 90%+ dos bots de datacenter
- O rate-limit por sessão resolve o problema de cliques duplicados (mesmo humano clicando várias vezes rápido)
- Nenhuma dessas mudanças afeta a experiência do usuário real no site

