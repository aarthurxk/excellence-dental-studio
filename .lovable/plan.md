
## Problema

As politicas RLS do bucket `clinic-images` usam `has_role(auth.uid(), 'admin')`, que verifica correspondencia exata com o papel `admin`. O usuario logado tem papel `socio`, entao o upload e bloqueado.

A funcao `is_admin()` ja trata `admin` e `socio` como equivalentes, mas as policies de storage nao usam `is_admin()` -- usam `has_role()` diretamente.

## Solucao

Atualizar as 3 policies de storage (INSERT, UPDATE, DELETE) para usar `is_admin(auth.uid())` em vez de `has_role(auth.uid(), 'admin')`.

```sql
DROP POLICY "Admins can upload clinic images" ON storage.objects;
CREATE POLICY "Admins can upload clinic images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'clinic-images' AND is_admin(auth.uid()));

DROP POLICY "Admins can update clinic images" ON storage.objects;
CREATE POLICY "Admins can update clinic images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'clinic-images' AND is_admin(auth.uid()));

DROP POLICY "Admins can delete clinic images" ON storage.objects;
CREATE POLICY "Admins can delete clinic images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'clinic-images' AND is_admin(auth.uid()));
```

Isso e tudo -- uma migration de 1 passo que corrige o acesso para usuarios com papel `socio`.
