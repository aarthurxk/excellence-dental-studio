-- ══════════════════════════════════════════════════════════════════
-- Etapa 1 — Permissões para módulo messages_audit
-- ══════════════════════════════════════════════════════════════════

INSERT INTO role_permissions (module, role, can_view, can_edit, can_delete)
VALUES
  ('messages_audit', 'admin',   true, false, false),
  ('messages_audit', 'socio',   true, false, false),
  ('messages_audit', 'gerente', true, false, false)
ON CONFLICT (module, role) DO UPDATE
  SET can_view = EXCLUDED.can_view;
