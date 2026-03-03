# AI Agent Instructions

**Next.js 14 App Router** · TypeScript (strict) · Tailwind CSS · next-intl · Redux Toolkit · shadcn/radix UI

Use this file as the single source of truth when working in this codebase.

---

## Prime Directive

- Make the smallest correct change that satisfies the request.
- Follow existing patterns and folder boundaries exactly.
- Do not introduce new UI/UX beyond the spec.
- Never hardcode user-facing strings — use translations.

---

## Commands

```bash
npm install          # Install dependencies (Node 20+ required)
npm run dev          # Start dev server
npm run build        # Production build (ESLint is skipped — run lint separately)
npm run start        # Start production server
npm run lint         # Run ESLint + report errors
```

> **No test runner is configured.** `eslint-plugin-vitest` and `eslint-plugin-testing-library` are present as devDependencies but no test script or config file exists. Use `npm run lint` and `npm run build` as the verification steps.

**Environment:** `NEXT_PUBLIC_API_URL` must be set. The Axios client sets `baseURL = ${NEXT_PUBLIC_API_URL}/api`.

---

## Architecture

### Routing + i18n

- All routes live under `src/app/[locale]/` — locale is always the first path segment.
- Supported locales: `en`, `vi` (default: `en`) — configured in `src/i18n/routing.ts`.
- Messages load via `src/i18n/messages.ts` (spreads per-namespace JSON files).
- Middleware: `src/middleware.ts` using `createMiddleware(routing)`.
- Per-locale providers (including `timeZone="Asia/Ho_Chi_Minh"`) are in `src/app/Providers.tsx`.

**Rule:** Any new user-facing string must be added to both `messages/en/*.json` **and** `messages/vi/*.json`, then wired into `src/i18n/messages.ts`.

### Providers (root layout order)

`StoreProvider` → `ThemeProvider` → `AuthProvider`

### Global State

- **Redux Toolkit** is the global store — configured in `src/stores/store.ts` with slices for auth, subscription, mindmap, pomodoro, etc.
- Access via typed hooks in `src/stores/hooks.tsx`.
- Note: AGENTS.md previously said "Zustand Toolkit" — the actual implementation uses Redux Toolkit.

### API / Services

- **Never call Axios directly from components or hooks.**
- Use the typed wrappers in `src/api/api.ts`: `getRequest`, `postRequest`, `putRequest`, `patchRequest`, `deleteRequest`.
- The Axios client (`src/api/axios.ts`) handles automatically:
    - `Authorization: Bearer <token>` from `localStorage`
    - `X-Timestamp` / `X-Timezone` headers via `getTimestampWithClientOffset()`
    - Feature gating: `featureId`, `planId`, `featureType` injected on `POST/PUT/PATCH` when URL matches plan features
    - `401` → refresh via `RefreshTokenAxiosClient` → retry; `402` → opens Upgrade modal
- Feature services live in `src/services/<feature>/` and should be thin wrappers.
- Auth context (`src/contexts/auth/AuthContext.tsx`) exposes `isAuthenticated`, `user`, plan info, and notifications.

---

## Data Access Pattern

```
Component → Feature hook → useFetch / usePost → Feature service → src/api/api.ts
```

- **Fetching:** use `useFetch(urlOrFn, options)` — returns `{ data, setData, loading, error, refetch }`.
- **Mutations:** use `usePost(urlOrFn, method, options)` — returns `{ execute, data, loading, error, reset }`.
- Validate request and response payloads with **Zod** schemas passed to `requestSchema` / `responseSchema` options.

```ts
// Fetch example
const { data, loading } = useFetch<IFlashcard[]>('/flashcards', { shouldRun: !!userId });

// Mutation example
const { execute } = usePost<ICreateInput, IFlashcard>((data) => flashcardService.create(data), 'POST', {
    onSuccess: (data) => {
        /* update UI */
    },
    requestSchema: createInputSchema,
});
```

---

## File & Folder Layout

