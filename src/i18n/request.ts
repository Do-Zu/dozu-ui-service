import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Nạp các tệp tin JSON cho các namespace (common, profile, navigation, v.v.)
  const commonMessages = (await import(`../../messages/${locale}/common.json`)).default;
  const homeMessages = (await import(`../../messages/${locale}/home.json`)).default;

  // Hợp nhất tất cả thông điệp lại với nhau
  const messages = {
    ...commonMessages,
    ...homeMessages,
  };

  return {
    locale,
    messages,
  };
});
