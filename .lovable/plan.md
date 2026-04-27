# Decisões Finais — Plano Vera Admin v3 (definitivo)

> **Para o Lovable:** este arquivo SUBSTITUI o `PLANO_LOVABLE.md` original. As 22 perguntas e 5 confirmações foram respondidas. Inicie pelo **PR 0** (apenas migrations, sem frontend). Cada PR = 1 branch + 1 commit + 1 PR no GitHub. NÃO avance sem o anterior estar verde no Vitest.

---

## 1. Webhook Evolution → ✅ OPÇÃO A (Evolution manda pros dois)

**Por quê:** independência total. Se n8n cair, painel continua recebendo. Se Lovable cair, robô continua atendendo. Zero acoplamento.

**Ação Lovable:** cria edge function `evo-webhook` deployada em `https://wgjorvpipbwgguaxyuvj.supabase.co/functions/v1/evo-webhook`.

**Schema esperado do payload Evolution v2 (`messages.upsert` event):**
```json
{
  "event": "messages.upsert",
  "instance": "vera-whatsapp",
  "data": {
    "key": { "remoteJid": "558196760118@s.whatsapp.net", "fromMe": false, "id": "..." },
    "message": { "conversation": "..." },
    "pushName": "Glauber",
    "messageTimestamp": 1745000000
  }
}
```

**Lógica da edge function:**
1. Valida `event === 'messages.upsert'` (ignorar outros eventos com 200 OK)
2. Valida header `X-Ingest-Token` contra secret
3. Extrai `phone` (digits do `remoteJid` antes do `@`)
4. UPSERT em `leads` (chave `phone`) com `push_name`, `last_contact_at = NOW()`, incrementa `total_messages_in` (se `!fromMe`) ou `total_messages_out` (se `fromMe`)
5. INSERT em `conversations_log`:
   - `lead_phone` = phone
   - `remote_jid` = `data.key.remoteJid`
   - `direction` = `fromMe ? 'out' : 'in'`
   - `message_text` = `data.message.conversation` ou `data.message.extendedTextMessage.text` ou `data.message.audioMessage ? '[ÁUDIO — aguardando transcrição]' : '[mensagem não suportada]'`
   - `whatsapp_message_id` = `data.key.id`
   - `sent_by` = `fromMe ? 'bot' : 'user'`
   - `is_audio` = `!!data.message.audioMessage`
6. Trata áudio: flag `is_audio: true` + coluna `audio_pending: true`. n8n posta transcrição depois via segundo webhook `evo-webhook-update` (PUT por `whatsapp_message_id`).
7. Retorna 200 sempre (Evolution v2 não faz retry, e queremos evitar reentrega duplicada)

**Ação Arthur (após Lovable deployar):** adicionar URL no Evolution via:
```bash
curl -X POST 'https://evo.odontoexcellencerecife.com.br/webhook/set/vera-whatsapp' \
  -H 'apikey: 548C7E69-C5EA-49FE-9FD4-FCCD9797F52D' \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": {
      "url": "https://wgjorvpipbwgguaxyuvj.supabase.co/functions/v1/evo-webhook",
      "events": ["MESSAGES_UPSERT"],
      "webhook_by_events": false
    },
    "additional_webhooks": [
      { "url": "http://10.0.2.4:5678/webhook/vera-wa-adapter", "events": ["MESSAGES_UPSERT"] }
    ]
  }'
```
Evolution v2 suporta `additional_webhooks` array — n8n continua recebendo igual.

---

## 2. Cancelar/Remarcar agendamento → ✅ OPÇÃO B (edge function + connector google_calendar)

**Por quê:** zero dependência de novo workflow n8n. Connector `google_calendar` já existe nativamente no Lovable. Centraliza no mesmo lugar.

**Ação Lovable:**
1. Pede ao Arthur para conectar Google Calendar via connector usando conta `artha.cl@gmail.com` (mesma do n8n)
2. Cria edge function `cancel-appointment`:
   - Recebe POST `{ appointment_id }`
   - SELECT `appointments WHERE id = $1` → pega `google_event_id`
   - Connector google_calendar: `DELETE /calendars/{calendarId}/events/{eventId}` onde `calendarId = '993e3473eef6a1de261f64f497cdeb93680cc3bdcfdfcbe856ac8dc3f0a20086@group.calendar.google.com'`
   - UPDATE `appointments SET status='cancelled', cancelled_at=NOW(), cancelled_by=auth.uid()`
   - INSERT em `vera_audit_log` (após PR 8 existir)
   - Retorna `{ success: boolean, gcal_status: number }`