```
src/
├── api/            # Axios instance + typed request wrappers + response types
├── app/
│   ├── [locale]/   # All route pages — each feature may have components/, hooks/, services/, types/, validations/
│   ├── layout.tsx  # Root layout + global providers
│   └── Providers.tsx
├── components/     # Shared UI (shadcn/radix primitives in components/ui/)
├── contexts/       # React contexts (auth, gamification, tracking…)
├── hooks/          # Shared hooks (useFetch, usePost, 40+ others)
├── i18n/           # next-intl config, routing, message loader
├── services/       # Shared thin API services
├── stores/         # Redux store, slices, typed hooks
├── types/          # Shared TypeScript types
└── utils/          # Shared utilities
```

**Rule:** If a feature is used only by one route, keep it inside that route directory. Do not promote route-only code to shared folders.

---

## Naming Conventions (enforced by ESLint)

| Target                | Convention   | Example                     |
| --------------------- | ------------ | --------------------------- |
| Folders               | `kebab-case` | `user-profile/`             |
| React component files | `PascalCase` | `UserCard.tsx`              |
| TS/JS utility files   | `camelCase`  | `formatDate.ts`             |
| React components      | `PascalCase` | `const UserCard: React.FC`  |
| Variables & functions | `camelCase`  | `handleSubmit`, `userData`  |
| Constants             | `UPPER_CASE` | `MAX_RETRIES`               |
| Types & interfaces    | `PascalCase` | `IFlashcard`, `ApiResponse` |
| Enum members          | `UPPER_CASE` | `FLASH_CARD`                |

- English identifiers only — no Vietnamese in code.
- Do not abbreviate names.
- Next.js reserved filenames (`page.tsx`, `layout.tsx`, `not-found.tsx`) stay as-is.
- Route segments (`[locale]`, `[id]`, `(group)`) follow Next.js conventions.

---

## TypeScript Rules

- `strict: true` is enabled — no implicit `any`, strict null checks, etc.
- **`any` is banned** (`@typescript-eslint/no-explicit-any: error`). Use proper generics or `unknown`.
- No unused variables (`@typescript-eslint/no-unused-vars: error`).
- No empty functions (`@typescript-eslint/no-empty-function: error`).
- Import alias: use `@/*` (maps to `src/*`) for all non-relative imports.
- Use `interface` for object shapes; `type` for unions, intersections, and mapped types.
- Prefix interfaces with `I` where that pattern is already established (e.g., `IFlashcard`).

---

## Styling

- Use existing Tailwind CSS variables and theme tokens only — no hard-coded colors, sizes, or shadows.
- Dark mode is class-based (`dark:`).
- Prefer existing components in `src/components/ui/` (shadcn/radix) before creating new ones.
- Font: `font-sans` resolves to Inter. For Vietnamese content, Inter is preferred.
- Tailwind class order is linted by `plugin:tailwindcss/recommended`.

---

## Implementation Rules (Must Follow)

1. **Route-scoped code stays route-scoped.** If only one route uses it, keep it in `src/app/[locale]/<feature>/`.
2. **Use API wrappers, never raw Axios.** All HTTP calls go through `src/api/api.ts`.
3. **Validate with Zod.** Pass `requestSchema` / `responseSchema` to `usePost`, or validate inline in feature hooks.
4. **Translate all strings.** Add to `messages/en/*.json` and `messages/vi/*.json`, then include in `src/i18n/messages.ts`. Use `useTranslations('namespace')` in components.
5. **Respect auth and plan gating.** Use `useAuth()` / `AuthContext` for role checks. The Axios client injects plan feature data automatically.
6. **Keep diffs minimal.** Avoid unrelated refactors. One concern per PR.

---

## Safe Change Checklist

Before marking a task done:

- [ ] `npm run lint` passes (or only pre-existing issues remain).
- [ ] `npm run build` succeeds for non-trivial changes.
- [ ] New strings added to `messages/en/*.json` **and** `messages/vi/*.json` and wired in `src/i18n/messages.ts`.
- [ ] No direct Axios calls — all HTTP through `src/api/api.ts` wrappers.
- [ ] Route-only logic is not placed in shared folders.
- [ ] No `any` types introduced.
- [ ] No hard-coded colors, fonts, or untranslated user-facing strings.
