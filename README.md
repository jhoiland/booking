# Booking Monorepo

## Tech Stack

- Node.js 20 LTS (via .nvmrc, engines)
- pnpm 9.x (Corepack, packageManager field)
- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 5.x (strict, ES2022, bundler)
- Tailwind CSS v4
- Zustand 5
- Zod 4
- Prisma ORM 7 + SQLite
- ESLint 9 (flat config, eslint-config-next)
- Prettier

## Prerequisites

- Node.js 20 LTS ([nvm recommended](https://github.com/nvm-sh/nvm))
- Corepack enabled (bundled with Node.js 20+)
- pnpm 9.x (`corepack prepare pnpm@9.0.0 --activate`)

## Getting Started

```sh
corepack enable
pnpm install
pnpm db:generate
pnpm db:push
pnpm build
pnpm lint
pnpm format
pnpm dev
```

## pnpm Command Shortcuts

| Script         | Description                        |
| -------------- | ---------------------------------- |
| dev            | Start Next.js dev server           |
| build          | Build Next.js app                  |
| start          | Start production server            |
| lint           | Run ESLint                         |
| format         | Run Prettier                       |
| format:check   | Check formatting                   |
| db:generate    | Generate Prisma client             |
| db:push        | Push schema to database            |
| db:studio      | Open Prisma Studio                 |

All scripts delegate to `apps/web` via `pnpm --filter web ...`.

## Structure

```
package.json
pnpm-workspace.yaml
.npmrc
.nvmrc
.gitignore
.env.example
.prettierrc
.prettierignore
apps/web/
packages/
.github/
```

See `.github/` for Copilot instructions and skills.