3. Cria edge function `reschedule-appointment`:
   - Recebe POST `{ appointment_id, new_datetime }`
   - SELECT pega `google_event_id`
   - `PATCH /events/{eventId}` com `start.dateTime = new_datetime`, `end.dateTime = new_datetime + 1h`
   - UPDATE `appointments SET scheduled_at = new_datetime, rescheduled_at = NOW(), rescheduled_by = auth.uid()`
   - Retorna `{ success, gcal_status }`
4. Tela `/admin/agendamentos` botão "Cancelar" → modal "Tem certeza?" → POST `cancel-appointment`. Botão "Remarcar" → modal calendar+time picker → POST `reschedule-appointment`.

**Sem mexer no n8n. Sem workflow novo.**

---

## 3. Sync VPS → Lovable → ✅ OPÇÃO E (push pelo n8n) + descontinuar mirror

**Por quê:** tempo real, zero infra nova, zero porta aberta, zero cron, zero dúvida sobre IPs Supabase Edge.

**Decisão arquitetural complementar:** **eliminar tabelas mirror desnecessárias.** Como Evolution já vai gravar direto no Lovable (item 1), `vera_messages_mirror` deixa de existir. Apenas estas tabelas precisam de push do n8n:

| Tabela Lovable | Quem escreve | Como |
|---|---|---|
| `vera_resumos` | n8n workflow `Resumo Encerramento` (ID `50irSiLQ2z5COLsQ`) | Arthur adiciona node HTTP Request final que POSTa pra edge function `ingest-resumo` em paralelo ao Postgres write |
| `vera_conversation_state` | n8n VERA CORE node `Salvar Estagio SPIN` | Arthur adiciona node HTTP Request paralelo ao Postgres write |
| `vera_logs` | **NÃO replicar** — descontinuar essa tabela. Logs ficam só no n8n executions UI (já é a fonte de verdade pra debug). Painel `/admin/logs` lê de **execuções n8n via edge function `n8n-executions`** que chama `GET /api/v1/executions` em demanda. | n/a |
| `vera_handoff_queue` | n8n workflow handoff (a criar quando rolar) escreve direto via `ingest-handoff` | n8n HTTP Request |
| `vera_spin_prompts` (write-back) | edição no painel Lovable → edge function `push-vera-config` faz UPDATE no Postgres VPS via Cloudflare Tunnel | edge function on-demand (única exceção que precisa TCP) |

**Histórico legado (1390 mensagens antigas pré-Evolution-Lovable):** **DESCARTAR**. Já está no n8n / VPS pra compliance. Painel só mostra dali pra frente. Reduz drasticamente o escopo.

**Edge functions a criar (lista completa):**
- `evo-webhook` — recebe Evolution (item 1)
- `evo-webhook-update` — recebe transcrição de áudio do n8n (PUT por `whatsapp_message_id`)
- `ingest-resumo` — n8n → Lovable (insert vera_resumos)
- `ingest-conversation-state` — n8n → Lovable (upsert vera_conversation_state)
- `ingest-handoff` — n8n → Lovable (insert vera_handoff_queue)
- `cancel-appointment` — item 2
- `reschedule-appointment` — item 2
- `n8n-executions` — proxy leitura logs (chama API n8n)
- `push-vera-config` — write-back config (precisa Cloudflare Tunnel, configurado por Arthur antes do PR 6)

**Autenticação ingest:** todas as funções `evo-webhook`, `evo-webhook-update`, `ingest-*` exigem header `X-Ingest-Token` igual ao secret `INGEST_TOKEN` (UUID gerado por Arthur, configurado em Supabase secrets E nos nodes HTTP Request do n8n).

---

## 4. Permissões `secretaria` → ✅ APROVADAS

