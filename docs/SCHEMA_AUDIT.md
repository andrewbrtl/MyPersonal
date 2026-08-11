# Auditoria do schema original

O arquivo original é uma boa especificação, mas precisava dos ajustes abaixo antes de ser aplicado.

## Correções críticas

- A leitura pública de `profiles` expunha todos os alunos e seus telefones. Agora somente o próprio usuário e profissionais publicados podem ser lidos.
- Um usuário podia criar/alterar o próprio `role` para `admin`. O cadastro agora aceita apenas `aluno` ou `personal`, e o papel fica imutável pelo cliente.
- O personal podia alterar `perfil_publico`, `nota_media` e `total_avaliacoes`. Esses campos agora são mantidos pelo banco e pelo backend privilegiado.
- A RPC de busca duplicava profissionais com várias modalidades. O `join` foi substituído por filtros e agregações correlacionadas.
- O clique público no WhatsApp não combinava com a policy que exigia login. `contatos` agora é escrito somente por uma Route Handler server-side, permitindo registrar leads anônimos sem abrir inserção pública no banco.

## Consistência adicionada

- Trigger de criação automática de `profiles` após cadastro no Supabase Auth.
- Criação automática do registro em `personais` quando o papel escolhido é `personal`.
- Sincronização automática de `perfil_publico` com assinaturas ativas.
- Tabela de fotos do personal e tabela de idempotência para webhooks do Asaas.
- Constraints para preços, experiência, raio e contadores não negativos.
- Policies para editar modalidade/preço e avaliações próprias.
- Busca usa preço específico da modalidade quando disponível.
- Benefícios dos planos não prometem alterar silenciosamente a ordem por distância.

## Decisões ainda pendentes

- Critério operacional de ativação do plano Gratuito (e-mail, telefone ou curadoria manual).
- Provedor de geocodificação e nível de precisão do endereço público.
- Limites exatos de fotos/vídeo por plano.
- Conteúdo e identidade visual final, a partir das telas do Stitch.

