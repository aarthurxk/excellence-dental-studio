-- Etapa 2/3 — leads: atribuição de atendente, prioridade e SLA
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS priority    smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sla_due_at  timestamptz;

CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS leads_status_idx       ON leads(status);
