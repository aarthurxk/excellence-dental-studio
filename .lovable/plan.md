

## Problema Real: Deadlock no Web Locks do Supabase

Depois de investigar a fundo, identifiquei a causa raiz. O login funciona (status 200 confirmado nos logs), mas o app trava depois.

### Causa raiz

O callback `onAuthStateChange` executa **dentro de um Web Lock** do Supabase. Dentro desse callback, o codigo chama `supabase.rpc("is_admin")`, que tambem precisa adquirir um lock. Isso causa um **deadlock** -- o RPC nunca completa, `checkAdmin` nunca resolve, `setLoading(false)` nunca executa, e o usuario fica preso no loading infinito.

Este e um bug conhecido do Supabase (issue #762, #2013, #2111).

### Solucao: Refazer o useAuth completamente

**Arquivo: `src/hooks/useAuth.ts`**

Usar `setTimeout(fn, 0)` para deferir a chamada RPC para fora do lock do `onAuthStateChange`. Isso quebra o deadlock.

```typescript
// Dentro do onAuthStateChange, em vez de:
await checkAdmin(sess.user.id);

// Fazer:
setTimeout(async () => {
  await checkAdmin(sess.user.id);
  setLoading(false);
}, 0);
```

Estrutura completa:
1. `onAuthStateChange` seta `session` e `user` imediatamente
2. Defere `checkAdmin` + `setLoading(false)` via `setTimeout`
3. `getSession` faz o mesmo padrao
4. Remover `await` direto dentro do callback

**Arquivo: `src/pages/admin/AdminLogin.tsx`**

Apos `signIn` com sucesso, aguardar o estado de auth atualizar antes de navegar. Adicionar verificacao com `useEffect` que observa `isAdmin` e navega quando pronto, em vez de navegar imediatamente apos `signIn`.

```typescript
// Adicionar useEffect para navegar quando isAdmin mudar
const { signIn, isAdmin, user } = useAuth();

useEffect(() => {
  if (user && isAdmin) {
    navigate("/admin");
  }
}, [user, isAdmin, navigate]);
```

No `handleSubmit`, remover o `navigate("/admin")` e apenas mostrar erro se houver.

### Resumo das alteracoes

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useAuth.ts` | Deferir `checkAdmin` via `setTimeout` para evitar deadlock do Web Lock |
| `src/pages/admin/AdminLogin.tsx` | Usar `useEffect` para navegar quando `isAdmin` estiver resolvido, em vez de navegar imediatamente |

