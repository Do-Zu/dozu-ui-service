import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import React from 'react';

const DownloadButton = () => {
    return (
        <Button variant="outline">
            <FileDown />
            Download -- WIP
            {/* Implements later */}
        </Button>
    );
};

export default DownloadButton;
