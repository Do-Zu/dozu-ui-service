'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth/AuthContext';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export function Topbar() {
    const { user } = useAuth();
    const router = useRouter();

    const goHome = () => {
        router.push(ROUTES.HOME);
    };

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
                <Button variant="outline" size="sm" onClick={goHome}>
                    Home
                </Button>
            </div>
        </header>
    );
}
