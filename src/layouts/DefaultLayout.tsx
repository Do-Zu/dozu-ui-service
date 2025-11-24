'use client';

import { ReactNode, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { usePathname } from 'next/navigation';
import { getLayoutSettings } from '@/configs/layout/layoutConfig';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/side-bar/SideBar';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

interface LayoutProps {
    children: ReactNode;
    className?: string;
    isDisplayHeader?: boolean;
    isDisplayFooter?: boolean;
    isDisplaySidebar?: boolean;
    isDisplaySidebarInset?: boolean;
}

const DefaultLayout: React.FC<LayoutProps> = ({
    children,
    className = '',
    isDisplayHeader: explicitHeader,
    isDisplayFooter: explicitFooter,
}) => {
    const pathname = usePathname();
    const { isStudent } = useRoleChecker();
    const [learningMode, setLearningMode] = useLocalStorage<ILearningMode>(
        'learningMode',
        MODE_ACCESS_PAGE_ROLE.personal,
    );

    useEffect(() => {
        if (!isStudent) return;
        if (pathname.includes('class-based')) {
            setLearningMode(MODE_ACCESS_PAGE_ROLE.classBased);
        } else {
            setLearningMode(MODE_ACCESS_PAGE_ROLE.personal);
        }
    }, [pathname]);

    const configSettings = getLayoutSettings(pathname);

    const displayHeader = explicitHeader !== undefined ? explicitHeader : configSettings.isDisplayHeader;
    const displayFooter = explicitFooter !== undefined ? explicitFooter : configSettings.isDisplayFooter;

    const displaySidebar = configSettings.isDisplaySidebar;
    const displaySidebarInset = configSettings.isDisplaySidebarInset;

    // Warn about potential layout issues
    if (displaySidebar && !displaySidebarInset) {
        console.warn('Sidebar is enabled but SidebarInset is not. This may lead to layout issues.');
    }

    // Main layout content
    const layoutContent = (
        <div className="flex flex-col min-h-screen bg-background dark:bg-muted transition-colors">
            {displayHeader && <Header />}
            <main
                className={`flex-1 bg-background ${className}`}
                style={
                    displayHeader
                        ? {
                              minHeight: 'calc(100vh - var(--header-height))',
                              height: 'calc(100vh - var(--header-height))',
                          }
                        : {
                              minHeight: '100vh',
                              height: '100vh',
                          }
                }
            >
                {children}
            </main>
            {displayFooter && <Footer />}
        </div>
    );

    const sidebarLayout = (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>{layoutContent}</SidebarInset>
        </SidebarProvider>
    );

    if (!displaySidebar) {
        return <>{layoutContent}</>;
    }

    if (displaySidebar && !displaySidebarInset) {
        return <>{layoutContent}</>;
    }

    // Wrap with SidebarInset if needed
    return sidebarLayout;
};

export default DefaultLayout;
