---
name: implement-feature
description: Implement a new feature using route-scoped modules, standardized API hooks (useFetch/usePost), and Zod-validated payloads.
---

# Skill: Implement New Feature

This guide standardizes how to add a new feature in this repo (Next.js App Router + TypeScript + i18n under `src/app/[locale]`).

## Scope Rule: Feature-Scoped Modules

If logic is exclusive to a single route, it **must stay inside that route’s directory**.

**Target location:** `src/app/[locale]/<feature-name>/...`

Recommended structure:

```plaintext
/feature-name
	/components    UI components specific to this route
	/hooks         Feature-specific hooks (calling useFetch/usePost)
	/services      API endpoint definitions for this feature
	/types         TypeScript definitions for this feature
	/validations   Zod schemas for forms/API payloads in this feature
	page.tsx
	layout.tsx
```

### What belongs here

- Route-only UI and state
- Route-only API calls (services + hooks)
- Route-only schemas/types

### What does _not_ belong here

- Cross-feature primitives (shared UI, shared hooks, shared utils)
    - Put shared code under `src/components`, `src/hooks`, `src/utils`, `src/services`, etc.

## API Interaction Standard

We use a custom hook pattern to ensure consistent:

- loading state
- error handling
- type-safety
- revalidation/refetch

The standard flow is:

`Component` ➡️ `Feature Hook` ➡️ `useFetch/usePost` ➡️ `Feature Service` ➡️ `src/api/* wrappers`

### 1) Data Fetching (GET) via `useFetch`

Use `useFetch` for all data retrieval.

**Location:** `src/app/[locale]/<feature-name>/hooks/` (example: `hooks/useGetProjectDetail.ts`).

**Contract:** must return:

```ts
{
    data, isLoading, error, refetch;
}
```

### 2) Data Mutations (POST/PUT/PATCH/DELETE) via `usePost`

Use `usePost` for all actions that modify data.

- **Location:** `src/app/[locale]/<feature-name>/hooks/`
- **Contract:** should expose a `mutate` function and standard state (loading/error) consistent with the existing `usePost` implementation.

### 3) Schema Validation (Zod)

All API payloads and form submissions must be validated using Zod.

- Define schemas in: `src/app/[locale]/<feature-name>/validations/`
- Infer TypeScript types from schemas to keep a single source of truth.

Example pattern:

```ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
    name: z.string().min(1),
});

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
```

## Naming Convention (Required)

- Hooks start with `use` (e.g., `useUserUpdate`, `useGetProjectDetail`)
- Services are descriptive (e.g., `projectService.ts`)
- Schemas end with `Schema` (e.g., `updateProfileSchema`)
- Avoid abbreviations; keep identifiers in English

## Implementation Workflow

Follow this order to keep the feature coherent and testable:

### Step 1 — Define types + schema

1. Create Zod schemas in `validations/`.
2. Infer TS types from Zod (`z.infer`).
3. If the response shape is stable, define response types in `types/`.

### Step 2 — Create the service

Create a service file in `services/` responsible for talking to the API.

Rules:

- Use the request wrappers from `src/api/api.ts` (e.g., `getRequest`, `postRequest`, ...)
- Keep services small: one function per endpoint action.
- Services should not manage React state.

Service example skeleton:

```ts
// src/app/[locale]/<feature-name>/services/projectService.ts
import { getRequest, postRequest } from '@/api/api';
import type { ApiResponse } from '@/api/type';

export const projectService = {
    getDetail(projectId: string) {
        return getRequest<ApiResponse<ProjectDetailResponse>>(`/projects/${projectId}`);
    },
    update(projectId: string, payload: UpdateProjectPayload) {
        return postRequest<ApiResponse<ProjectDetailResponse>>(`/projects/${projectId}`, payload);
    },
};
```

### Step 3 — Implement feature hooks

Create hooks in `hooks/` that wrap services using `useFetch` or `usePost`.

Guidelines:

- Validate payloads with Zod inside the hook before calling the service.
- Keep UI components dumb: no direct API calls from components.
- Expose a small, typed surface area to the UI.

Hook example skeleton (mutation):

```ts
// src/app/[locale]/<feature-name>/hooks/useUpdateProject.ts
import { usePost } from '@/hooks/usePost';
import { updateProjectSchema, type UpdateProjectPayload } from '../validations/updateProjectSchema';
import { projectService } from '../services/projectService';

export function useUpdateProject(projectId: string) {
    return usePost({
        mutationFn: async (payload: UpdateProjectPayload) => {
            const validatedPayload = updateProjectSchema.parse(payload);
            return projectService.update(projectId, validatedPayload);
        },
    });
}
```

### Step 4 — Connect UI (page + local components)

In `page.tsx` and route-local `components/`:

- Use hooks to fetch/mutate.
- Use `useTranslations()` for all user-facing text; don’t hardcode strings.
- Keep route-only UI in the feature folder.

## i18n Notes (Next-Intl)

- Route is locale-prefixed: `src/app/[locale]/...`
- For new text, add translations under `messages/en` and `messages/vi`, and ensure they are included by the message loader.

## State Management (Component / Route / Global)

This repo already standardizes on **Redux Toolkit** for global state and **React Context** for scoped state.

### When state should stay inside components

Use component-local state (`useState`, `useReducer`) when the state is only used by a single component subtree and does not need to be accessed globally.

### When to use Zustand (route-scoped or feature-scoped)

Use Zustand when state needs to be shared across multiple components **within a single route/feature**.

- Put route-only contexts under the route folder
- Keep providers close to the route `layout.tsx` / `page.tsx` to avoid accidental global coupling.

### When to use Zustand (global)

Use Zustand when state is truly cross-feature

## Checklist (Before You Open a PR)

- Feature code lives under `src/app/[locale]/<feature-name>` when route-scoped
- API calls are routed through `services/` + hooks (`useFetch`/`usePost`)
- Zod schemas exist for payloads and are used for validation
- All UI strings use translations
- Naming matches required conventions
- State follows repo conventions (component-local state, route-scoped Context, or global Zustand Toolkit)
