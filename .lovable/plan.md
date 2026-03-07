

## Problema Identificado

O bug esta no `useAuth.ts`. A race condition acontece assim:

1. Login com sucesso (status 200 confirmado nos logs)
2. `onAuthStateChange` dispara → seta `user` → chama `checkAdmin()` (async, **sem await**)
3. `setLoading(false)` executa **antes** de `checkAdmin` terminar
4. `ProtectedRoute` ve `loading=false` + `isAdmin=false` (ainda nao resolveu) → redireciona para `/admin/login`

O mesmo problema existe no `getSession().then()` -- `setLoading(false)` roda antes do `checkAdmin` completar.

## Correção

**Arquivo: `src/hooks/useAuth.ts`**

Aguardar `checkAdmin` completar antes de setar `loading = false`:

- Na callback do `onAuthStateChange`: `await checkAdmin(...)` antes de `setLoading(false)` (tornar a callback async)
- No `getSession().then()`: mesma coisa -- aguardar `checkAdmin` antes de `setLoading(false)`

Alteração simples de ~4 linhas, adicionando `await` nas chamadas a `checkAdmin` e tornando as callbacks `async`.

