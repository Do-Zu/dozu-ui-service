'use client';

import {
    Calendar,
    Home,
    Inbox,
    Search,
    Settings,
    BookOpen,
    Gamepad2,
    FileQuestion,
    Brain,
    BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { ROUTES } from '@/utils/constants/routes';
import { useAuth } from '@/contexts/auth/AuthContext';
import { ShieldCheck } from 'lucide-react';

// Menu items.
const items = [
    {
        title: 'Home',
        url: ROUTES.HOME,
        icon: Home,
    },
    {
        title: 'Library',
        url: ROUTES.HOME,
        icon: BookOpen,
    },
    {
        title: 'Progress',
        url: '/progress',
        icon: BarChart3,
    },
    // {
    //   title: 'Process',
    //   url: '/process',
    //   icon: Brain,
    // },
    // {
    //   title: 'Schedule',
    //   url: '/schedule',
    //   icon: FileQuestion,
    // },
];

const secondaryItems = [
    {
        title: 'Calendar',
        url: ROUTES.SCHEDULE,
        icon: Calendar,
    },
    {
        title: 'Settings',
        url: ROUTES.SETTING_SCHEDULE_SETUP,
        icon: Settings,
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { hasRole } = useAuth();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:mx-auto">
                        <SidebarTrigger />
                    </div>
                    <span className="font-semibold group-data-[collapsible=icon]:hidden">Dozu</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname
                                    ? pathname === item.url || (item.url !== '/home' && pathname.startsWith(item.url))
                                    : false;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Tools</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondaryItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {hasRole('admin') && (
                <SidebarGroup>
                    <SidebarGroupLabel>Admin</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname ? pathname.startsWith('/admin') : false}
                                    tooltip="Admin Panel"
                                >
                                    <Link href="/admin">
                                        <ShieldCheck />
                                        <span>Admin Panel</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}

            <SidebarFooter>
                <div className="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">© Dozu</div>
            </SidebarFooter>
        </Sidebar>
    );
}
