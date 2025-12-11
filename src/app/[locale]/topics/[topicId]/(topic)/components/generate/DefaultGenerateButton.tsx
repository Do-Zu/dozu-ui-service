import React from 'react';
import { Button } from '@/components/ui/button';

export default function DefaultGenerateButton({ onClick }: { onClick: () => void | Promise<void> }) {
    return (
        <Button className="rounded-2xl" onClick={onClick}>
            Generate
        </Button>
    );
}
