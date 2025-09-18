'use client';
import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LANGS = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

const LanguageSwitcher = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [current, setCurrent] = useState('en');

    useEffect(() => {
        const code = pathname?.split('/')[1];
        if (code && LANGS.find((l) => l.code === code)) setCurrent(code);
    }, [pathname]);

    const changeLocale = (locale: string) => {
        if (locale === current) return;

        const segments = pathname?.split('/');

        if (!segments || !segments[1]) return;

        segments[1] = locale;
        const newPath = segments.join('/');
        const query = searchParams?.toString();
        const href = query ? `${newPath}?${query}` : newPath;

        startTransition(() => {
            router.push(href);
        });
    };

    return (
        <TooltipProvider>
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <button
                                aria-label="Change language"
                                className="relative h-9 w-9 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700 backdrop-blur hover:bg-white/80 dark:hover:bg-slate-700/70 transition-colors flex items-center justify-center"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-slate-300" />
                                ) : (
                                    <span className="text-base leading-none">
                                        {LANGS.find((l) => l.code === current)?.flag || '🌐'}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="px-2 py-1 text-xs">
                        Language
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                    align="start"
                    side="right"
                    className="w-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-700"
                >
                    {LANGS.map((lang) => {
                        const active = lang.code === current;
                        return (
                            <DropdownMenuItem
                                key={lang.code}
                                onSelect={() => changeLocale(lang.code)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <span className="text-lg leading-none">{lang.flag}</span>
                                <span className="flex-1 text-sm">{lang.label}</span>
                                {active && <Check className="h-4 w-4 text-indigo-500" />}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </TooltipProvider>
    );
};

export default LanguageSwitcher;
