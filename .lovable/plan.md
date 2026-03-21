

## Criar gerenciamento de "Antes e Depois" no Admin

### O que será feito

1. **Nova tabela `before_after_cases`** no banco de dados com colunas:
   - `id`, `title`, `detail`, `before_image`, `after_image`, `display_order`, `active`, `created_at`, `updated_at`
   - RLS: leitura pública, gerenciamento por admins

2. **Nova página admin `/admin/antes-depois`**
   - Tabela listando os casos cadastrados
   - Formulário para adicionar/editar com:
     - Título e detalhe (texto)
     - Upload de foto "Antes" e foto "Depois" (usando o componente ImageUpload existente com o bucket `clinic-images`)
     - Ordem de exibição e ativo/inativo

3. **Adicionar link no menu lateral do admin** para a nova página

4. **Atualizar o componente `BeforeAfter.tsx`** para buscar os dados do banco em vez dos placeholders hardcoded

### Resultado
Você poderá adicionar, editar e trocar as fotos de antes e depois diretamente pelo painel admin, da mesma forma que já faz com dentistas, eventos, etc.

