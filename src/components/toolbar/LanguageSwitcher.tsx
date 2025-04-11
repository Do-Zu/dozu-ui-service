'use client';

import { useState, useEffect } from 'react';
import { createNavigation } from 'next-intl/navigation';  // Import createNavigation
import { routing } from '@/i18n/routing'; // Import routing từ file cấu hình của bạn

// Khởi tạo navigation với routing
const { usePathname, getPathname, redirect } = createNavigation(routing); // Thêm 'routing' vào đây

const LanguageSwitcher = () => {
  const pathname = usePathname(); // Lấy pathname hiện tại
  console.log({ pathname });

  const [selectedLocale, setSelectedLocale] = useState('en'); // Mặc định là 'en'
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Đảm bảo code chỉ chạy trên client
  }, []);

  const handleChangeLanguage = (locale: string) => {
    setSelectedLocale(locale); // Cập nhật locale trong state
    console.log({ locale });

    // Truyền tham số đúng cho getPathname
    const updatedPathname = getPathname({
      href: { pathname },  // Đảm bảo 'href' là đối tượng có 'pathname' và không có query
      locale
    });

    console.log({ updatedPathname });

    // Dùng redirect để thay đổi URL và locale
    redirect({ href: updatedPathname, locale });
  };

  if (!isClient) {
    return null; // Hiển thị loading spinner nếu cần
  }

  return (
    <div>
      <select value={selectedLocale} onChange={(e) => handleChangeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
