'use client';

import { useState, useEffect } from 'react';
import { createNavigation } from 'next-intl/navigation'; // Import createNavigation từ next-intl/navigation
import { routing } from '@/i18n/routing'; // Import routing của bạn
import path from 'path';

const { usePathname, getPathname, redirect } = createNavigation(routing);

const LanguageSwitcher = () => {
  const pathname = usePathname(); // Lấy pathname từ createNavigation
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [isClient, setIsClient] = useState(false); // Kiểm tra môi trường client

  // Kiểm tra client-side
  useEffect(() => {
    setIsClient(true); // Đảm bảo code chỉ chạy trên client
  }, []);

  const handleChangeLanguage = (locale: 'en' | 'vi') => {
    setSelectedLocale(locale); // Cập nhật locale trong state

    // Chỉ gọi redirect khi ở client
    if (isClient) {
      const updatedPathname = getPathname({ href: { pathname }, locale });
      console.log({updatedPathname})
      redirect({ href: updatedPathname, locale });
    }
  };

  if (!isClient) {
    return null; // Hoặc bạn có thể hiển thị một loading spinner khi chưa có client-side
  }

  return (
    <div>
      <select value={selectedLocale} onChange={(e) => {
        const locale = e.target.value;
        if (locale === 'en' || locale === 'vi') {
          handleChangeLanguage(locale);
        } else {
          console.error(`Invalid locale: ${locale}`);
        }
      }}>
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
