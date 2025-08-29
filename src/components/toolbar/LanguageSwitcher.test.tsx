/* Framework: Jest + React Testing Library (jsdom) */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()],
  };
});

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(),
    usePathname: jest.fn(),
    useSearchParams: jest.fn(),
  };
});

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// Adjust import path if component file is elsewhere
import LanguageSwitcher from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setup(path: string | null, queryString?: string) {
    (usePathname as jest.Mock).mockReturnValue(path);
    (useSearchParams as jest.Mock).mockReturnValue({
      toString: () => queryString ?? '',
    } as any);

    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(<LanguageSwitcher />);
    return { push };
  }

  it('renders with default value from pathname locale segment', () => {
    setup('/en/products/42', '');
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('en');
  });

  it('preserves query string when switching locale', () => {
    const { push } = setup('/en/shop/items', 'sort=asc&page=2');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vi' } });
    expect(push).toHaveBeenCalledWith('/vi/shop/items?sort=asc&page=2');
  });

  it('does not append "?" when there is no query string', () => {
    const { push } = setup('/en', '');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vi' } });
    expect(push).toHaveBeenCalledWith('/vi');
  });

  it('keeps deeper path segments intact when changing locale', () => {
    const { push } = setup('/en/a/b/c', '');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vi' } });
    expect(push).toHaveBeenCalledWith('/vi/a/b/c');
  });

  it('does nothing if pathname is null', () => {
    const { push } = setup(null, 'x=1');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vi' } });
    expect(push).not.toHaveBeenCalled();
  });

  it('does nothing if there is no locale segment at index 1', () => {
    const { push } = setup('/', 'x=1');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'vi' } });
    expect(push).not.toHaveBeenCalled();
  });

  it('multiple changes navigate each time with the correct full path', () => {
    const { push } = setup('/en/category', 'q=test');
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'vi' } });
    fireEvent.change(select, { target: { value: 'en' } });
    expect(push).toHaveBeenNthCalledWith(1, '/vi/category?q=test');
    expect(push).toHaveBeenNthCalledWith(2, '/en/category?q=test');
  });
});
