
-- CRM de Leads
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  push_name TEXT,
  profile_pic_url TEXT,
  status TEXT DEFAULT 'novo',
  first_contact_at TIMESTAMPTZ DEFAULT now(),
  last_contact_at TIMESTAMPTZ,
  last_message_preview TEXT,
  ai_enabled BOOLEAN DEFAULT true,
  total_messages_in INTEGER DEFAULT 0,
  total_messages_out INTEGER DEFAULT 0,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for leads status
CREATE OR REPLACE FUNCTION public.validate_lead_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('novo', 'qualificado', 'agendado', 'compareceu', 'nao_compareceu', 'perdido') THEN
    RAISE EXCEPTION 'Invalid lead status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_lead_status
BEFORE INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.validate_lead_status();

-- Auto-update updated_at for leads
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access leads" ON public.leads
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Log de mensagens
CREATE TABLE public.conversations_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_phone TEXT NOT NULL,
  remote_jid TEXT NOT NULL,
  direction TEXT,
  message_text TEXT,
  message_type TEXT DEFAULT 'text',
  sent_by TEXT,
  whatsapp_message_id TEXT,
  whatsapp_timestamp BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Validation triggers for conversations_log
CREATE OR REPLACE FUNCTION public.validate_conversation_fields()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.direction IS NOT NULL AND NEW.direction NOT IN ('incoming', 'outgoing') THEN
    RAISE EXCEPTION 'Invalid direction: %', NEW.direction;
  END IF;
  IF NEW.sent_by IS NOT NULL AND NEW.sent_by NOT IN ('lead', 'ai', 'human') THEN
    RAISE EXCEPTION 'Invalid sent_by: %', NEW.sent_by;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_conversation_fields
BEFORE INSERT OR UPDATE ON public.conversations_log
FOR EACH ROW EXECUTE FUNCTION public.validate_conversation_fields();

CREATE INDEX idx_conv_phone ON public.conversations_log(lead_phone);
CREATE INDEX idx_conv_created ON public.conversations_log(created_at DESC);

ALTER TABLE public.conversations_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access conversations_log" ON public.conversations_log
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Configuração da IA Vera
CREATE TABLE public.vera_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  system_prompt TEXT,
  greeting_message TEXT DEFAULT 'Olá! 😊 Bem-vindo(a) à Odonto Excellence! Como posso te ajudar hoje?',
  away_message TEXT DEFAULT 'Obrigada por entrar em contato! 😊 Nosso horário de atendimento é de segunda a sexta, 8h às 20h, e sábado até 14h.',
  ai_enabled BOOLEAN DEFAULT true,
  working_hours_start TIME DEFAULT '08:00',
  working_hours_end TIME DEFAULT '20:00',
  working_days INT[] DEFAULT '{1,2,3,4,5,6}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vera_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access vera_config" ON public.vera_config
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Log de conexão WhatsApp
CREATE TABLE public.connection_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL,
  disconnect_reason TEXT,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.connection_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access connection_logs" ON public.connection_logs
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Agendamentos
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_phone TEXT NOT NULL,
  lead_name TEXT,
  google_event_id TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 30,
  procedure_interest TEXT,
  status TEXT DEFAULT 'confirmed',
  booked_by TEXT DEFAULT 'ai_vera',
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for appointment status
CREATE OR REPLACE FUNCTION public.validate_appointment_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled') THEN
    RAISE EXCEPTION 'Invalid appointment status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_appointment_status
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_status();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_appointments_phone ON public.appointments(lead_phone);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_at) WHERE status = 'confirmed';

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access appointments" ON public.appointments
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
