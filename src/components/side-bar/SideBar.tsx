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
    Crown,
    MessageCircle,
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
import { UserMenu } from '../toolbar/UserMenu';
import TreeView from '@/app/[locale]/home/components/package/TreeView';
import { ScrollArea } from '../ui/scroll-area';
import { USER_ROLES } from '@/utils/constants/roles';
import { getConfigLayoutPackageForSidebar } from '@/configs/layout/layoutConfig';
import { safeDestructure } from '@/utils';
import { useUpgradeModal } from '@/stores/features/subscription/useUpgradeModal';
import { Button } from '@/components/ui/button';
import { FeedbackDialog } from '../feedback/FeedbackDialog';
import { useState } from 'react';

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
    {
        title: 'Feedback',
        url: '#', // Not used, will open dialog instead
        icon: MessageCircle,
    }
];

export function AppSidebar() {
    const pathname = usePathname();
    const { hasRole, currentPlanUser,isAuthenticated } = useAuth();
    const { openUpgradeModal } = useUpgradeModal();
    const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

    const isPro = currentPlanUser?.plan?.name?.toLowerCase().includes('pro') ?? false;

    const { isDisplayPackages } = safeDestructure(getConfigLayoutPackageForSidebar(pathname));

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
                    {hasRole(USER_ROLES.USER) && isDisplayPackages && (
                        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                            <SidebarGroupLabel>Packages</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <AuthGuard>
                                    <TreeView />
                                </AuthGuard>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}

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
                                {secondaryItems.map((item) => {
                                    // Feedback item should open dialog instead of navigating
                                    if (item.title === 'Feedback') {
                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton 
                                                    tooltip={item.title}
                                                    onClick={() => setIsFeedbackDialogOpen(true)}
                                                >
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    }
                                    // Other items use Link navigation
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild tooltip={item.title}>
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
                    {!isAuthenticated && (
                        <div className="flex flex-col gap-4 group-data-[collapsible=icon]:hidden">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                    )}
                    {/* Upgrade to Pro Button */}
                    {!isPro && isAuthenticated && (
                        <div className="px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                            <Button
                                onClick={openUpgradeModal}
                                variant="outline"
                                size="sm"
                                className="w-full justify-center gap-1.5 py-1.5 bg-gradient-to-r from-blue-100/80 via-indigo-100/80 to-purple-100/80 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40 border-blue-300/60 dark:border-blue-700/60 hover:from-blue-200/90 hover:via-indigo-200/90 hover:to-purple-200/90 dark:hover:from-blue-800/50 dark:hover:via-indigo-800/50 dark:hover:to-purple-800/50 text-blue-700 dark:text-blue-300 font-semibold shadow-sm hover:shadow-md transition-all duration-200 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:min-w-0"
                            >
                                <Crown className="h-3 w-3 flex-shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden">Upgrade to Pro</span>
                            </Button>
                        </div>
                    )}
                    {isAuthenticated ? <UserMenu /> : <AuthButton />}
                    
                </SidebarGroupContent>
            </SidebarGroup>

            <div className="text-[10px] text-muted-foreground text-center w-full group-data-[collapsible=icon]:hidden">
                © Dozu
            </div>

            {/* Feedback Dialog */}
            <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
        </Sidebar>
    );
}
