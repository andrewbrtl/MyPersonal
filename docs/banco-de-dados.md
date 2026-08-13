# Guia rápido do banco de dados

O banco usa algumas tabelas técnicas que já estavam conectadas ao site. Para evitar que uma troca de nome derrube login, perfis ou permissões, os nomes físicos foram mantidos e receberam descrições em português no Supabase.

Para consultar com nomes mais fáceis, use estas visões somente de leitura:

- `usuarios`: nome, tipo de conta, telefone, foto e cidade.
- `resumo_personais`: principais informações públicas e profissionais em uma única consulta.

## O que cada tabela guarda

| Nome técnico | Significado simples |
| --- | --- |
| `auth.users` | Login, e-mail e senha gerenciados pelo Supabase |
| `profiles` | Dados básicos dos usuários |
| `personais` | Dados profissionais, CREF, bio, preço e redes |
| `modalidades` | Lista de esportes e atividades |
| `personal_modalidades` | Modalidades escolhidas por cada profissional |
| `personal_fotos` | Fotos adicionais dos profissionais |
| `planos` | Planos disponíveis |
| `assinaturas` | Plano e situação de pagamento de cada profissional |
| `avaliacoes` | Notas e comentários dos alunos |
| `favoritos` | Profissionais salvos pelos alunos |
| `contatos` | Cliques em telefone e WhatsApp |
| `asaas_webhook_eventos` | Registros técnicos enviados pelo Asaas |

## Regras importantes

- `id` é o identificador único do usuário ou registro.
- `role` significa tipo da conta: `aluno`, `personal` ou `admin`.
- `criado_em` e `atualizado_em` são datas automáticas.
- Telefones ficam apenas com DDD e números, por exemplo `42999999999`.
- O telefone é único e pode ser usado no login, mas a recuperação de senha sempre chega ao e-mail cadastrado.
- As visões não substituem as tabelas e não devem receber gravações.