| Recurso | Ver | Criar | Editar | Apagar |
|---|---|---|---|---|
| Leads | ✅ | ❌ | ✅ (nome, tel, email, notes, tags, status) | ❌ |
| Conversas/mensagens | ✅ | ✅ (enviar via Evolution) | ❌ | ❌ |
| Agendamentos | ✅ | ✅ (criar manual fora do bot) | ✅ (reagendar) | ❌ (só status=cancelled via fluxo controlado) |
| Resumos Vera | ✅ | ❌ | ❌ | ❌ |
| Logs Vera | ❌ | ❌ | ❌ | ❌ |
| Handoff queue | ✅ | ❌ | ✅ (assumir, devolver, marcar resolvido) | ❌ |
| Vera config + SPIN prompts | ❌ | ❌ | ❌ | ❌ |
| Site/equipe/serviços | ❌ | ❌ | ❌ | ❌ |
| Users/roles | ❌ | ❌ | ❌ | ❌ |
| Analytics/relatórios | ❌ | ❌ | ❌ | ❌ |
| Auditoria | ❌ | ❌ | ❌ | ❌ |

**Justificativas das diferenças vs proposta original:**
- ❌ **Logs**: secretária NÃO vê logs (informação técnica, ruído operacional, exposição de payloads sensíveis tipo telefones de outros leads).
- ✅ **Agendamentos criar**: secretária PRECISA criar agendamento manual (paciente liga em vez de WhatsApp).
- ❌ **Analytics**: NÃO. Métricas de conversão são gestão, só admin/socio.
- ❌ **Apagar mensagem por engano**: NÃO. Se enviou errado, secretária envia outra mensagem corrigindo. Histórico imutável.

**Migration do PR 0:**
```sql
-- Estende enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'secretaria';

-- Função is_staff (admin OR socio OR secretaria)
CREATE OR REPLACE FUNCTION public.is_staff(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _uid
      AND role IN ('admin','socio','secretaria')
  )
$$;

-- Função auxiliar pra esconder UI específico de secretária
CREATE OR REPLACE FUNCTION public.is_secretaria_only(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _uid AND role = 'secretaria'
  ) AND NOT public.is_admin(_uid)
$$;
```

Aplicar nas RLS:
- `leads`, `appointments`, `conversations_log`, `vera_resumos`, `vera_handoff_queue`, `vera_conversation_state`: SELECT/UPDATE/INSERT = `is_staff()`, DELETE = `is_admin()`
- `vera_config`, `vera_spin_prompts`, `user_roles`, `vera_audit_log`, `site_settings`, `dentists`: ALL = `is_admin()`

---

## 5. Frequência sync → ✅ N/A

Item 3 escolheu opção E (push tempo real pelo n8n). Sem cron. Sem polling. Latência = ~200ms (tempo do node HTTP Request).

Única exceção (`push-vera-config`) é on-demand — só roda quando admin edita no painel.

---

## 📋 Plano consolidado v3 (PRs sequenciais)

| PR | Título | Bloqueia próximo? | Esforço |
|---|---|---|---|
| **PR 0** | Migration: enum `secretaria` + `is_staff()` + colunas em `leads` + tabelas novas + RLS | sim | 1 dia |
| **PR 1** | Edge functions ingest + secret token validation | sim | 1 dia |
| **PR 2** | Estender `/admin/conversas` | não | 1 dia |
| **PR 3** | `/admin/resumos` | não | 0.5 dia |
| **PR 4** | `/admin/handoff` | não | 0.5 dia |
| **PR 5** | `/admin/logs` (proxy n8n) | não | 0.5 dia |
| **PR 6** | Estender `/admin/vera-config` (SPIN prompts + write-back) | depende: tunnel ativo | 1.5 dia |
| **PR 7** | Estender `/admin/leads` + cancel/reschedule appointment | depende: connector GCal | 1 dia |
| **PR 8** | `/admin/audit` + triggers | não | 1 dia |

**Total: ~8 dias Lovable, 9 PRs isolados, zero quebra do `/admin/*` atual.**

---

## 🔧 PR 0 — Especificação completa (comece por aqui)

### Arquivo: `supabase/migrations/20260427_pr0_vera_admin_base.sql`

