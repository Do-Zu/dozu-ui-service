---
title: Defer State Reads to Usage Point
impact: MEDIUM
impactDescription: avoids unnecessary subscriptions
tags: rerender, searchParams, localStorage, optimization
---

## Defer State Reads to Usage Point

- Don't subscribe to dynamic state (searchParams, localStorage) if you only read it inside callbacks.
- Avoid SSR/hydration issues.

**Incorrect (subscribes to all searchParams changes):**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
    const searchParams = useSearchParams();

    const handleShare = () => {
        const ref = searchParams.get('ref');
        shareChat(chatId, { ref });
    };

    return <button onClick={handleShare}>Share</button>;
}
```

**Correct (reads on demand, no subscription):**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
    const handleShare = () => {
        //Guard in ShareButton.handleShare to avoid SSR/hydration issues.
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        shareChat(chatId, { ref });
    };

    return <button onClick={handleShare}>Share</button>;
}
```
