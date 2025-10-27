'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Home, Users, BarChart3, Clock, ListChecks, CreditCard, Star, TrendingUp, DollarSign, Wallet } from 'lucide-react';

interface SidebarProps {
    className?: string;
}

const navItems = [
    {
        label: 'Dashboard',
        icon: <Home className="w-4 h-4 mr-2" />,
        href: '/admin',
    },
    {
        label: 'Users',
        icon: <Users className="w-4 h-4 mr-2" />,
        href: '/admin/users',
    },
    {
        label: 'Subscriptions',
        icon: <TrendingUp className="w-4 h-4 mr-2" />,
        href: '/admin/subscriptions',
    },
    {
        label: 'Revenue',
        icon: <DollarSign className="w-4 h-4 mr-2" />,
        href: '/admin/revenue',
    },
    {
        label: 'Payments',
        icon: <Wallet className="w-4 h-4 mr-2" />,
        href: '/admin/payments',
    },
    {
        label: 'Subscription Plans',
        icon: <CreditCard className="w-4 h-4 mr-2" />,
        href: '/admin/plans',
    },
    {
        label: 'Features',
        icon: <Star className="w-4 h-4 mr-2" />,
        href: '/admin/features',
    },
    {
        label: 'Stats',
        icon: <BarChart3 className="w-4 h-4 mr-2" />,
        href: '/admin/stats',
    },
    {
        label: 'Pending Teacher Requests',
        icon: <Clock className="w-4 h-4 mr-2" />,
        href: '/admin/teacher-requests/pending'
    },
    {
        label: 'Teacher Requests',
        icon: <ListChecks className="w-4 h-4 mr-2" />,
        href: '/admin/teacher-requests'
    }
];

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn('bg-muted border-r h-screen sticky top-0 p-4', className)}>
            <div className="text-lg font-semibold mb-6 px-2">Dozu</div>
            <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full justify-start rounded-md px-3 py-2 transition-colors',
                                    isActive && 'bg-accent text-accent-foreground hover:bg-accent',
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
