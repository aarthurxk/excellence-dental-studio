

## Plano: Botão discreto para funcionários no rodapé

Adicionar um pequeno ícone (ex: `Settings` ou `Lock`) na barra de copyright do footer, ao lado direito, que leva ao `/admin/login`. Será quase invisível — mesma cor do texto de copyright (`text-primary-foreground/50`) com hover sutil.

### Alteração

| Arquivo | O que fazer |
|---|---|
| `src/components/medico/FooterMedico.tsx` | Na div de copyright (linha 97-101), adicionar um `Link` para `/admin/login` com ícone `Lock` (tamanho 14px), cor `text-primary-foreground/30` com hover para `/50`. Usar `flex justify-between` em vez de `text-center` |

O ícone será discreto o suficiente para não chamar atenção de pacientes, mas acessível para funcionários que sabem onde clicar.

