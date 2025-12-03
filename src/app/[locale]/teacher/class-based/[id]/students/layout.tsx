'use client';

import React from 'react';
import { GamificationProvider } from '@/contexts/gamification/GamificationContext';

interface StudentsLayoutProps {
    children: React.ReactNode;
}

/**
 * Layout for teacher's class-based students section
 * Provides GamificationProvider for streak and points functionality
 */
export default function StudentsLayout({ children }: StudentsLayoutProps) {
    return (
        <GamificationProvider autoLoad={true}>
            {children}
        </GamificationProvider>
    );
}