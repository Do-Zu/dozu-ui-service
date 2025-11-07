'use client';

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth/AuthContext';
import { ShieldCheck, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const THEMES: Array<{ key: string; icon: any; label: string }> = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
];

export function Topbar() {
    const { user } = useAuth();
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => setMounted(true), []);
    
    const current = theme || 'light';
    const currentTheme = THEMES.find((t) => t.key === current) || THEMES[1];
    const CurrentIcon = currentTheme.icon;

    const cycleTheme = useCallback(() => {
        const idx = THEMES.findIndex((t) => t.key === current);
        const next = THEMES[(idx + 1) % THEMES.length].key;
        setTheme(next);
    }, [current, setTheme]);

    if (!mounted) {
        return (
            <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-b">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Admin Panel
                        </h1>
                        <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600">
                            Dozu
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {user?.email && (
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            {user.email}
                        </span>
                    )}
                </div>
            </header>
        );
    }

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-b">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
                    <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                    <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600">
                        Dozu
                    </Badge>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {user?.email && (
                    <span className="text-sm text-muted-foreground hidden sm:block">
                        {user.email}
                    </span>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={cycleTheme}
                                className="h-9 w-9 rounded-lg hover:bg-accent"
                                aria-label={`Current theme: ${currentTheme.label}. Click to change.`}
                            >
                                <CurrentIcon className="h-4 w-4 transition-all duration-200" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                            {currentTheme.label} theme
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </header>
    );
}
