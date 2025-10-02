import React, { ReactNode } from 'react';
import { Card } from '../ui/card';

interface CentralCardProps {
    children: ReactNode;
}

const CentralCard: React.FC<CentralCardProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center transition-colors">
            <Card className="w-full max-w-md rounded-2xl shadow-lg border">{children}</Card>
        </div>
    );
};

export default CentralCard;
