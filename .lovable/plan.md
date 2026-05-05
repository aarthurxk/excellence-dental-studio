
## Objetivo
Tornar o sistema de Usuários & Papéis mais completo e prático: liberar fluxos operacionais para a **Secretaria** (atendimento WhatsApp), enriquecer os dados de cadastro, e melhorar a tela de gestão (filtros, visualização, busca).

---

## 1. Backend — papel "Secretaria" virando cidadão de primeira classe

### 1.1 Permissões da Secretaria (`role_permissions`)
Atualmente `secretaria` não tem **nenhuma** linha em `role_permissions`. Inserir com `can_view=true, can_edit=true, can_delete=false` para os módulos:

| Módulo | view | edit | delete |
|---|---|---|---|
| messages (formulário site) | ✓ | ✓ | ✗ |
| testimonials | ✓ | ✗ | ✗ |
| services / dentists / videos / events / about / features | ✓ | ✗ | ✗ |
| settings / users | ✗ | ✗ | ✗ |
| messages_audit | ✓ | ✗ | ✗ |

### 1.2 Liberar páginas operacionais (front)
Hoje `RESTRICTED_URLS` em `AdminLayout.tsx` libera **Ao Vivo / Pendentes / Conversas / Leads / Handoff / Resumos / Vera Health** apenas para `admin | socio | gerente`. Adicionar `secretaria` à lista permitida desses URLs.

A função `is_staff()` já inclui `secretaria` — RLS de `leads`, `appointments`, `conversations_log`, `vera_handoff_queue`, `vera_resumos`, `vera_conversation_state` já permitem acesso. Sem mudança de RLS necessária.

### 1.3 Novo perfil estendido — tabela `user_profiles`
Criar tabela vinculada a `auth.users(id)` com campos extras de cadastro:

```
user_profiles
  user_id uuid PK FK auth.users(id) ON DELETE CASCADE
  full_name text
  phone text
  avatar_url text
  job_title text          -- ex: "Recepcionista turno manhã"
  department text         -- ex: "Atendimento", "Clínico"
  active boolean default true   -- bloqueio sem deletar
  notes text
  last_login_at timestamptz     -- atualizado por trigger no signin
  created_at, updated_at timestamptz
```

RLS:
- SELECT: `is_staff(auth.uid())` (todo staff vê a lista)
- UPDATE/INSERT/DELETE: `is_admin(auth.uid())` ou o próprio dono em UPDATE do seu registro
- Trigger `handle_new_user`: ao criar um auth.user, inserir profile vazio

---

## 2. Edge functions

- **`create-user`**: aceitar `full_name`, `phone`, `job_title`, `department` no body; após criar auth.user, fazer upsert em `user_profiles`.
- **`update-user`** (NOVO): editar profile + (admin) reset de senha + ativar/desativar.
- **`list-user-emails`** → renomear conceito para **`list-users`**: retornar array com `{id, email, last_sign_in_at, created_at}` cruzando com `user_profiles`. Mantém compat com `emailMap`.

---

## 3. Frontend — `src/pages/admin/AdminUsers.tsx`

Reescrever a tela em layout de **cards/tabela rica**:

**Topo**
- Busca por nome/email
- Filtro por papel (chips)
- Filtro Ativos/Inativos
- Botão "Novo Usuário"

**Tabela**
| Avatar + Nome | E-mail | Papel | Cargo / Setor | Último login | Status | Ações |

Ações por linha: editar (modal), reset senha, ativar/desativar, remover.

**Modal Novo/Editar Usuário** — campos:
- Nome completo, E-mail, Telefone
- Cargo, Setor
- Papel (Select com `secretaria` + descrição curta do que cada papel pode)
- Senha (apenas em criação) + botão "gerar senha forte"
- Avatar URL (opcional)
- Notas internas

**Card de papéis** (sidebar ou seção colapsável)
Mostrar matriz visual "papel × módulo" lendo `role_permissions` — somente leitura para esta entrega (editor visual fica fora do escopo).

---

## 4. AdminLayout & Sidebar

- Adicionar "secretaria" ao filtro de visibilidade dos URLs operacionais.
- `ROLE_LABELS` já inclui Secretaria — confirmar texto correto.
- Mostrar badge do cargo (`job_title`) abaixo do papel quando disponível.

---

## 5. Detalhes técnicos

- `Constants.public.Enums.app_role` já tem `secretaria` — sem migração de enum.
- Datas em pt-BR via `date-fns/locale`.
- `last_login_at`: atualizar via trigger em `auth.sessions` é restrito; alternativa simples — chamar `supabase.from("user_profiles").update({last_login_at: now})` no `AuthContext` após sign-in bem-sucedido.
- Manter design neumórfico do admin (memória de design).

---

## Resumo de arquivos

**Migração**
- nova tabela `user_profiles` + RLS + trigger `handle_new_user`
- inserts em `role_permissions` para `secretaria`

**Edge functions**
- `create-user/index.ts` (atualizado)
- `update-user/index.ts` (novo)
- `list-user-emails/index.ts` → estender para retornar profiles + last_sign_in_at

**Frontend**
- `src/pages/admin/AdminUsers.tsx` (reescrita)
- `src/components/admin/AdminLayout.tsx` (liberar secretaria nas rotas operacionais; mostrar cargo)
- `src/contexts/AuthContext.tsx` (gravar `last_login_at`)
- novo `src/components/admin/UserFormDialog.tsx`
- novo `src/components/admin/RolePermissionsMatrix.tsx`
