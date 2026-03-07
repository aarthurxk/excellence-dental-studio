

# Plano Atualizado: Odonto Excellence – Ipsep

## Alterações solicitadas

### 1. Substituir Galeria por Eventos
- Remover seção "Galeria" da Home e das páginas
- Adicionar seção "Eventos" com: título, descrição, data, imagem, local
- Tabela `events` no banco: `id, title, description, date, image_url, location, created_at`
- No admin: CRUD de eventos (adicionar, editar, remover)
- Remover tabela `gallery` do schema

### 2. Cores da franquia (baseado nos logos)
Extraídas do logo Odonto Excellence:
- **Primary (vermelho):** ~HSL 358 82% 50% (#E31E24)
- **Dark (preto/cinza escuro):** ~HSL 0 0% 10% (#1A1A1A) — headings, header
- **Background:** branco e cinza claro
- **Accent:** vermelho para CTAs e destaques
- **Foreground:** cinza escuro para texto corpo

### 3. Logos
- `Logo_quadrado_recife.png` → logo principal no header (versão grande)
- `logo_recife_quadrado.png` → logo menor / favicon / mobile
- `Logo_zap_redondo.jpg` → ícone do WhatsApp / perfil
- `image.png` → referência visual do layout do site da franquia (não será embutida)

## Estrutura atualizada da Home
1. Hero (com logo, título, botões WhatsApp + Agendar)
2. Diferenciais (4 cards com ícones)
3. Tratamentos em destaque
4. Sobre a clínica
5. Equipe de dentistas
6. Depoimentos
7. Vídeos
8. **Eventos** (substituiu Galeria)
9. Localização + mapa
10. CTA final
11. Footer

## Implementação
- Atualizar CSS variables com as cores vermelha/preta da franquia
- Copiar logos para `src/assets/`
- Criar componente `Events` e página `/eventos`
- Criar tabela `events` no banco (no lugar de `gallery`)
- Admin: seção Eventos com CRUD
- Usar `image.png` apenas como referência de layout do header/hero

