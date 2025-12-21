# Claude Agent Instructions

This repository is a **Next.js App Router (Next 14)** frontend written in **TypeScript**, styled with **Tailwind**, using **next-intl** for i18n and **Zustand Toolkit** for state.

Use this file as the single source of truth for how an AI agent should work in this codebase.

## Prime Directive

- Make the smallest correct change that satisfies the request.
- Follow existing patterns and folder boundaries.
- Do not introduce new UI/UX beyond the spec.
- Do not hardcode user-facing strings; use translations.

## Quick Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

**Environment**

- Node.js: **20+** preferred (some docs may mention 18+, but use Node 20 unless required otherwise).
- API base: set `NEXT_PUBLIC_API_URL`.

## Architecture (What to Know Before Editing)

### Routing + i18n

- Locale is the first URL segment: `src/app/[locale]/...`
- Messages load via `src/i18n/messages.ts`.
- Locale routing config lives in `src/i18n/routing.ts`.
- Middleware is in `src/middleware.ts`.

**Rule:** Any new user-facing text must be added to `messages/en/*.json` and `messages/vi/*.json`, then included in `src/i18n/messages.ts`.

### Providers

- Root layout wraps global providers in `src/app/layout.tsx`.
- Per-locale providers are in `src/app/Providers.tsx`.

### API / Services

- Do not call Axios directly from components.
- Use request wrappers in `src/api/api.ts` (`getRequest`, `postRequest`, `putRequest`, `patchRequest`, `deleteRequest`).
- Axios client behavior is centralized in `src/api/axios.ts` (auth header, timezone headers, refresh, upgrade modal).
- Feature services generally live in `src/services/**` and should be thin.

### Global State

- Use Zudtand Toolkit (store setup in `<feature or component>/stores/store.ts`).

## Implementation Rules (Must Follow)

### 1) Route-scoped features stay route-scoped

If a feature is used only by a single route, keep it inside that route directory:

`src/app/[locale]/<feature-name>/{components,hooks,services,types,validations}`

Do not move route-only code into shared folders.

### 2) Standard data access pattern

Use this flow:

`Component` ➝ `Feature hook` ➝ `useFetch/usePost` ➝ `Feature service` ➝ `src/api/api.ts wrappers`

- Fetching: use `useFetch`.
- Mutations: use `usePost`.
- Validate payloads with **Zod** in the hook.

### 3) Naming conventions

- English only identifiers.
- Do not abbreviate names.
- Folders: kebab-case (except Next route segments like `[locale]`).
- React components: PascalCase.
- TS utility files: camelCase.
- Constants: UPPER_CASE.

### 4) Styling constraints

- Use existing Tailwind tokens and theme primitives.
- Do not introduce new hard-coded colors, fonts, or shadows.
- Prefer existing UI components under `src/components/**`.

### 5) Strings and translations

- No hard-coded strings in UI (including validation messages) unless already an established pattern.
- Use `useTranslations('<namespace>')`.

## Where Things Go

- Shared UI: `src/components/**`
- Shared hooks: `src/hooks/**`
- Shared utilities: `src/utils/**`
- Shared services: `src/services/**`
- Route pages: `src/app/[locale]/**/page.tsx`

## Safe Change Checklist

Before finishing a task:

- Run the narrowest check that applies (lint, typecheck/build if needed).
- Ensure new text is translated (EN + VI) and messages are wired.
- Ensure API calls use wrappers (not raw axios).
- Ensure route-only logic stays route-local.
- Keep diffs minimal; avoid refactors unrelated to the request.
