'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

const SettingSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const cleanPathname = pathname?.split('/').slice(2).join('/');

  const menuItems = [
    { title: 'Profile', path: '/setting/profile' }, //demo
    { title: 'Schedule Setup', path: ROUTES.SETTING_SCHEDULE_SETUP },
  ];

  const handleClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="w-1/4 bg-background text-foreground p-4">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={() => handleClick(item.path)}
            className={`w-full text-left p-2 rounded-md hover:bg-muted 
              ${cleanPathname === item.path.substring(1) ? 'bg-primary text-primary-foreground' : ''} 
              ${cleanPathname === item.path.substring(1) ? 'hover:bg-primary' : ''} 
            `}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingSidebar;
