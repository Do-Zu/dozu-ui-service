import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const commonMessages = (await import(`../../messages/${locale}/common.json`)).default;
  const homeMessages = (await import(`../../messages/${locale}/home.json`)).default;
  const welcomeMessages = (await import(`../../messages/${locale}/welcome.json`)).default;
  const loginMessages = (await import(`../../messages/${locale}/login.json`)).default;

  const messages = {
    ...commonMessages,
    ...homeMessages,
    ...welcomeMessages,
    ...loginMessages,
  };

  return {
    locale,
    messages,
  };
});
