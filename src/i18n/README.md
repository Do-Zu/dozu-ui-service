# Internationalization (i18n) in Dozu UI Service

This directory contains configuration and utilities for implementing internationalization in the Dozu UI Service application.

## Structure

- `messages.ts` - Centralized message loader utility that dynamically imports translation files
- `navigation.ts` - Navigation utilities for internationalized routing
- `routing.ts` - Configuration for routing with locale support
- `request.ts` - Utilities for handling i18n in API requests

## Message Management

We use a centralized message loading approach to avoid cluttering our layout files with multiple import statements. This offers several benefits:

1. **Scalability**: As the application grows, we can add more translation files without modifying the layout.
2. **Organization**: All translation loading logic is in one place.
3. **Error handling**: Centralized error handling for missing translation files.
4. **Conditional loading**: Support for conditionally loading translations based on features or routes.

## How to Use

### Adding New Translation Files

1. Create your JSON translation file in the appropriate locale folder under `messages/[locale]/`
2. Update the `getMessages` function in `messages.ts` to include your new file

```typescript
// Example of adding a new translation file
export async function getMessages(locale: string) {
  const messages = {
    ...(await import(`../../messages/${locale}/common.json`)).default,
    ...(await import(`../../messages/${locale}/home.json`)).default,
    // Add your new translation file here
    ...(await import(`../../messages/${locale}/your-feature.json`)).default,
  };

  return messages;
}
```

### Using Translations in Components

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function YourComponent() {
  // 'common' refers to the namespace defined in your translation files
  const t = useTranslations('common');

  return <h1>{t('greeting')}</h1>;
}
```

## Configuration

The default timezone is set to "Asia/Ho_Chi_Minh" in the `Providers.tsx` file. If you need to change this, update the `timeZone` prop in the `NextIntlClientProvider`.

## Supported Locales

Currently supported locales are defined in `routing.ts`:

- English (`en`)
- Vietnamese (`vi`)

To add support for a new locale, update the `locales` array in `routing.ts` and create corresponding message files in the `messages` directory.
