

## Plano: Transições mais suaves + Trocar logo

### 1. Suavizar transições de página (`PageTransition.tsx`)
- Reduzir o deslocamento vertical de 15px para 6px (entrada) e de -10px para -4px (saída)
- Aumentar a duração de 0.3s para 0.5s
- Trocar easing de `easeOut` para `[0.25, 0.1, 0.25, 1]` (cubic-bezier suave, quase imperceptível)
- Resultado: transição delicada, quase um fade puro com movimento mínimo

### 2. Trocar logo por nova versão
- Copiar `user-uploads://Logo_OE_Recife_vermelho.png` para `src/assets/logo-recife.png`
- Atualizar import nos 5 arquivos que usam `logo-small.png`:
  - `HeaderInfo.tsx` — logo do header desktop
  - `Navbar.tsx` — logo mobile
  - `FooterMedico.tsx` — logo do rodapé
  - `AdminLogin.tsx` — tela de login admin
  - `AdminResetPassword.tsx` — tela de reset de senha
- Ajustar altura da logo onde necessário (a nova é horizontal/maior, pode precisar de `h-14` ou `h-16` em vez de `h-12`/`h-8`)

