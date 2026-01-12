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
    ShieldCheck,
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
        url: '#',
        icon: MessageCircle,
    },
];

const NAME_CONVERSION_PLAN_UPGRADE = 'free';

export function AppSidebar() {
    const pathname = usePathname();
    const { hasRole, currentPlanUser, isAuthenticated } = useAuth();
    const { openUpgradeModal } = useUpgradeModal();
    const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

    const isUpgradeButtonVisible = isAuthenticated && currentPlanUser?.plan?.name?.toLocaleLowerCase().includes(NAME_CONVERSION_PLAN_UPGRADE);

    const { isDisplayPackages } = safeDestructure(getConfigLayoutPackageForSidebar(pathname));

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 py-2">
                    <div className="flex size-8 items-center justify-center rounded-lg group-data-[collapsible=icon]:mx-auto">
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
                <SidebarGroupContent className="flex flex-col gap-4 ">
                    {!isAuthenticated && (
                        <div className="flex flex-col gap-4 group-data-[collapsible=icon]:hidden">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                    )}
                    {isUpgradeButtonVisible && (
                        <div className="px-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            <Button
                                onClick={openUpgradeModal}
                                variant="outline"

                                className="w-full justify-center gap-1.5 py-1.5 font-semibold  shadow-sm transition-all duration-200 hover:shadow-md group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:min-w-0 group-data-[collapsible=icon]:p-0 "
                            >
                                <Crown className="size-3 shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden">Upgrade Plan</span>
                            </Button>
                        </div>
                    )}
                    {isAuthenticated ? <UserMenu /> : <AuthButton />}
                </SidebarGroupContent>
            </SidebarGroup>

            <div className="w-full text-center text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                © Dozu
            </div>

            {/* Feedback Dialog */}
            <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
        </Sidebar>
    );
}
