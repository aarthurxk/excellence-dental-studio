ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS hero_bg_image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_doctor_image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_image TEXT DEFAULT '';