# Professor +LA

Aplicação web (Vite + React + TypeScript) integrada ao Supabase.

## Scripts

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Rodar em desenvolvimento:
   ```bash
   npm run dev
   ```
3. Gerar build de produção:
   ```bash
   npm run build
   ```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deploy na Vercel

1. Importar o repositório na Vercel.
2. Em **Project Settings > Environment Variables**, configurar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Fazer o deploy (build command padrão: `npm run build`).

## Checklist de produção

- RLS habilitado nas tabelas públicas do Supabase.
- Policies com CRUD completo para `authenticated` (sem acesso anônimo).
- Credenciais somente em variáveis de ambiente (nunca hardcoded no código).
- Build local validado com `npm run build`.
- Logo customizável no topo em `public/logo.png`.
