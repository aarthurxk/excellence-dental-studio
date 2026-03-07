

## Plano: Refazer Sistema de Login + Admin Completo

### 1. Problema do Login (Causa Raiz Confirmada)

Os logs de rede confirmam: login retorna 200, mas a chamada RPC `is_admin` **nunca aparece** nos network requests. O `setTimeout` com `ignore` flag esta falhando -- quando `onAuthStateChange` e `getSession` disparam quase simultaneamente, um dos dois seta `ignore = true` antes do `setTimeout` executar.

**Solucao**: Reescrever `useAuth.ts` completamente com uma abordagem diferente:
- Usar `AuthContext` (React Context + Provider) em vez de hook standalone -- assim ha uma unica instancia
- No `onAuthStateChange`, apenas setar `user` e `session` (dados sincronos)
- Usar um `useEffect` separado que observa `user` e dispara `checkAdmin` quando `user` muda -- sem `setTimeout`, sem deadlock, sem race condition
- O `loading` so vira `false` quando o efeito de check completar

### 2. Banco de Dados

**Nenhuma alteracao de schema necessaria** -- o enum `app_role` ja tem os valores corretos: `admin`, `socio`, `gerente`, `dentista`, `recepcionista`, `user`. As funcoes `is_admin` e `has_role` ja existem.

**Nova tabela: `roadmap_items`** (via migration):
```sql
CREATE TABLE public.roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'backlog', -- backlog, in_progress, done
  phase TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
-- Admins gerenciam
CREATE POLICY "Admins can manage roadmap" ON public.roadmap_items FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
```

**Nova tabela: `role_permissions`** (para matriz detalhada):
```sql
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  module TEXT NOT NULL, -- 'services','dentists','testimonials','videos','events','features','about','messages','settings','roadmap','users'
  can_view BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE(role, module)
);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage permissions" ON public.role_permissions FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Authenticated can read permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);
```

Inserir permissoes padrao:
- **admin/socio**: tudo liberado em todos os modulos
- **gerente**: tudo exceto modulo `users` e `settings`
- **dentista**: view em tudo, edit em `services` e `about`
- **recepcionista**: view em tudo, edit em `messages`

**Nova funcao RPC: `get_user_role`** -- retorna o papel do usuario (para mostrar no sidebar e controlar permissoes no frontend):
```sql
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;
```

### 3. Arquivos a Criar/Reescrever

| Arquivo | Acao |
|---|---|
| `src/contexts/AuthContext.tsx` | **Novo** -- Context + Provider com logica de auth separada em effects |
| `src/hooks/useAuth.ts` | **Reescrever** -- consumir o context em vez de ter logica propria |
| `src/components/admin/ProtectedRoute.tsx` | **Atualizar** -- usar context, verificar qualquer role valida (nao so admin) |
| `src/pages/admin/AdminLogin.tsx` | **Reescrever** -- simplificar, usar context |
| `src/App.tsx` | **Atualizar** -- envolver com AuthProvider, adicionar rotas do roadmap e usuarios |
| `src/hooks/usePermissions.ts` | **Novo** -- hook que carrega permissoes do usuario por modulo |
| `src/pages/admin/AdminRoadmap.tsx` | **Novo** -- CRUD de itens do roadmap com kanban simples (3 colunas) |
| `src/pages/admin/AdminUsers.tsx` | **Novo** -- gerenciar usuarios e seus papeis |
| `src/components/admin/AdminLayout.tsx` | **Atualizar** -- filtrar itens do menu por permissao, mostrar papel do usuario |

### 4. AuthContext (Detalhe Tecnico)

```text
AuthProvider
  ├── onAuthStateChange → seta user/session (sincrono, sem RPC)
  ├── useEffect([user]) → se user, chama get_user_role + seta role + loading=false
  │                        se !user, role=null, loading=false
  └── Expoe: user, session, role, loading, signIn, signOut
```

A chave e: **separar a leitura do auth state (sincrona) da verificacao de role (assincrona)**. O `onAuthStateChange` nunca faz chamadas de rede. O `useEffect` que observa `user` e quem faz a chamada RPC, fora de qualquer lock.

### 5. ProtectedRoute Atualizado

Em vez de verificar `isAdmin`, verificar se o usuario tem **qualquer** role no sistema (admin, socio, gerente, dentista, recepcionista). Quem nao tiver role e redirecionado ao login com mensagem de permissao.

### 6. Permissoes por Modulo

O hook `usePermissions` carrega a tabela `role_permissions` filtrada pelo papel do usuario. Cada pagina admin usa `usePermissions('modulo')` para decidir se mostra botoes de editar/excluir/criar.

### 7. Roadmap Admin

Pagina com 3 colunas (Backlog, Em Desenvolvimento, Concluido). Cards arrastaveis com titulo, descricao e fase. CRUD completo via dialogo. Ja viria pre-populado com as fases atuais do projeto.

### 8. Gerenciamento de Usuarios

Pagina para listar usuarios com seus papeis, adicionar novos papeis e remover. Apenas admin/socio tem acesso.

### Resumo de Entregas

1. Login funcionando de verdade (sem race condition/deadlock)
2. Roles: Socio/Admin, Gerente, Dentista, Recepcionista com permissoes por modulo
3. Roadmap editavel no admin
4. Gerenciamento de usuarios/papeis no admin
5. Fotos/videos/depoimentos ja editaveis (existente, mantido)
6. Menu admin filtrado por permissoes

