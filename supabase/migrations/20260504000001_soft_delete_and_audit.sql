-- ══════════════════════════════════════════════════════════════════
-- Etapa 1 — Soft delete + auditoria de mensagens apagadas
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Soft delete em conversations_log ────────────────────────
ALTER TABLE conversations_log
  ADD COLUMN IF NOT EXISTS deleted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by   uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- ── 2. Soft delete em contact_messages ─────────────────────────
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS deleted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by   uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- ── 3. Tabela de auditoria de mensagens apagadas ───────────────
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

CREATE INDEX IF NOT EXISTS deleted_message_audit_source_id_idx
  ON deleted_message_audit(source_id);
CREATE INDEX IF NOT EXISTS deleted_message_audit_deleted_at_idx
  ON deleted_message_audit(deleted_at DESC);

-- ── 4. RLS em deleted_message_audit ───────────────────────────
ALTER TABLE deleted_message_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_allowed_roles"
  ON deleted_message_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'socio', 'gerente')
    )
  );

-- Sem INSERT/UPDATE/DELETE via cliente — só via trigger e service role
CREATE POLICY "audit_insert_service_role"
  ON deleted_message_audit
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── 5. Trigger: conversations_log — ao soft-delete, grava audit ─
CREATE OR REPLACE FUNCTION fn_audit_deleted_conversation_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Dispara quando deleted_at passa de NULL → valor
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    INSERT INTO deleted_message_audit (
      source_table, source_id, author, author_phone,
      content, sent_at, deleted_at, deleted_by, deletion_reason,
      metadata
    ) VALUES (
      'conversations_log',
      NEW.id::uuid,
      COALESCE(NEW.sent_by, NEW.direction),
      NEW.lead_phone,
      COALESCE(NEW.message_text, '[mídia]'),
      COALESCE(NEW.created_at, now()),
      NEW.deleted_at,
      NEW.deleted_by,
      NEW.deletion_reason,
      jsonb_build_object(
        'message_type', NEW.message_type,
        'direction',    NEW.direction,
        'remote_jid',   NEW.remote_jid,
        'is_audio',     NEW.is_audio
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_deleted_conversation_log ON conversations_log;
CREATE TRIGGER trg_audit_deleted_conversation_log
  AFTER UPDATE OF deleted_at ON conversations_log
  FOR EACH ROW
  EXECUTE FUNCTION fn_audit_deleted_conversation_log();

-- ── 6. Trigger: contact_messages — ao soft-delete, grava audit ─
CREATE OR REPLACE FUNCTION fn_audit_deleted_contact_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    INSERT INTO deleted_message_audit (
      source_table, source_id, author, author_phone,
      content, sent_at, deleted_at, deleted_by, deletion_reason,
      metadata
    ) VALUES (
      'contact_messages',
      NEW.id::uuid,
      NEW.name,
      NEW.phone,
      COALESCE(NEW.message, '[vazio]'),
      COALESCE(NEW.created_at, now()),
      NEW.deleted_at,
      NEW.deleted_by,
      NEW.deletion_reason,
      jsonb_build_object('email', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_deleted_contact_message ON contact_messages;
CREATE TRIGGER trg_audit_deleted_contact_message
  AFTER UPDATE OF deleted_at ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION fn_audit_deleted_contact_message();
