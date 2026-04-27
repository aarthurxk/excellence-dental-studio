-- PR 8 — Triggers de auditoria automáticos
-- Registra UPDATE e DELETE em tabelas sensíveis no vera_audit_log

CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_acao text;
  v_dados_antes jsonb;
  v_dados_depois jsonb;
  v_registro_id text;
BEGIN
  v_user_id := auth.uid();

  BEGIN
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_user_email := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    v_acao := 'insert_' || TG_TABLE_NAME;
    v_dados_antes := NULL;
    v_dados_depois := to_jsonb(NEW);
    v_registro_id := COALESCE((to_jsonb(NEW)->>'id'), (to_jsonb(NEW)->>'chave'));
  ELSIF TG_OP = 'UPDATE' THEN
    v_acao := 'update_' || TG_TABLE_NAME;
    v_dados_antes := to_jsonb(OLD);
    v_dados_depois := to_jsonb(NEW);
    v_registro_id := COALESCE((to_jsonb(NEW)->>'id'), (to_jsonb(NEW)->>'chave'));
  ELSIF TG_OP = 'DELETE' THEN
    v_acao := 'delete_' || TG_TABLE_NAME;
    v_dados_antes := to_jsonb(OLD);
    v_dados_depois := NULL;
    v_registro_id := COALESCE((to_jsonb(OLD)->>'id'), (to_jsonb(OLD)->>'chave'));
  END IF;

  INSERT INTO public.vera_audit_log (user_id, user_email, acao, tabela, registro_id, dados_antes, dados_depois)
  VALUES (v_user_id, v_user_email, v_acao, TG_TABLE_NAME, v_registro_id, v_dados_antes, v_dados_depois);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS audit_leads_trg ON public.leads;
CREATE TRIGGER audit_leads_trg
AFTER UPDATE OR DELETE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_appointments_trg ON public.appointments;
CREATE TRIGGER audit_appointments_trg
AFTER INSERT OR UPDATE OR DELETE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_spin_prompts_trg ON public.vera_spin_prompts;
CREATE TRIGGER audit_spin_prompts_trg
AFTER UPDATE OR DELETE ON public.vera_spin_prompts
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_user_roles_trg ON public.user_roles;
CREATE TRIGGER audit_user_roles_trg
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_vera_config_trg ON public.vera_config;
CREATE TRIGGER audit_vera_config_trg
AFTER UPDATE OR DELETE ON public.vera_config
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();