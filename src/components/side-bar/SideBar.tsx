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
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { AuthGuard } from '../permission/AuthGuard';
import { ROUTES } from '@/utils/constants/routes';
import { useAuth } from '@/contexts/auth/AuthContext';
import { ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/components/toolbar/ThemeToggle';
import LanguageSwitcher from '@/components/toolbar/LanguageSwitcher';
import AuthButton from '@/components/toolbar/AuthButton';
import TreeView from '@/app/[locale]/home/components/TreeView';
import { ScrollArea } from '../ui/scroll-area';

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
        url: ROUTES.PROGRESS,
        icon: BarChart3,
    },
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
                <ScrollArea>
                    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                        <SidebarGroupLabel>Packages</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <AuthGuard>
                                <TreeView />
                            </AuthGuard>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => {
                                    const isActive = pathname
                                        ? pathname === item.url ||
                                          (item.url !== ROUTES.HOME && pathname.startsWith(item.url))
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
                                            <Link href={ROUTES.ADMIN}>
                                                <ShieldCheck />
                                                <span>Admin Panel</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}
                </ScrollArea>
            </SidebarContent>

            <SidebarGroup>
                <SidebarGroupLabel></SidebarGroupLabel>
                <SidebarGroupContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 group-data-[collapsible=icon]:hidden">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                    <AuthButton />
                </SidebarGroupContent>
            </SidebarGroup>

            <div className="text-[10px] text-muted-foreground text-center w-full group-data-[collapsible=icon]:hidden">
                © Dozu
            </div>
        </Sidebar>
    );
}
