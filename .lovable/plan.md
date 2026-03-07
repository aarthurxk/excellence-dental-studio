

## Plano: Paleta Vermelho/Preto + Timetable + Fotos Editáveis pelo Admin

### 1. Substituir paleta Teal → Vermelho/Preto

**Arquivos:** `src/index.css`, `tailwind.config.ts`

Trocar as CSS variables:
- `--primary`: de `168 100% 37%` (teal) para `0 83% 51%` (#E31E24 vermelho)
- `--secondary`: de `210 40% 20%` para `0 0% 10%` (#1A1A1A preto)
- `--teal` → `--brand-red`: `0 83% 51%`
- `--mint-bg` → fundo rosado claro: `0 40% 97%`
- `--teal-light` → `0 40% 96%`
- Ajustar dark mode correspondente
- Renomear referências de `teal` para `brand` no tailwind.config e nos componentes

**Componentes a atualizar** (referências diretas a cores teal):
- `Navbar.tsx` linha 89: `bg-teal-light` → `bg-clinic-red-light`
- `DepartmentsSection.tsx` linha 53: box-shadow hardcoded teal → vermelho
- Nenhum outro hardcode encontrado; o resto usa variáveis CSS (`primary`, `secondary`)

### 2. Criar Timetable (Grade Semanal)

**Novo arquivo:** `src/components/medico/TimetableSection.tsx`

- Tabela com colunas: Segunda a Domingo
- Linhas alternadas: fundo branco e fundo `primary` (vermelho)
- Nas linhas vermelhas: texto branco, nome do dentista em destaque
- Dados estáticos iniciais (lorem) com estrutura: horário, nome do dentista, especialidade
- Hover em linha: destaque com sombra
- Scroll-triggered fade-in com Framer Motion
- Usar `SectionDivider` para heading

**Adicionar à Home:** `src/pages/Index.tsx` — inserir `<TimetableSection />` após `DoctorsSection`

### 3. Fotos Editáveis pelo Admin (imagens do site)

**Migração de banco** — Adicionar colunas de imagem à tabela `site_settings`:
```sql
ALTER TABLE public.site_settings 
  ADD COLUMN hero_bg_image TEXT DEFAULT '',
  ADD COLUMN hero_doctor_image TEXT DEFAULT '',
  ADD COLUMN about_image TEXT DEFAULT '';
```

**Atualizar componentes do site:**
- `HeroSection.tsx`: usar `settings?.hero_bg_image` e `settings?.hero_doctor_image` no lugar dos placeholders
- `AboutSection.tsx`: usar `settings?.about_image` no lugar do placeholder
- `BlogSection.tsx`: manter estático (não há tabela de blog ainda)

**Atualizar admin:**
- `AdminSettings.tsx`: adicionar 3 campos de upload de imagem (hero background, hero doctor, about) usando o bucket `clinic-images` existente
- Criar componente reutilizável `ImageUpload.tsx` com preview, botão de upload ao storage, e retorno de URL pública
- Os dentistas já possuem `photo_url` — adicionar `ImageUpload` ao `AdminDentists.tsx` no lugar do campo de texto "URL da Foto"
- Os eventos já possuem `image_url` — adicionar `ImageUpload` ao `AdminEvents.tsx` no lugar do campo de texto

**Componente `ImageUpload`:**
- Props: `bucket`, `folder`, `value`, `onChange`
- Upload via `supabase.storage.from(bucket).upload()`
- Preview da imagem atual
- Botão para remover/trocar

### Resumo de Arquivos

| Ação | Arquivo |
|---|---|
| Editar | `src/index.css` (variáveis CSS) |
| Editar | `tailwind.config.ts` (nomes de cores) |
| Editar | `src/components/medico/Navbar.tsx` |
| Editar | `src/components/medico/DepartmentsSection.tsx` |
| Criar | `src/components/medico/TimetableSection.tsx` |
| Editar | `src/pages/Index.tsx` |
| Criar | `src/components/admin/ImageUpload.tsx` |
| Editar | `src/pages/admin/AdminSettings.tsx` |
| Editar | `src/pages/admin/AdminDentists.tsx` |
| Editar | `src/pages/admin/AdminEvents.tsx` |
| Editar | `src/components/medico/HeroSection.tsx` |
| Editar | `src/components/medico/AboutSection.tsx` |
| Migração | `site_settings`: 3 novas colunas de imagem |

