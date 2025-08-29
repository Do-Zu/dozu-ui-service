/**
 * Note: Testing framework and libraries:
 * - This project uses React Testing Library with Jest/Vitest (detected from repository).
 * - The tests below follow RTL idioms and avoid implementation details.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// If the project exposes a custom render or i18n-aware render, prefer it:
let customRender: typeof render;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const custom = require('../../test-utils');
  // eslint-disable-next-line prefer-const
  customRender = custom.render || render;
} catch {
  // fallback to RTL render
  customRender = render;
}

// Attempt to import LanguageSwitcher relative to this file.
// Adjust if component path differs (we searched for LanguageSwitcher.tsx in src/components/toolbar).
// eslint-disable-next-line import/no-relative-packages
import LanguageSwitcher from './LanguageSwitcher';

// Mock i18n if react-i18next/i18next is used in the repo.
// We keep the mock flexible to avoid dependency on exact implementation.
let changeLanguageCalls: string[] = [];
jest.mock('react-i18next', () => {
  try {
    const actual = jest.requireActual('react-i18next');
    return {
      ...actual,
      useTranslation: () => ({
        i18n: {
          language: 'en',
          languages: ['en', 'es', 'fr'],
          changeLanguage: (lng: string) => {
            changeLanguageCalls.push(lng);
            return Promise.resolve();
          },
        },
        t: (key: string) => key,
      }),
    };
  } catch {
    return {
      useTranslation: () => ({
        i18n: {
          language: 'en',
          languages: ['en', 'es', 'fr'],
          changeLanguage: (lng: string) => {
            changeLanguageCalls.push(lng);
            return Promise.resolve();
          },
        },
        t: (key: string) => key,
      }),
    };
  }
});

// Utility to reset mocks between tests
const setup = async (ui: React.ReactElement = <LanguageSwitcher />) => {
  changeLanguageCalls = [];
  const user = userEvent.setup();
  const utils = customRender(ui);
  return { user, ...utils };
};

describe('LanguageSwitcher', () => {
  it('renders the current language indicator', async () => {
    await setup();
    // Prefer accessible name if the component uses aria-label like "Change language"
    const trigger = screen.getByRole('button', { name: /language|locale|change language/i });
    expect(trigger).toBeInTheDocument();
    // Ensure current language text or abbreviation is visible
    expect(screen.getByText(/en/i)).toBeTruthy();
  });

  it('opens the menu on click and lists available languages', async () => {
    const { user } = await setup();
    const trigger = screen.getByRole('button', { name: /language|locale|change language/i });
    await user.click(trigger);

    // Find the menu/listbox; use generic role patterns to avoid coupling
    const menu = await screen.findByRole(/menu|listbox/i);
    const items = within(menu).getAllByRole(/menuitem|option/i);
    const labels = items.map((li) => li.textContent?.trim()?.toLowerCase());
    expect(labels).toEqual(expect.arrayContaining(['en', 'es', 'fr']));
  });

  it('changes language when a different option is selected', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /language|locale|change language/i }));
    const menu = await screen.findByRole(/menu|listbox/i);

    const spanish = within(menu).getByRole(/menuitem|option/i, { name: /es|spanish/i });
    await user.click(spanish);

    expect(changeLanguageCalls).toContain('es');
  });

  it('does not call changeLanguage when selecting the current language again', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /language|locale|change language/i }));
    const menu = await screen.findByRole(/menu|listbox/i);

    const current = within(menu).getByRole(/menuitem|option/i, { name: /en|english/i });
    await user.click(current);

    // Allow either 0 calls or a call filtered by implementation;
    // if implementation prevents duplicate changes, enforce 0.
    const duplicateCalls = changeLanguageCalls.filter((lng) => lng === 'en');
    expect(duplicateCalls.length).toBe(0);
  });

  it('supports keyboard navigation (ArrowDown/Enter) to change language', async () => {
    const { user } = await setup();
    const trigger = screen.getByRole('button', { name: /language|locale|change language/i });
    trigger.focus();
    await user.keyboard('{Enter}'); // open
    const menu = await screen.findByRole(/menu|listbox/i);

    // Move to next language and select
    await user.keyboard('{ArrowDown}{Enter}');
    // Accept either es or fr depending on initial focus; assert some change occurred
    expect(changeLanguageCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('gracefully handles an unknown/unsupported locale provided via props', async () => {
    // If LanguageSwitcher accepts a prop like currentLanguage, render with an invalid value
    // @ts-expect-error testing robustness with unexpected input
    const { user } = await setup(<LanguageSwitcher currentLanguage="xx" />);
    expect(screen.getByRole('button', { name: /language|locale|change language/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /language|locale|change language/i }));
    const menu = await screen.findByRole(/menu|listbox/i);
    const items = within(menu).getAllByRole(/menuitem|option/i);
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('announces selection change via aria-live or updates trigger label for accessibility', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /language|locale|change language/i }));
    const menu = await screen.findByRole(/menu|listbox/i);
    const french = within(menu).getByRole(/menuitem|option/i, { name: /fr|french/i });
    await user.click(french);

    // Check that the trigger text updates or some aria-live region reflects the change
    expect(screen.getByRole('button', { name: /fr|french|language.*fr/i })).toBeInTheDocument();
  });

  it('closes the menu when clicking outside', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /language|locale|change language/i }));
    await user.click(document.body);
    expect(screen.queryByRole(/menu|listbox/i)).not.toBeInTheDocument();
  });

  it('closes the menu on Escape key', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /language|locale|change language/i }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole(/menu|listbox/i)).not.toBeInTheDocument();
  });
});