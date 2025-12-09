'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import AuthButton from '@/components/toolbar/AuthButton';
import { Home, Users, BarChart3, TrendingUp, DollarSign, Wallet, Link as LinkIcon } from 'lucide-react';

interface SidebarProps {
    className?: string;
}

const navItems = [
    {
        label: 'Dashboard',
        icon: Home,
        href: '/admin',
    },
    {
        label: 'Users',
        icon: Users,
        href: '/admin/users',
    },
    {
        label: 'Subscriptions',
        icon: TrendingUp,
        href: '/admin/subscriptions',
    },
    {
        label: 'Revenue',
        icon: DollarSign,
        href: '/admin/revenue',
    },
    {
        label: 'Payments',
        icon: Wallet,
        href: '/admin/payments',
    },

    {
        label: 'Stats',
        icon: BarChart3,
        href: '/admin/stats',
    },
];

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'bg-muted border-r min-h-screen sticky top-0 p-4 transition-all duration-300 ease-in-out flex flex-col group',
                isCollapsed ? 'w-[70px]' : 'w-[240px]',
                className,
            )}
            data-collapsible={isCollapsed ? 'icon' : undefined}
        >
            {/* Header with Logo - Click logo to toggle */}
            <div className="mb-6">
                {isCollapsed ? (
                    // Collapsed: Show large "D" logo centered - clickable
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 mx-auto cursor-pointer"
                        title="Expand sidebar - Click Dozu logo"
                    >
                        D
                    </button>
                ) : (
                    // Expanded: Show full "Dozu" text - clickable
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="flex items-center gap-2 px-2 w-full hover:opacity-80 transition-opacity cursor-pointer group"
                        title="Collapse sidebar - Click Dozu logo"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                            D
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Dozu
                        </span>
                    </button>
                )}
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full rounded-md px-3 py-2 transition-all',
                                    isActive && 'bg-accent text-accent-foreground hover:bg-accent',
                                    isCollapsed ? 'justify-center' : 'justify-start',
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon className={cn('w-4 h-4 transition-all', !isCollapsed && 'mr-2')} />
                                <span
                                    className={cn(
                                        'transition-all duration-200 whitespace-nowrap',
                                        isCollapsed && 'opacity-0 w-0 overflow-hidden',
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* Auth Button at bottom */}
            <div className="mt-auto pt-2">
                <AuthButton />
            </div>
        </aside>
    );
}
