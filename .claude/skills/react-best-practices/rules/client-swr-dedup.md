---
title: Use custom mechanism SWR for Automatic Deduplication
impact: MEDIUM-HIGH
impactDescription: automatic deduplication
tags: client, swr, deduplication, data-fetching
---

## Use custom mechanism SWR for Automatic Deduplication

SWR is a common approach for request deduplication, caching, and revalidation across component instances.

Note: In this repo, prefer the built-in `useFetch` (GET) and `usePost` (mutations) hooks by convention; SWR-equivalent behavior (deduplication/caching/mutations) can be achieved using those hooks.

**Incorrect (no deduplication, each instance fetches):**

```tsx
function UserList() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        fetch('/api/users')
            .then((r) => r.json())
            .then(setUsers);
    }, []);
}
```

**Correct (multiple instances share one request):**

```tsx
import useFetch from '@/hooks/useFetch';

function UserList() {
    const { data: users, loading, error } = useFetch('/api/users');

    if (loading) return null;
    if (error) return null;

    return <pre>{JSON.stringify(users, null, 2)}</pre>;
}
```

**For immutable data:**

```tsx
import useFetch from '@/hooks/useFetch';

function StaticContent() {
    const { data, loading, error } = useFetch('/api/config');

    if (loading) return null;
    if (error) return null;

    return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

**For mutations:**

```tsx
import usePost from '@/hooks/usePost';

function UpdateButton() {
    const { execute, loading } = usePost('/api/user', 'PATCH');

    return (
        <button disabled={loading} onClick={() => execute({})}>
            Update
        </button>
    );
}
```

Reference: [https://swr.vercel.app](https://swr.vercel.app)
