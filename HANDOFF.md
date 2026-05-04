# Handoff — Excellence Dental Studio

**Data:** 2026-05-04  
**Status:** Em andamento — NÃO commitado, NÃO deployado no Lovable.

---

## Contexto

Refatoração do painel admin do site da Odonto Excellence (Lovable + Supabase + React + Vite + shadcn + Tailwind).  
Benchmark funcional: JetSales/JetGO. Design: Vercel (monocromático, Inter font, dark sidebar).  
Repo: `aarthurxk/excellence-dental-studio`  
Local: `C:\Users\Arthur\dev\excellence-dental-studio`  
**Nunca** mexa na VPS (69.62.100.183) — robôs Vera em produção lá.

---

## Plano geral (8 etapas)

| Etapa | Nome | Status |
|---|---|---|
| A | Redesign visual + sidebar 5 grupos + Cmd+K | ✅ Feita |
| 0 | Componentes reutilizáveis + hooks base | ✅ Feita |
| 1 | Soft delete msgs + auditoria + RLS | ✅ Feita |
| 2 | Dashboard enriquecido c/ avatar + ranking | ✅ Feita |
| 3 | Menu "Ao Vivo" (wallboard) | ✅ Feita |
| 4 | Cards pendentes c/ foto/SLA | ✅ Feita |
| 5 | Filtros por tag em Conversas | ✅ Feita |
| 6 | Permissões RLS + gates de rota | ✅ Feita |
| 7 | QA, testes finais, checklist | ✅ Feita |

---

## O que foi feito (Etapas A + 0)

### Arquivos ALTERADOS
- `src/index.css` — tokens Vercel (Inter, radius 0.375rem, dark sidebar, paleta monocromática)
- `tailwind.config.ts` — font-sans: Inter, font-mono: Geist Mono
- `src/test/setup.ts` — mock ResizeObserver (jsdom)
- `src/components/admin/AdminLayout.tsx` — sidebar 5 grupos colapsáveis, Ctrl+K trigger, `.admin-layout` class

### Arquivos CRIADOS
- `src/components/admin/CommandPalette.tsx` — cmdk, 26 rotas, filtra por role
- `src/components/admin/cards/ConversationCard.tsx` — card conversa (avatar, tags, SLA, unread)
- `src/components/admin/cards/AgentLiveCard.tsx` — card atendente ao vivo (presença, scroll interno)
- `src/components/admin/cards/MetricsCard.tsx` — card métrica com avatar/trend
- `src/components/admin/badges/DeletedMessageBadge.tsx` — badge msg apagada (modo limitado/admin)
- `src/components/admin/filters/TagFilter.tsx` — multiselect tags, chips, contagem
- `src/hooks/useAgentPresence.ts` — Supabase Realtime Presence, ordenação online→offline
- `src/hooks/useConversationFilters.ts` — filtros URL-persistidos, applyLocal()
- `src/hooks/useDeletedMessages.ts` — busca deleted_message_audit, gate por role
- `src/test/adminLayout.test.ts` — 9 testes filtragem por role
- `src/test/commandPalette.test.tsx` — 8 testes estrutura nav
- `src/test/foundation.test.ts` — 23 testes helpers/lógica pura

**Testes: 40/40 ✅ | Build: limpo ✅**

---

## Etapa 1 — O que foi feito

### Arquivos criados
- `supabase/migrations/20260504000001_soft_delete_and_audit.sql` — ALTER conversations_log/contact_messages (deleted_at, deleted_by, deletion_reason), CREATE deleted_message_audit, RLS, 2 triggers (fn_audit_deleted_conversation_log, fn_audit_deleted_contact_message)
- `supabase/migrations/20260504000002_role_permissions_messages_audit.sql` — INSERT role_permissions para módulo messages_audit (admin/socio/gerente)
- `src/test/etapa1_soft_delete.test.ts` — 20 testes (permissões, filtragem, audit entry, ConvLogMeta)

### Arquivos alterados
- `src/pages/admin/AdminMessages.tsx` — hard delete → soft delete (update deleted_at), admin vê msgs deletadas com `DeletedMessageBadge`, badge "Modo auditoria" no header
- `src/components/admin/ConversasWhatsApp.tsx` — ConvLogMeta ganhou deleted_at/deleted_by/deletion_reason, query busca esses campos, renderiza `DeletedMessageBadge` no lugar de msgs apagadas, botão trash (hover) para soft-delete por admin

