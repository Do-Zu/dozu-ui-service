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
        pathPattern: '/${locale}/admin',
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
    {
        pathPattern: '/${locale}/topics/*',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: true,
    },
    {
        pathPattern: '/${locale}/class-based/*/topics/*',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: true,
    },
    {
        pathPattern: '/${locale}/teacher/class-based/*/topics/*',
        isDisplayHeader: false,
        isDisplayFooter: false,
        isDisplaySidebar: true,
    },
];

export const displayPackagesConfigs = [
    {
        pathPattern: '/${locale}/*/teacher/*',
        isDisplayPackage: false,
    },
    {
        pathPattern: '/${locale}/*/class-based/*',
        isDisplayPackage: false,
    },
];
