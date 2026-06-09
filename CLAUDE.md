# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

## IMPORTANT: Documentation First

Before writing ANY code, you MUST first read the relevant documentation file in the `/docs` directory. This applies to every feature, component, or API you are about to implement. Do not rely on training data — always consult `/docs` first:

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md
- /docs/server-components.md
- /docs/routing.md

## Architecture

- **Framework**: Next.js 16.2.6 with App Router (`src/app/`)
- **Language**: TypeScript (strict mode), path alias `@/*` → `src/*`
- **Styling**: Tailwind CSS 4 via PostCSS

App Router conventions live in `src/app/`: `layout.tsx` is the root layout, `page.tsx` files are routes, `globals.css` holds global styles.

Before using any Next.js API, check `node_modules/next/dist/docs/` — v16 has breaking changes from earlier versions.