```sql
-- =============================================================
-- PR 0: Vera Admin — base schema + roles + RLS
-- =============================================================

-- 1. Estender enum app_role com 'secretaria'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'secretaria';

-- 2. Funções auxiliares de role
CREATE OR REPLACE FUNCTION public.is_staff(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _uid AND role IN ('admin','socio','secretaria')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_secretaria_only(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _uid AND role = 'secretaria'
  ) AND NOT public.is_admin(_uid)
$$;

-- 3. Estender tabela leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS gcal_event_id TEXT,
  ADD COLUMN IF NOT EXISTS data_agendamento TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS procedimento_interesse TEXT,
  ADD COLUMN IF NOT EXISTS ja_e_paciente BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ultimo_interesse TEXT,
  ADD COLUMN IF NOT EXISTS resumo TEXT;

-- 4. Estender conversations_log
ALTER TABLE public.conversations_log
  ADD COLUMN IF NOT EXISTS is_audio BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS audio_pending BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_from_ai BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conversations_log_pending_audio
  ON public.conversations_log(audio_pending) WHERE audio_pending = true;

-- 5. Tabela vera_resumos
CREATE TABLE IF NOT EXISTS public.vera_resumos (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,                          -- chat_id estilo "wa:558196760118"
  channel TEXT NOT NULL,                          -- 'whatsapp' | 'telegram' | 'website'
  resumo TEXT NOT NULL,
  outcome TEXT CHECK (outcome IN ('agendou','recusou','transferido','abandonado')),
  data_agendamento TIMESTAMPTZ,
  tags TEXT[],
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  origem TEXT DEFAULT 'n8n'                       -- rastreio
);
CREATE INDEX IF NOT EXISTS idx_vera_resumos_user ON public.vera_resumos(user_id);
CREATE INDEX IF NOT EXISTS idx_vera_resumos_outcome ON public.vera_resumos(outcome);
CREATE INDEX IF NOT EXISTS idx_vera_resumos_criado ON public.vera_resumos(criado_em DESC);

ALTER TABLE public.vera_resumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vera_resumos_select_staff" ON public.vera_resumos
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "vera_resumos_insert_service" ON public.vera_resumos
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "vera_resumos_delete_admin" ON public.vera_resumos
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- 6. Tabela vera_conversation_state
CREATE TABLE IF NOT EXISTS public.vera_conversation_state (
  id BIGSERIAL PRIMARY KEY,
  chat_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  spin_stage TEXT NOT NULL DEFAULT 'triagem'
    CHECK (spin_stage IN ('triagem','situacao','problema','implicacao','necessidade','proposta','encerramento')),
  stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chat_id, channel)
);
CREATE INDEX IF NOT EXISTS idx_vera_conv_state_updated ON public.vera_conversation_state(updated_at DESC);

ALTER TABLE public.vera_conversation_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vera_conv_state_select_staff" ON public.vera_conversation_state
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "vera_conv_state_upsert_service" ON public.vera_conversation_state
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. Tabela vera_handoff_queue
CREATE TABLE IF NOT EXISTS public.vera_handoff_queue (
  id BIGSERIAL PRIMARY KEY,
  chat_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  motivo TEXT NOT NULL,                           -- razão do pedido humano
  payload JSONB,                                  -- contexto extra
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','assumido','resolvido','devolvido')),
  assumido_por UUID REFERENCES auth.users(id),
  assumido_em TIMESTAMPTZ,
  resolvido_em TIMESTAMPTZ,
  notas TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_handoff_status ON public.vera_handoff_queue(status, criado_em DESC);

ALTER TABLE public.vera_handoff_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "handoff_select_staff" ON public.vera_handoff_queue
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "handoff_update_staff" ON public.vera_handoff_queue
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "handoff_insert_service" ON public.vera_handoff_queue
  FOR INSERT TO service_role WITH CHECK (true);

-- 8. Tabela vera_spin_prompts (espelho local de ia_config da VPS)
CREATE TABLE IF NOT EXISTS public.vera_spin_prompts (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descricao TEXT,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_por UUID REFERENCES auth.users(id)
);

-- Seed inicial com chaves conhecidas (Arthur popula valor real depois)
INSERT INTO public.vera_spin_prompts (chave, descricao) VALUES
  ('vera_system_prompt',           'System prompt base Vera — protocolo SPIN'),
  ('spin_instruction_triagem',     'Instrução estágio TRIAGEM'),
  ('spin_instruction_situacao',    'Instrução estágio SITUAÇÃO (S do SPIN)'),
  ('spin_instruction_problema',    'Instrução estágio PROBLEMA (P do SPIN)'),
  ('spin_instruction_implicacao',  'Instrução estágio IMPLICAÇÃO (I do SPIN)'),
  ('spin_instruction_necessidade', 'Instrução estágio NECESSIDADE-BENEFÍCIO (N do SPIN)'),
  ('spin_instruction_proposta',    'Instrução estágio PROPOSTA DE AGENDAMENTO'),
  ('spin_instruction_encerramento','Instrução estágio ENCERRAMENTO'),
  ('telegram_atendente_chat_id',   'Chat ID Telegram que recebe notificações de handoff')
ON CONFLICT (chave) DO NOTHING;

-- Atualiza valor com 'PENDENTE_SYNC' até Arthur popular
UPDATE public.vera_spin_prompts SET valor = 'PENDENTE_SYNC' WHERE valor IS NULL;

ALTER TABLE public.vera_spin_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spin_prompts_admin_all" ON public.vera_spin_prompts
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Histórico de alterações
CREATE TABLE IF NOT EXISTS public.vera_spin_prompts_history (
  id BIGSERIAL PRIMARY KEY,
  chave TEXT NOT NULL,
  valor_antigo TEXT,
  valor_novo TEXT NOT NULL,
  alterado_por UUID REFERENCES auth.users(id),
  alterado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_spin_history_chave ON public.vera_spin_prompts_history(chave, alterado_em DESC);

ALTER TABLE public.vera_spin_prompts_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spin_history_admin_select" ON public.vera_spin_prompts_history
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.log_vera_spin_prompts_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.valor IS DISTINCT FROM NEW.valor THEN
    INSERT INTO public.vera_spin_prompts_history (chave, valor_antigo, valor_novo, alterado_por)
    VALUES (NEW.chave, OLD.valor, NEW.valor, NEW.atualizado_por);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vera_spin_prompts_history ON public.vera_spin_prompts;
CREATE TRIGGER trg_vera_spin_prompts_history
  AFTER UPDATE ON public.vera_spin_prompts
  FOR EACH ROW EXECUTE FUNCTION public.log_vera_spin_prompts_change();

-- 9. Tabela vera_audit_log
CREATE TABLE IF NOT EXISTS public.vera_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  acao TEXT NOT NULL,                             -- ex: 'lead.update', 'message.delete', 'config.update'
  tabela TEXT,
  registro_id TEXT,
  dados_antes JSONB,
  dados_depois JSONB,
  ip TEXT,
  user_agent TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.vera_audit_log(user_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_audit_acao ON public.vera_audit_log(acao);
CREATE INDEX IF NOT EXISTS idx_audit_tabela ON public.vera_audit_log(tabela, criado_em DESC);

ALTER TABLE public.vera_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_admin_select" ON public.vera_audit_log
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "audit_insert_authenticated" ON public.vera_audit_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "audit_insert_service" ON public.vera_audit_log
  FOR INSERT TO service_role WITH CHECK (true);

-- 10. Atualizar RLS de tabelas existentes pra incluir secretaria
-- (manter policies atuais admin, ADICIONAR policy is_staff onde aplica)

-- leads: staff pode ver e editar campos não-críticos
DROP POLICY IF EXISTS "leads_staff_select" ON public.leads;
CREATE POLICY "leads_staff_select" ON public.leads
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "leads_staff_update" ON public.leads;
CREATE POLICY "leads_staff_update" ON public.leads
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "leads_admin_delete" ON public.leads;
CREATE POLICY "leads_admin_delete" ON public.leads
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- conversations_log: staff vê, admin apaga
DROP POLICY IF EXISTS "conv_log_staff_select" ON public.conversations_log;
CREATE POLICY "conv_log_staff_select" ON public.conversations_log
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "conv_log_staff_update_hidden" ON public.conversations_log;
CREATE POLICY "conv_log_staff_update_hidden" ON public.conversations_log
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "conv_log_admin_delete" ON public.conversations_log;
CREATE POLICY "conv_log_admin_delete" ON public.conversations_log
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- appointments: staff vê e edita, admin apaga (mas use status='cancelled' via fluxo)
DROP POLICY IF EXISTS "appointments_staff_select" ON public.appointments;
CREATE POLICY "appointments_staff_select" ON public.appointments
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "appointments_staff_insert" ON public.appointments;
CREATE POLICY "appointments_staff_insert" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "appointments_staff_update" ON public.appointments;
CREATE POLICY "appointments_staff_update" ON public.appointments
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "appointments_admin_delete" ON public.appointments;
CREATE POLICY "appointments_admin_delete" ON public.appointments
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- vera_config: somente admin
DROP POLICY IF EXISTS "vera_config_admin_all" ON public.vera_config;
CREATE POLICY "vera_config_admin_all" ON public.vera_config
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

COMMIT;
```

