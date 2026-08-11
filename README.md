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
```

## Documentação

- `docs/PROJECT_CONTEXT.md`: decisões de produto e escopo do MVP.
- `docs/SCHEMA_AUDIT.md`: problemas encontrados no SQL original e correções aplicadas.
- `supabase/migrations/0001_initial_schema.sql`: fonte de verdade inicial do banco.
