import { PageLayoutConfig } from './types';

// More specific patterns should come before more general ones.
export const layoutConfigs: PageLayoutConfig[] = [
    {
        pathPattern: '/${locale}/welcome',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: false,
    },
    {
        pathPattern: '/${locale}/auth/*',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: false,
    },
    {
        pathPattern: '/${locale}/onboarding',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: false,
    },
    {
        pathPattern: '/${locale}',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: false,
    },
    {
        pathPattern: '/${locale}/admin/',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: false,
    },
    {
        pathPattern: '/${locale}/admin/*',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: false,
    },
];
