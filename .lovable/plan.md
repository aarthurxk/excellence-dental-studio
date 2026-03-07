

## Plano: Aumentar logo no header e footer (~50%)

### Mudancas

1. **`src/components/medico/HeaderInfo.tsx`** (header desktop)
   - Logo: `h-14` → `h-20` (de ~56px para ~80px)
   - Aumentar padding vertical: `py-4` → `py-5` para acomodar

2. **`src/components/medico/Navbar.tsx`** (header mobile)
   - Logo: `h-10` → `h-14` (de ~40px para ~56px)
   - Altura da navbar: `h-16` → `h-20` para caber

3. **`src/components/medico/FooterMedico.tsx`** (rodape)
   - Logo: `h-14` → `h-20` (de ~56px para ~80px)

Todas as logos usam `w-auto` implicitamente, entao a largura se ajusta proporcionalmente.

