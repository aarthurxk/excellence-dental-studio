

## Plano de Correção: Analytics de Rastreamento

### Problema
Três bugs fazem o analytics subestimar drasticamente o tráfego e perder atribuição do Google Ads.

### Correções

**1. Rastrear o botão Hero do WhatsApp**
- Editar `src/components/home/Hero.tsx` para usar `trackWhatsAppClick("btn-hero")` com o mesmo padrão dos outros botões (preventDefault + finally → window.open).

**2. Corrigir persistência de UTMs — sempre atualizar com novos parâmetros**
- Editar `src/hooks/useAnalytics.ts`: quando a URL contém UTMs ou click IDs (`gclid`, `fbclid`, etc.), sobrescrever os dados armazenados com os novos valores, gerando um novo `session_id`. Isso garante que cada visita paga é atribuída corretamente.

**3. Rastrear sessões no carregamento da página (não só no clique do WhatsApp)**
- Criar um novo edge function `track-session` que recebe apenas os dados de sessão e faz upsert na tabela `traffic_sessions`.
- Chamar esse edge function no `useAnalytics` (no `useEffect` de inicialização), com `keepalive: true` e timeout de 500ms para não impactar performance.
- Isso separa "Sessões" (visitas ao site) de "Cliques WhatsApp" (conversões), dando uma visão real do funil.

### Detalhes técnicos
- O edge function `track-session` será uma versão simplificada do `track-lead`, sem a parte de inserção em `whatsapp_leads`.
- A lógica de "session nova vs existente" usará um flag em `sessionStorage` (que expira ao fechar a aba) para evitar múltiplos registros na mesma visita.
- A tabela `traffic_sessions` já tem RLS de insert para `anon` e unique constraint em `session_id` com `ignoreDuplicates`, então não precisa de migração.
- O `DailyTrendChart` e demais componentes já consomem `traffic_sessions` separadamente — após a correção, os números passarão a divergir corretamente (sessões > cliques).

### Arquivos afetados
- `src/components/home/Hero.tsx` — adicionar tracking ao botão
- `src/hooks/useAnalytics.ts` — atualizar UTMs em visitas subsequentes + disparar track-session
- `supabase/functions/track-session/index.ts` — novo edge function (cópia simplificada do track-lead)

