'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const THEMES: Array<{ key: string; icon: any; label: string }> = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'system', icon: Monitor, label: 'System' },
];

export default function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const current = theme || 'system';

    const cycle = useCallback(() => {
        const idx = THEMES.findIndex((t) => t.key === current);
        const next = THEMES[(idx + 1) % THEMES.length].key;
        setTheme(next);
    }, [current, setTheme]);

    if (!mounted) return null;

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-2 w-full">
                {/* <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={cycle}
                            aria-label={`Theme: ${current}. Click to change.`}
                            className="group relative flex items-center justify-center h-9 w-9 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700 backdrop-blur hover:bg-white/80 dark:hover:bg-slate-700/70 transition-colors shadow-[0_1px_3px_-1px_rgba(0,0,0,0.2)]"
                        >
                            {THEMES.map((t) => {
                                const Icon = t.icon;
                                const active = t.key === current;
                                return (
                                    <Icon
                                        key={t.key}
                                        className={cn(
                                            'absolute h-4 w-4 text-slate-600 dark:text-slate-300 transition-all duration-300',
                                            active ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                                        )}
                                    />
                                );
                            })}
                            <span className="sr-only">Toggle theme</span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="px-2 py-1 text-xs">
                        Cycle theme
                    </TooltipContent>
                </Tooltip> */}

                <div className="hidden group-data-[collapsible=icon]:hidden xl:flex items-center rounded-lg p-1 bg-white/60 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700 backdrop-blur gap-1">
                    {THEMES.map((t) => {
                        const Icon = t.icon;
                        const active = t.key === current;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTheme(t.key)}
                                className={cn(
                                    'relative flex items-center gap-1 px-2 h-7 rounded-md text-[0.65rem] font-medium tracking-wide transition-all',
                                    'hover:bg-white/80 dark:hover:bg-slate-700/70',
                                    active &&
                                        'bg-gradient-to-r from-indigo-500/30 via-sky-500/30 to-cyan-500/30 text-slate-900 dark:text-white',
                                )}
                                aria-pressed={active}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="capitalize">{t.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </TooltipProvider>
    );
}
