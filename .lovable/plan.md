

## Plano: Corrigir tracking de cliques WhatsApp (sendBeacon → fetch)

### Problema
Os cliques no WhatsApp não estão sendo registrados porque o `openTrackedWhatsApp.ts` usa `navigator.sendBeacon()`, que:
- Não permite enviar headers customizados (Content-Type vai como text/plain)
- Pode ser bloqueado por CORS no gateway do Supabase
- Resultado: as chamadas falham silenciosamente e nenhum clique é gravado

Prova: os logs mostram ZERO chamadas a `track-lead`, enquanto `track-session` (que usa `fetch`) funciona normalmente.

### Correção

**Arquivo:** `src/lib/openTrackedWhatsApp.ts`

Substituir o `sendBeacon` por `fetch` com `keepalive: true`, seguindo o mesmo padrão que já funciona em `track-session`:
- Usar `fetch()` com `method: POST`, `headers: { "Content-Type": "application/json" }`, `keepalive: true`
- Manter o `catch(() => {})` para nunca bloquear a navegação ao WhatsApp
- Abrir o WhatsApp imediatamente após disparar o fetch (sem await)
- Usar `VITE_SUPABASE_URL` + `/functions/v1/track-lead` em vez de construir a URL manualmente com project ID (mais robusto)

### Resultado esperado
Todos os cliques reais no WhatsApp passarão a ser registrados corretamente no banco de dados e aparecerão no dashboard de analytics.

