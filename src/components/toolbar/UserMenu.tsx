'use client';

import { useAuth } from '@/contexts/auth/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { LogOut, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import LoadingPage from '@/app/loading';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/stores/hooks';
import { logout } from '@/stores/features/auth/authSlice';
import { ROUTES } from '@/utils/constants/routes';
import { cn } from '@/lib/utils';
import { useLanguageSwitcher } from '@/hooks/useLanguageSwitcher';
import { THEMES } from '@/utils/constants/themes';
import { useTranslations } from 'next-intl';

export function UserMenu() {
    const t = useTranslations('userMenu');
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isAuthenticated, clearAuthData } = useAuth();
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showThemeOptions, setShowThemeOptions] = useState(false);
    const [showLanguageOptions, setShowLanguageOptions] = useState(false);
    const { current: currentLang, isPending, changeLocale, LANGS } = useLanguageSwitcher();
    const displayName = user?.fullName || user?.username || 'User';

    useEffect(() => setMounted(true), []);

    const { execute, loading } = usePost<any, any>('/auth/logout', 'POST', {
        onError: () => toast({ description: t('logoutFailed') }),
        onSuccess: () => {
            clearAuthData();
        },
    });

    const handleLogout = async () => {
        try {
            await execute({});
            clearAuthData();
            dispatch(logout());
            router.replace(ROUTES.LOGIN);
        } catch (error) {
            toast({
                description: t('logoutError'),
            });
        }
    };

    if (loading) return <LoadingPage isOverlay={true} />;

    if (!isAuthenticated || !user) {
        return null;
    }

    // Get user initials for avatar fallback
    const getInitials = () => {
        if (user.fullName) {
            const names = user.fullName.split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[names.length - 1][0]).toUpperCase();
            }
            return user.fullName.slice(0, 2).toUpperCase();
        }
        if (user.username) {
            return user.username.slice(0, 2).toUpperCase();
        }
        return 'U';
    };

    const currentTheme = theme || 'system';
    const selectedTheme = THEMES.find((t) => t.key === currentTheme);
    const selectedLang = LANGS.find((l) => l.code === currentLang);

    return (
        <div className="flex flex-col gap-2 w-full p-4">
            <DropdownMenu
                onOpenChange={(open) => {
                    if (!open) {
                        setShowThemeOptions(false);
                        setShowLanguageOptions(false);
                    }
                }}
            >
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            'flex items-center gap-2 w-full rounded-lg px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm',
                            'group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:hover:bg-transparent',
                        )}
                    >
                        <Avatar className="h-8 w-8 flex-shrink-0 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
                            <AvatarImage src={user.avatarUrl} alt={displayName} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left min-w-0 group-data-[collapsible=icon]:hidden">
                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                                {displayName}
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0 group-data-[collapsible=icon]:hidden" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" side="top" sideOffset={8}>
                    <DropdownMenuLabel className="font-normal">
                        <button
                            onClick={() => router.push(ROUTES.PROFILE)}
                            className="w-full text-left flex flex-col space-y-1 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <p className="text-sm font-medium leading-none">{displayName}</p>
                        </button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setShowThemeOptions(!showThemeOptions);
                        }}
                        className="cursor-pointer"
                    >
                        <span className="flex-1 text-sm">{t('theme')}</span>
                        {selectedTheme &&
                            mounted &&
                            (() => {
                                const Icon = selectedTheme.icon;
                                return (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Icon className="h-3.5 w-3.5" />
                                        {/* <span>{selectedTheme.label}</span> */}
                                    </div>
                                );
                            })()}
                    </DropdownMenuItem>
                    {showThemeOptions && mounted && (
                        <DropdownMenuRadioGroup value={currentTheme} onValueChange={setTheme}>
                            {THEMES.map((themeOption) => {
                                const Icon = themeOption.icon;
                                return (
                                    <DropdownMenuRadioItem
                                        key={themeOption.key}
                                        value={themeOption.key}
                                        className="cursor-pointer pl-6"
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {themeOption.labelVi}
                                    </DropdownMenuRadioItem>
                                );
                            })}
                        </DropdownMenuRadioGroup>
                    )}
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setShowLanguageOptions(!showLanguageOptions);
                        }}
                        className="cursor-pointer"
                    >
                        <span className="flex-1 text-sm">{t('language')}</span>
                        {selectedLang && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="text-sm leading-none">{selectedLang.flag}</span>
                                {/* <span>{selectedLang.label}</span> */}
                            </div>
                        )}
                    </DropdownMenuItem>
                    {showLanguageOptions &&
                        LANGS.map((lang) => {
                            const active = lang.code === currentLang;
                            return (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onSelect={() => changeLocale(lang.code)}
                                    className="flex items-center gap-2 cursor-pointer pl-6"
                                    disabled={isPending}
                                >
                                    <span className="text-lg leading-none">{lang.flag}</span>
                                    <span className="flex-1 text-sm">{lang.label}</span>
                                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                                    {!isPending && active && <Check className="h-4 w-4 text-indigo-500" />}
                                </DropdownMenuItem>
                            );
                        })}
                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('logout')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