### Vitest do PR 0 — `tests/pr0.schema.test.ts`

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const sbAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

describe('PR 0 — Schema base', () => {
  it('enum app_role contém secretaria', async () => {
    const { data, error } = await sbAdmin.rpc('exec_sql', {
      sql: "SELECT enumlabel FROM pg_enum WHERE enumtypid = 'app_role'::regtype"
    } as any).catch(() => ({ data: null, error: null }));
    // fallback: verificar via inserção
    const { error: insErr } = await sbAdmin.from('user_roles').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      role: 'secretaria'
    } as any);
    // se erro for FK (user não existe) e não enum inválido, tá OK
    expect(insErr?.message).not.toMatch(/invalid input value for enum/i);
    await sbAdmin.from('user_roles').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
  });

  it('função is_staff existe', async () => {
    const { data, error } = await sbAdmin.rpc('is_staff', {
      _uid: '00000000-0000-0000-0000-000000000000'
    });
    expect(error).toBeNull();
    expect(typeof data).toBe('boolean');
  });

  it('tabela vera_resumos existe e aceita insert via service_role', async () => {
    const { data, error } = await sbAdmin.from('vera_resumos').insert({
      user_id: 'wa:teste_pr0',
      channel: 'whatsapp',
      resumo: 'teste pr0',
      outcome: 'agendou',
      tags: ['teste']
    }).select().single();
    expect(error).toBeNull();
    expect(data?.id).toBeDefined();
    await sbAdmin.from('vera_resumos').delete().eq('id', data!.id);
  });

  it('tabela vera_conversation_state existe e enforça unique (chat_id, channel)', async () => {
    await sbAdmin.from('vera_conversation_state').insert({ chat_id: 'wa:test_pr0', channel: 'whatsapp', spin_stage: 'triagem' });
    const { error } = await sbAdmin.from('vera_conversation_state').insert({ chat_id: 'wa:test_pr0', channel: 'whatsapp', spin_stage: 'situacao' });
    expect(error?.message).toMatch(/duplicate key|unique constraint/i);
    await sbAdmin.from('vera_conversation_state').delete().eq('chat_id', 'wa:test_pr0');
  });

  it('tabela vera_handoff_queue existe', async () => {
    const { data, error } = await sbAdmin.from('vera_handoff_queue').insert({
      chat_id: 'wa:test_pr0', channel: 'whatsapp', motivo: 'teste'
    }).select().single();
    expect(error).toBeNull();
    expect(data?.status).toBe('pendente');
    await sbAdmin.from('vera_handoff_queue').delete().eq('id', data!.id);
  });

  it('vera_spin_prompts foi seeded com 9 chaves', async () => {
    const { data } = await sbAdmin.from('vera_spin_prompts').select('chave');
    const chaves = data?.map(d => d.chave) || [];
    expect(chaves).toContain('vera_system_prompt');
    expect(chaves).toContain('spin_instruction_triagem');
    expect(chaves).toContain('spin_instruction_encerramento');
    expect(chaves.length).toBeGreaterThanOrEqual(9);
  });

  it('trigger histórico spin_prompts dispara em UPDATE', async () => {
    await sbAdmin.from('vera_spin_prompts')
      .update({ valor: 'novo valor teste pr0' })
      .eq('chave', 'spin_instruction_triagem');
    const { data } = await sbAdmin.from('vera_spin_prompts_history')
      .select('*').eq('chave', 'spin_instruction_triagem')
      .order('alterado_em', { ascending: false }).limit(1);
    expect(data?.[0]?.valor_novo).toBe('novo valor teste pr0');
  });

  it('vera_audit_log existe e RLS bloqueia anon', async () => {
    const sbAnon = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);
    const { data } = await sbAnon.from('vera_audit_log').select('*');
    expect(data).toEqual([]);  // RLS bloqueia
  });

  it('leads tem novas colunas (gcal_event_id, data_agendamento, etc)', async () => {
    const { data, error } = await sbAdmin.from('leads').select('phone, gcal_event_id, data_agendamento, procedimento_interesse, ja_e_paciente, ultimo_interesse, resumo').limit(1);
    expect(error).toBeNull();
  });

  it('conversations_log tem flags is_audio, audio_pending, hidden_from_ai', async () => {
    const { error } = await sbAdmin.from('conversations_log').select('id, is_audio, audio_pending, hidden_from_ai').limit(1);
    expect(error).toBeNull();
  });
});
```

**Comando:** `npx vitest run tests/pr0.schema.test.ts`

**Critério de avanço pro PR 1:** todos os 10 testes verdes.

---

## 🔧 PR 1 — Edge functions ingest

### Estrutura

`supabase/functions/_shared/auth.ts`:
```ts
export function validateIngestToken(req: Request): boolean {
  const token = req.headers.get('X-Ingest-Token');
  return token === Deno.env.get('INGEST_TOKEN');
}
```

`supabase/functions/evo-webhook/index.ts`:
```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateIngestToken } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-ingest-token',
};

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (!validateIngestToken(req)) return new Response('unauthorized', { status: 401, headers: corsHeaders });

  const body = await req.json();
  if (body.event !== 'messages.upsert') return new Response('ok', { status: 200, headers: corsHeaders });

  const d = body.data;
  const remoteJid = d.key.remoteJid as string;
  const phone = remoteJid.split('@')[0].replace(/\D/g, '');
  const fromMe = !!d.key.fromMe;
  const isAudio = !!d.message?.audioMessage;
  const messageText =
    d.message?.conversation
    || d.message?.extendedTextMessage?.text
    || (isAudio ? '[ÁUDIO — aguardando transcrição]' : '[mensagem não suportada]');

  // 1. UPSERT lead
  await sb.from('leads').upsert({
    phone,
    push_name: d.pushName,
    last_contact_at: new Date().toISOString(),
  }, { onConflict: 'phone' });

  // 2. Incrementar contador
  await sb.rpc('increment_message_counter', {
    _phone: phone,
    _direction: fromMe ? 'out' : 'in'
  }).catch(() => {});  // RPC opcional, não bloqueia

  // 3. INSERT mensagem
  const { error } = await sb.from('conversations_log').insert({
    lead_phone: phone,
    remote_jid: remoteJid,
    direction: fromMe ? 'out' : 'in',
    sent_by: fromMe ? 'bot' : 'user',
    message_text: messageText,
    whatsapp_message_id: d.key.id,
    is_audio: isAudio,
    audio_pending: isAudio,
  });

  if (error) console.error('insert err:', error);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

