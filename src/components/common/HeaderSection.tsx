'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HeaderSectionProps {
    icon: LucideIcon;
    title: string;
    slogan?: string;
    actionButton?: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
    icon: Icon,
    title,
    slogan,
    actionButton,
    description,
    className = '',
}) => {
    return (
        <div className={`rounded-lg shadow-dm ${className}`}>
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col gap-3 flex-1">
                        <div className="flex flex-row gap-3 items-center">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-6 w-6 text-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-3xl font-semibold text-foreground tracking-tight">{title}</h2>
                        </div>
                        {slogan && (
                            <p className="text-lg font-medium ml-[52px] leading-relaxed bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                                {slogan}
                            </p>
                        )}
                        {description && <div className="ml-[52px]">{description}</div>}
                    </div>
                    {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
                </div>
            </div>
        </div>
    );
};
