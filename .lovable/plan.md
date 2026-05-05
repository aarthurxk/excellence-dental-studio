Objetivo
Fazer os nomes aparecerem corretamente em Ao Vivo e Conversas, eliminando a exibição de números quando já existe algum nome disponível no ecossistema do projeto.

O que já foi confirmado
- O preview já está rodando com as mudanças recentes, então não parece ser apenas falta de publicar.
- A função de contatos do WhatsApp está retornando vazio em `findContacts`.
- A listagem de chats do WhatsApp (`findChats`) está retornando os telefones, e no payload há evidência de nomes citados dentro das mensagens, mas não em um campo estruturado de contato.
- A fonte da Vera que vimos no snapshot traz majoritariamente sessões `site:`; não ficou comprovado ainda que ela esteja entregando nomes `wa:` para os chats WhatsApp usados nessas telas.

Plano
1. Auditar a cadeia de resolução de nomes
- Mapear exatamente como cada tela decide o nome exibido.
- Comparar, para o mesmo telefone, estas fontes em ordem:
  - nome salvo em `leads.name`
  - nome salvo em `leads.push_name`
  - nome vindo de Vera logs (`wa:` quando existir)
  - nome vindo de `findChats`
  - nome vindo de `findContacts`
  - fallback final para telefone
- Identificar em quais casos o sistema ainda cai no telefone mesmo havendo nome implícito em outra fonte.

2. Fortalecer a lógica de fallback no frontend
- Unificar a resolução de nomes entre Ao Vivo e Conversas para não haver comportamentos diferentes.
- Criar uma estratégia única de nome com prioridade consistente.
- Normalizar telefone/chave em todos os pontos para evitar mismatch entre `5581...`, `wa:5581...` e `5581...@s.whatsapp.net`.
- Revalidar chaves do React Query para garantir atualização quando os nomes mudarem, e não só quando a quantidade de registros mudar.

3. Adicionar fallback inteligente a partir do conteúdo das mensagens
- Quando não houver nome estruturado em nenhuma fonte, extrair o primeiro nome detectável da última mensagem enviada pela IA ou do histórico recente, apenas em casos seguros.
- Exemplo: se a mensagem contém “Perfeito, Glauber!” ou “Entendo, Diogo.”, usar esse nome como fallback visual temporário.
- Aplicar heurísticas conservadoras para evitar nomes errados.

4. Opcionalmente persistir o nome no cadastro do lead
- Quando o sistema descobrir um nome confiável para um telefone que ainda está sem `name/push_name`, salvar esse valor no lead para não depender sempre de heurística.
- Só farei isso se a implementação mostrar que é seguro e compatível com as regras atuais do app.

5. Validar nas duas telas críticas
- Ao Vivo: confirmar que os cards deixam de mostrar só o número quando há nome disponível.
- Conversas / WhatsApp: confirmar que a lista lateral e o cabeçalho da conversa usam a mesma resolução de nome.
- Conferir também o popup/sheet da conversa para garantir consistência.

6. Fechar a dúvida sobre publicação
- Backend já entra em vigor automaticamente quando alterado.
- Mudanças de frontend aparecem no preview; para ir ao site publicado, aí sim é preciso clicar em Update/Publish.
- Ou seja: se no preview ainda não aparece, publicar sozinho não deve resolver a causa raiz; primeiro preciso corrigir a lógica/dados.

Detalhes técnicos
- Centralizar a função de resolução de nome em util compartilhado, em vez de manter regras diferentes em `AdminAoVivo.tsx` e `ConversasWhatsApp.tsx`.
- Usar parsing defensivo para possíveis fontes de nome em `findChats` e nas últimas mensagens.
- Se necessário, incluir logs temporários de diagnóstico no cliente para comparar telefone -> nome resolvido durante o teste.
- Se eu concluir que o problema principal é ausência de nome persistido no banco, posso propor um passo seguinte para sincronizar nomes automaticamente no backend.

Entrega esperada
- Nomes consistentes nas telas de operação.
- Menos dependência de campos vazios da API de contatos.
- Confirmação objetiva se faltava publicar ou se o problema era realmente a lógica/dados.

Se você aprovar, eu implemento esse plano e valido no preview.