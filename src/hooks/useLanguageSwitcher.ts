import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const LANGS = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export function useLanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [current, setCurrent] = useState('en');

    useEffect(() => {
        const code = pathname?.split('/')[1];
        if (code && LANGS.find((l) => l.code === code)) setCurrent(code);
    }, [pathname]);

    const buildHref = (basePath: string, query?: string, hash?: string): string => {
        const queryString = query ? `?${query}` : '';
        const hashString = hash ?? '';
        return `${basePath}${queryString}${hashString}`;
    };

    const changeLocale = (locale: string) => {
        if (locale === current) return;

        const segments = pathname?.split('/');

        const hasLocal = !!segments![1] && LANGS.some((lang) => lang.code.toLowerCase() === segments![1].toLowerCase());

        let basePath: string;

        if (hasLocal) {
            segments[1] = locale;
            basePath = segments.join('/');
        } else {
            const safePath = pathname ?? '';
            const extendPath = pathname.startsWith('/') ? '' : `${safePath.replace(/^\/+/, '')}`;

            basePath = `/${locale}/${extendPath}`;
        }

        const query = searchParams?.toString();
        const hash = typeof window !== 'undefined' ? window.location.hash : '';

        const href = buildHref(basePath, query, hash);

        startTransition(() => {
            router.push(href);
        });
    };

    return {
        current,
        isPending,
        changeLocale,
        LANGS,
    };
}

