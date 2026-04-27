-- =============================================================
-- PR 0 (parte 2): estrutura base + RLS
-- =============================================================

-- 1. Funções auxiliares de role
CREATE OR REPLACE FUNCTION public.is_staff(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid AND role IN ('admin','socio','secretaria')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_secretaria_only(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'secretaria'
  ) AND NOT public.is_admin(_uid)
$$;

-- 2. Estender tabela leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS gcal_event_id TEXT,
  ADD COLUMN IF NOT EXISTS data_agendamento TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS procedimento_interesse TEXT,
  ADD COLUMN IF NOT EXISTS ja_e_paciente BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ultimo_interesse TEXT,
  ADD COLUMN IF NOT EXISTS resumo TEXT;

-- 3. Estender conversations_log
ALTER TABLE public.conversations_log
  ADD COLUMN IF NOT EXISTS is_audio BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS audio_pending BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_from_ai BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conversations_log_pending_audio
  ON public.conversations_log(audio_pending) WHERE audio_pending = true;

-- 4. vera_resumos
CREATE TABLE IF NOT EXISTS public.vera_resumos (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  resumo TEXT NOT NULL,
  outcome TEXT CHECK (outcome IN ('agendou','recusou','transferido','abandonado')),
  data_agendamento TIMESTAMPTZ,
  tags TEXT[],
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  origem TEXT DEFAULT 'n8n'
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

-- 5. vera_conversation_state
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

CREATE POLICY "vera_conv_state_all_service" ON public.vera_conversation_state
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. vera_handoff_queue
CREATE TABLE IF NOT EXISTS public.vera_handoff_queue (
  id BIGSERIAL PRIMARY KEY,
  chat_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  motivo TEXT NOT NULL,
  payload JSONB,
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
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "handoff_insert_service" ON public.vera_handoff_queue
  FOR INSERT TO service_role WITH CHECK (true);

-- 7. vera_spin_prompts
CREATE TABLE IF NOT EXISTS public.vera_spin_prompts (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL DEFAULT 'PENDENTE_SYNC',
  descricao TEXT,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_por UUID REFERENCES auth.users(id)
);

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

ALTER TABLE public.vera_spin_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spin_prompts_admin_all" ON public.vera_spin_prompts
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. vera_spin_prompts_history + trigger
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
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

-- 9. vera_audit_log
CREATE TABLE IF NOT EXISTS public.vera_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  acao TEXT NOT NULL,
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

-- 10. RLS estendida em tabelas existentes (staff = admin/socio/secretaria)
DROP POLICY IF EXISTS "leads_staff_select" ON public.leads;
CREATE POLICY "leads_staff_select" ON public.leads
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "leads_staff_update" ON public.leads;
CREATE POLICY "leads_staff_update" ON public.leads
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "leads_admin_delete" ON public.leads;
CREATE POLICY "leads_admin_delete" ON public.leads
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "conv_log_staff_select" ON public.conversations_log;
CREATE POLICY "conv_log_staff_select" ON public.conversations_log
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "conv_log_staff_update_hidden" ON public.conversations_log;
CREATE POLICY "conv_log_staff_update_hidden" ON public.conversations_log
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "conv_log_admin_delete" ON public.conversations_log;
CREATE POLICY "conv_log_admin_delete" ON public.conversations_log
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "appointments_staff_select" ON public.appointments;
CREATE POLICY "appointments_staff_select" ON public.appointments
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "appointments_staff_insert" ON public.appointments;
CREATE POLICY "appointments_staff_insert" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "appointments_staff_update" ON public.appointments;
CREATE POLICY "appointments_staff_update" ON public.appointments
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "appointments_admin_delete" ON public.appointments;
CREATE POLICY "appointments_admin_delete" ON public.appointments
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));