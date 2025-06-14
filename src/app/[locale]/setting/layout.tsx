import { ReactNode } from 'react';
import SettingSidebar from './components/SettingSidebar';

const SettingsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex">
      <SettingSidebar />
      <div className="w-3/4 p-6 bg-gray-100">
        {children} 
      </div>
    </div>
  );
};

export default SettingsLayout;
