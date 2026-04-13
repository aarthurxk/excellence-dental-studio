

## Plano: Página "Conversas Vera" no Admin

### O que será feito
Nova página admin `/admin/conversas-vera` com layout estilo WhatsApp Web para visualizar conversas da assistente Vera, protegida por auth guard (admin only).

### Arquivos a criar/editar

**1. Criar `src/pages/admin/AdminConversasVera.tsx`**
- Fetch GET para `https://bot.odontoexcellencerecife.com.br/webhook/vera-logs`
- Layout split: lista de contatos à esquerda, chat à direita
- Lista de contatos: nome, prévia da última mensagem, timestamp
- Ao clicar, exibe conversa completa no painel direito
- Mensagens human → direita (roxo/azul), ai → esquerda (cinza)
- Parser para mensagens AI: extrai apenas conteúdo de `<resposta>...</resposta>`, remove `<proximo_estagio>` e `[CONTEXTO_SESSAO]`
- Botão "Atualizar" que re-fetcha os dados
- Responsivo: em mobile, lista e chat alternam (como WhatsApp mobile)
- Usa `useQuery` com `queryKey: ["vera-logs"]` e `refetchOnWindowFocus: false`

**2. Editar `src/App.tsx`**
- Import `AdminConversasVera`
- Nova rota: `<Route path="/admin/conversas-vera" element={<AdminPage><AdminConversasVera /></AdminPage>} />`

**3. Editar `src/components/admin/AdminLayout.tsx`**
- Adicionar item no `navItems`: `{ title: "Conversas Vera", url: "/admin/conversas-vera", icon: MessageCircle, module: null }`
- Visível apenas para admin/socio (já controlado pelo filtro de `role === "agencia"`)

### Detalhes técnicos
- A proteção auth já existe via `AdminPage` → `ProtectedRoute` (exige user + role)
- Para restringir a admin/socio especificamente, o item do menu será filtrado por role e a página verificará `role` do `useAuth()`
- O fetch ao endpoint externo será feito com `fetch()` direto (não é Supabase)
- O parser de mensagens AI usa regex: `/&lt;resposta&gt;([\s\S]*?)&lt;\/resposta&gt;/` para extrair o texto limpo

