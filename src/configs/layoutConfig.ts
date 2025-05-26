export interface PageLayoutConfig {
  pathPattern: RegExp; // Use RegExp for flexible matching
  isDisplayHeader?: boolean;
  isDisplayFooter?: boolean;
}

// Define configurations for specific paths.
// More specific patterns should come before more general ones.
export const layoutConfigs: PageLayoutConfig[] = [
  {
    pathPattern: /^(\/[^\/]+)?\/welcome(\/.*)?$/,
    isDisplayHeader: false,
    isDisplayFooter: false,
  },
  {
    pathPattern: /^(\/[^\/]+)?\/onboarding(\/.*)?$/,
    isDisplayHeader: false,
    isDisplayFooter: false,
  },
];

// Default configuration if no specific pattern matches.
export const defaultLayoutSettings = {
  isDisplayHeader: true,
  isDisplayFooter: true,
};

/**
 * Determines the layout settings for a given pathname.
 * @param pathname The page pathname
 * @returns The applicable layout settings.
 */
export function getLayoutSettings(pathname: string | null): {
  isDisplayHeader: boolean;
  isDisplayFooter: boolean;
} {
  if (pathname === null) {
    return defaultLayoutSettings;
  }

  for (const config of layoutConfigs) {
    if (config.pathPattern.test(pathname)) {
      return {
        isDisplayHeader: config.isDisplayHeader ?? defaultLayoutSettings.isDisplayHeader,
        isDisplayFooter: config.isDisplayFooter ?? defaultLayoutSettings.isDisplayFooter,
      };
    }
  }
  return defaultLayoutSettings;
}
