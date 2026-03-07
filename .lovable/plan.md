

## Plano: Fundo para logo no footer

### Mudança

**`src/components/medico/FooterMedico.tsx`** (linha 26):
- Envolver o `<img>` em uma `<div>` com fundo branco arredondado e padding
- De: `<img src={logo} alt="Logo" className="h-20" />`
- Para: `<div className="bg-white rounded-lg p-3 inline-block"><img src={logo} alt="Logo" className="h-20" /></div>`

**`src/components/layout/Footer.tsx`** (linha 14):
- Mesma abordagem: envolver logo em container branco arredondado
- De: `<img src={logoQuadrado} alt="Odonto Excellence" className="h-16 w-auto" />`
- Para: `<div className="bg-white rounded-lg p-2 inline-block"><img src={logoQuadrado} alt="Odonto Excellence" className="h-16 w-auto" /></div>`

Isso cria um "cartão" branco sutil atrás do logo, garantindo visibilidade sobre o fundo escuro do footer.

