

## Plano: Adicionar duas informações em destaque no site

Adicionar uma faixa de destaque logo abaixo do InfoStrip (ou integrada a ele) com duas informações chamativas:
- **"Não fechamos para o almoço"**
- **"AQUI VOCÊ PODE!"**

### Abordagem
Criar uma nova seção/barra de destaque entre o InfoStrip e o AboutSection na página Index. Será um banner com fundo contrastante (ex: `bg-secondary` ou `bg-accent`) com as duas frases lado a lado, em destaque visual com ícones e tipografia bold.

### Alterações

| Arquivo | Alteração |
|---|---|
| `src/components/medico/HighlightBanner.tsx` | **Novo componente** — banner horizontal com dois blocos em destaque: "Não fechamos para o almoço" (ícone Clock) e "AQUI VOCÊ PODE!" (ícone CheckCircle). Fundo `bg-secondary`, texto grande e bold, com animação de entrada via framer-motion |
| `src/pages/Index.tsx` | Importar e adicionar `<HighlightBanner />` entre `<InfoStrip />` e `<AboutSection />` |

### Layout do banner
```text
┌─────────────────────────────────────────────────────┐
│  🕐 Não fechamos para o almoço  │  ✅ AQUI VOCÊ PODE!  │
└─────────────────────────────────────────────────────┘
```

Responsivo: lado a lado em desktop, empilhado em mobile. Estilo visual consistente com o restante do tema médico.

