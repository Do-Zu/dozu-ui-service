# AI Coding Agent Guide: Dozu UI Service

Use this guide to work productively in this Next.js 14 + TypeScript monorepo. It documents actual patterns and workflows in this codebase.

## Architecture

- **App Router + i18n**: Locale is the first path segment under [src/app/[locale]](src/app/%5Blocale%5D). `next-intl` is wired via [src/middleware.ts](src/middleware.ts#L1-L12) and the per-locale layout [src/app/[locale]/layout.tsx](src/app/%5Blocale%5D/layout.tsx#L1-L40) which loads messages using [src/i18n/messages.ts](src/i18n/messages.ts#L1-L80).
- **Root Providers**: Global layout [src/app/layout.tsx](src/app/layout.tsx#L1-L80) wraps `StoreProvider`, `ThemeProvider`, `ReactFlowProvider`, and `AuthProvider`. Per-locale `Providers` sets `timeZone="Asia/Ho_Chi_Minh"` in [src/app/Providers.tsx](src/app/Providers.tsx#L1-L40).
- **State**: Redux Toolkit store initialized in [src/app/StoreProvider.tsx](src/app/StoreProvider.tsx#L1-L40) using reducers defined in [src/stores/store.ts](src/stores/store.ts#L1-L80) (auth, subscription, mindmap, pomodoro, etc.).
- **Services**: Feature services live under [src/services](src/services). They call typed request wrappers in [src/api/api.ts](src/api/api.ts#L1-L120).
- **Styling + Fonts**: Tailwind with CSS variables in [tailwind.config.ts](tailwind.config.ts#L1-L220). Inter + Geist fonts configured in [src/app/layout.tsx](src/app/layout.tsx#L1-L80) and used via `font-sans`.

## Data & API Patterns

- **Axios client**: Central client in [src/api/axios.ts](src/api/axios.ts#L1-L220) with:
    - `baseURL = ${NEXT_PUBLIC_API_URL}/api` and `withCredentials = true`.
    - Request headers: `Content-Type` auto-set (except `FormData`), `Authorization: Bearer <token>` from `localStorage`, plus `X-Timestamp`, `X-Timezone` via `getTimestampWithClientOffset()`.
    - Feature gating: For `POST/PUT/PATCH`, inject `featureId`, `planId`, `featureType`, and `url` when the URL matches the current plan’s features (see [src/utils/auth/subscription.ts](src/utils/auth/subscription.ts#L1-L40)).
    - Error handling: `401` triggers refresh via `RefreshTokenAxiosClient` and retries; `402` opens Upgrade modal; logs `500` and network errors.
- **Request wrappers**: Always use `getRequest/postRequest/putRequest/patchRequest/deleteRequest` from [src/api/api.ts](src/api/api.ts#L1-L120). These add timezone info via [src/utils/date/apiDateUtils.ts](src/utils/date/apiDateUtils.ts#L1-L120) and return the typed `ApiResponse<T>` defined in [src/api/type.ts](src/api/type.ts#L1-L40).
- **Example (service)**: See [src/services/auth/auth.service.ts](src/services/auth/auth.service.ts#L1-L80) for the pattern (`BASE_URL` + wrapper methods).

## Routing & Localization

- **Middleware**: `createMiddleware(routing)` in [src/middleware.ts](src/middleware.ts#L1-L12) ensures locale-aware routes with matcher exclusion for `api`, `trpc`, `_next`, files.
- **Routing config**: Locales `['en','vi']` and default `en` in [src/i18n/routing.ts](src/i18n/routing.ts#L1-L40).
- **Messages loader**: Centralized imports per-locale in [src/i18n/messages.ts](src/i18n/messages.ts#L1-L120). Use `useTranslations('namespace')` in client components.

## Role & Auth Flow

- **Auth context**: [src/contexts/auth/AuthContext.tsx](src/contexts/auth/AuthContext.tsx#L1-L200) exposes `isAuthenticated`, `user`, plan info, notifications, and websocket-driven notifications. It fetches current plan + features and caches in session storage.
- **Home redirect**: [src/app/[locale]/page.tsx](src/app/%5Blocale%5D/page.tsx#L1-L120) redirects based on role (`admin`, `teacher`, default user) and `ROUTES` constants.

## Build & Run

- **Prereqs**: Node 20+. Ensure env `NEXT_PUBLIC_API_URL` is set for API calls.
- **Dev**:

```bash
npm run dev
```

- **Build/Start**:

```bash
npm run build
npm run start
```

- **Lint/Format**: `eslint` + `prettier` via `lint-staged`; run `npm run lint`.
- **Next config**: Standalone output and YouTube proxy rewrite in [next.config.js](next.config.js#L1-L60). Remote images from Cloudinary/Unsplash.

## Conventions & Tips

## Naming Conventions

Follow these conventions for any new code (and when touching existing code):

- Do not abbreviate or shorten names.
- Use English only (no Vietnamese identifiers).
- Use names that accurately describe the function and content.
- Do not use special characters in identifiers (e.g., `@`, `#`, `$`).

### Folders

- Use kebab-case (e.g., `user-profile-pictures`).
- **Exception (Next.js App Router):** route segment folders may include Next.js syntax like `[locale]`, `[id]`, or `(group)` and should not be renamed.

### Files

- React component files: PascalCase (e.g., `UserProfile.tsx`, `ProductCard.tsx`).
- General TypeScript/JavaScript files: camelCase (e.g., `formatDate.ts`, `validate.ts`).
- **Exception (Next.js App Router reserved filenames):** keep framework-reserved names as-is (e.g., `page.tsx`, `layout.tsx`, `not-found.tsx`, `global-error.tsx`).

### Variables / Functions / Constants

- Variables and functions: camelCase (e.g., `handleSubmit`, `userData`).
- Constants: UPPER_CASE with underscores (e.g., `MAX_ITEMS`, `DEFAULT_TIMEOUT`).

- **Paths**: Use TS alias `@/*` per [tsconfig.json](tsconfig.json#L1-L40).
- **Timezone**: Requests include `timestamp` and `timezone`; prefer wrappers over raw `Axios`.
- **UI**: shadcn/radix components throughout `src/components/**`.
- **Locale fonts**: For Vietnamese content, prefer Inter; see [src/fonts/README.md](src/fonts/README.md).
- **Adding translations**: Add JSON under [messages/en](messages/en) or [messages/vi](messages/vi), then include in [src/i18n/messages.ts](src/i18n/messages.ts#L20-L80).

## When Implementing New Features

- Create service under [src/services/<feature>](src/services) using request wrappers.
- Use `useTranslations()` for text; avoid hardcoding strings.
- Respect role-based routing and plan gating; use `useAuth()` for checks.
- Keep styling consistent with Tailwind variables and `font-sans`.

If anything here is unclear or missing (e.g., additional envs, test setup), reply with specifics and I’ll refine this doc.
