import { routing } from '@/i18n/routing';
import { displayPackagesConfigs, layoutConfigs } from './list.config';
import { isNilOrEmpty } from '@/utils';

// Default configuration if no specific pattern matches.
export const defaultLayoutSettings = {
    isDisplayHeader: true,
    isDisplayFooter: true,
    isDisplaySidebar: true,
    isDisplaySidebarInset: true,
};

/**
 * Converts a string pattern to RegExp for pathname matching
 * @param pattern String pattern with ${locale} placeholder and * wildcards
 * @returns RegExp for matching
 */
export function convertPatternToRegex(pattern: string): RegExp {
    let p = pattern.replace(/\$\{locale\}/g, '___LOCALE___');

    p = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

    p = p.replace(/\/\*/g, '(?:/.*)?');

    p = p.replace(/\*/g, '.*?');

    const locales = routing.locales.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

    p = p.replace(/___LOCALE___/g, `(?:${locales})`);

    p = `^${p}$`;

    return new RegExp(p);
}

/**
 * Determines the layout settings for a given pathname.
 * @param pathname The page pathname
 * @returns The applicable layout settings.
 */
export function getLayoutSettings(pathname: string | null): {
    isDisplayHeader: boolean;
    isDisplayFooter: boolean;
    isDisplaySidebar: boolean;
    isDisplaySidebarInset: boolean;
} {
    if (pathname === null) {
        return defaultLayoutSettings;
    }

    for (const config of layoutConfigs) {
        const pattern =
            typeof config.pathPattern === 'string' ? convertPatternToRegex(config.pathPattern) : config.pathPattern;

        if (pattern.test(pathname)) {
            return {
                isDisplayHeader: config.isDisplayHeader ?? defaultLayoutSettings.isDisplayHeader,
                isDisplayFooter: config.isDisplayFooter ?? defaultLayoutSettings.isDisplayFooter,
                isDisplaySidebar: config.isDisplaySidebar ?? defaultLayoutSettings.isDisplaySidebar,
                isDisplaySidebarInset: config.isDisplaySidebarInset ?? defaultLayoutSettings.isDisplaySidebarInset,
            };
        }
    }

    return defaultLayoutSettings;
}

export type LayoutDisplayPackages = {
    isDisplayPackages: boolean;
};

/**
 * Determines the display packages given
 * @param pathname The page pathname
 * @returns The applicable layout settings.
 */
export function getConfigLayoutPackageForSidebar(pathname: string): LayoutDisplayPackages {
    if (isNilOrEmpty(pathname)) {
        return {
            isDisplayPackages: false,
        };
    }

    for (const config of displayPackagesConfigs) {
        const pattern =
            typeof config.pathPattern === 'string' ? convertPatternToRegex(config.pathPattern) : config.pathPattern;

        if (pattern.test(pathname)) {
            return {
                isDisplayPackages: config.isDisplayPackage,
            };
        }
    }

    return {
        isDisplayPackages: true,
    };
}
