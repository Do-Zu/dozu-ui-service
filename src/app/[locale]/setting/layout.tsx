import { ReactNode } from 'react';
import SettingSidebar from './components/SettingSidebar';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const SettingsLayout = ({ children }: { children: ReactNode }) => {
    return (
        <TooltipProvider>
            <div className="flex h-full">
                <SettingSidebar />
                <div className="w-[85%] p-6 bg-gray-100">{children}</div>
            </div>
        </TooltipProvider>
    );
};

export default SettingsLayout;
