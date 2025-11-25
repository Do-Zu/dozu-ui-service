'use client';

import React from 'react';
import { Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'card' | 'list';

interface ViewModeToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    return (
        <div className="flex border rounded-md overflow-hidden">
            <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('card')}
                className="rounded-r-none"
            >
                <Grid3x3 className="h-4 w-4 mr-2" />
            </Button>
            <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
            >
                <List className="h-4 w-4 mr-2" />
            </Button>
        </div>
    );
}