`supabase/functions/evo-webhook-update/index.ts` (transcrição áudio):
```ts
// Recebe PUT { whatsapp_message_id, transcription }
// UPDATE conversations_log SET message_text = $transcription, audio_pending = false WHERE whatsapp_message_id = $1
```

`supabase/functions/ingest-resumo/index.ts`:
```ts
// POST { user_id, channel, resumo, outcome, data_agendamento, tags }
// INSERT vera_resumos
```

`supabase/functions/ingest-conversation-state/index.ts`:
```ts
// POST { chat_id, channel, spin_stage }
// UPSERT vera_conversation_state ON CONFLICT (chat_id, channel) UPDATE SET spin_stage, updated_at = NOW(), stage_entered_at = (CASE WHEN spin_stage_changed THEN NOW() ELSE old.stage_entered_at END)
```

`supabase/functions/ingest-handoff/index.ts`:
```ts
// POST { chat_id, channel, motivo, payload? }
// INSERT vera_handoff_queue
```

`supabase/functions/n8n-executions/index.ts`:
```ts
// GET ?workflowId=xxx&status=error&limit=20
// Valida user logado é admin via supabase.auth.getUser()
// Chama http://10.0.2.4:5678/api/v1/executions?workflowId=$1 com header X-N8N-API-KEY (do secret)
// Retorna lista de execuções
```

