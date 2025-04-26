'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const changeLocale = (locale: string) => {
    const segments = pathname?.split('/');
    // Ensure the first segment is the locale
    if (segments && segments[1]) {
      segments[1] = locale;
      const newPath = segments.join('/');

      startTransition(() => {
        router.push(newPath);
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
