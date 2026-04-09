

## Plano: Toggle para ativar/desativar o chatbot Vera no painel admin

### O que será feito
Adicionar um campo `chat_enabled` na tabela `site_settings` e um switch no painel de Configurações (`AdminSettings`) para ligar/desligar o botão vermelho da assistente Vera. Quando desativado, o widget não será renderizado no site.

### Etapas

1. **Migração SQL** — Adicionar coluna `chat_enabled boolean default true` à tabela `site_settings`.

2. **Atualizar `useSiteSettings.ts`** — Incluir `chat_enabled: true` no fallback.

3. **Atualizar `AdminSettings.tsx`** — Adicionar um Switch com label "Assistente Vera (Chat)" dentro de um novo fieldset, ligado ao campo `chat_enabled` do formulário.

4. **Atualizar `SiteChatWidget.tsx`** — Consumir `useSiteSettings()` e retornar `null` quando `chat_enabled` for `false`.

### Detalhes técnicos
- A coluna terá `DEFAULT true` para não quebrar registros existentes.
- O componente `Switch` de `@/components/ui/switch` já existe no projeto.
- O `SiteChatWidget` já é renderizado no `App.tsx` de forma global; basta condicionar internamente.

