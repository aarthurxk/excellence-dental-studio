

## Plano: Scroll suave + Transicoes de pagina

### 1. Novo componente `src/components/layout/ScrollToTop.tsx`
- Usa `useLocation` do react-router-dom
- `useEffect` que faz `window.scrollTo({ top: 0, behavior: 'smooth' })` a cada mudanca de `pathname`

### 2. Novo componente `src/components/layout/PageTransition.tsx`
- Wrapper com `framer-motion` (`motion.div`)
- Aplica fade-in + leve slide vertical na entrada (opacity 0->1, translateY 15px->0, ~0.3s)
- Usa `key={location.pathname}` com `AnimatePresence` para animar entrada/saida

### 3. Atualizar `src/App.tsx`
- Extrair rotas para um componente interno `AppRoutes` que usa `useLocation` (necessario estar dentro do `BrowserRouter`)
- Adicionar `ScrollToTop` dentro do `BrowserRouter`
- Envolver o bloco `<Routes>` com `AnimatePresence` e cada rota publica com `PageTransition`
- Rotas admin ficam sem animacao para nao atrapalhar o painel

### Efeito final
- Ao clicar em qualquer link de navegacao, a pagina rola suavemente ao topo
- O conteudo da nova pagina entra com fade + leve slide de baixo para cima

