-- Migration 1: soft delete + auditoria
ALTER TABLE conversations_log
  ADD COLUMN IF NOT EXISTS deleted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by   uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deletion_reason text;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS deleted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by   uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deletion_reason text;

CREATE TABLE IF NOT EXISTS deleted_message_audit (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table    text        NOT NULL,
  source_id       uuid        NOT NULL,
  author          text,
  author_phone    text,
  content         text        NOT NULL,
  sent_at         timestamptz NOT NULL,
  deleted_at      timestamptz NOT NULL DEFAULT now(),
  deleted_by      uuid        REFERENCES auth.users(id),
  deletion_reason text,
  metadata        jsonb
);

CREATE INDEX IF NOT EXISTS deleted_message_audit_source_id_idx ON deleted_message_audit(source_id);
CREATE INDEX IF NOT EXISTS deleted_message_audit_deleted_at_idx ON deleted_message_audit(deleted_at DESC);

ALTER TABLE deleted_message_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select_allowed_roles" ON deleted_message_audit;
CREATE POLICY "audit_select_allowed_roles" ON deleted_message_audit FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'socio', 'gerente')));

DROP POLICY IF EXISTS "audit_insert_service_role" ON deleted_message_audit;
CREATE POLICY "audit_insert_service_role" ON deleted_message_audit FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION fn_audit_deleted_conversation_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    INSERT INTO deleted_message_audit (source_table, source_id, author, author_phone, content, sent_at, deleted_at, deleted_by, deletion_reason, metadata)
    VALUES ('conversations_log', NEW.id::uuid, COALESCE(NEW.sent_by, NEW.direction), NEW.lead_phone, COALESCE(NEW.message_text, '[mídia]'), COALESCE(NEW.created_at, now()), NEW.deleted_at, NEW.deleted_by, NEW.deletion_reason, jsonb_build_object('message_type', NEW.message_type, 'direction', NEW.direction, 'remote_jid', NEW.remote_jid, 'is_audio', NEW.is_audio));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_deleted_conversation_log ON conversations_log;
CREATE TRIGGER trg_audit_deleted_conversation_log
  AFTER UPDATE OF deleted_at ON conversations_log FOR EACH ROW
  EXECUTE FUNCTION fn_audit_deleted_conversation_log();

CREATE OR REPLACE FUNCTION fn_audit_deleted_contact_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    INSERT INTO deleted_message_audit (source_table, source_id, author, author_phone, content, sent_at, deleted_at, deleted_by, deletion_reason, metadata)
    VALUES ('contact_messages', NEW.id::uuid, NEW.name, NEW.phone, COALESCE(NEW.message, '[vazio]'), COALESCE(NEW.created_at, now()), NEW.deleted_at, NEW.deleted_by, NEW.deletion_reason, jsonb_build_object('email', NEW.email));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_deleted_contact_message ON contact_messages;
CREATE TRIGGER trg_audit_deleted_contact_message
  AFTER UPDATE OF deleted_at ON contact_messages FOR EACH ROW
  EXECUTE FUNCTION fn_audit_deleted_contact_message();

-- Migration 2: permissões
-- Garante unicidade para suportar ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS role_permissions_module_role_uidx ON role_permissions(module, role);

INSERT INTO role_permissions (module, role, can_view, can_edit, can_delete)
VALUES
  ('messages_audit', 'admin',   true, false, false),
  ('messages_audit', 'socio',   true, false, false),
  ('messages_audit', 'gerente', true, false, false)
ON CONFLICT (module, role) DO UPDATE SET can_view = EXCLUDED.can_view;

-- Migration 3: leads SLA
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS priority    smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sla_due_at  timestamptz;

CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);