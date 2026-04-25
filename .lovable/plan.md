## Objetivo
Adicionar um sistema de **etiquetas (tags)** coloridas e reutilizáveis para leads, exibidas:
1. No header de cada conversa em **`/admin/whatsapp`** (aba Conversas).
2. Nos cards do Kanban e tabela do **`/admin/leads`**.
3. Editáveis no painel lateral de detalhe do lead.

## Como vai funcionar (visão do usuário)

- Em **Configurações → Etiquetas** (nova seção), o admin cria etiquetas com **nome + cor** (ex.: "VIP" vermelho, "Implante" azul, "Orçamento enviado" amarelo).
- No card do CRM e no header da conversa, aparecem chips coloridos com as etiquetas do lead.
- No detalhe do lead (painel lateral), um seletor multi-select permite **adicionar/remover** etiquetas com um clique.
- As etiquetas são compartilhadas entre todos os leads (não duplica) — útil para filtrar.

## Mudanças no banco

Duas novas tabelas:

```text
lead_tags                  lead_tag_assignments
─────────                  ───────────────────
id (uuid, pk)              id (uuid, pk)
name (text, unique)        lead_id (uuid → leads.id)
color (text, hex)          tag_id (uuid → lead_tags.id)
created_at                 created_at
                           UNIQUE(lead_id, tag_id)
```

- RLS: só admin/socio (`is_admin`) pode ler/escrever em ambas.
- Índices em `lead_id` e `tag_id` para joins rápidos.
- Seeds opcionais: "VIP", "Urgente", "Orçamento", "Implante", "Clareamento".

## Mudanças no frontend

### 1. Hook novo `src/hooks/useLeadTags.ts`
- `useTags()` — lista todas as etiquetas disponíveis.
- `useLeadTags(leadId)` — etiquetas do lead.
- Mutations: `createTag`, `deleteTag`, `assignTag`, `unassignTag`.

### 2. Componente `src/components/admin/LeadTagsEditor.tsx`
- Mostra chips coloridos das tags atuais.
- Popover com lista de tags disponíveis (checkbox) + input para criar nova tag inline.

### 3. `src/pages/admin/AdminLeads.tsx`
- Card do Kanban: renderiza chips das tags abaixo do nome.
- Tabela: nova coluna "Etiquetas".
- Sheet de detalhe: substitui/adiciona o `LeadTagsEditor`.
- Filtro adicional por tag no topo.

### 4. `src/components/admin/ConversasWhatsApp.tsx`
- Header do chat: ao lado do botão "IA Ativa/Humano", renderiza chips das tags do lead selecionado + botão `+` para abrir o editor.

### 5. (Opcional) `src/pages/admin/AdminSettings.tsx`
- Nova aba "Etiquetas" para gerenciar (criar/editar cor/excluir) o catálogo de tags.

## Detalhes técnicos

- **Cor**: armazenar como hex (`#3B82F6`) e renderizar com `style={{ backgroundColor }}` + `color` calculado por luminância para legibilidade.
- **Performance**: query única com join `leads → lead_tag_assignments → lead_tags` agregada via `select("*, tags:lead_tag_assignments(tag:lead_tags(*))")`.
- **Realtime** (opcional): canal Supabase em `lead_tag_assignments` para sincronizar entre admins.
- **Acesso**: mantém regra atual — apenas `admin` e `socio` (Agência continua sem acesso ao módulo).

## Fora do escopo (pode vir depois)
- Atribuição automática de tags por regras (ex.: "tag VIP se >5 mensagens").
- Cor por contraste WCAG AA automática.
- Drag-and-drop de tags entre leads.