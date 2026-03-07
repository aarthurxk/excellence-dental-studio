

## Diagnosis

All code fallbacks already use `adm@odontoexcellencerecife.com.br`. The old email `contato@odontoexcellence.com.br` exists in two places in the **database**:

1. **`site_settings` table data** — the actual row has `email = 'contato@odontoexcellence.com.br'`
2. **`site_settings` column default** — the column default is `'contato@odontoexcellence.com.br'::text`

Since the database value overrides all code fallbacks, the old email keeps showing up.

## Plan

1. **Update the existing record** (using insert/update tool):
   ```sql
   UPDATE site_settings SET email = 'adm@odontoexcellencerecife.com.br' WHERE id = '03684baa-7f82-4906-ae80-bec6b4d4792b';
   ```

2. **Update the column default** (using migration tool):
   ```sql
   ALTER TABLE site_settings ALTER COLUMN email SET DEFAULT 'adm@odontoexcellencerecife.com.br';
   ```

No code changes needed — all components already have the correct fallback.

