'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/utils/constants/routes';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import LoadingPage from '@/app/loading';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/stores/hooks';
import { logout } from '@/stores/features/auth/authSlice';

/**
 * Unified auth action button.
 * - Shows Login when unauthenticated.
 * - Shows Logout (with async call) when authenticated.
 * - Compact, glassy, supports collapsed sidebar (icon-only).
 */
export function AuthButton() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, clearAuthData } = useAuth();

    const { execute, loading } = usePost<any, any>('/auth/logout', 'POST', {
        onError: () => toast({ description: 'Logout failed. Try again.' }),
        onSuccess: () => {
            clearAuthData();
        },
    });

    const handleLogout = async () => {
        try {
            await execute({});

            clearAuthData();

            dispatch(logout());

            router.replace(ROUTES.LANDING);
        } catch (error) {
            toast({
                description: 'There was an error logging you out. Please try again later.',
            });
        }
    };

    if (loading) return <LoadingPage isOverlay={true} />;

    if (!isAuthenticated) {
        return (
            <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur border-slate-300/60 dark:border-slate-600 hover:bg-white/80 dark:hover:bg-slate-700/70 transition-colors group-data-[collapsible=icon]:px-0"
            >
                <Link href={ROUTES.LOGIN} aria-label="Login">
                    <LogIn className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Login</span>
                </Link>
            </Button>
        );
    }

    return (
        <Button
            disabled={loading}
            onClick={handleLogout}
            variant="outline"
            size="sm"
            aria-label="Logout"
            className="w-full justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-cyan-500/20 dark:from-indigo-400/15 dark:via-sky-400/15 dark:to-cyan-400/15 border-slate-300/60 dark:border-slate-600 hover:from-indigo-500/30 hover:via-sky-500/30 hover:to-cyan-500/30 dark:hover:from-indigo-400/25 dark:hover:via-sky-400/25 dark:hover:to-cyan-400/25 backdrop-blur group-data-[collapsible=icon]:px-0"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
    );
}

export default AuthButton;