**Testes: 60/60 ✅ | Build: limpo ✅**

---

## ✅ IMPLEMENTAÇÃO CONCLUÍDA

**Testes: 100/100 | Build: limpo | Não commitado ainda**

### Arquivos criados/alterados (Etapas 2–6)
- `supabase/migrations/20260504000003_leads_assignment_sla.sql`
- `src/components/admin/dashboard/AtendentesOnline.tsx`
- `src/components/admin/dashboard/RankingAtendentes.tsx`
- `src/components/admin/dashboard/SectionEquipe.tsx`
- `src/pages/admin/AdminAoVivo.tsx`
- `src/pages/admin/AdminPendentes.tsx`
- `src/test/etapas2a6.test.ts` (16 testes)
- Alterados: `AdminDashboard.tsx`, `ConversasWhatsApp.tsx`, `ProtectedRoute.tsx`, `App.tsx`

### Para deployar
1. `git add -A && git commit -m "feat: redesign admin panel + CRM features"` (confirmar com Arthur)
2. `git push origin main` → Lovable detecta e deploya
3. Aplicar migrations no Supabase: dashboard > SQL Editor > rodar os 3 arquivos de `supabase/migrations/20260504*`

---

## Próxima etapa (Etapa 2 — já feita, ver acima)

### Objetivo
Converter hard delete → soft delete em mensagens. Auditoria admin de msgs apagadas.

### O que fazer (Etapa 2 — Dashboard enriquecido)

**Objetivo:** adicionar widgets com avatar/ranking ao `AdminDashboard.tsx` sem quebrar os 8 cards existentes.

**Componentes já prontos (Etapa 0):** `MetricsCard`, `Avatar` shadcn, `useAgentPresence`.

**O que criar:**
1. `src/components/admin/dashboard/RankingAtendentes.tsx` — top atendentes por leads atendidos (query `leads` GROUP BY `assigned_to`, join `user_roles` para nome)
2. `src/components/admin/dashboard/AtendentesOnline.tsx` — strip de avatares dos usuários online (usa `useAgentPresence`)
3. `src/components/admin/dashboard/SectionEquipe.tsx` — wrapper que agrupa os dois acima

**Alterar:**
- `src/pages/admin/AdminDashboard.tsx` — adicionar `<SectionEquipe />` abaixo dos 8 cards atuais (sem remover nada)

**Migration necessária:**
```sql
-- leads precisa de assigned_to para saber qual atendente pegou
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS priority smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sla_due_at timestamptz;
```
Arquivo: `supabase/migrations/20260504000003_leads_assignment_sla.sql`

---

## Sidebar — 5 grupos

| Grupo | Rotas |
|---|---|
| Operação | /admin, /admin/ao-vivo*, /admin/pendentes*, /admin/conversas, /admin/leads, /admin/handoff |
| Vera IA | /admin/resumos, /admin/vera-actions, /admin/vera-health, /admin/vera-prompts |
| Conteúdo | /admin/tratamentos, /admin/dentistas, /admin/depoimentos, /admin/videos, /admin/eventos, /admin/diferenciais, /admin/antes-depois, /admin/sobre |
| Analytics | /admin/analytics, /admin/relatorios, /admin/roadmap |
| Sistema | /admin/mensagens, /admin/whatsapp, /admin/usuarios, /admin/configuracoes, /admin/audit |

*Rotas /ao-vivo e /pendentes = páginas ainda não criadas (Etapas 3 e 4)

---

## Stack de teste

```
node_modules/.bin/vitest run          # todos os testes
node_modules/.bin/vite build          # smoke build
```

Instalar deps se node_modules sumiu: `npm install`

---

## Regras críticas

- NÃO commitar ainda — usuário quer tudo pronto antes
- NÃO tocar na VPS nem em workflows n8n
- NÃO quebrar rotas existentes do site público (Index, About, Services, etc.)
- Soft delete NUNCA deleta dado — só marca `deleted_at`
- Permissão de ver msgs apagadas: apenas admin/socio/gerente
- Modelos Claude: Sonnet 4.6 pra volume, Opus 4.7 pra etapas críticas (A e 3)