### Vitest PR 1 — `tests/pr1.edge.test.ts`

```ts
import { describe, it, expect } from 'vitest';

const FN_URL = process.env.VITE_SUPABASE_URL + '/functions/v1';
const TOKEN = process.env.INGEST_TOKEN!;

describe('PR 1 — Edge functions ingest', () => {
  it('evo-webhook rejeita sem token', async () => {
    const r = await fetch(`${FN_URL}/evo-webhook`, {
      method: 'POST',
      body: JSON.stringify({ event: 'messages.upsert', data: {} })
    });
    expect(r.status).toBe(401);
  });

  it('evo-webhook insere mensagem text', async () => {
    const msgId = `e2e_pr1_${Date.now()}`;
    const r = await fetch(`${FN_URL}/evo-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Ingest-Token': TOKEN },
      body: JSON.stringify({
        event: 'messages.upsert',
        instance: 'vera-whatsapp',
        data: {
          key: { remoteJid: '5581900000999@s.whatsapp.net', fromMe: false, id: msgId },
          message: { conversation: 'mensagem teste pr1' },
          pushName: 'Teste PR1',
          messageTimestamp: Math.floor(Date.now()/1000)
        }
      })
    });
    expect(r.status).toBe(200);
    // valida via supabase
    // ... query conversations_log WHERE whatsapp_message_id = msgId
  });

  it('evo-webhook trata áudio com pending', async () => {
    // POST com audioMessage → audio_pending=true, message_text=[ÁUDIO ...]
  });

  it('evo-webhook-update preenche transcrição', async () => {
    // PUT { whatsapp_message_id, transcription } → message_text atualizado, audio_pending=false
  });

  it('ingest-resumo grava em vera_resumos', async () => {
    const r = await fetch(`${FN_URL}/ingest-resumo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Ingest-Token': TOKEN },
      body: JSON.stringify({
        user_id: 'wa:teste_pr1', channel: 'whatsapp',
        resumo: 'pr1 resumo teste', outcome: 'agendou', tags: ['e2e']
      })
    });
    expect(r.status).toBe(200);
  });

  it('ingest-conversation-state upsert funciona', async () => { /* ... */ });
  it('ingest-handoff cria pendente', async () => { /* ... */ });
  it('n8n-executions retorna 401 pra anon', async () => { /* ... */ });
});
```

**Critério avanço PR 2:** todos verdes.

---

## 🔒 Regras invariantes (válidas em TODOS os PRs)

1. **NÃO criar `src/lib/supabase.ts`** — usar `import { supabase } from "@/integrations/supabase/client"` sempre.
2. **NÃO rodar `npm i @supabase/supabase-js`** — já vem do template Lovable.
3. **NÃO editar `.env`** — gerenciado pelo Lovable.
4. **NÃO criar `vera_admin_users`** — usa `user_roles` + `is_admin()`/`is_staff()`.
5. **NÃO usar `VITE_SUPABASE_ANON_KEY`** — é `VITE_SUPABASE_PUBLISHABLE_KEY` no Lovable.
6. **NÃO mexer em `src/integrations/supabase/{client,types}.ts`** — gerados.
7. **NÃO usar Playwright como bloqueio de CI** — usar Vitest. Playwright fica pro Arthur rodar local.
8. **NÃO criar workflows novos no n8n** — apenas Arthur adiciona nodes HTTP push em workflows existentes.
9. **TODA edge function ingest** valida `X-Ingest-Token`.
10. **TODA ação destrutiva** no frontend tem modal "digite APAGAR" + log em `vera_audit_log` (após PR 8).
11. **TODA UI em pt-BR**, mobile-first.
12. **NUNCA tocar** em tabelas: `n8n_*`, `execution_*`, `chat_hub_*`, `auth_*`, `oauth_*`, `workflow_*`, `credentials_*`.
13. **Idioma**: comentários, mensagens de UI, toasts — tudo pt-BR.
14. **Datas**: `format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })`.
15. **Telefones**: helper `formatPhone()` (`+55 (81) 99876-0118`).

---

## 📦 Próximas ações concretas

**Lovable:**
1. Cria branch `pr0-base-schema`
2. Cria migration conforme spec
3. Roda Vitest PR 0
4. Abre PR no GitHub com checklist marcado
5. Aguarda Arthur aprovar → merge → começa PR 1

**Arthur (em paralelo ao PR 0):**
1. Gera `INGEST_TOKEN` UUID e adiciona em Supabase secrets + nodes n8n
2. Cria nodes "Push Lovable" nos workflows existentes (`Resumo Encerramento`, `VERA CORE`)
3. Pré-configura Cloudflare Tunnel TCP forward Postgres VPS (ativa só perto do PR 6)
4. Conecta Google Calendar no connector Lovable (perto do PR 7)
5. Atualiza Evolution webhook com `additional_webhooks` (após PR 1 deploy)

---

**FIM DO PLANO V3.** Lovable, comece pelo PR 0 agora.
