# Marketplace de Personais

MVP mobile-first para conectar alunos a profissionais de esporte em Guarapuava/PR.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Postgres, PostGIS, Auth e Storage)
- Asaas para assinaturas recorrentes
- Vercel para deploy

## Começando

1. Copie `.env.example` para `.env.local` e preencha a URL, a chave publicável e a chave secreta do Supabase.
2. Crie um projeto no Supabase e execute `supabase/migrations/0001_initial_schema.sql`.
3. Gere os tipos do banco:

```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID > types/database.types.ts
```

4. Rode o projeto:

```bash
npm run dev
```

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm run security:repo
npm run test:security
```

## Segurança para repositório público

- Segredos ficam somente em `.env.local` e nas variáveis protegidas do Vercel; nunca no Git.
- `.env.example` contém apenas nomes de variáveis e valores vazios.
- `npm run security:repo` examina arquivos atuais e todo o histórico Git sem imprimir valores encontrados.
- O CI verifica segredos, dependências, validações, lint e build em cada pull request.
- Chaves com privilégio (`SUPABASE_SECRET_KEY`, `CPF_HASH_SECRET` e `RATE_LIMIT_SECRET`) nunca podem receber o prefixo `NEXT_PUBLIC_`.

Se uma chave real for adicionada a um commit, removê-la do arquivo não basta: revogue/rotacione a chave e limpe o histórico antes de tornar o repositório público.

## Documentação

- `docs/PROJECT_CONTEXT.md`: decisões de produto e escopo do MVP.
- `docs/SCHEMA_AUDIT.md`: problemas encontrados no SQL original e correções aplicadas.
- `supabase/migrations/0001_initial_schema.sql`: fonte de verdade inicial do banco.
