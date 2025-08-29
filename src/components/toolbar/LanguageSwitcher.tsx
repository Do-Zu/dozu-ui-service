'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const changeLocale = (locale: string) => {
    const segments = pathname?.split('/');
    // Ensure the first segment is the locale
    if (segments && segments[1]) {
      segments[1] = locale;
      const newPath = segments.join('/');
      
      // Preserve query parameters
      const queryString = searchParams.toString();
      const fullPath = queryString ? `${newPath}?${queryString}` : newPath;

      startTransition(() => {
        router.push(fullPath);
      });
    }
  };

  return (
    <select
      onChange={(e) => changeLocale(e.target.value)}
      className="border rounded px-2 py-1 bg-background text-foreground"
      defaultValue={pathname?.split('/')[1]}
    >
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
  );
};

export default LanguageSwitcher;
