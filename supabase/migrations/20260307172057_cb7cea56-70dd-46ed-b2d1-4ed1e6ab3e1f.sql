DROP POLICY IF EXISTS "Admins can upload clinic images" ON storage.objects;
CREATE POLICY "Admins can upload clinic images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'clinic-images' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update clinic images" ON storage.objects;
CREATE POLICY "Admins can update clinic images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'clinic-images' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete clinic images" ON storage.objects;
CREATE POLICY "Admins can delete clinic images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'clinic-images' AND public.is_admin(auth.uid()));