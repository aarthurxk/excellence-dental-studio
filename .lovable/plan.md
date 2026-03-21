

## Alterar senha do usuário

Vou criar uma Edge Function temporária que usa a Admin API para alterar a senha do usuário `arthur@odontoexcellencerecife.com.br` para `102030`.

### Passos

1. **Criar edge function `update-password`** que:
   - Usa o `SUPABASE_SERVICE_ROLE_KEY` para acessar a Admin API
   - Busca o usuário pelo email
   - Atualiza a senha com `supabase.auth.admin.updateUserById()`

2. **Executar a função** para aplicar a alteração

3. **Remover a edge function** após o uso (não precisa ficar no projeto)

### Detalhes técnicos
- A função usará o Supabase Admin Client com service role key
- Não requer secrets adicionais — `SUPABASE_SERVICE_ROLE_KEY` já está configurado

