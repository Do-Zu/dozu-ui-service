import { routing } from '@/i18n/routing';
import { layoutConfigs } from './list.config';

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
function convertPatternToRegex(pattern: string): RegExp {
  // Get all available locales from routing config
  const locales = routing.locales.join('|');

  // Replace ${locale} placeholder with actual locale pattern
  let regexPattern = pattern.replace(/\$\{locale\}/g, `(${locales})`);

  // Escape special regex characters, but preserve our locale group and handle wildcards
  regexPattern = regexPattern
    .replace(/[.+?^${}[\]\\]/g, '\\$&') // Escape special regex chars except | and ()
    .replace(/\*/g, '.*'); // Convert * wildcards to regex .*

  // Ensure exact match from start to end
  regexPattern = `^${regexPattern}$`;

  return new RegExp(regexPattern);
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
      typeof config.pathPattern === 'string'
        ? convertPatternToRegex(config.pathPattern)
        : config.pathPattern;

    if (pattern.test(pathname)) {
      return {
        isDisplayHeader: config.isDisplayHeader ?? defaultLayoutSettings.isDisplayHeader,
        isDisplayFooter: config.isDisplayFooter ?? defaultLayoutSettings.isDisplayFooter,
        isDisplaySidebar: config.isDisplaySidebar ?? defaultLayoutSettings.isDisplaySidebar,
        isDisplaySidebarInset:
          config.isDisplaySidebarInset ?? defaultLayoutSettings.isDisplaySidebarInset,
      };
    }
  }

  return defaultLayoutSettings;
}
